from fastapi import APIRouter, Depends, HTTPException
from app.modules.classroom.schemas import ClassroomCreate, ClassroomJoin, ClassroomResponse
from app.modules.classroom.service import classroom_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/classrooms", tags=["Classrooms"])


@router.post("/", response_model=ClassroomResponse)
async def create_classroom(
    classroom_data: ClassroomCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create new classroom (teacher only)"""
    require_teacher(current_user)
    
    try:
        return await classroom_service.create_classroom(
            db, current_user.user_id, classroom_data
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/join", response_model=ClassroomResponse)
async def join_classroom(
    join_data: ClassroomJoin,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Join classroom via code (student)"""
    try:
        return await classroom_service.join_classroom(
            db, current_user.user_id, join_data.code
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[ClassroomResponse])
async def list_classrooms(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    List classrooms
    
    - Students: joined classrooms
    - Teachers: created + assigned classrooms
    """
    try:
        return await classroom_service.list_classrooms(
            db, current_user.user_id, current_user.role
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
