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
            .single()\
            .execute()
        
        if not classroom_response.data:
            raise Exception("Invalid classroom code")
        
        classroom_id = classroom_response.data['id']
        
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
        
        return ClassroomResponse(**classroom_response.data)
    
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
            response = db.table("classroom_members")\
                .select("classrooms!inner(*), users!inner(name)")\
                .eq("user_id", user_id)\
                .execute()
            
            classrooms = []
            for item in response.data:
                classroom = item['classrooms']
                classroom['creator_name'] = item['users']['name']
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
                classroom_map[c['id']] = ClassroomResponse(**c)
            
            # Add assigned classrooms
            for item in assigned.data:
                classroom = item['subjects']['classrooms']
                if classroom['id'] not in classroom_map:
                    classroom_map[classroom['id']] = ClassroomResponse(**classroom)
            
            return list(classroom_map.values())


# Global instance
classroom_service = ClassroomService()
