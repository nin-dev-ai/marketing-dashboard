"""PostgreSQL writes for match_table, match_summary, and campaign decisions."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

from psycopg2.extras import Json, RealDictCursor

from services.postgres import connect

logger = logging.getLogger(__name__)


def get_companies_for_daily_job() -> list[dict[str, Any]]:
    """Active companies with monitoring enabled."""
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    company_id::text,
                    company_name,
                    website,
                    linkedin_url,
                    industry,
                    country,
                    notes,
                    status,
                    monitoring_enabled
                FROM dream_companies
                WHERE status = 'active' AND monitoring_enabled = TRUE
                ORDER BY company_name
                """
            )
            return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def get_uncondensed_matches_by_company(
    interval_days: int = 7,
) -> dict[str, list[dict[str, Any]]]:
    """Group non-condensed match_table rows by company_id within the interval."""
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT
                    match_id::text,
                    company_id::text,
                    company_name,
                    match_date::text,
                    news_article_1,
                    service_match_1,
                    news_article_2,
                    service_match_2,
                    news_article_3,
                    service_match_3,
                    condensed,
                    created_at::text
                FROM match_table
                WHERE condensed = FALSE
                  AND match_date >= CURRENT_DATE - %s * INTERVAL '1 day'
                ORDER BY company_id, match_date ASC
                """,
                (interval_days,),
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    grouped: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        data = dict(row)
        for key in (
            "news_article_1",
            "service_match_1",
            "news_article_2",
            "service_match_2",
            "news_article_3",
            "service_match_3",
        ):
            val = data[key]
            if isinstance(val, str):
                data[key] = json.loads(val)
            elif val is None:
                data[key] = {}
        cid = data["company_id"]
        grouped.setdefault(cid, []).append(data)
    return grouped


def insert_daily_match(
    company_id: str,
    company_name: str,
    articles: list[dict[str, Any]],
    service_matches: list[dict[str, Any]],
    match_date: date | None = None,
) -> str:
    """Insert one match_table row with up to 3 article/service pairs."""
    conn = connect()
    try:
        slots: dict[str, Any] = {}
        for i in range(3):
            art = articles[i] if i < len(articles) else {}
            svc = service_matches[i] if i < len(service_matches) else {}
            slots[f"news_article_{i + 1}"] = Json(art)
            slots[f"service_match_{i + 1}"] = Json(svc)

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO match_table (
                    company_id, company_name, match_date,
                    news_article_1, service_match_1,
                    news_article_2, service_match_2,
                    news_article_3, service_match_3,
                    condensed
                ) VALUES (
                    %s, %s, COALESCE(%s, CURRENT_DATE),
                    %s, %s, %s, %s, %s, %s, FALSE
                )
                RETURNING match_id::text
                """,
                (
                    company_id,
                    company_name,
                    match_date,
                    slots["news_article_1"],
                    slots["service_match_1"],
                    slots["news_article_2"],
                    slots["service_match_2"],
                    slots["news_article_3"],
                    slots["service_match_3"],
                ),
            )
            match_id = cur.fetchone()[0]
            cur.execute(
                """
                UPDATE dream_companies
                SET last_scraped_at = NOW(), updated_at = NOW()
                WHERE company_id = %s
                """,
                (company_id,),
            )
            conn.commit()
            return match_id
    finally:
        conn.close()


def insert_weekly_summary(
    company_id: str,
    company_name: str,
    summary: dict[str, Any],
    interval_days: int = 7,
) -> str:
    end = date.today()
    start = end - timedelta(days=interval_days - 1)
    opps = summary.get("opportunities", [])

    def slot(n: int, key: str) -> dict:
        if n < len(opps):
            return opps[n].get(key, {})
        return {}

    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO match_summary (
                    company_id, company_name,
                    summary_start_date, summary_end_date, summary_date,
                    news_article_1, service_match_1, contact_1,
                    news_article_2, service_match_2, contact_2,
                    news_article_3, service_match_3, contact_3,
                    weekly_summary, opportunity_score
                ) VALUES (
                    %s, %s, %s, %s, CURRENT_DATE,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                RETURNING summary_id::text
                """,
                (
                    company_id,
                    company_name,
                    start,
                    end,
                    Json(slot(0, "news_article")),
                    Json(slot(0, "service_match")),
                    Json(slot(0, "contact")),
                    Json(slot(1, "news_article")),
                    Json(slot(1, "service_match")),
                    Json(slot(1, "contact")),
                    Json(slot(2, "news_article")),
                    Json(slot(2, "service_match")),
                    Json(slot(2, "contact")),
                    summary.get("weekly_summary", ""),
                    summary.get("opportunity_score", 0),
                ),
            )
            summary_id = cur.fetchone()[0]
            conn.commit()
            return summary_id
    finally:
        conn.close()


def mark_matches_condensed(match_ids: list[str]) -> int:
    if not match_ids:
        return 0
    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE match_table
                SET condensed = TRUE, updated_at = NOW()
                WHERE match_id = ANY(%s::uuid[])
                """,
                (match_ids,),
            )
            count = cur.rowcount
            conn.commit()
            return count
    finally:
        conn.close()


def create_campaign_decision(
    company_id: str,
    company_name: str,
    summary_id: str,
    opportunity_score: int,
    weekly_summary: str,
) -> str:
    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO campaign_decisions (
                    company_id, summary_id, company_name,
                    opportunity_score, weekly_summary, status
                ) VALUES (%s, %s, %s, %s, %s, 'pending')
                RETURNING decision_id::text
                """,
                (company_id, summary_id, company_name, opportunity_score, weekly_summary),
            )
            decision_id = cur.fetchone()[0]
            conn.commit()
            return decision_id
    finally:
        conn.close()


def update_job_run_timestamp(job_type: str) -> None:
    column = "last_daily_run_at" if job_type == "daily" else "last_weekly_run_at"
    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                UPDATE job_settings
                SET {column} = NOW(), updated_at = NOW()
                WHERE workspace_id = 'default'
                """
            )
            conn.commit()
    finally:
        conn.close()
