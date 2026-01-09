from supabase import Client
from app.core.config import settings
import google.generativeai as genai
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


import asyncio

class VectorService:
    """Supabase pgvector service for semantic search"""
    
    def __init__(self):
        self.embedding_model = "models/text-embedding-004"
        self.embedding_dimension = 768
    
    def _generate_embedding(self, text: str) -> list[float]:
        """
        Generate embedding using Gemini (Synchronous helper)
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
            
    async def add_note_embedding(
        self,
        db: Client,
        note_id: str,
        title: str,
        content: str
    ):
        """
        Generate and store embedding for a note
        """
        try:
            # Combine title and content for better semantic search
            text = f"{title}\n{content}"
            
            # Run embedding generation in thread to avoid blocking
            embedding = await asyncio.to_thread(self._generate_embedding, text)
            
            # Run DB update in thread
            await asyncio.to_thread(
                lambda: db.table("notes").update({
                    "embedding": embedding
                }).eq("id", note_id).execute()
            )
            
            logger.info(f"Added embedding for note {note_id}")
        except Exception as e:
            logger.error(f"Failed to add embedding for note {note_id}: {e}")
            # Don't raise - embedding is optional, note should still be saved
    
    async def delete_note_embedding(
        self,
        db: Client,
        note_id: str
    ):
        """
        Remove embedding from a note
        """
        try:
            # Run DB update in thread
            await asyncio.to_thread(
                lambda: db.table("notes").update({
                    "embedding": None
                }).eq("id", note_id).execute()
            )
            
            logger.info(f"Deleted embedding for note {note_id}")
        except Exception as e:
            logger.error(f"Failed to delete embedding for note {note_id}: {e}")
    
    async def search_notes(
        self,
        db: Client,
        query: str,
        chapter_id: str,
        limit: int = 5
    ) -> list[dict]:
        """
        Search for relevant notes using semantic similarity
        """
        try:
            # Generate query embedding in thread
            query_embedding = await asyncio.to_thread(self._generate_embedding, query)
            
            # Run DB search in thread
            response = await asyncio.to_thread(
                lambda: db.rpc(
                    "search_notes_by_similarity",
                    {
                        "query_embedding": query_embedding,
                        "target_chapter_id": chapter_id,
                        "result_limit": limit
                    }
                ).execute()
            )
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to search notes: {e}")
            return []


# Global instance
vector_service = VectorService()
