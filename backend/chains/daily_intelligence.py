"""Categorize daily research into top-3 articles with service mappings."""

from __future__ import annotations

import json
from typing import Any

from config import get_settings
from schemas.dream_list import DreamListCompany


def _load_catalog() -> list[dict]:
    path = get_settings().data_dir / "services_catalog.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _map_service_for_text(text: str, catalog: list[dict]) -> dict[str, Any]:
    lower = text.lower()
    best_score = 0
    best = catalog[0] if catalog else {"id": "s_ai_governance", "name": "AI Governance & Compliance", "description": ""}
    for svc in catalog:
        score = sum(2 for kw in svc.get("risk_keywords", []) if kw.lower() in lower)
        if score > best_score:
            best_score = score
            best = svc
    return {
        "service_id": best["id"],
        "service_name": best["name"],
        "service_description": best.get("description", ""),
        "match_rationale": f"Mapped based on AI/security themes in: {text[:120]}…",
    }


def _doc_to_article(doc: dict[str, Any], index: int) -> dict[str, Any]:
    return {
        "headline": doc.get("title", f"AI update #{index + 1}"),
        "summary": doc.get("summary") or doc.get("raw_content", "")[:400],
        "source": doc.get("publisher", doc.get("source_type", "Web")),
        "url": doc.get("url", ""),
        "published_at": doc.get("published_at", ""),
        "category": doc.get("category", "ai_news"),
    }


async def categorize_daily_signals(
    company: DreamListCompany,
    documents: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Returns (articles, service_matches) — up to 3 pairs for match_table JSONB slots.
    """
    catalog = _load_catalog()
    settings = get_settings()

    if settings.llm_enabled and documents:
        try:
            from langchain_openai import ChatOpenAI
            from pydantic import BaseModel, Field

            class ArticleSlot(BaseModel):
                headline: str
                summary: str
                source: str
                url: str = ""
                category: str = Field(
                    description="One of: product_launch, partnership, hiring, infrastructure, transformation, ai_news"
                )
                service_name: str
                service_rationale: str

            class DailyResult(BaseModel):
                articles: list[ArticleSlot] = Field(max_length=3)

            combined = "\n\n".join(
                f"- {d.get('title', 'Untitled')}: {d.get('summary', d.get('raw_content', ''))[:300]}"
                for d in documents[:12]
            )
            services_list = ", ".join(s["name"] for s in catalog[:12])

            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.2,
                api_key=settings.openai_api_key,
            ).with_structured_output(DailyResult)

            result = await llm.ainvoke(
                f"""Company: {company.company_name}
Industry: {company.industry or 'Technology'}
Website: {company.website or 'N/A'}

Select the top 3 strongest AI-related signals from the research below.
Categories: product launches, partnerships, hiring, infrastructure, transformation, general AI news.
Map each to the best cybersecurity/AI-security service from this catalog:
{services_list}

Research:
{combined[:4500]}"""
            )

            articles: list[dict[str, Any]] = []
            service_matches: list[dict[str, Any]] = []
            for slot in result.articles[:3]:
                articles.append(
                    {
                        "headline": slot.headline,
                        "summary": slot.summary,
                        "source": slot.source,
                        "url": slot.url,
                        "published_at": "",
                        "category": slot.category,
                    }
                )
                svc = next(
                    (s for s in catalog if s["name"].lower() == slot.service_name.lower()),
                    catalog[0],
                )
                service_matches.append(
                    {
                        "service_id": svc["id"],
                        "service_name": svc["name"],
                        "service_description": svc.get("description", ""),
                        "match_rationale": slot.service_rationale,
                    }
                )
            if articles:
                return articles, service_matches
        except Exception:
            pass

    # Fallback: top 3 docs + keyword service mapping
    articles = []
    service_matches = []
    for i, doc in enumerate(documents[:3]):
        article = _doc_to_article(doc, i)
        text = f"{article['headline']} {article['summary']}"
        mapping = _map_service_for_text(text, catalog)
        articles.append(article)
        service_matches.append(mapping)

    if not articles:
        articles.append(
            {
                "headline": f"{company.company_name} — AI activity monitoring",
                "summary": company.notes[:300] if company.notes else "No fresh signals found; using company profile.",
                "source": "Emitly Research",
                "url": company.website or "",
                "published_at": "",
                "category": "ai_news",
            }
        )
        service_matches.append(_map_service_for_text(company.industry or "AI", catalog))

    return articles, service_matches
