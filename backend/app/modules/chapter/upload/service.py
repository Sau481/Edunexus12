from supabase import Client
from app.modules.chapter.upload.schemas import NoteUploadResponse
from app.services.document_processor import document_processor
from app.utils.helpers import sanitize_filename
from datetime import datetime
import uuid


class UploadService:
    """File upload service for Supabase Storage"""
    
    DEFAULT_BUCKET = "notes"
    
    async def upload_note(
        self,
        db: Client,
        chapter_id: str,
        user_id: str,
        role: str,
        title: str,
        file_bytes: bytes,
        filename: str,
        visibility: str
    ) -> NoteUploadResponse:
        """
        Upload note file to Supabase Storage
        
        - Students: pending approval (unless private)
        - Teachers: auto-approved
        """
        # Process document to extract text
        try:
            content = document_processor.process_document(file_bytes, filename)
        except Exception as e:
            raise Exception(f"Error processing document: {str(e)}")
        
        # Generate unique file path
        safe_filename = sanitize_filename(filename)
        file_id = str(uuid.uuid4())
        file_path = f"{chapter_id}/{file_id}_{safe_filename}"
        
        # Upload to Supabase Storage
        try:
            storage_response = db.storage.from_(self.DEFAULT_BUCKET).upload(
                file_path,
                file_bytes,
                {"content-type": "application/octet-stream"}
            )
        except Exception as e:
            raise Exception(f"Error uploading file: {str(e)}")
        
        # Get public URL
        file_url = db.storage.from_(self.DEFAULT_BUCKET).get_public_url(file_path)
        
        # Determine approval status
        if role == "teacher":
            approval_status = "approved"
        else:
            approval_status = "approved" if visibility == "private" else "pending"
        
        # Save metadata to database
        note_data = {
            "chapter_id": chapter_id,
            "title": title,
            "content": content[:5000],  # Store first 5000 chars
            "file_url": file_url,
            "file_name": filename,
            "visibility": visibility,
            "approval_status": approval_status,
            "uploaded_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if role == "teacher":
            note_data["approved_by"] = user_id
            note_data["approved_at"] = datetime.utcnow().isoformat()
        
        response = db.table("notes").insert(note_data).execute()
        
        # If teacher uploaded or private, add to vector DB immediately
        if approval_status == "approved" and visibility == "public":
            from app.services.vector_service import vector_service
            vector_service.add_note_embedding(
                db=db,
                note_id=response.data[0]['id'],
                title=title,
                content=content
            )
        
        return NoteUploadResponse(
            id=response.data[0]['id'],
            chapter_id=chapter_id,
            title=title,
            content=content[:500],  # Return preview
            file_url=file_url,
            file_name=filename,
            visibility=visibility,
            approval_status=approval_status,
            created_at=response.data[0]['created_at']
        )


# Global instance
upload_service = UploadService()
