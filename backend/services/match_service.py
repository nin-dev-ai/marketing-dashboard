"""Read/write match_table and match_summary rows."""

from __future__ import annotations

import json
import logging
from typing import Any

from psycopg2.extras import RealDictCursor

from schemas.jobs import MatchSummaryRow, MatchTableRow
from services.postgres import connect

logger = logging.getLogger(__name__)


def _json(value: Any) -> dict:
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        return json.loads(value)
    return {}


def list_match_table(company_id: str | None = None, limit: int = 50) -> list[MatchTableRow]:
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if company_id:
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
                        created_at::text,
                        updated_at::text
                    FROM match_table
                    WHERE company_id = %s
                    ORDER BY match_date DESC, created_at DESC
                    LIMIT %s
                    """,
                    (company_id, limit),
                )
            else:
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
                        created_at::text,
                        updated_at::text
                    FROM match_table
                    ORDER BY match_date DESC, created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
            rows = cur.fetchall()
    finally:
        conn.close()

    result = []
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
            data[key] = _json(data[key])
        result.append(MatchTableRow.model_validate(data))
    return result


def list_match_summaries(
    company_id: str | None = None, limit: int = 50
) -> list[MatchSummaryRow]:
    conn = connect()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if company_id:
                cur.execute(
                    """
                    SELECT
                        summary_id::text,
                        company_id::text,
                        company_name,
                        summary_start_date::text,
                        summary_end_date::text,
                        summary_date::text,
                        news_article_1,
                        service_match_1,
                        contact_1,
                        news_article_2,
                        service_match_2,
                        contact_2,
                        news_article_3,
                        service_match_3,
                        contact_3,
                        weekly_summary,
                        opportunity_score,
                        created_at::text
                    FROM match_summary
                    WHERE company_id = %s
                    ORDER BY summary_date DESC, created_at DESC
                    LIMIT %s
                    """,
                    (company_id, limit),
                )
            else:
                cur.execute(
                    """
                    SELECT
                        summary_id::text,
                        company_id::text,
                        company_name,
                        summary_start_date::text,
                        summary_end_date::text,
                        summary_date::text,
                        news_article_1,
                        service_match_1,
                        contact_1,
                        news_article_2,
                        service_match_2,
                        contact_2,
                        news_article_3,
                        service_match_3,
                        contact_3,
                        weekly_summary,
                        opportunity_score,
                        created_at::text
                    FROM match_summary
                    ORDER BY summary_date DESC, created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
            rows = cur.fetchall()
    finally:
        conn.close()

    result = []
    for row in rows:
        data = dict(row)
        for key in (
            "news_article_1",
            "service_match_1",
            "contact_1",
            "news_article_2",
            "service_match_2",
            "contact_2",
            "news_article_3",
            "service_match_3",
            "contact_3",
        ):
            data[key] = _json(data[key])
        result.append(MatchSummaryRow.model_validate(data))
    return result
