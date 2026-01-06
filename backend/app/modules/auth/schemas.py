from pydantic import BaseModel, EmailStr
from typing import Literal


class UserCreate(BaseModel):
    """Schema for creating user profile"""
    firebase_uid: str
    email: EmailStr
    name: str
    role: Literal['student', 'teacher']


class UserResponse(BaseModel):
    """Schema for user profile response"""
    id: str
    firebase_uid: str
    email: str
    name: str
    role: str
    created_at: str
    
    class Config:
        from_attributes = True
