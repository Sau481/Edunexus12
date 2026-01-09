from pydantic import BaseModel
from typing import Optional, Literal


class NotebookQuery(BaseModel):
    """Schema for AI notebook query"""
    question: str


class NotebookResponse(BaseModel):
    """Schema for AI notebook response"""
    answer: str
    sources: list[dict]  # List of {title, uploaded_by}
    note_count: int
    chapter_name: str
    



class RecommendationItem(BaseModel):
    """Schema for a single recommendation"""
    id: str
    title: str
    type: Literal['video', 'article']
    url: str
    description: str
    thumbnail: Optional[str] = None


class RecommendationsResponse(BaseModel):
    """Schema for recommendations response"""
    recommendations: list[RecommendationItem]
    chapter_name: str
    subject_name: str
