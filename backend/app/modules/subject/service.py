from supabase import Client
from app.modules.classroom.schemas import SubjectCreate, SubjectResponse
from datetime import datetime
from typing import Optional


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
        classroom_id: str,
        user_id: Optional[str] = None
    ) -> list[SubjectResponse]:
        """
        List all subjects in classroom.
        If user_id is provided, checks permissions:
        - Classroom owner: sees all
        - Subject teacher: sees only assigned subjects
        - Student/Other: checks handling should be upstream but here we filter for teachers
        """
        # First get classroom creator
        classroom_res = db.table("classrooms")\
            .select("created_by")\
            .eq("id", classroom_id)\
            .single()\
            .execute()
            
        is_creator = False
        if classroom_res.data and user_id and classroom_res.data['created_by'] == user_id:
            is_creator = True
            
        # Get all subjects
        response = db.table("subjects")\
            .select("*")\
            .eq("classroom_id", classroom_id)\
            .execute()
            
        all_subjects = [SubjectResponse(**s) for s in response.data]
        
        # Filter if needed (not creator and user_id provided)
        # Note: Students should see all subjects (or enrolled ones, but currently model assumes open class).
        # We only really want to restrict for "Subject Teachers" who are NOT creators.
        
        if user_id and not is_creator:
            # Check if user is a teacher for specific subjects
            access_res = db.table("teacher_access")\
                .select("subject_id")\
                .eq("teacher_id", user_id)\
                .execute()
            
            allowed_subject_ids = [a['subject_id'] for a in access_res.data]
            
            # If user has NO access entries and is NOT creator, maybe they are a student?
            # But we can't easily check role here without passing it.
            # Assuming this service is called by filtering logic. 
            # Ideally, we return ALL subjects if filter not requested, or handle logic in route.
            
            # Let's actually CHANGE the logic:
            # If user_id is passed, we filter based on explicit access if they are not the creator.
            # BUT wait, students also have user_ids.
            # We should probably pass 'role' or 'is_student'.
            
            # Simplest for now given the request: 
            # If they are in `teacher_access` table for ANY subject in this classroom, restrict them.
            # If they are NOT in `teacher_access` and NOT creator, assume they are student/viewer and show all?
            # OR better: The requirement is only for "Accessed Classrooms" view.
            
            if allowed_subject_ids:
                return [s for s in all_subjects if s.id in allowed_subject_ids]
            
        return all_subjects
    
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


    async def delete_subject(
        self,
        db: Client,
        user_id: str,
        subject_id: str
    ) -> bool:
        """Delete subject (classroom creator only)"""
        # 1. Get subject's classroom creator
        response = db.table("subjects")\
            .select("classrooms!inner(created_by)")\
            .eq("id", subject_id)\
            .single()\
            .execute()
            
        if not response.data:
            return False
            
        creator_id = response.data['classrooms']['created_by']
        
        if creator_id != user_id:
            # Technically, could allow if user has DELETE access, but simplistic rule = owner only
            return False
            
        db.table("subjects").delete().eq("id", subject_id).execute()
        return True

# Global instance
subject_service = SubjectService()
