from pydantic import BaseModel


class TeacherAccessCreate(BaseModel):
    """Schema for assigning teacher to subject"""
    subject_id: str
    teacher_email: str  # Email of teacher to add


class TeacherAccessResponse(BaseModel):
    """Schema for teacher access response"""
    id: str
    subject_id: str
    teacher_id: str
    teacher_name: str
    teacher_email: str
    created_at: str
    
    class Config:
        from_attributes = True
