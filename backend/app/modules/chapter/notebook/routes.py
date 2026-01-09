from fastapi import APIRouter, Depends, HTTPException
from app.modules.chapter.notebook.schemas import NotebookQuery, NotebookResponse, RecommendationsResponse
from app.modules.chapter.notebook.service import notebook_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import check_chapter_access
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/notebook", tags=["AI Notebook"])


@router.post("/chapter/{chapter_id}/query", response_model=NotebookResponse)
async def query_notebook(
    chapter_id: str,
    query_data: NotebookQuery,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Query AI notebook for chapter
    
    Uses RAG with chapter notes only
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await notebook_service.query_notebook(
            db, chapter_id, query_data.question
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chapter/{chapter_id}/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(
    chapter_id: str,
    query: str = None,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Get educational resource recommendations for a chapter
    
    Returns AI-generated video and article recommendations
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await notebook_service.get_recommendations(db, chapter_id, topic=query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
