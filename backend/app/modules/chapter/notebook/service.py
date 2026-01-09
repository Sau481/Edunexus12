from supabase import Client
from app.modules.chapter.notebook.schemas import NotebookResponse, RecommendationsResponse, RecommendationItem
from app.services.rag_service import rag_service
from app.services.recommendation_service import recommendation_service


class NotebookService:
    """AI Notebook service using RAG"""
    
    async def query_notebook(
        self,
        db: Client,
        chapter_id: str,
        question: str
    ) -> NotebookResponse:
        """
        Query AI notebook with chapter-scoped RAG
        
        Only uses approved notes from the current chapter
        """
        # Get chapter details
        chapter = db.table("chapters")\
            .select("name")\
            .eq("id", chapter_id)\
            .single()\
            .execute()
        
        if not chapter.data:
            raise Exception("Chapter not found")
        
        chapter_name = chapter.data['name']
        
        # Use RAG service
        result = await rag_service.query_with_rag(
            question=question,
            chapter_id=chapter_id,
            chapter_name=chapter_name,
            db=db
        )
        
        return NotebookResponse(
            answer=result['answer'],
            sources=result['sources'],
            note_count=result['note_count'],
            chapter_name=chapter_name
        )
    
    async def get_recommendations(
        self,
        db: Client,
        chapter_id: str,
        topic: str = None
    ) -> RecommendationsResponse:
        """
        Get educational resource recommendations for a chapter
        
        Args:
            db: Supabase client
            chapter_id: Chapter ID
            
        Returns:
            RecommendationsResponse with video and article recommendations
        """
        # Get chapter and subject details
        chapter = db.table("chapters")\
            .select("name, subject_id, subjects(name)")\
            .eq("id", chapter_id)\
            .single()\
            .execute()
        
        if not chapter.data:
            raise Exception("Chapter not found")
        
        chapter_name = chapter.data['name']
        subject_name = chapter.data['subjects']['name']
        
        # Get recommendations from AI service
        result = await recommendation_service.get_recommendations(
            chapter_name=chapter_name,
            subject_name=subject_name,
            topic=topic
        )
        
        # Convert to response model
        recommendation_items = [
            RecommendationItem(**rec) for rec in result['recommendations']
        ]
        
        return RecommendationsResponse(
            recommendations=recommendation_items,
            chapter_name=chapter_name,
            subject_name=subject_name
        )


# Global instance
notebook_service = NotebookService()
