from pydantic import BaseModel
from typing import Optional

class ChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    unit_id: str # Each chapter belongs to a Unit, or directly Subject? Prompt said "Subject ... Units ... Chapters".
                 # Actually prompting hierarchy: Classroom -> Subject -> (Implied Units/Chapters).
                 # User prompt: "modules/subject: Manage subjects and units". "modules/chapter: List chapters for a subject".
                 # So Chapter likely links to Subject but maybe organized by Unit.
                 # Let's link to subject_id as per "List chapters for a subject" instruction.
    subject_id: str

class ChapterCreate(ChapterBase):
    pass

class ChapterResponse(ChapterBase):
    id: str
    created_at: str
