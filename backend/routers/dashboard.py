from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard():
    from services.dashboard_service import get_merged_dashboard

    return get_merged_dashboard()
