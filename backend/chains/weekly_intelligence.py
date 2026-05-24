"""Condense 7-day match_table rows into weekly summary + top opportunities."""

from __future__ import annotations

import json
from typing import Any

from config import get_settings


def _collect_signals(match_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    signals: list[dict[str, Any]] = []
    for row in match_rows:
        for i in range(1, 4):
            article = row.get(f"news_article_{i}") or {}
            service = row.get(f"service_match_{i}") or {}
            if article.get("headline") or article.get("summary"):
                signals.append(
                    {
                        "date": row.get("match_date"),
                        "headline": article.get("headline", ""),
                        "summary": article.get("summary", ""),
                        "source": article.get("source", ""),
                        "service_name": service.get("service_name", ""),
                        "service_rationale": service.get("match_rationale", ""),
                    }
                )
    return signals


def _fallback_weekly(company_name: str, signals: list[dict[str, Any]]) -> dict[str, Any]:
    catalog_path = get_settings().data_dir / "services_catalog.json"
    contacts_path = get_settings().data_dir / "sample_contacts.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    contacts = json.loads(contacts_path.read_text(encoding="utf-8"))
    roles = contacts.get("default", [])[:3]

    sorted_signals = sorted(signals, key=lambda s: len(s.get("summary", "")), reverse=True)
    top = sorted_signals[:3]
    while len(top) < 3 and catalog:
        svc = catalog[len(top) % len(catalog)]
        top.append(
            {
                "headline": f"{company_name} AI security opportunity",
                "summary": svc.get("description", ""),
                "service_name": svc["name"],
                "service_rationale": "Catalog match for ongoing AI expansion.",
            }
        )

    opportunities = []
    for i, sig in enumerate(top[:3]):
        role = roles[i]["role"] if i < len(roles) else "CISO"
        opportunities.append(
            {
                "news_article": {
                    "headline": sig.get("headline", ""),
                    "summary": sig.get("summary", ""),
                    "source": sig.get("source", ""),
                },
                "service_match": {
                    "service_name": sig.get("service_name", ""),
                    "match_rationale": sig.get("service_rationale", ""),
                },
                "contact": {
                    "role": role,
                    "reason": roles[i]["reason"] if i < len(roles) else "Security decision-maker for AI initiatives.",
                    "name": roles[i].get("name", "") if i < len(roles) else "",
                },
            }
        )

    score = min(95, 60 + len(signals) * 3 + sum(len(o["news_article"].get("summary", "")) for o in opportunities) // 50)
    summary_text = (
        f"Weekly review for {company_name}: {len(signals)} AI signals collected. "
        f"Top opportunity: {opportunities[0]['news_article']['headline'][:100]}."
    )

    return {
        "weekly_summary": summary_text,
        "opportunity_score": score,
        "opportunities": opportunities,
    }


async def summarize_weekly_intelligence(
    company_name: str,
    match_rows: list[dict[str, Any]],
) -> dict[str, Any]:
    signals = _collect_signals(match_rows)
    settings = get_settings()

    if settings.llm_enabled and signals:
        try:
            from langchain_openai import ChatOpenAI
            from pydantic import BaseModel, Field

            class ContactMatch(BaseModel):
                role: str
                reason: str
                name: str = ""

            class OpportunitySlot(BaseModel):
                headline: str
                summary: str
                service_name: str
                service_rationale: str
                contact: ContactMatch

            class WeeklyResult(BaseModel):
                weekly_summary: str
                opportunity_score: int = Field(ge=0, le=100)
                opportunities: list[OpportunitySlot] = Field(max_length=3)

            signal_text = "\n".join(
                f"[{s.get('date')}] {s.get('headline')}: {s.get('summary')[:200]} → {s.get('service_name')}"
                for s in signals[:21]
            )

            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.2,
                api_key=settings.openai_api_key,
            ).with_structured_output(WeeklyResult)

            result = await llm.ainvoke(
                f"""Company: {company_name}
Daily signals collected this week ({len(signals)} total, variable count per day):

{signal_text[:6000]}

Condense into the top 3 cybersecurity sales opportunities.
For each: headline, summary, best service mapping, and ideal stakeholder role (CISO, CTO, Head of AI, etc.).
Write a 2-3 sentence weekly_summary and opportunity_score 0-100."""
            )

            opportunities = []
            for slot in result.opportunities[:3]:
                opportunities.append(
                    {
                        "news_article": {
                            "headline": slot.headline,
                            "summary": slot.summary,
                            "source": "Weekly rollup",
                        },
                        "service_match": {
                            "service_name": slot.service_name,
                            "match_rationale": slot.service_rationale,
                        },
                        "contact": {
                            "role": slot.contact.role,
                            "reason": slot.contact.reason,
                            "name": slot.contact.name,
                        },
                    }
                )
            return {
                "weekly_summary": result.weekly_summary,
                "opportunity_score": result.opportunity_score,
                "opportunities": opportunities,
            }
        except Exception:
            pass

    return _fallback_weekly(company_name, signals)
