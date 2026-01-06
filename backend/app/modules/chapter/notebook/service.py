from supabase import Client
from app.modules.chapter.notebook.schemas import NotebookResponse
from app.services.rag_service import rag_service


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


# Global instance
notebook_service = NotebookService()
