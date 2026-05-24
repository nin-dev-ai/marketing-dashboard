"""Load dream-list companies from PostgreSQL."""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone

from fastapi import HTTPException
from psycopg2.extras import RealDictCursor

from schemas.dream_list import DreamCompanyResponse, DreamListCompany
from services.postgres import connect, require_db_url
from store.json_store import get_store

logger = logging.getLogger(__name__)

DB_STATUS_TO_UI = {
    "active": "New",
    "acquired": "Archived",
    "merged": "Archived",
    "inactive": "Archived",
}


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "company"


def opportunity_score_for(company: DreamListCompany) -> int:
    if company.opportunity_score > 0:
        return min(98, company.opportunity_score)
    base = 72
    if company.status != "active":
        base -= 10
    base += sum(ord(c) for c in company.company_id) % 15
    return min(98, max(55, base))


def _require_db_url() -> str:
    return require_db_url()


def _fetch_companies_from_postgres() -> list[DreamListCompany]:
    try:
        conn = connect()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT
                        dc.company_id::text,
                        dc.company_name,
                        dc.website,
                        dc.linkedin_url,
                        dc.industry,
                        dc.country,
                        dc.notes,
                        dc.discovery_source,
                        dc.discovery_reason,
                        dc.added_by_ai,
                        dc.status,
                        dc.monitoring_enabled,
                        dc.last_scraped_at::text,
                        dc.created_at::text,
                        dc.updated_at::text,
                        COALESCE(ms.opportunity_score, 0) AS opportunity_score,
                        ms.weekly_summary
                    FROM dream_companies dc
                    LEFT JOIN LATERAL (
                        SELECT opportunity_score, weekly_summary
                        FROM match_summary
                        WHERE company_id = dc.company_id
                        ORDER BY summary_date DESC
                        LIMIT 1
                    ) ms ON TRUE
                    ORDER BY dc.company_name
                    """
                )
                rows = cur.fetchall()
        finally:
            conn.close()
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Postgres dream list query failed")
        raise HTTPException(
            status_code=503,
            detail=f"Could not read companies from Postgres: {exc}",
        ) from exc

    return [DreamListCompany.model_validate(dict(r)) for r in rows]


def _workflow_status(company_id: str, has_intelligence: bool, has_campaign: bool) -> str:
    if has_campaign:
        return "Active Campaign"
    if has_intelligence:
        return "Intelligence Ready"
    return DB_STATUS_TO_UI.get("active", "New")


def _json_store_counts(company_id: str, slug: str) -> tuple[int, int, int, bool, bool]:
    store = get_store()
    has_intel = (
        store.get_intelligence_by_company(company_id) is not None
        or store.get_intelligence_by_company(slug) is not None
    )
    campaigns = [
        c
        for c in store.list_campaigns()
        if c.company_id in (company_id, slug)
    ]
    emails = sum(len(store.get_emails_for_campaign(c.id)) for c in campaigns)
    stakeholders = 0
    intel = store.get_intelligence_by_company(company_id) or store.get_intelligence_by_company(
        slug
    )
    if intel:
        stakeholders = len(intel.intelligence.stakeholders)
    return len(campaigns), emails, stakeholders, has_intel, len(campaigns) > 0


def to_dream_company_response(row: DreamListCompany) -> DreamCompanyResponse:
    slug = _slugify(row.company_name)
    campaigns_count, emails_count, stakeholders_count, has_intel, has_campaign = (
        _json_store_counts(row.company_id, slug)
    )
    ui_status = _workflow_status(row.company_id, has_intel, has_campaign)
    if row.status != "active":
        ui_status = DB_STATUS_TO_UI.get(row.status, "Archived")

    last_signal = row.weekly_summary
    if not last_signal and row.notes:
        last_signal = row.notes[:120]

    now = datetime.now(timezone.utc).isoformat()
    return DreamCompanyResponse(
        id=row.company_id,
        slug=slug,
        name=row.company_name,
        website=row.website or "",
        industry=row.industry or "Unknown",
        country=row.country,
        status=ui_status,
        opportunity_score=opportunity_score_for(row),
        stakeholders_count=stakeholders_count,
        campaigns_count=campaigns_count,
        emails_count=emails_count,
        last_signal=last_signal,
        added_at=row.created_at or now,
        updated_at=row.updated_at or now,
        description=row.notes,
        linkedin_url=row.linkedin_url,
        discovery_source=row.discovery_source,
        discovery_reason=row.discovery_reason,
        added_by_ai=row.added_by_ai,
        monitoring_enabled=row.monitoring_enabled,
    )


def get_dream_list_companies() -> list[DreamListCompany]:
    return _fetch_companies_from_postgres()


def get_dream_companies_for_api() -> list[DreamCompanyResponse]:
    return [to_dream_company_response(c) for c in get_dream_list_companies()]


def get_dream_company_by_id(company_id: str) -> DreamCompanyResponse:
    for row in get_dream_list_companies():
        if row.company_id == company_id or _slugify(row.company_name) == company_id:
            return to_dream_company_response(row)
    raise HTTPException(status_code=404, detail="Company not found in dream list")


def set_company_monitoring(company_id: str, enabled: bool) -> DreamCompanyResponse:
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE dream_companies
                SET monitoring_enabled = %s, updated_at = NOW()
                WHERE company_id = %s
                RETURNING company_id::text
                """,
                (enabled, company_id),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Company not found in dream list")
            conn.commit()
    finally:
        conn.close()
    return get_dream_company_by_id(company_id)
