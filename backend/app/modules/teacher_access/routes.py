from fastapi import APIRouter, Depends, HTTPException
from app.modules.teacher_access.schemas import TeacherAccessCreate, TeacherAccessResponse
from app.modules.teacher_access.service import teacher_access_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher, check_subject_teacher_access
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/teacher-access", tags=["Teacher Access"])


@router.post("/", response_model=TeacherAccessResponse)
async def assign_teacher_to_subject(
    access_data: TeacherAccessCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Assign teacher to subject (teacher only)"""
    require_teacher(current_user)
    
    # Verify current user has access to this subject
    has_access = check_subject_teacher_access(db, current_user.user_id, access_data.subject_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="No access to this subject")
    
    try:
        return await teacher_access_service.assign_teacher(
            db, access_data.subject_id, access_data.teacher_email
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subject/{subject_id}", response_model=list[TeacherAccessResponse])
async def list_subject_teachers(
    subject_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """List teachers assigned to subject"""
    require_teacher(current_user)
    
    # Verify access
    has_access = check_subject_teacher_access(db, current_user.user_id, subject_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="No access to this subject")
    
    try:
        return await teacher_access_service.list_subject_teachers(db, subject_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{access_id}")
async def remove_teacher_access(
    access_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Remove teacher access from subject"""
    require_teacher(current_user)
    
    try:
        await teacher_access_service.remove_teacher(db, access_id, current_user.user_id)
        return {"message": "Access removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

