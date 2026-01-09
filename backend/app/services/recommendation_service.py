import google.generativeai as genai
from app.core.config import settings
import json
import logging
import hashlib
import asyncio
from typing import Optional

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class RecommendationService:
    """Generate external resource recommendations"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.max_retries = 3
        self.base_delay = 2  # seconds
    
    async def _retry_with_backoff(self, func, *args, **kwargs):
        """Retry function with exponential backoff for rate limits"""
        for attempt in range(self.max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                error_msg = str(e).lower()
                
                # Check if it's a rate limit error
                if 'rate limit' in error_msg or 'quota' in error_msg or 'too many requests' in error_msg or '429' in error_msg:
                    if attempt < self.max_retries - 1:
                        delay = self.base_delay * (2 ** attempt)  # Exponential backoff: 2s, 4s, 8s
                        logger.warning(f"Rate limit hit, retrying in {delay}s (attempt {attempt + 1}/{self.max_retries})")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error(f"Rate limit exceeded after {self.max_retries} attempts")
                        raise Exception("API rate limit exceeded. Please try again in a moment.")
                else:
                    # For non-rate-limit errors, raise immediately
                    raise
        
        raise Exception("Max retries exceeded")
    
    async def get_recommendations(
        self,
        chapter_name: str,
        subject_name: str,
        topic: str = None
    ) -> dict:
        """
        Get video and article recommendations for a chapter/topic
        
        Args:
            chapter_name: Chapter name
            subject_name: Subject name
            topic: Optional specific topic within chapter
            
        Returns:
            dict with 'videos' and 'articles' lists containing structured recommendations
        """
        # Log whether we're generating query-based or general recommendations
        if topic:
            logger.info(f"Generating query-based recommendations for topic: '{topic}' in {subject_name} - {chapter_name}")
            prompt = f"""You are an educational AI assistant. A student is asking about "{topic}" within the context of {subject_name} - {chapter_name}.
            
Find exactly 3 YouTube video recommendations and 3 article/blog recommendations specifically relevant to their question: "{topic}".

If the question is specific (e.g., "what is generate and test"), find resources explaining that exact concept.
If the question is broad, provide good overview resources."""
        else:
            logger.info(f"Generating general recommendations for {subject_name} - {chapter_name}")
            prompt = f"""Generate educational resource recommendations for students learning:
Subject: {subject_name}
Chapter: {chapter_name}"""

        prompt += f"""

Provide exactly 3 YouTube video recommendations and 3 article/blog recommendations.

Return a JSON object with this exact structure:
{{
  "videos": [
    {{
      "title": "Descriptive video title",
      "search_terms": "search query to find this video on YouTube",
      "description": "Brief explanation of what this video covers and why it's helpful"
    }}
  ],
  "articles": [
    {{
      "title": "Descriptive article title",
      "search_terms": "search query to find this article",
      "description": "Brief explanation of what this article covers and why it's helpful"
    }}
  ]
}}

Make sure recommendations are:
- Relevant to the specific chapter/topic
- Appropriate for students
- Diverse in approach (theory, examples, practice)
- STRICTLY VALID JSON format
"""
        
        try:
            # Use retry logic for API call
            response = await self._retry_with_backoff(
                self.model.generate_content_async,
                prompt
            )
            text = response.text
            
            # Clean up potential markdown formatting
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            text = text.strip()
            data = json.loads(text)
            
            # Transform to our API format with IDs and URLs
            recommendations = []
            
            # Generate unique IDs based on topic if provided
            id_suffix = f"-{topic}" if topic else ""
            
            # Process videos
            for idx, video in enumerate(data.get('videos', [])[:3]):
                video_id = self._generate_id(f"video-{chapter_name}{id_suffix}-{idx}")
                search_url = f"https://www.youtube.com/results?search_query={video['search_terms'].replace(' ', '+')}"
                recommendations.append({
                    'id': video_id,
                    'title': video['title'],
                    'type': 'video',
                    'url': search_url,
                    'description': video['description']
                })
            
            # Process articles
            for idx, article in enumerate(data.get('articles', [])[:3]):
                article_id = self._generate_id(f"article-{chapter_name}{id_suffix}-{idx}")
                search_url = f"https://www.google.com/search?q={article['search_terms'].replace(' ', '+')}"
                recommendations.append({
                    'id': article_id,
                    'title': article['title'],
                    'type': 'article',
                    'url': search_url,
                    'description': article['description']
                })
            
            logger.info(f"Successfully generated {len(recommendations)} recommendations")
            return {
                'recommendations': recommendations,
                'chapter': chapter_name,
                'subject': subject_name
            }
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            # Return empty recommendations on error
            return {
                'recommendations': [],
                'chapter': chapter_name,
                'subject': subject_name
            }
    
    def _generate_id(self, text: str) -> str:
        """Generate a stable ID from text"""
        return hashlib.md5(text.encode()).hexdigest()[:12]


# Global instance
recommendation_service = RecommendationService()
