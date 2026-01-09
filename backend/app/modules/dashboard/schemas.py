from pydantic import BaseModel
from typing import List, Optional
from app.modules.classroom.schemas import ClassroomResponse

class PendingNote(BaseModel):
    id: str
    title: str
    content: str
    chapter_id: str
    chapter_name: str
    author_id: str
    author_name: str
    status: str
    created_at: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None

class PendingQuestion(BaseModel):
    id: str
    title: str
    content: str
    chapter_id: str
    chapter_name: str
    author_id: str
    author_name: str
    is_private: bool
    created_at: str

class TeacherDashboardResponse(BaseModel):
    """Aggregated dashboard data for teachers"""
    created_classrooms: List[ClassroomResponse]
    accessed_classrooms: List[ClassroomResponse]
    pending_notes: List[PendingNote]
    pending_questions: List[PendingQuestion]
