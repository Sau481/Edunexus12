from app.services.vector_service import vector_service
from app.services.ai_service import ai_service


class RAGService:
    """Retrieval-Augmented Generation service"""
    
    async def query_with_rag(
        self,
        question: str,
        chapter_id: str,
        chapter_name: str,
        db
    ) -> dict:
        """
        Answer question using RAG pipeline:
        1. Retrieve relevant notes from Supabase vector search
        2. Generate answer using Gemini with context
        
        Args:
            question: User's question
            chapter_id: Current chapter ID
            chapter_name: Chapter name for context
            db: Supabase client
            
        Returns:
            dict with 'answer', 'sources', 'note_count'
        """
        # Step 1: Retrieve relevant notes from vector DB
        retrieved_notes = await vector_service.search_notes(
            db=db,
            query=question,
            chapter_id=chapter_id,
            limit=5
        )
        
        if not retrieved_notes:
            return {
                'answer': f"I don't have any notes available for {chapter_name} yet. Please upload some notes first!",
                'sources': [],
                'note_count': 0
            }
        
        # Step 2: Format notes for AI context
        # Vector search already returns note_id, title, content, and similarity
        enriched_notes = [
            {
                'title': note['title'],
                'content': note['content']
            }
            for note in retrieved_notes
        ]
        
        # Step 3: Generate AI response with context
        result = await ai_service.generate_chapter_response(
            question=question,
            retrieved_notes=enriched_notes,
            chapter_name=chapter_name
        )
        
        result['note_count'] = len(enriched_notes)
        return result


# Global instance
rag_service = RAGService()
