import google.generativeai as genai
from app.core.config import settings


class RecommendationService:
    """Generate external resource recommendations"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
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
            dict with 'videos' and 'articles' lists
        """
        query = topic if topic else chapter_name
        
        prompt = f"""Suggest educational resources for students learning about:
Subject: {subject_name}
Chapter: {chapter_name}
{f"Topic: {topic}" if topic else ""}

Provide:
1. 5 YouTube video recommendations (with likely search terms)
2. 5 article/blog recommendations (with likely search terms)

Format each as:
- Title: <descriptive title>
- Search: <search terms to find this>
- Why: <brief reason for recommendation>
"""
        
        response = self.model.generate_content(prompt)
        
        # Note: In production, you'd parse the response and potentially
        # use YouTube API / search APIs to get actual links
        # For now, return the AI suggestions
        
        return {
            'recommendations': response.text,
            'chapter': chapter_name,
            'subject': subject_name
        }


# Global instance
recommendation_service = RecommendationService()
