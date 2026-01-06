from pydantic import BaseModel
from typing import Optional, Literal


class QuestionCreate(BaseModel):
    """Schema for creating question"""
    chapter_id: str
    title: str
    content: str
    is_private: bool = False  # Public by default


class AnswerCreate(BaseModel):
    """Schema for answering question"""
    content: str


class QuestionResponse(BaseModel):
    """Schema for question response"""
    id: str
    chapter_id: str
    user_id: str
    title: str
    content: str
    is_private: bool
    answer: Optional[str]
    answered_by: Optional[str]
    answered_at: Optional[str]
    created_at: str
    user_name: str  # Name of question asker
    answerer_name: Optional[str] = None
    
    class Config:
        from_attributes = True
