# Emitly — Dream List Database

PostgreSQL schema for dream companies, daily matches, weekly summaries, and job scheduling.

## Tables

| Table | Purpose |
|-------|---------|
| `dream_companies` | Dream list master data (`monitoring_enabled` toggles daily scans) |
| `job_settings` | Workspace scheduler config (daily time, weekly interval, campaign mode) |
| `match_table` | Daily news + service matches per company |
| `match_summary` | Weekly condensed summaries with opportunity scores |
| `campaign_decisions` | Pending weekly review queue when campaign mode is `notify` |

## API (backend)

| Endpoint | Purpose |
|----------|---------|
| `PATCH /api/dream-companies/{id}/monitoring` | Toggle company monitoring |
| `GET/PATCH /api/jobs/settings` | Job schedule configuration |
| `GET /api/jobs/status` | Settings + pipeline counts |
| `GET /api/jobs/match-table` | Daily match rows |
| `GET /api/jobs/match-summary` | Weekly summary rows |
| `GET /api/jobs/pending-decisions` | Notifications queue |
| `POST /api/jobs/pending-decisions/{id}/approve` | Approve campaign start |
| `POST /api/jobs/pending-decisions/{id}/dismiss` | Dismiss review |

## Run locally (Docker)

From `backend/`:

```bash
docker compose up -d postgres
```

To recreate after schema changes:

```bash
docker compose down -v
docker compose up -d postgres
```

## Connection string

```
postgresql://emitly:emitly@localhost:5433/emitly
```

## Seed summary

- **30 companies** (G42 group + UAE AI/cyber players)
- **1 default job_settings row** (daily 08:00 Asia/Dubai, weekly every 7 days, notify mode)
