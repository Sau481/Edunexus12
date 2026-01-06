from supabase import Client
from app.modules.chapter.notes.schemas import NoteResponse
from app.services.vector_service import vector_service
from datetime import datetime


class NoteService:
    """Note management service"""
    
    async def list_notes(
        self,
        db: Client,
        chapter_id: str,
        user_id: str,
        role: str
    ) -> list[NoteResponse]:
        """
        List notes for chapter with visibility rules
        
        Students see:
        - All approved public notes
        - Own notes (any status)
        
        Teachers see:
        - All notes
        """
        query = db.table("notes")\
            .select("*, users!notes_uploaded_by_fkey!inner(name), users!notes_approved_by_fkey(name)")\
            .eq("chapter_id", chapter_id)
        
        if role == "student":
            # Approved public notes OR own notes
            query = query.or_(f"and(approval_status.eq.approved,visibility.eq.public),uploaded_by.eq.{user_id}")
        
        response = query.execute()
        
        notes = []
        for note in response.data:
            notes.append(NoteResponse(
                id=note['id'],
                chapter_id=note['chapter_id'],
                title=note['title'],
                content=note['content'],
                file_url=note.get('file_url'),
                file_name=note.get('file_name'),
                visibility=note['visibility'],
                approval_status=note['approval_status'],
                uploaded_by=note['uploaded_by'],
                uploader_name=note['users']['name'],
                approved_by=note.get('approved_by'),
                approver_name=note.get('users', {}).get('name') if note.get('approved_by') else None,
                created_at=note['created_at']
            ))
        
        return notes
    
    async def approve_note(
        self,
        db: Client,
        note_id: str,
        teacher_id: str,
        status: str
    ) -> NoteResponse:
        """
        Approve or reject note (teacher only)
        
        On approval: create embedding in Supabase
        On rejection: delete embedding from Supabase if exists
        """
        # Get note details
        note = db.table("notes")\
            .select("*")\
            .eq("id", note_id)\
            .single()\
            .execute()
        
        if not note.data:
            raise Exception("Note not found")
        
        # Update status
        response = db.table("notes").update({
            "approval_status": status,
            "approved_by": teacher_id if status == "approved" else None,
            "approved_at": datetime.utcnow().isoformat() if status == "approved" else None
        }).eq("id", note_id).execute()
        
        # Sync with vector DB
        if status == "approved":
            # Add to vector DB
            vector_service.add_note_embedding(
                db=db,
                note_id=note_id,
                title=note.data['title'],
                content=note.data['content']
            )
        else:
            # Remove from vector DB
            try:
                vector_service.delete_note_embedding(db=db, note_id=note_id)
            except:
                pass  # Embedding might not exist
        
        # Fetch updated note with user details
        full_response = db.table("notes")\
            .select("*, users!notes_uploaded_by_fkey!inner(name), users!notes_approved_by_fkey(name)")\
            .eq("id", note_id)\
            .single()\
            .execute()
        
        n = full_response.data
        return NoteResponse(
            id=n['id'],
            chapter_id=n['chapter_id'],
            title=n['title'],
            content=n['content'],
            file_url=n.get('file_url'),
            file_name=n.get('file_name'),
            visibility=n['visibility'],
            approval_status=n['approval_status'],
            uploaded_by=n['uploaded_by'],
            uploader_name=n['users']['name'],
            approved_by=n.get('approved_by'),
            approver_name=n.get('users', {}).get('name') if n.get('approved_by') else None,
            created_at=n['created_at']
        )


# Global instance
note_service = NoteService()
