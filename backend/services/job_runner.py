"""Orchestrate daily and weekly LangGraph job runs."""

from __future__ import annotations

import logging
from typing import Any

from schemas.dream_list import DreamListCompany
from graph.daily_intelligence_graph import run_daily_intelligence_for_company
from graph.weekly_summary_graph import run_weekly_summary_for_company
from services.job_settings_service import get_job_settings
from services.match_write_service import (
    get_companies_for_daily_job,
    get_uncondensed_matches_by_company,
    update_job_run_timestamp,
)

logger = logging.getLogger(__name__)


async def run_daily_job() -> dict[str, Any]:
    """Job 1: scan all monitoring-enabled active companies."""
    companies_raw = get_companies_for_daily_job()
    results: list[dict[str, Any]] = []

    for row in companies_raw:
        company = DreamListCompany.model_validate(row)
        try:
            result = await run_daily_intelligence_for_company(company)
            results.append(result)
        except Exception as exc:
            logger.exception("Daily job failed for %s", company.company_name)
            results.append(
                {
                    "company_id": company.company_id,
                    "company_name": company.company_name,
                    "error": str(exc),
                }
            )

    update_job_run_timestamp("daily")
    succeeded = sum(1 for r in results if r.get("match_id") and not r.get("error"))
    return {
        "job": "daily_intelligence",
        "companies_processed": len(results),
        "succeeded": succeeded,
        "failed": len(results) - succeeded,
        "results": results,
    }


async def run_weekly_job() -> dict[str, Any]:
    """Job 2: summarize non-condensed match_table rows per company."""
    settings = get_job_settings()
    interval = settings.weekly_interval_days
    grouped = get_uncondensed_matches_by_company(interval_days=interval)

    if not grouped:
        update_job_run_timestamp("weekly")
        return {
            "job": "weekly_summary",
            "companies_processed": 0,
            "succeeded": 0,
            "failed": 0,
            "results": [],
            "message": "No uncondensed match rows to summarize",
        }

    job_settings = settings.model_dump()
    results: list[dict[str, Any]] = []

    for company_id, match_rows in grouped.items():
        company_name = match_rows[0].get("company_name", "Unknown")
        try:
            result = await run_weekly_summary_for_company(
                company_id=company_id,
                company_name=company_name,
                match_rows=match_rows,
                job_settings=job_settings,
            )
            results.append(result)
        except Exception as exc:
            logger.exception("Weekly job failed for %s", company_name)
            results.append(
                {
                    "company_id": company_id,
                    "company_name": company_name,
                    "error": str(exc),
                }
            )

    update_job_run_timestamp("weekly")
    succeeded = sum(1 for r in results if r.get("summary_id") and not r.get("error"))
    return {
        "job": "weekly_summary",
        "companies_processed": len(results),
        "succeeded": succeeded,
        "failed": len(results) - succeeded,
        "results": results,
    }
