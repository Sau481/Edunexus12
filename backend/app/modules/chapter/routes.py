from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.modules.chapter.schemas import ChapterCreate, ChapterResponse
from app.modules.chapter.service import chapter_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher
from app.core.supabase import get_db, get_admin_db
from supabase import Client

router = APIRouter(prefix="/chapters", tags=["Chapters"])

@router.post("/", response_model=ChapterResponse)
async def create_chapter(
    chapter: ChapterCreate, 
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    require_teacher(current_user)
    try:
        return await chapter_service.create_chapter(db, chapter)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subject/{subject_id}", response_model=List[ChapterResponse])
async def list_chapters(
    subject_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    try:
        return await chapter_service.get_chapters_by_subject(db, subject_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chapter_id}")
async def delete_chapter(
    chapter_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """Delete chapter (teacher only)"""
    require_teacher(current_user)
    try:
        success = await chapter_service.delete_chapter(
            db, current_user.user_id, chapter_id
        )
        if not success:
            raise HTTPException(status_code=403, detail="Not authorized to delete this chapter")
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
