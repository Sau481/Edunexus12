from fastapi import APIRouter, Depends, HTTPException
from app.modules.classroom.schemas import SubjectCreate, SubjectResponse
from app.modules.subject.service import subject_service
from app.modules.subject.schemas import ChapterCreate, ChapterResponse
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher, check_classroom_access
from app.core.supabase import get_db
from supabase import Client
from datetime import datetime


router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.post("/", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create subject in classroom (teacher only)"""
    require_teacher(current_user)
    
    # Verify classroom access
    has_access = check_classroom_access(db, current_user.user_id, subject_data.classroom_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="No access to this classroom")
    
    try:
        return await subject_service.create_subject(db, subject_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/classroom/{classroom_id}", response_model=list[SubjectResponse])
async def list_subjects(
    classroom_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """List subjects in classroom"""
    # Verify classroom access
    has_access = check_classroom_access(db, current_user.user_id, classroom_id)
    if not has_access:
        raise HTTPException(status_code=403, detail="No access to this classroom")
    
    try:
        return await subject_service.list_subjects(db, classroom_id, current_user.user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{subject_id}/chapters", response_model=ChapterResponse)
async def create_chapter(
    subject_id: str,
    chapter_data: ChapterCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create chapter in subject (teacher only)"""
    require_teacher(current_user)
    
    # Verify teacher access to subject
    from app.core.permissions import check_subject_teacher_access
    is_teacher = check_subject_teacher_access(db, current_user.user_id, subject_id)
    if not is_teacher:
        raise HTTPException(status_code=403, detail="No teacher access to this subject")
    
    try:
        response = db.table("chapters").insert({
            "subject_id": subject_id,
            "name": chapter_data.name,
            "description": chapter_data.description,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return ChapterResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{subject_id}/chapters", response_model=list[ChapterResponse])
async def list_chapters(
    subject_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """List chapters in subject"""
    try:
        response = db.table("chapters")\
            .select("*")\
            .eq("subject_id", subject_id)\
            .execute()
        
        return [ChapterResponse(**c) for c in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Delete subject (classroom owner only)"""
    require_teacher(current_user)
    try:
        success = await subject_service.delete_subject(
            db, current_user.user_id, subject_id
        )
        if not success:
            raise HTTPException(status_code=403, detail="Not authorized to delete this subject")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
