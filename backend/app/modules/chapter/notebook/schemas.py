from pydantic import BaseModel
from typing import Optional


class NotebookQuery(BaseModel):
    """Schema for AI notebook query"""
    question: str


class NotebookResponse(BaseModel):
    """Schema for AI notebook response"""
    answer: str
    sources: list[dict]  # List of {title, uploaded_by}
    note_count: int
    chapter_name: str
    
    class Config:
        from_attributes = True
