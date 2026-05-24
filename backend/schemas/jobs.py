from typing import Any, Literal

from pydantic import BaseModel, Field


CampaignMode = Literal["auto", "notify"]
DecisionStatus = Literal["pending", "approved", "dismissed"]


class JobSettings(BaseModel):
    workspace_id: str = "default"
    daily_scan_enabled: bool = True
    daily_scan_time: str = "08:00:00"
    timezone: str = "Asia/Dubai"
    weekly_summary_enabled: bool = True
    weekly_interval_days: int = 7
    weekly_run_day: int = 1
    campaign_mode: CampaignMode = "notify"
    min_opportunity_score: int = 70
    last_daily_run_at: str | None = None
    last_weekly_run_at: str | None = None
    updated_at: str | None = None


class JobSettingsUpdate(BaseModel):
    daily_scan_enabled: bool | None = None
    daily_scan_time: str | None = None
    timezone: str | None = None
    weekly_summary_enabled: bool | None = None
    weekly_interval_days: int | None = None
    weekly_run_day: int | None = None
    campaign_mode: CampaignMode | None = None
    min_opportunity_score: int | None = None


class JobStatus(BaseModel):
    settings: JobSettings
    monitoring_enabled_count: int
    total_companies: int
    pending_decisions: int
    daily_matches_7d: int
    weekly_summaries_30d: int


class MatchTableRow(BaseModel):
    match_id: str
    company_id: str
    company_name: str
    match_date: str
    news_article_1: dict[str, Any] = Field(default_factory=dict)
    service_match_1: dict[str, Any] = Field(default_factory=dict)
    news_article_2: dict[str, Any] = Field(default_factory=dict)
    service_match_2: dict[str, Any] = Field(default_factory=dict)
    news_article_3: dict[str, Any] = Field(default_factory=dict)
    service_match_3: dict[str, Any] = Field(default_factory=dict)
    condensed: bool = False
    created_at: str | None = None
    updated_at: str | None = None


class MatchSummaryRow(BaseModel):
    summary_id: str
    company_id: str
    company_name: str
    summary_start_date: str
    summary_end_date: str
    summary_date: str
    news_article_1: dict[str, Any] = Field(default_factory=dict)
    service_match_1: dict[str, Any] = Field(default_factory=dict)
    contact_1: dict[str, Any] = Field(default_factory=dict)
    news_article_2: dict[str, Any] = Field(default_factory=dict)
    service_match_2: dict[str, Any] = Field(default_factory=dict)
    contact_2: dict[str, Any] = Field(default_factory=dict)
    news_article_3: dict[str, Any] = Field(default_factory=dict)
    service_match_3: dict[str, Any] = Field(default_factory=dict)
    contact_3: dict[str, Any] = Field(default_factory=dict)
    weekly_summary: str | None = None
    opportunity_score: int = 0
    created_at: str | None = None


class CampaignDecision(BaseModel):
    decision_id: str
    company_id: str
    summary_id: str | None = None
    company_name: str
    opportunity_score: int = 0
    weekly_summary: str | None = None
    status: DecisionStatus = "pending"
    created_at: str
    resolved_at: str | None = None


class MonitoringToggle(BaseModel):
    monitoring_enabled: bool


class JobRunResult(BaseModel):
    job: str
    companies_processed: int
    succeeded: int
    failed: int
    results: list[dict] = Field(default_factory=list)
    message: str | None = None
