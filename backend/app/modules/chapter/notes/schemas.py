from pydantic import BaseModel
from typing import Optional, Literal


class NoteResponse(BaseModel):
    """Schema for note response"""
    id: str
    chapter_id: str
    title: str
    content: str
    file_url: Optional[str]
    file_name: Optional[str]
    visibility: Literal['public', 'private']
    approval_status: Literal['approved', 'pending', 'rejected']
    uploaded_by: str
    uploader_name: str
    approved_by: Optional[str] = None
    approver_name: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True


class NoteApprovalUpdate(BaseModel):
    """Schema for approving/rejecting note"""
    status: Literal['approved', 'rejected']
    reason: Optional[str] = None  # Rejection reason
