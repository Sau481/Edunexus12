from fastapi import APIRouter, Depends, HTTPException
from app.modules.dashboard.schemas import TeacherDashboardResponse
from app.modules.dashboard.service import dashboard_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher
from app.core.supabase import get_db, get_admin_db
from supabase import Client

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/teacher", response_model=TeacherDashboardResponse)
async def get_teacher_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """
    Get teacher dashboard data
    - Classrooms (created + assigned)
    - Pending Notes
    - Unanswered Questions
    """
    require_teacher(current_user)
    
    try:
        return await dashboard_service.get_teacher_dashboard(
            db, current_user.user_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
