from fastapi import APIRouter, Query

from schemas.jobs import CampaignDecision, JobRunResult, JobSettings, JobSettingsUpdate, JobStatus, MatchSummaryRow, MatchTableRow
from services.decision_service import list_pending_decisions, resolve_decision
from services.job_runner import run_daily_job, run_weekly_job
from services.job_settings_service import get_job_settings, get_job_status, update_job_settings
from services.match_service import list_match_summaries, list_match_table

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/status", response_model=JobStatus)
def jobs_status():
    """Scheduler config plus counts for monitoring, matches, and pending decisions."""
    return get_job_status()


@router.get("/settings", response_model=JobSettings)
def read_job_settings():
    return get_job_settings()


@router.patch("/settings", response_model=JobSettings)
def patch_job_settings(body: JobSettingsUpdate):
    return update_job_settings(body)


@router.get("/match-table", response_model=list[MatchTableRow])
def read_match_table(
    company_id: str | None = None,
    limit: int = Query(default=50, le=200),
):
    return list_match_table(company_id=company_id, limit=limit)


@router.get("/match-summary", response_model=list[MatchSummaryRow])
def read_match_summary(
    company_id: str | None = None,
    limit: int = Query(default=50, le=200),
):
    return list_match_summaries(company_id=company_id, limit=limit)


@router.get("/pending-decisions", response_model=list[CampaignDecision])
def read_pending_decisions():
    return list_pending_decisions()


@router.post("/pending-decisions/{decision_id}/approve", response_model=CampaignDecision)
async def approve_decision(decision_id: str):
    decision = resolve_decision(decision_id, "approved")
    if decision.summary_id:
        from services.campaign_launch_service import launch_campaign_from_summary

        await launch_campaign_from_summary(
            company_id=decision.company_id,
            company_name=decision.company_name,
            summary_id=decision.summary_id,
            summary={
                "weekly_summary": decision.weekly_summary or "",
                "opportunity_score": decision.opportunity_score,
                "opportunities": [],
            },
        )
    return decision


@router.post("/pending-decisions/{decision_id}/dismiss", response_model=CampaignDecision)
def dismiss_decision(decision_id: str):
    return resolve_decision(decision_id, "dismissed")


@router.post("/run/daily", response_model=JobRunResult)
async def trigger_daily_job():
    """Manually run Job 1 — daily intelligence for all monitoring-enabled companies."""
    return await run_daily_job()


@router.post("/run/weekly", response_model=JobRunResult)
async def trigger_weekly_job():
    """Manually run Job 2 — weekly summary for all uncondensed match rows."""
    return await run_weekly_job()
