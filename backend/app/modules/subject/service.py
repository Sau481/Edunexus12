from supabase import Client
from app.modules.classroom.schemas import SubjectCreate, SubjectResponse
from datetime import datetime


class SubjectService:
    """Subject management service"""
    
    async def create_subject(
        self,
        db: Client,
        subject_data: SubjectCreate
    ) -> SubjectResponse:
        """Create subject in classroom (teacher only)"""
        response = db.table("subjects").insert({
            "classroom_id": subject_data.classroom_id,
            "name": subject_data.name,
            "description": subject_data.description,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return SubjectResponse(**response.data[0])
    
    async def list_subjects(
        self,
        db: Client,
        classroom_id: str
    ) -> list[SubjectResponse]:
        """List all subjects in classroom"""
        response = db.table("subjects")\
            .select("*")\
            .eq("classroom_id", classroom_id)\
            .execute()
        
        return [SubjectResponse(**s) for s in response.data]
    
    async def get_subject(
        self,
        db: Client,
        subject_id: str
    ) -> SubjectResponse:
        """Get subject by ID"""
        response = db.table("subjects")\
            .select("*")\
            .eq("id", subject_id)\
            .single()\
            .execute()
        
        if not response.data:
            raise Exception("Subject not found")
        
        return SubjectResponse(**response.data)


# Global instance
subject_service = SubjectService()
