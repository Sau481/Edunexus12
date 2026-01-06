from supabase import Client
from app.modules.teacher_access.schemas import TeacherAccessResponse
from datetime import datetime


class TeacherAccessService:
    """Teacher access management service"""
    
    async def assign_teacher(
        self,
        db: Client,
        subject_id: str,
        teacher_email: str
    ) -> TeacherAccessResponse:
        """Assign teacher to subject"""
        # Find teacher by email
        teacher_response = db.table("users")\
            .select("id, name, email")\
            .eq("email", teacher_email)\
            .eq("role", "teacher")\
            .single()\
            .execute()
        
        if not teacher_response.data:
            raise Exception("Teacher not found or user is not a teacher")
        
        teacher = teacher_response.data
        
        # Check if already assigned
        existing = db.table("teacher_access")\
            .select("id")\
            .eq("subject_id", subject_id)\
            .eq("teacher_id", teacher['id'])\
            .execute()
        
        if existing.data:
            raise Exception("Teacher already has access to this subject")
        
        # Create access
        response = db.table("teacher_access").insert({
            "subject_id": subject_id,
            "teacher_id": teacher['id'],
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return TeacherAccessResponse(
            id=response.data[0]['id'],
            subject_id=subject_id,
            teacher_id=teacher['id'],
            teacher_name=teacher['name'],
            teacher_email=teacher['email'],
            created_at=response.data[0]['created_at']
        )
    
    async def list_subject_teachers(
        self,
        db: Client,
        subject_id: str
    ) -> list[TeacherAccessResponse]:
        """List all teachers assigned to subject"""
        response = db.table("teacher_access")\
            .select("id, subject_id, teacher_id, created_at, users!inner(name, email)")\
            .eq("subject_id", subject_id)\
            .execute()
        
        teachers = []
        for item in response.data:
            teachers.append(TeacherAccessResponse(
                id=item['id'],
                subject_id=item['subject_id'],
                teacher_id=item['teacher_id'],
                teacher_name=item['users']['name'],
                teacher_email=item['users']['email'],
                created_at=item['created_at']
            ))
        
        return teachers


# Global instance
teacher_access_service = TeacherAccessService()
