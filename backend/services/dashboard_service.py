"""Merge JSON-store dashboard metrics with dream-list data."""

from __future__ import annotations

from datetime import datetime, timezone

from schemas.campaign import ActivityItem
from schemas.dashboard import DashboardData, DashboardKpis, TopOpportunity
from services.dream_list_service import get_dream_list_companies, opportunity_score_for
from store.json_store import get_store


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_merged_dashboard() -> DashboardData:
    base = get_store().get_dashboard()
    dream_list = get_dream_list_companies()
    if not dream_list:
        return base

    active_dream = [c for c in dream_list if c.status == "active"]
    store = get_store()
    json_ids = {c.id for c in store.list_companies()}
    dream_ids = {c.company_id for c in dream_list}

    extra_user_companies = sum(
        1 for cid in json_ids if cid and cid not in dream_ids
    )
    dream_count = len(active_dream) + extra_user_companies

    seen_companies: set[str] = set()
    merged_opps: list[TopOpportunity] = []

    for opp in base.top_opportunities:
        key = opp.company.lower()
        if key in seen_companies:
            continue
        seen_companies.add(key)
        merged_opps.append(opp)

    dream_opps = sorted(
        active_dream,
        key=lambda c: -opportunity_score_for(c),
    )
    for company in dream_opps:
        name = company.company_name
        key = name.lower()
        if key in seen_companies:
            continue
        seen_companies.add(key)
        merged_opps.append(
            TopOpportunity(
                id=company.company_id,
                company=name,
                industry=company.discovery_reason or company.industry or "Unknown",
                opportunity_score=opportunity_score_for(company),
            )
        )
        if len(merged_opps) >= 10:
            break

    activity: list[ActivityItem] = [
        ActivityItem(
            id="act_dream_list",
            message=(
                f"Postgres dream list synced — {len(active_dream)} UAE AI & "
                f"cyber companies"
            ),
            timestamp=_now_iso(),
        ),
    ]
    for item in base.activity_feed:
        if item.id != "act_dream_list":
            activity.append(item)
        if len(activity) >= 10:
            break

    prospect_opportunities = max(
        base.kpis.opportunities,
        len([c for c in active_dream if c.company_id not in json_ids]),
    )

    return DashboardData(
        kpis=DashboardKpis(
            dream_companies=dream_count,
            opportunities=prospect_opportunities,
            emails_generated=base.kpis.emails_generated,
            ready_to_send=base.kpis.ready_to_send,
        ),
        recent_campaigns=base.recent_campaigns,
        top_opportunities=merged_opps[:10],
        activity_feed=activity[:10],
    )
