from pydantic import BaseModel
from typing import Literal


class NoteUploadResponse(BaseModel):
    """Schema for note upload response"""
    id: str
    chapter_id: str
    title: str
    content: str
    file_url: str
    file_name: str
    visibility: Literal['public', 'private']
    approval_status: Literal['approved', 'pending']
    created_at: str
    
    class Config:
        from_attributes = True
