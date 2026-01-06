from pydantic import BaseModel
from typing import Optional


class ChapterCreate(BaseModel):
    """Schema for creating chapter"""
    subject_id: str
    name: str
    description: Optional[str] = None


class ChapterResponse(BaseModel):
    """Schema for chapter response"""
    id: str
    subject_id: str
    name: str
    description: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True
