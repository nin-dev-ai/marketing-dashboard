"""Summarize research documents into intelligence fields."""

from __future__ import annotations

import uuid
from typing import Any

from config import get_settings
from schemas.company import Company
from schemas.intelligence import IntelligenceSource, LatestSignal


def _fallback_signal(company: Company, docs: list[dict[str, Any]]) -> LatestSignal:
    doc = docs[0] if docs else {}
    return LatestSignal(
        title=doc.get("title", f"{company.name} AI initiative update"),
        source=doc.get("publisher", "Research"),
        published_at=doc.get("published_at", ""),
        summary=doc.get(
            "summary",
            f"{company.name} is expanding AI capabilities in {company.industry or 'technology'}.",
        ),
        url=doc.get("url"),
    )


def _fallback_sources(docs: list[dict[str, Any]]) -> list[IntelligenceSource]:
    sources: list[IntelligenceSource] = []
    for i, doc in enumerate(docs[:5]):
        sources.append(
            IntelligenceSource(
                id=f"src_{i + 1}",
                title=doc.get("title", "Source"),
                url=doc.get("url", ""),
                publisher=doc.get("publisher", "Unknown"),
                date=doc.get("published_at", ""),
            )
        )
    return sources


async def summarize_signals(
    company: Company, docs: list[dict[str, Any]]
) -> dict[str, Any]:
    signal = _fallback_signal(company, docs)
    combined = "\n\n".join(
        f"{d.get('title', '')}: {d.get('raw_content', d.get('summary', ''))[:500]}"
        for d in docs[:8]
    )

    initiative = (
        f"{company.name} is advancing AI initiatives in {company.industry or 'technology'}. "
        f"Recent signals indicate focus on {signal.title.lower()[:80]}..."
    )
    why = (
        f"{company.name} sits at the intersection of {company.industry or 'enterprise AI'} "
        f"and rapid AI deployment in {company.country or 'the region'}. "
        "The demand for both velocity and assurance creates a strong fit for cybersecurity "
        "and AI governance services."
    )
    takeaway = (
        f"{company.name} shows high-value AI momentum. Engaging security and AI governance "
        "stakeholders with a clear compliance narrative is the winning approach in the next 90 days."
    )
    score = min(95, 72 + min(len(docs), 5) * 4)

    settings = get_settings()
    if settings.llm_enabled and combined.strip():
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.prompts import ChatPromptTemplate

            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=settings.openai_api_key)
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You analyze B2B AI company signals for cybersecurity sales. "
                        "Return concise initiative_summary, why_this_company, key_takeaway, "
                        "and opportunity_score (0-100) as JSON fields in your response text.",
                    ),
                    ("human", "Company: {company}\nIndustry: {industry}\n\nSignals:\n{signals}"),
                ]
            )
            chain = prompt | llm
            result = await chain.ainvoke(
                {
                    "company": company.name,
                    "industry": company.industry,
                    "signals": combined[:4000],
                }
            )
            text = result.content if hasattr(result, "content") else str(result)
            if "initiative" in text.lower():
                initiative = text[:600] if len(text) > 100 else initiative
        except Exception:
            pass

    return {
        "latest_signal": signal,
        "initiative_summary": initiative,
        "why_this_company": why,
        "key_takeaway": takeaway,
        "opportunity_score": score,
        "sources": _fallback_sources(docs),
    }
