from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import campaigns, companies, dashboard, dream_companies, emails, intelligence, jobs
from services.scheduler_service import shutdown_scheduler, start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    shutdown_scheduler()


settings = get_settings()
app = FastAPI(title="Emitly API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(dream_companies.router)
app.include_router(jobs.router)
app.include_router(companies.router)
app.include_router(intelligence.router)
app.include_router(emails.router)
app.include_router(campaigns.router)


@app.get("/health")
def health():
    return {"status": "ok"}
