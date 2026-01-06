from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from app.core.config import settings
import google.generativeai as genai
from functools import lru_cache
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_qdrant_client() -> Optional[QdrantClient]:
    """Get Qdrant client instance"""
    try:
        if settings.QDRANT_API_KEY:
            client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY
            )
        else:
            client = QdrantClient(url=settings.QDRANT_URL)
        
        # Test connection
        client.get_collections()
        return client
    except Exception as e:
        logger.warning(f"Qdrant connection failed: {e}. Vector search will be disabled.")
        return None


class QdrantService:
    """Qdrant vector database service"""
    
    def __init__(self):
        self.client = None
        self.collection_name = "notes_embeddings"
        self.embedding_model = "models/text-embedding-004"
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization of Qdrant client"""
        if self._initialized:
            return
        
        self.client = get_qdrant_client()
        if self.client:
            self._ensure_collection()
        self._initialized = True
    
    def _ensure_collection(self):
        """Create collection if it doesn't exist"""
        collections = self.client.get_collections().collections
        collection_names = [col.name for col in collections]
        
        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )
    
    def _generate_embedding(self, text: str) -> list[float]:
        """Generate embedding using Gemini"""
        result = genai.embed_content(
            model=self.embedding_model,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    
    def add_note_embedding(
        self,
        note_id: str,
        chapter_id: str,
        title: str,
        content: str
    ):
        """
        Add note embedding to Qdrant
        
        Called when note is approved
        """
        self._ensure_initialized()
        if not self.client:
            logger.warning("Qdrant not available. Skipping embedding.")
            return
        
        # Combine title and content for better semantic search
        text = f"{title}\n{content}"
        embedding = self._generate_embedding(text)
        
        point = PointStruct(
            id=note_id,
            vector=embedding,
            payload={
                "note_id": note_id,
                "chapter_id": chapter_id,
                "title": title,
                "content": content[:1000]  # Store preview
            }
        )
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[point]
        )
    
    def delete_note_embedding(self, note_id: str):
        """
        Delete note embedding from Qdrant
        
        Called when note is rejected or deleted
        """
        self._ensure_initialized()
        if not self.client:
            logger.warning("Qdrant not available. Skipping deletion.")
            return
        
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=[note_id]
        )
    
    def search_notes(
        self,
        query: str,
        chapter_id: str,
        limit: int = 5
    ) -> list[dict]:
        """
        Search for relevant notes in a chapter
        
        Args:
            query: User's question
            chapter_id: Limit search to this chapter
            limit: Max number of results
            
        Returns:
            List of relevant note payloads
        """
        self._ensure_initialized()
        if not self.client:
            logger.warning("Qdrant not available. Returning empty search results.")
            return []
        
        query_embedding = self._generate_embedding(query)
        
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="chapter_id",
                        match=MatchValue(value=chapter_id)
                    )
                ]
            ),
            limit=limit
        )
        
        return [hit.payload for hit in results]


# Global instance
qdrant_service = QdrantService()
