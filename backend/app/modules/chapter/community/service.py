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
            .select("*, users!inner(name)")\
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
            creator_name=a['users']['name'],
            created_at=a['created_at']
        )
    
    async def list_announcements(
        self,
        db: Client,
        chapter_id: str
    ) -> list[AnnouncementResponse]:
        """List all announcements for chapter"""
        response = db.table("announcements")\
            .select("*, users!inner(name)")\
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
                creator_name=a['users']['name'],
                created_at=a['created_at']
            ))
        
        return announcements


# Global instance
community_service = CommunityService()
