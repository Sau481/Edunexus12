from pydantic import BaseModel
from typing import Optional


class ClassroomCreate(BaseModel):
    """Schema for creating classroom"""
    name: str
    description: Optional[str] = None


class ClassroomJoin(BaseModel):
    """Schema for joining classroom via code"""
    code: str


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
    
    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    """Schema for creating subject"""
    classroom_id: str
    name: str
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    """Schema for subject response"""
    id: str
    classroom_id: str
    name: str
    description: Optional[str]
    created_at: str
    
    class Config:
        from_attributes = True
