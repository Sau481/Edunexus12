from pydantic import BaseModel
from typing import Optional


class AnnouncementCreate(BaseModel):
    """Schema for creating announcement"""
    chapter_id: str
    title: str
    content: str


class AnnouncementResponse(BaseModel):
    """Schema for announcement response"""
    id: str
    chapter_id: str
    title: str
    content: str
    created_by: str
    creator_name: str
    created_at: str
    
    class Config:
        from_attributes = True
