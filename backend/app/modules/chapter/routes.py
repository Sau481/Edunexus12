from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.modules.chapter.schemas import ChapterCreate, ChapterResponse
from app.modules.chapter.service import ChapterService
from app.core.permissions import get_current_teacher, get_current_user

# Sub-module routers
# Will import and include them after implementation
# from app.modules.chapter.notes.routes import router as notes_router

router = APIRouter()
service = ChapterService()

@router.post("/", response_model=ChapterResponse)
async def create_chapter(
    chapter: ChapterCreate, 
    teacher: dict = Depends(get_current_teacher)
):
    return await service.create_chapter(chapter)

@router.get("/subject/{subject_id}", response_model=List[ChapterResponse])
async def list_chapters(
    subject_id: str,
    user: dict = Depends(get_current_user)
):
    return await service.get_chapters_by_subject(subject_id)

# We will mount sub-modules in main.py or here. 
# Conventionally, if they are sub-resources of chapter, we might structure URLs like /chapter/{id}/notes
# But user folder structure treats them as modules. 
# I will implement them as separate routers and we can decide how to mount them.
# The user asked for "chapter/notes/routes.py", etc.
