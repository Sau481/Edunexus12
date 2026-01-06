from fastapi import APIRouter, Depends, HTTPException
from app.modules.chapter.community.schemas import AnnouncementCreate, AnnouncementResponse
from app.modules.chapter.community.service import community_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher, check_chapter_access
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/community", tags=["Community"])


@router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Create announcement (teacher only)"""
    require_teacher(current_user)
    
    # Verify chapter access and teacher status
    access = check_chapter_access(db, current_user.user_id, current_user.role, announcement.chapter_id)
    if not access['allowed'] or not access['is_teacher']:
        raise HTTPException(status_code=403, detail="Teacher access required for this chapter")
    
    try:
        return await community_service.create_announcement(
            db,
            announcement.chapter_id,
            current_user.user_id,
            announcement.title,
            announcement.content
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/chapter/{chapter_id}/announcements", response_model=list[AnnouncementResponse])
async def list_announcements(
    chapter_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """List announcements for chapter (all users)"""
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await community_service.list_announcements(db, chapter_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
