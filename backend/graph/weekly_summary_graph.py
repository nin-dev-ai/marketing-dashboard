"""LangGraph workflow: Job 2 — 7-Day Intelligence Summary."""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from chains.weekly_intelligence import summarize_weekly_intelligence
from graph.job_state import WeeklyJobState
from schemas.dream_list import DreamListCompany
from services.match_write_service import create_campaign_decision, insert_weekly_summary, mark_matches_condensed

logger = logging.getLogger(__name__)


async def summarize_node(state: WeeklyJobState) -> dict:
    company_name = state["company_name"]
    match_rows = state.get("match_rows", [])
    try:
        summary = await summarize_weekly_intelligence(company_name, match_rows)
        return {"summary": summary, "error": None}
    except Exception as exc:
        logger.exception("Weekly summarize failed for %s", company_name)
        return {"summary": {}, "error": str(exc)}


async def persist_node(state: WeeklyJobState) -> dict:
    company_id = state["company_id"]
    company_name = state["company_name"]
    match_rows = state.get("match_rows", [])
    summary = state.get("summary", {})
    settings = state.get("job_settings", {})

    if not summary or not match_rows:
        return {"error": state.get("error") or "Nothing to summarize"}

    interval_days = settings.get("weekly_interval_days", 7)
    campaign_mode = settings.get("campaign_mode", "notify")
    min_score = settings.get("min_opportunity_score", 70)

    try:
        summary_id = insert_weekly_summary(
            company_id=company_id,
            company_name=company_name,
            summary=summary,
            interval_days=interval_days,
        )
        match_ids = [r["match_id"] for r in match_rows if r.get("match_id")]
        mark_matches_condensed(match_ids)

        decision_id = None
        score = summary.get("opportunity_score", 0)
        weekly_text = summary.get("weekly_summary", "")

        if score >= min_score:
            if campaign_mode == "notify":
                decision_id = create_campaign_decision(
                    company_id=company_id,
                    company_name=company_name,
                    summary_id=summary_id,
                    opportunity_score=score,
                    weekly_summary=weekly_text,
                )
            else:
                from services.campaign_launch_service import launch_campaign_from_summary

                decision_id = await launch_campaign_from_summary(
                    company_id=company_id,
                    company_name=company_name,
                    summary_id=summary_id,
                    summary=summary,
                )

        return {
            "summary_id": summary_id,
            "decision_id": decision_id,
            "error": None,
        }
    except Exception as exc:
        logger.exception("Weekly persist failed for %s", company_name)
        return {"error": str(exc)}


def build_weekly_summary_graph():
    graph = StateGraph(WeeklyJobState)
    graph.add_node("summarize", summarize_node)
    graph.add_node("persist", persist_node)

    graph.set_entry_point("summarize")
    graph.add_edge("summarize", "persist")
    graph.add_edge("persist", END)
    return graph.compile()


_weekly_graph = None


def get_weekly_summary_graph():
    global _weekly_graph
    if _weekly_graph is None:
        _weekly_graph = build_weekly_summary_graph()
    return _weekly_graph


async def run_weekly_summary_for_company(
    company_id: str,
    company_name: str,
    match_rows: list[dict],
    job_settings: dict,
) -> dict:
    graph = get_weekly_summary_graph()
    company = DreamListCompany(
        company_id=company_id,
        company_name=company_name,
    )
    result = await graph.ainvoke(
        {
            "company": company,
            "company_id": company_id,
            "company_name": company_name,
            "match_rows": match_rows,
            "job_settings": job_settings,
        }
    )
    return {
        "company_id": company_id,
        "company_name": company_name,
        "summary_id": result.get("summary_id"),
        "decision_id": result.get("decision_id"),
        "signals_processed": sum(
            1
            for r in match_rows
            for i in range(1, 4)
            if (r.get(f"news_article_{i}") or {}).get("headline")
        ),
        "error": result.get("error"),
    }
