from supabase import Client
from app.modules.chapter.community.schemas import AnnouncementResponse
from datetime import datetime


class CommunityService:
    """Community management service"""
    
    async def create_announcement(
        self,
        db: Client,
        chapter_id: str,
        teacher_id: str,
        title: str,
        content: str
    ) -> AnnouncementResponse:
        """Create announcement (teacher only)"""
        response = db.table("announcements").insert({
            "chapter_id": chapter_id,
            "title": title,
            "content": content,
            "created_by": teacher_id,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Fetch with user details
        announcement_id = response.data[0]['id']
        full_response = db.table("announcements")\
            .select("*, users(name)")\
            .eq("id", announcement_id)\
            .single()\
            .execute()
        
        a = full_response.data
        return AnnouncementResponse(
            id=a['id'],
            chapter_id=a['chapter_id'],
            title=a['title'],
            content=a['content'],
            created_by=a['created_by'],
            creator_name=a.get('users', {}).get('name') if a.get('users') else 'Unknown User',
            created_at=a['created_at']
        )
    
    async def list_announcements(
        self,
        db: Client,
        chapter_id: str
    ) -> list[AnnouncementResponse]:
        """List all announcements for chapter"""
        response = db.table("announcements")\
            .select("*, users(name)")\
            .eq("chapter_id", chapter_id)\
            .order("created_at", desc=True)\
            .execute()
        
        announcements = []
        for a in response.data:
            announcements.append(AnnouncementResponse(
                id=a['id'],
                chapter_id=a['chapter_id'],
                title=a['title'],
                content=a['content'],
                created_by=a['created_by'],
                creator_name=a.get('users', {}).get('name') if a.get('users') else 'Unknown User',
                created_at=a['created_at']
            ))
        
        return announcements

    async def list_all_announcements(
        self,
        db: Client,
        user_id: str
    ) -> list[AnnouncementResponse]:
        """List all announcements for user across all enrolled/taught chapters"""
        # First get all chapters user has access to
        # For teachers: created classrooms -> subjects -> chapters
        # For students: joined classrooms -> subjects -> chapters
        
        # Actually simpler: join through user_classroom -> classroom -> subject -> chapter
        # But we need to handle permissions.
        # Simplest approach: Get all announcements where chapter_id IN (user's chapters)
        
        # Let's use a raw query or smart join since the permission logic is complex
        # Ideally we reuse check_chapter_access logic but that's per chapter.
        
        # Efficient query strategy:
        # 1. Get all classroom_ids user is in (as student or teacher)
        # 2. Get all subject_ids in those classrooms
        # 3. Get all chapter_ids in those subjects
        # 4. Get announcements
        
        # 1. Get classrooms
        user_classrooms = db.table("user_classroom")\
            .select("classroom_id")\
            .eq("user_id", user_id)\
            .execute()
        
        joined_classroom_ids = [uc['classroom_id'] for uc in user_classrooms.data]
        
        created_classrooms = db.table("classrooms")\
            .select("id")\
            .eq("created_by", user_id)\
            .execute()
            
        all_classroom_ids = list(set(joined_classroom_ids + [c['id'] for c in created_classrooms.data]))
        
        if not all_classroom_ids:
            return []
            
        # 2. Get subjects
        subjects = db.table("subjects")\
            .select("id")\
            .in_("classroom_id", all_classroom_ids)\
            .execute()
            
        subject_ids = [s['id'] for s in subjects.data]
        
        if not subject_ids:
            return []
            
        # 3. Get chapters
        chapters = db.table("chapters")\
            .select("id")\
            .in_("subject_id", subject_ids)\
            .execute()
            
        chapter_ids = [c['id'] for c in chapters.data]
        
        if not chapter_ids:
            return []
            
        # 4. Get announcements
        response = db.table("announcements")\
            .select("*, users(name)")\
            .in_("chapter_id", chapter_ids)\
            .order("created_at", desc=True)\
            .execute()
            
        announcements = []
        for a in response.data:
            announcements.append(AnnouncementResponse(
                id=a['id'],
                chapter_id=a['chapter_id'],
                title=a['title'],
                content=a['content'],
                created_by=a['created_by'],
                creator_name=a.get('users', {}).get('name') if a.get('users') else 'Unknown User',
                created_at=a['created_at']
            ))
        
        return announcements


# Global instance
community_service = CommunityService()
