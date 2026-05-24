"""State types for automated job LangGraph workflows."""

from __future__ import annotations

from typing import Any, TypedDict

from schemas.dream_list import DreamListCompany


class DailyJobState(TypedDict, total=False):
    company: DreamListCompany
    documents: list[dict[str, Any]]
    articles: list[dict[str, Any]]
    service_matches: list[dict[str, Any]]
    match_id: str
    error: str | None


class WeeklyJobState(TypedDict, total=False):
    company: DreamListCompany
    company_id: str
    company_name: str
    match_rows: list[dict[str, Any]]
    job_settings: dict[str, Any]
    summary: dict[str, Any]
    summary_id: str
    decision_id: str | None
    error: str | None
