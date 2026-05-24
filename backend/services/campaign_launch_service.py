"""Launch campaigns from weekly summaries (auto-start mode)."""

from __future__ import annotations

import logging
from typing import Any

from schemas.company import Company
from graph.marketing_graph import run_intelligence_pipeline, run_email_pipeline
from services.match_write_service import create_campaign_decision
from services.postgres import connect
from store.json_store import get_store

logger = logging.getLogger(__name__)


def _fetch_company_row(company_id: str) -> dict[str, Any] | None:
    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT company_id::text, company_name, website, linkedin_url,
                       industry, country, notes
                FROM dream_companies WHERE company_id = %s
                """,
                (company_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            cols = [
                "company_id",
                "company_name",
                "website",
                "linkedin_url",
                "industry",
                "country",
                "notes",
            ]
            return dict(zip(cols, row))
    finally:
        conn.close()


async def launch_campaign_from_summary(
    company_id: str,
    company_name: str,
    summary_id: str,
    summary: dict[str, Any],
) -> str:
    """
    Auto-start: run intelligence + email pipeline, log activity.
    Returns a pseudo decision_id for tracking (approved auto-run).
    """
    row = _fetch_company_row(company_id)
    if not row:
        raise ValueError(f"Company {company_id} not found")

    company = Company(
        id=company_id,
        name=row["company_name"],
        website=row.get("website") or "",
        industry=row.get("industry") or "Technology",
        country=row.get("country") or "UAE",
        notes=summary.get("weekly_summary") or row.get("notes"),
        linkedin_url=row.get("linkedin_url"),
    )

    try:
        intelligence = await run_intelligence_pipeline(company)
        campaign_id, _emails = await run_email_pipeline(company, intelligence)
        store = get_store()
        store.add_activity(
            f"Auto-campaign started for {company_name} from weekly summary (campaign {campaign_id})"
        )
        logger.info("Auto campaign %s for %s", campaign_id, company_name)
    except Exception as exc:
        logger.exception("Auto campaign failed for %s", company_name)
        store = get_store()
        store.add_activity(f"Auto-campaign failed for {company_name}: {exc}")

    return summary_id
