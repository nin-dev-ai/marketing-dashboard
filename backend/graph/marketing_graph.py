"""LangGraph marketing intelligence workflow."""

from __future__ import annotations

from datetime import datetime, timezone

from langgraph.graph import END, StateGraph

from chains.extract_risks import extract_risks
from chains.generate_emails import generate_email_sequence
from chains.map_services import map_services
from chains.summarize_signals import summarize_signals
from graph.state import MarketingGraphState
from schemas.company import Company
from schemas.intelligence import CompanyIntelligence
from services.email_generation import build_email_sequence
from services.research_service import gather_research_documents
from services.stakeholder_service import recommend_stakeholders
from store.json_store import get_store


async def research_node(state: MarketingGraphState) -> dict:
    company = state["company"]
    docs = await gather_research_documents(company)
    store = get_store()
    store.save_source_documents(company.id, docs)
    return {"documents": docs}


async def risk_analysis_node(state: MarketingGraphState) -> dict:
    company = state["company"]
    docs = state.get("documents", [])
    risks = await extract_risks(company, docs)
    return {"risks": risks}


async def service_mapping_node(state: MarketingGraphState) -> dict:
    risks = state.get("risks", [])
    matched = await map_services(risks)
    company = state["company"]
    docs = state.get("documents", [])
    summary = await summarize_signals(company, docs)

    intelligence = CompanyIntelligence(
        company=company,
        opportunity_score=summary["opportunity_score"],
        latest_signal=summary["latest_signal"],
        initiative_summary=summary["initiative_summary"],
        why_this_company=summary["why_this_company"],
        risks=risks,
        matched_services=matched,
        stakeholders=recommend_stakeholders(company.industry or ""),
        key_takeaway=summary["key_takeaway"],
        sources=summary["sources"],
    )
    return {"intelligence": intelligence}


async def stakeholder_node(state: MarketingGraphState) -> dict:
    """Stakeholders already attached in service_mapping_node; pass through."""
    return {}


async def intelligence_save_node(state: MarketingGraphState) -> dict:
    company = state["company"]
    intelligence = state["intelligence"]
    store = get_store()
    record = store.save_intelligence(company.id, intelligence)
    return {"intelligence_run_id": record.id}


async def email_generation_node(state: MarketingGraphState) -> dict:
    company = state["company"]
    intelligence = state["intelligence"]
    campaign_id = state.get("campaign_id", "")

    if campaign_id:
        emails = await build_email_sequence(company, intelligence, campaign_id)
    else:
        emails = await generate_email_sequence(company, intelligence)
    return {"emails": emails}


async def campaign_save_node(state: MarketingGraphState) -> dict:
    company = state["company"]
    intelligence = state["intelligence"]
    emails = state.get("emails", [])
    store = get_store()

    run_id = state.get("intelligence_run_id")
    if not run_id:
        record = store.save_intelligence(company.id, intelligence)
        run_id = record.id

    campaign_name = f"{company.name} Outreach"
    existing = [
        c for c in store.list_campaigns() if c.company_id == company.id and c.name == campaign_name
    ]
    if existing:
        campaign = existing[-1]
    else:
        campaign = store.create_campaign(
            company_id=company.id,
            intelligence_run_id=run_id,
            name=campaign_name,
            opportunity_score=intelligence.opportunity_score,
        )

    store.save_emails(campaign.id, emails)
    store.update_campaign_status(
        campaign.id,
        "In Progress" if any(e.status == "Draft" for e in emails) else "Ready to Send",
    )
    return {"campaign_id": campaign.id, "emails": emails}


def build_intelligence_graph():
    graph = StateGraph(MarketingGraphState)
    graph.add_node("research", research_node)
    graph.add_node("risk_analysis", risk_analysis_node)
    graph.add_node("service_mapping", service_mapping_node)
    graph.add_node("stakeholder", stakeholder_node)
    graph.add_node("save_intelligence", intelligence_save_node)

    graph.set_entry_point("research")
    graph.add_edge("research", "risk_analysis")
    graph.add_edge("risk_analysis", "service_mapping")
    graph.add_edge("service_mapping", "stakeholder")
    graph.add_edge("stakeholder", "save_intelligence")
    graph.add_edge("save_intelligence", END)
    return graph.compile()


def build_email_graph():
    graph = StateGraph(MarketingGraphState)
    graph.add_node("email_generation", email_generation_node)
    graph.add_node("campaign_save", campaign_save_node)

    graph.set_entry_point("email_generation")
    graph.add_edge("email_generation", "campaign_save")
    graph.add_edge("campaign_save", END)
    return graph.compile()


_intelligence_graph = None
_email_graph = None


def get_intelligence_graph():
    global _intelligence_graph
    if _intelligence_graph is None:
        _intelligence_graph = build_intelligence_graph()
    return _intelligence_graph


def get_email_graph():
    global _email_graph
    if _email_graph is None:
        _email_graph = build_email_graph()
    return _email_graph


async def run_intelligence_pipeline(company: Company) -> CompanyIntelligence:
    graph = get_intelligence_graph()
    result = await graph.ainvoke({"company": company, "mode": "intelligence"})
    return result["intelligence"]


async def run_email_pipeline(
    company: Company, intelligence: CompanyIntelligence, campaign_id: str = ""
) -> tuple[str, list]:
    graph = get_email_graph()
    result = await graph.ainvoke(
        {
            "company": company,
            "intelligence": intelligence,
            "campaign_id": campaign_id,
            "mode": "emails",
        }
    )
    return result["campaign_id"], result.get("emails", [])
