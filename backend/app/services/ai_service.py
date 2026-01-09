import google.generativeai as genai
from app.core.config import settings


# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
from google.api_core import exceptions



class AIService:
    """Gemini LLM interaction service"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    async def generate_response(
        self,
        prompt: str,
        context: str = "",
        max_tokens: int = 1024,
        temperature: float = 0.7
    ) -> str:
        """
        Generate AI response using Gemini
        
        Args:
            prompt: User question or prompt
            context: Additional context (e.g., from RAG)
            max_tokens: Maximum response length
            temperature: Creativity (0-1)
            
        Returns:
            Generated text response
        """
        full_prompt = f"{context}\n\nUser Question: {prompt}" if context else prompt
        
        try:
            response = await self.model.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=temperature
                )
            )
            return response.text
        except exceptions.ResourceExhausted:
            return "I apologize, but I'm currently receiving too many requests. Please try again in 30 seconds."
        except Exception as e:
            return f"I encountered an error processing your request: {str(e)}"
    
    async def generate_chapter_response(
        self,
        question: str,
        retrieved_notes: list[dict],
        chapter_name: str
    ) -> dict:
        """
        Generate response using chapter notes as context
        
        Args:
            question: Student's question
            retrieved_notes: List of relevant notes from RAG
            chapter_name: Current chapter name
            
        Returns:
            dict with 'answer' and 'sources'
        """
        # Build context from notes
        context_parts = [
            f"Chapter: {chapter_name}",
            "\nRelevant Notes:\n"
        ]
        
        sources = []
        for i, note in enumerate(retrieved_notes, 1):
            context_parts.append(f"\n{i}. {note['title']}")
            context_parts.append(f"   {note['content'][:500]}...")  # Truncate long content
            sources.append({
                'title': note['title'],
                'uploaded_by': note.get('uploaded_by', 'Unknown')
            })
        
        context = "\n".join(context_parts)
        
        # System instruction
        system_prompt = f"""You are an AI tutor helping students with {chapter_name}.
Answer the question using ONLY the information from the provided notes.
If the notes don't contain enough information, say so clearly.
Always cite which note(s) you're referencing."""
        
        full_prompt = f"{system_prompt}\n\n{context}\n\nQuestion: {question}"
        
        answer = await self.generate_response(full_prompt, temperature=0.5)
        
        return {
            'answer': answer,
            'sources': sources
        }


# Global instance
ai_service = AIService()
