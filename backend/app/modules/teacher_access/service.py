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
            .execute()
        
        if not teacher_response.data:
            raise Exception("Teacher not found with this email")
        
        teacher = teacher_response.data[0]
        
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
        # First get all teacher access records for this subject
        access_response = db.table("teacher_access")\
            .select("*")\
            .eq("subject_id", subject_id)\
            .execute()
        
        if not access_response.data:
            return []
        
        teachers = []
        for access in access_response.data:
            # Get teacher details for each access record
            teacher_response = db.table("users")\
                .select("name, email")\
                .eq("id", access['teacher_id'])\
                .single()\
                .execute()
            
            if teacher_response.data:
                teachers.append(TeacherAccessResponse(
                    id=access['id'],
                    subject_id=access['subject_id'],
                    teacher_id=access['teacher_id'],
                    teacher_name=teacher_response.data['name'],
                    teacher_email=teacher_response.data['email'],
                    created_at=access['created_at']
                ))
        
        return teachers
    
    async def remove_teacher(
        self,
        db: Client,
        access_id: str,
        current_user_id: str
    ) -> None:
        """Remove teacher access from subject"""
        # Verify the access record exists
        access_record = db.table("teacher_access")\
            .select("id")\
            .eq("id", access_id)\
            .single()\
            .execute()
        
        if not access_record.data:
            raise Exception("Access record not found")
        
        # Delete the access
        db.table("teacher_access")\
            .delete()\
            .eq("id", access_id)\
            .execute()


# Global instance
teacher_access_service = TeacherAccessService()

