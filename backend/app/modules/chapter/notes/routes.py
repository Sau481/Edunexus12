from fastapi import APIRouter, Depends, HTTPException
from app.modules.chapter.notes.schemas import NoteResponse, NoteApprovalUpdate
from app.modules.chapter.notes.service import note_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher, check_chapter_access
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/chapter/{chapter_id}", response_model=list[NoteResponse])
async def list_notes(
    chapter_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    List notes for chapter
    
    Students: approved public + own notes
    Teachers: all notes
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await note_service.list_notes(
            db, chapter_id, current_user.user_id, current_user.role
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{note_id}/approval", response_model=NoteResponse)
async def approve_or_reject_note(
    note_id: str,
    approval: NoteApprovalUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Approve or reject note (teacher only)"""
    require_teacher(current_user)
    
    try:
        return await note_service.approve_note(
            db, note_id, current_user.user_id, approval.status
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
