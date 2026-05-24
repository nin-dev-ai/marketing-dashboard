"""LangGraph workflow: Job 1 — Daily Company Intelligence."""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from chains.daily_intelligence import categorize_daily_signals
from graph.job_state import DailyJobState
from schemas.company import Company
from schemas.dream_list import DreamListCompany
from services.match_write_service import insert_daily_match
from services.research_service import gather_research_documents

logger = logging.getLogger(__name__)


def _to_company(row: DreamListCompany) -> Company:
    return Company(
        id=row.company_id,
        name=row.company_name,
        website=row.website or "",
        industry=row.industry or "Technology",
        country=row.country,
        notes=row.notes,
        linkedin_url=row.linkedin_url,
    )


async def research_node(state: DailyJobState) -> dict:
    company = state["company"]
    try:
        docs = await gather_research_documents(_to_company(company))
        return {"documents": docs, "error": None}
    except Exception as exc:
        logger.exception("Daily job research failed for %s", company.company_name)
        return {"documents": [], "error": str(exc)}


async def categorize_node(state: DailyJobState) -> dict:
    company = state["company"]
    docs = state.get("documents", [])
    try:
        articles, service_matches = await categorize_daily_signals(company, docs)
        return {"articles": articles, "service_matches": service_matches, "error": None}
    except Exception as exc:
        logger.exception("Daily job categorize failed for %s", company.company_name)
        return {"articles": [], "service_matches": [], "error": str(exc)}


async def persist_node(state: DailyJobState) -> dict:
    company = state["company"]
    articles = state.get("articles", [])
    service_matches = state.get("service_matches", [])
    if not articles:
        return {"error": state.get("error") or "No articles to persist"}

    try:
        match_id = insert_daily_match(
            company_id=company.company_id,
            company_name=company.company_name,
            articles=articles,
            service_matches=service_matches,
        )
        return {"match_id": match_id, "error": None}
    except Exception as exc:
        logger.exception("Daily job persist failed for %s", company.company_name)
        return {"error": str(exc)}


def build_daily_intelligence_graph():
    graph = StateGraph(DailyJobState)
    graph.add_node("research", research_node)
    graph.add_node("categorize", categorize_node)
    graph.add_node("persist", persist_node)

    graph.set_entry_point("research")
    graph.add_edge("research", "categorize")
    graph.add_edge("categorize", "persist")
    graph.add_edge("persist", END)
    return graph.compile()


_daily_graph = None


def get_daily_intelligence_graph():
    global _daily_graph
    if _daily_graph is None:
        _daily_graph = build_daily_intelligence_graph()
    return _daily_graph


async def run_daily_intelligence_for_company(company: DreamListCompany) -> dict:
    graph = get_daily_intelligence_graph()
    result = await graph.ainvoke({"company": company})
    return {
        "company_id": company.company_id,
        "company_name": company.company_name,
        "match_id": result.get("match_id"),
        "articles_count": len(result.get("articles", [])),
        "error": result.get("error"),
    }
