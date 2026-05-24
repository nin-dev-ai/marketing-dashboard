# Emitly Backend

FastAPI backend for the Emitly marketing intelligence platform. Uses JSON file storage, LangGraph orchestration, and fallback-first scraping.

## Run

Requires **Python 3.10+** (3.12 recommended).

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # optional: set OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Automated jobs (LangGraph)

| Job | Graph | Trigger |
|-----|-------|---------|
| **Daily intelligence** | `graph/daily_intelligence_graph.py` | Scheduler 8 AM + `POST /api/jobs/run/daily` |
| **Weekly summary** | `graph/weekly_summary_graph.py` | Scheduler weekly + `POST /api/jobs/run/weekly` |

**Daily flow:** research → categorize top 3 articles + service maps → `match_table`  
**Weekly flow:** rollup uncondensed rows → `match_summary` → notify or auto-start campaign

Enable companies on **Dream Companies** (Monitor toggle). Requires Postgres (`DATABASE_URL`).

```bash
docker compose up -d postgres
```

## Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `.env.local` (optional; this is the default).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | LLM categorization + weekly summary (fallback templates without it) |
| `TAVILY_API_KEY` | No | Better news search (`topic=news`); DuckDuckGo news used otherwise |
| `CORS_ORIGINS` | No | Comma-separated origins (default `http://localhost:3000`) |
| `DATA_DIR` | No | Static data directory |
| `STORE_FILE` | No | Runtime JSON store path |

## Fallback behavior

1. Scraping tries RSS, website paths, and web search (including LinkedIn via search snippets).
2. If live fetch fails or keys are missing, `data/sample_news.json` is used.
3. LLM steps use template-based output when `OPENAI_API_KEY` is unset.

## Demo flow

1. Open http://localhost:3000/dashboard
2. Add Dream Company (e.g. Core42)
3. Generate intelligence → view risks and services
4. Generate emails → edit in Email Workspace
5. Open campaign detail → Simulate Send
