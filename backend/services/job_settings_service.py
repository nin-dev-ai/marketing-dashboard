"""Job settings and scheduler status."""

from __future__ import annotations

import logging

from fastapi import HTTPException
from psycopg2.extras import RealDictCursor

from schemas.jobs import JobSettings, JobSettingsUpdate, JobStatus
from services.postgres import connect

logger = logging.getLogger(__name__)

_SETTINGS_COLUMNS = """
    workspace_id,
    daily_scan_enabled,
    daily_scan_time::text,
    timezone,
    weekly_summary_enabled,
    weekly_interval_days,
    weekly_run_day,
    campaign_mode,
    min_opportunity_score,
    last_daily_run_at::text,
    last_weekly_run_at::text,
    updated_at::text
"""


def get_job_settings() -> JobSettings:
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"SELECT {_SETTINGS_COLUMNS} FROM job_settings WHERE workspace_id = 'default'"
            )
            row = cur.fetchone()
            if not row:
                cur.execute(
                    "INSERT INTO job_settings (workspace_id) VALUES ('default') RETURNING workspace_id"
                )
                conn.commit()
                cur.execute(
                    f"SELECT {_SETTINGS_COLUMNS} FROM job_settings WHERE workspace_id = 'default'"
                )
                row = cur.fetchone()
    finally:
        conn.close()
    return JobSettings.model_validate(dict(row))


def update_job_settings(patch: JobSettingsUpdate) -> JobSettings:
    data = patch.model_dump(exclude_unset=True)
    if not data:
        return get_job_settings()

    sets = ", ".join(f"{key} = %({key})s" for key in data)
    data["workspace_id"] = "default"

    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"""
                UPDATE job_settings
                SET {sets}, updated_at = NOW()
                WHERE workspace_id = %(workspace_id)s
                RETURNING {_SETTINGS_COLUMNS}
                """,
                data,
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Job settings not found")
            conn.commit()
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update job settings")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        conn.close()

    result = JobSettings.model_validate(dict(row))
    try:
        from services.scheduler_service import reschedule_from_settings

        reschedule_from_settings()
    except Exception:
        logger.debug("Scheduler reschedule skipped")
    return result


def get_job_status() -> JobStatus:
    settings = get_job_settings()
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    (SELECT COUNT(*)::int FROM dream_companies WHERE monitoring_enabled = TRUE) AS monitoring_enabled_count,
                    (SELECT COUNT(*)::int FROM dream_companies) AS total_companies,
                    (SELECT COUNT(*)::int FROM campaign_decisions WHERE status = 'pending') AS pending_decisions,
                    (SELECT COUNT(*)::int FROM match_table WHERE match_date >= CURRENT_DATE - INTERVAL '7 days') AS daily_matches_7d,
                    (SELECT COUNT(*)::int FROM match_summary WHERE summary_date >= CURRENT_DATE - INTERVAL '30 days') AS weekly_summaries_30d
                """
            )
            stats = cur.fetchone()
    finally:
        conn.close()

    return JobStatus(
        settings=settings,
        monitoring_enabled_count=stats["monitoring_enabled_count"],
        total_companies=stats["total_companies"],
        pending_decisions=stats["pending_decisions"],
        daily_matches_7d=stats["daily_matches_7d"],
        weekly_summaries_30d=stats["weekly_summaries_30d"],
    )
