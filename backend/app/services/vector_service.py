from supabase import Client
from app.core.config import settings
import google.generativeai as genai
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class VectorService:
    """Supabase pgvector service for semantic search"""
    
    def __init__(self):
        self.embedding_model = "models/text-embedding-004"
        self.embedding_dimension = 768
    
    def _generate_embedding(self, text: str) -> list[float]:
        """
        Generate embedding using Gemini
        
        Args:
            text: Text to embed
            
        Returns:
            768-dimensional embedding vector
        """
        try:
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def add_note_embedding(
        self,
        db: Client,
        note_id: str,
        title: str,
        content: str
    ):
        """
        Generate and store embedding for a note
        
        Called when note is approved
        
        Args:
            db: Supabase client
            note_id: ID of the note
            title: Note title
            content: Note content
        """
        try:
            # Combine title and content for better semantic search
            text = f"{title}\n{content}"
            embedding = self._generate_embedding(text)
            
            # Update note with embedding
            db.table("notes").update({
                "embedding": embedding
            }).eq("id", note_id).execute()
            
            logger.info(f"Added embedding for note {note_id}")
        except Exception as e:
            logger.error(f"Failed to add embedding for note {note_id}: {e}")
            # Don't raise - embedding is optional, note should still be saved
    
    def delete_note_embedding(
        self,
        db: Client,
        note_id: str
    ):
        """
        Remove embedding from a note
        
        Called when note is rejected or deleted
        
        Args:
            db: Supabase client
            note_id: ID of the note
        """
        try:
            # Set embedding to NULL
            db.table("notes").update({
                "embedding": None
            }).eq("id", note_id).execute()
            
            logger.info(f"Deleted embedding for note {note_id}")
        except Exception as e:
            logger.error(f"Failed to delete embedding for note {note_id}: {e}")
    
    def search_notes(
        self,
        db: Client,
        query: str,
        chapter_id: str,
        limit: int = 5
    ) -> list[dict]:
        """
        Search for relevant notes in a chapter using semantic similarity
        
        Args:
            db: Supabase client
            query: User's question
            chapter_id: Limit search to this chapter
            limit: Max number of results
            
        Returns:
            List of relevant notes with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            
            # Call the search function created in migration
            response = db.rpc(
                "search_notes_by_similarity",
                {
                    "query_embedding": query_embedding,
                    "target_chapter_id": chapter_id,
                    "result_limit": limit
                }
            ).execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to search notes: {e}")
            return []


# Global instance
vector_service = VectorService()
