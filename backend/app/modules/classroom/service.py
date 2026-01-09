from supabase import Client
from app.modules.classroom.schemas import ClassroomCreate, ClassroomResponse
from app.utils.helpers import generate_classroom_code
from datetime import datetime


class ClassroomService:
    """Classroom management service"""
    
    async def create_classroom(
        self,
        db: Client,
        user_id: str,
        classroom_data: ClassroomCreate
    ) -> ClassroomResponse:
        """Create new classroom (teacher only)"""
        code = generate_classroom_code()
        
        response = db.table("classrooms").insert({
            "name": classroom_data.name,
            "description": classroom_data.description,
            "code": code,
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return ClassroomResponse(**response.data[0])
    
    async def join_classroom(
        self,
        db: Client,
        user_id: str,
        code: str
    ) -> ClassroomResponse:
        """Join classroom via code (student)"""
        # Find classroom by code
        classroom_response = db.table("classrooms")\
            .select("*")\
            .eq("code", code)\
            .execute()
        
        if not classroom_response.data:
            raise Exception("Invalid classroom code")
        
        classroom_id = classroom_response.data[0]['id']
        
        # Check if already a member
        existing = db.table("classroom_members")\
            .select("id")\
            .eq("classroom_id", classroom_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if existing.data:
            raise Exception("Already a member of this classroom")
        
        # Add member
        db.table("classroom_members").insert({
            "classroom_id": classroom_id,
            "user_id": user_id,
            "joined_at": datetime.utcnow().isoformat()
        }).execute()
        
        
        return ClassroomResponse(**classroom_response.data[0])
    
    async def list_classrooms(
        self,
        db: Client,
        user_id: str,
        role: str
    ) -> list[ClassroomResponse]:
        """
        List classrooms for user
        
        - Students: joined classrooms
        - Teachers: created + assigned classrooms
        """
        if role == "student":
            # Get classrooms where user is a member
            # We want to fetch the classroom details AND the creator's name (which is on the classroom table)
            response = db.table("classroom_members")\
                .select("classrooms!inner(*, users!created_by(name))")\
                .eq("user_id", user_id)\
                .execute()
            
            classrooms = []
            for item in response.data:
                classroom = item['classrooms']
                # Map creator name from the nested inner join on classrooms
                if 'users' in classroom and classroom['users']:
                     classroom['creator_name'] = classroom['users']['name']
                     del classroom['users'] # Clean up to match schema
                
                # Fetch subjects for this classroom
                subjects_res = db.table("subjects")\
                    .select("*")\
                    .eq("classroom_id", classroom['id'])\
                    .execute()
                
                # Fetch chapters for each subject
                subjects_with_chapters = []
                for subject in subjects_res.data:
                    chapters_res = db.table("chapters")\
                        .select("*")\
                        .eq("subject_id", subject['id'])\
                        .execute()
                    subject['chapters'] = chapters_res.data
                    subjects_with_chapters.append(subject)
                
                classroom['subjects'] = subjects_with_chapters
                classrooms.append(ClassroomResponse(**classroom))
            
            return classrooms
        
        else:  # teacher
            # Get classrooms created by teacher
            created = db.table("classrooms")\
                .select("*")\
                .eq("created_by", user_id)\
                .execute()
            
            # Get classrooms where teacher has subject access
            assigned = db.table("teacher_access")\
                .select("subjects!inner(classrooms!inner(*))")\
                .eq("teacher_id", user_id)\
                .execute()
            
            classroom_map = {}
            
            # Add created classrooms
            for c in created.data:
                # Fetch subjects for this classroom
                subjects_res = db.table("subjects")\
                    .select("*")\
                    .eq("classroom_id", c['id'])\
                    .execute()
                
                # Fetch chapters for each subject
                subjects_with_chapters = []
                for subject in subjects_res.data:
                    chapters_res = db.table("chapters")\
                        .select("*")\
                        .eq("subject_id", subject['id'])\
                        .execute()
                    subject['chapters'] = chapters_res.data
                    subjects_with_chapters.append(subject)
                
                c['subjects'] = subjects_with_chapters
                classroom_map[c['id']] = ClassroomResponse(**c)
            
            # Add assigned classrooms
            for item in assigned.data:
                classroom = item['subjects']['classrooms']
                if classroom['id'] not in classroom_map:
                    # Fetch subjects for this classroom
                    subjects_res = db.table("subjects")\
                        .select("*")\
                        .eq("classroom_id", classroom['id'])\
                        .execute()
                    
                    # Fetch chapters for each subject
                    subjects_with_chapters = []
                    for subject in subjects_res.data:
                        chapters_res = db.table("chapters")\
                            .select("*")\
                            .eq("subject_id", subject['id'])\
                            .execute()
                        subject['chapters'] = chapters_res.data
                        subjects_with_chapters.append(subject)
                    
                    classroom['subjects'] = subjects_with_chapters
                    classroom_map[classroom['id']] = ClassroomResponse(**classroom)
            
            return list(classroom_map.values())

    async def delete_classroom(
        self,
        db: Client,
        user_id: str,
        classroom_id: str
    ) -> bool:
        """Delete classroom (creator only)"""
        # Verify ownership
        response = db.table("classrooms")\
            .select("created_by")\
            .eq("id", classroom_id)\
            .single()\
            .execute()
            
        if not response.data or response.data['created_by'] != user_id:
            return False
            
        # Delete (Supabase cascade should handle details, but we proceed)
        db.table("classrooms").delete().eq("id", classroom_id).execute()
        return True



# Global instance
classroom_service = ClassroomService()
