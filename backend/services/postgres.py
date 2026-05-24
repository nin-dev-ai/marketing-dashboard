"""Shared PostgreSQL connection helper."""

from __future__ import annotations

from fastapi import HTTPException

from config import get_settings


def require_db_url() -> str:
    url = get_settings().database_url_sync
    if not url:
        raise HTTPException(
            status_code=503,
            detail="DATABASE_URL is not configured. Start Postgres and set DATABASE_URL in backend/.env",
        )
    return url


def connect():
    import psycopg2

    return psycopg2.connect(require_db_url())
