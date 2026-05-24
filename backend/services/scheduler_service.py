"""APScheduler hooks for daily and weekly LangGraph jobs."""

from __future__ import annotations

import asyncio
import logging
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.job_runner import run_daily_job, run_weekly_job
from services.job_settings_service import get_job_settings

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def _parse_time(time_str: str) -> tuple[int, int]:
    parts = time_str.split(":")
    hour = int(parts[0]) if parts else 8
    minute = int(parts[1]) if len(parts) > 1 else 0
    return hour, minute


async def _scheduled_daily():
    settings = get_job_settings()
    if not settings.daily_scan_enabled:
        logger.info("Daily scan disabled — skipping")
        return
    logger.info("Starting scheduled daily intelligence job")
    result = await run_daily_job()
    logger.info("Daily job complete: %s", result)


async def _scheduled_weekly():
    settings = get_job_settings()
    if not settings.weekly_summary_enabled:
        logger.info("Weekly summary disabled — skipping")
        return
    logger.info("Starting scheduled weekly summary job")
    result = await run_weekly_job()
    logger.info("Weekly job complete: %s", result)


def configure_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler

    scheduler = AsyncIOScheduler()
    settings = get_job_settings()

    hour, minute = _parse_time(settings.daily_scan_time)
    tz = settings.timezone or "Asia/Dubai"
    try:
        tzinfo = ZoneInfo(tz)
    except Exception:
        tzinfo = ZoneInfo("Asia/Dubai")

    scheduler.add_job(
        _scheduled_daily,
        CronTrigger(hour=hour, minute=minute, timezone=tzinfo),
        id="daily_intelligence",
        replace_existing=True,
    )

    scheduler.add_job(
        _scheduled_weekly,
        CronTrigger(day_of_week=settings.weekly_run_day, hour=hour, minute=minute, timezone=tzinfo),
        id="weekly_summary",
        replace_existing=True,
    )

    _scheduler = scheduler
    return scheduler


def start_scheduler() -> AsyncIOScheduler | None:
    try:
        scheduler = configure_scheduler()
        if not scheduler.running:
            scheduler.start()
            logger.info("Job scheduler started")
        return scheduler
    except Exception:
        logger.exception("Could not start job scheduler")
        return None


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Job scheduler stopped")
    _scheduler = None


def reschedule_from_settings() -> None:
    """Re-read job_settings and update cron triggers."""
    global _scheduler
    if _scheduler is None:
        return
    settings = get_job_settings()
    hour, minute = _parse_time(settings.daily_scan_time)
    tz = settings.timezone or "Asia/Dubai"
    try:
        tzinfo = ZoneInfo(tz)
    except Exception:
        tzinfo = ZoneInfo("Asia/Dubai")

    _scheduler.reschedule_job(
        "daily_intelligence",
        trigger=CronTrigger(hour=hour, minute=minute, timezone=tzinfo),
    )
    _scheduler.reschedule_job(
        "weekly_summary",
        trigger=CronTrigger(
            day_of_week=settings.weekly_run_day,
            hour=hour,
            minute=minute,
            timezone=tzinfo,
        ),
    )
