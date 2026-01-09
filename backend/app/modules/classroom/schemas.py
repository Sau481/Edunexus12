from pydantic import BaseModel
from typing import Optional, List


class ClassroomCreate(BaseModel):
    """Schema for creating classroom"""
    name: str
    description: Optional[str] = None


class ClassroomJoin(BaseModel):
    """Schema for joining classroom via code"""
    code: str


class ChapterResponse(BaseModel):
    """Schema for chapter response"""
    id: str
    subject_id: str
    name: str
    description: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True


class SubjectResponse(BaseModel):
    """Schema for subject response"""
    id: str
    classroom_id: str
    name: str
    description: Optional[str]
    created_at: str
    chapters: Optional[List[ChapterResponse]] = []
    
    class Config:
        from_attributes = True


class ClassroomResponse(BaseModel):
    """Schema for classroom response"""
    id: str
    name: str
    description: Optional[str]
    code: str
    created_by: str
    created_at: str
    creator_name: Optional[str] = None  # For joined responses
    member_count: Optional[int] = 0
    subjects: Optional[List[SubjectResponse]] = []
    
    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    """Schema for creating subject"""
    classroom_id: str
    name: str
    description: Optional[str] = None
