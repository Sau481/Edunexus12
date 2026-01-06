from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.modules.chapter.upload.schemas import NoteUploadResponse
from app.modules.chapter.upload.service import upload_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import check_chapter_access
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/chapter/{chapter_id}/note", response_model=NoteUploadResponse)
async def upload_note(
    chapter_id: str,
    title: str = Form(...),
    visibility: str = Form(...),  # 'public' or 'private'
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Upload note file (PDF/TXT)
    
    - Students: pending approval for public, auto-approved for private
    - Teachers: always auto-approved
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
    
    # Validate visibility
    if visibility not in ['public', 'private']:
        raise HTTPException(status_code=400, detail="Visibility must be 'public' or 'private'")
    
    try:
        file_bytes = await file.read()
        
        return await upload_service.upload_note(
            db=db,
            chapter_id=chapter_id,
            user_id=current_user.user_id,
            role=current_user.role,
            title=title,
            file_bytes=file_bytes,
            filename=file.filename,
            visibility=visibility
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
