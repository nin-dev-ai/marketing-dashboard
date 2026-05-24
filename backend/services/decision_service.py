"""Campaign decision queue for weekly review notifications."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import HTTPException
from psycopg2.extras import RealDictCursor

from schemas.jobs import CampaignDecision
from services.postgres import connect
from store.json_store import get_store

logger = logging.getLogger(__name__)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_pending_decisions() -> list[CampaignDecision]:
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    decision_id::text,
                    company_id::text,
                    summary_id::text,
                    company_name,
                    opportunity_score,
                    weekly_summary,
                    status,
                    created_at::text,
                    resolved_at::text
                FROM campaign_decisions
                WHERE status = 'pending'
                ORDER BY created_at DESC
                """
            )
            rows = cur.fetchall()
    finally:
        conn.close()
    return [CampaignDecision.model_validate(dict(r)) for r in rows]


def resolve_decision(decision_id: str, action: str) -> CampaignDecision:
    if action not in ("approved", "dismissed"):
        raise HTTPException(status_code=400, detail="action must be approved or dismissed")

    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    decision_id::text,
                    company_id::text,
                    summary_id::text,
                    company_name,
                    opportunity_score,
                    weekly_summary,
                    status,
                    created_at::text,
                    resolved_at::text
                FROM campaign_decisions
                WHERE decision_id = %s AND status = 'pending'
                """,
                (decision_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Pending decision not found")

            cur.execute(
                """
                UPDATE campaign_decisions
                SET status = %s, resolved_at = NOW()
                WHERE decision_id = %s
                RETURNING
                    decision_id::text,
                    company_id::text,
                    summary_id::text,
                    company_name,
                    opportunity_score,
                    weekly_summary,
                    status,
                    created_at::text,
                    resolved_at::text
                """,
                (action, decision_id),
            )
            updated = cur.fetchone()
            conn.commit()
    finally:
        conn.close()

    decision = CampaignDecision.model_validate(dict(updated))

    if action == "approved":
        store = get_store()
        store.add_activity(
            f"Weekly review approved — campaign queued for {decision.company_name}",
        )

    return decision
