from app.core.firebase import get_firestore_client
from app.modules.chapter.schemas import ChapterCreate
import uuid
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter

class ChapterService:
    def __init__(self):
        self.db = get_firestore_client()
        self.collection = self.db.collection('chapters')

    async def create_chapter(self, data: ChapterCreate):
        c_id = str(uuid.uuid4())
        new_chapter = data.model_dump()
        new_chapter.update({
            "id": c_id,
            "created_at": datetime.utcnow().isoformat()
        })
        self.collection.document(c_id).set(new_chapter)
        return new_chapter

    async def get_chapters_by_subject(self, subject_id: str):
        query = self.collection.where(filter=FieldFilter("subject_id", "==", subject_id)).order_by("order")
        return [doc.to_dict() for doc in query.stream()]
        
    async def get_chapter_by_id(self, chapter_id: str):
        doc = self.collection.document(chapter_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
