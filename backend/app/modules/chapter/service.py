from supabase import Client
from app.modules.chapter.schemas import ChapterCreate, ChapterResponse
from datetime import datetime

class ChapterService:
    """Chapter management service"""
    
    async def create_chapter(
        self, 
        db: Client, 
        chapter_data: ChapterCreate
    ) -> ChapterResponse:
        """Create new chapter"""
        response = db.table("chapters").insert({
            "subject_id": chapter_data.subject_id,
            "title": chapter_data.title,
            "description": chapter_data.description,
            "order": chapter_data.order,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return ChapterResponse(**response.data[0])

    async def get_chapters_by_subject(
        self, 
        db: Client, 
        subject_id: str
    ) -> list[ChapterResponse]:
        """List chapters for a subject"""
        response = db.table("chapters")\
            .select("*")\
            .eq("subject_id", subject_id)\
            .order("order")\
            .execute()
            
        return [ChapterResponse(**c) for c in response.data]
        
    async def delete_chapter(
        self,
        db: Client,
        user_id: str,
        chapter_id: str
    ) -> bool:
        """Delete chapter (teacher only - validation should happen in route or via helper)"""
        # Validate ownership via subject -> classroom -> created_by OR teacher_access
        # For efficiency, we'll verify the user is a teacher who has access to the subject of this chapter
        
        # 1. Get chapter's subject_id
        chapter_res = db.table("chapters").select("subject_id").eq("id", chapter_id).single().execute()
        if not chapter_res.data:
            return False
        subject_id = chapter_res.data['subject_id']
        
        # 2. Check subject's classroom creator OR teacher_access
        # Check if creator
        subject_res = db.table("subjects")\
            .select("classrooms!inner(created_by)")\
            .eq("id", subject_id)\
            .single()\
            .execute()
            
        if subject_res.data and subject_res.data['classrooms']['created_by'] == user_id:
             # Owner - OK
             pass
        else:
             # Check explicit access
             access_res = db.table("teacher_access")\
                .select("id")\
                .eq("teacher_id", user_id)\
                .eq("subject_id", subject_id)\
                .execute()
                
             if not access_res.data:
                 return False # No access
                 
        db.table("chapters").delete().eq("id", chapter_id).execute()
        return True

# Global instance
chapter_service = ChapterService()
