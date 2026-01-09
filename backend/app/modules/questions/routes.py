from fastapi import APIRouter, Depends, HTTPException
from app.modules.questions.schemas import QuestionCreate, AnswerCreate, QuestionResponse
from app.modules.questions.service import question_service
from app.core.auth import get_current_user, CurrentUser
from app.core.permissions import require_teacher, check_chapter_access
from app.core.supabase import get_db, get_admin_db
from supabase import Client


router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """Create new question"""
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, question_data.chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await question_service.create_question(
            db,
            current_user.user_id,
            current_user.name,
            question_data.chapter_id,
            question_data.title,
            question_data.content,
            question_data.is_private
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/chapter/{chapter_id}", response_model=list[QuestionResponse])
async def list_questions(
    chapter_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """
    List questions for chapter
    
    - Students: own + public questions
    - Teachers: all questions
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await question_service.list_questions(
            db, chapter_id, current_user.user_id, current_user.role
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chapter/{chapter_id}/community", response_model=list[QuestionResponse])
async def list_community_questions(
    chapter_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """
    List community questions (public & answered)
    """
    # Verify chapter access
    access = check_chapter_access(db, current_user.user_id, current_user.role, chapter_id)
    if not access['allowed']:
        raise HTTPException(status_code=403, detail="No access to this chapter")
    
    try:
        return await question_service.list_community_questions(db, chapter_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-questions", response_model=list[QuestionResponse])
async def list_my_questions(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """List all questions by current user"""
    try:
        return await question_service.list_user_questions(db, current_user.user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{question_id}/answer", response_model=QuestionResponse)
async def answer_question(
    question_id: str,
    answer_data: AnswerCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """Answer question (teacher only)"""
    require_teacher(current_user)
    
    try:
        return await question_service.answer_question(
            db, question_id, current_user.user_id, answer_data.content
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{question_id}", response_model=bool)
def delete_question(
    question_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_admin_db)
):
    """Delete question (author only)"""
    try:
        success = question_service.delete_question(db, current_user.user_id, question_id)
        if not success:
            raise HTTPException(status_code=403, detail="Not allowed to delete this question")
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
