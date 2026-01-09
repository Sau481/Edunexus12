from supabase import Client
from app.modules.dashboard.schemas import TeacherDashboardResponse, PendingNote, PendingQuestion
from app.modules.classroom.service import classroom_service
from app.modules.classroom.schemas import ClassroomResponse

class DashboardService:
    """Dashboard aggregator service"""

    async def get_teacher_dashboard(
        self,
        db: Client,
        teacher_id: str
    ) -> TeacherDashboardResponse:
        """
        Get all dashboard data for a teacher in one go.
        1. List all classrooms (created + assigned)
        2. Find all pending notes in those classrooms
        3. Find all unanswered questions in those classrooms
        """
        
        # 1. Get Classrooms (Split into Created and Accessed)
        # Use classroom service to get separate lists or filter here. 
        # Ideally, we refactor classroom_service.list_classrooms to return structured data, 
        # but for now, let's just fetch them here or use the existing list_classrooms and split.
        
        # Actually, list_classrooms for teacher returns a flat list of all visible classrooms.
        # Let's get them and split manually, BUT we need to handle subject filtering for accessed classrooms.
        
        # created_classrooms query
        created_res = db.table("classrooms")\
            .select("*")\
            .eq("created_by", teacher_id)\
            .execute()
            
        created_classrooms = []
        for c in created_res.data:
            # Fetch ALL subjects for created classrooms
            subjects_res = db.table("subjects")\
                .select("*")\
                .eq("classroom_id", c['id'])\
                .execute()
            
            # Fetch chapters for each subject
            subjects_with_chapters = []
            for subject in subjects_res.data:
                chapters_res = db.table("chapters")\
                    .select("*")\
                    .eq("subject_id", subject['id'])\
                    .execute()
                subject['chapters'] = chapters_res.data
                subjects_with_chapters.append(subject)
            
            c['subjects'] = subjects_with_chapters
            created_classrooms.append(ClassroomResponse(**c))

        # accessed_classrooms query (via teacher_access)
        accessed_res = db.table("teacher_access")\
            .select("subjects!inner(classrooms!inner(*), *)")\
            .eq("teacher_id", teacher_id)\
            .execute()
            
        accessed_classroom_map = {}
        
        for item in accessed_res.data:
            classroom = item['subjects']['classrooms']
            subject = item['subjects']
            
            # Remove circular classroom ref from subject dict if present to cleanly serialise
            if 'classrooms' in subject:
                del subject['classrooms']

            if classroom['id'] not in accessed_classroom_map:
                # Initialize classroom with empty subjects list
                classroom['subjects'] = []
                accessed_classroom_map[classroom['id']] = classroom
            
            # Fetch chapters for this SPECIFIC subject
            chapters_res = db.table("chapters")\
                .select("*")\
                .eq("subject_id", subject['id'])\
                .execute()
            subject['chapters'] = chapters_res.data
            
            # Add this subject to the classroom
            # Check if subject already added (assigned multiple times? shouldn't happen but good to be safe)
            existing_ids = [s['id'] for s in accessed_classroom_map[classroom['id']]['subjects']]
            if subject['id'] not in existing_ids:
                accessed_classroom_map[classroom['id']]['subjects'].append(subject)
        
        accessed_classrooms = [ClassroomResponse(**c) for c in accessed_classroom_map.values()]
        
        # Combine for pending items queries (we still want to show pending items for all visible contexts)
        assigned_subject_ids = [item['subjects']['id'] for item in accessed_res.data]
        
        # Pending Notes Query
        pending_notes_res = db.table("notes")\
            .select("*, uploaded_by, users!uploaded_by(name), chapters!inner(name, id, subject_id, subjects!inner(classroom_id, classrooms!inner(created_by)))")\
            .eq("approval_status", "pending")\
            .execute()
            
        # Helper to get subjects with ANY assigned teacher
        # We need to know if a subject has an assigned teacher to decide if Creator should see it.
        # IF a subject has assigned teachers, Creator does NOT see pending notes (delegated).
        # IF no assigned teachers, Creator sees it.
        # Assigned teachers ALWAYS see it (checked via is_assigned).

        # Collect all subject IDs from pending notes to batch query
        pending_subject_ids = set()
        for n in pending_notes_res.data:
            pending_subject_ids.add(n['chapters']['subject_id'])
            
        # Query teacher_access to see which subjects have assignments
        # We just need "subject_id" distinct list from teacher_access where subject_id IN pending_subject_ids
        subjects_with_teachers = set()
        if pending_subject_ids:
            has_teacher_res = db.table("teacher_access")\
                .select("subject_id")\
                .in_("subject_id", list(pending_subject_ids))\
                .execute()
            subjects_with_teachers = {item['subject_id'] for item in has_teacher_res.data}

        final_pending_notes = []
        for n in pending_notes_res.data:
            chapter = n['chapters']
            subject_id = chapter['subject_id']
            classroom = chapter['subjects']['classrooms']
            
            # Check access
            is_creator = classroom['created_by'] == teacher_id
            is_assigned = subject_id in assigned_subject_ids
            has_assigned_teacher = subject_id in subjects_with_teachers
            
            # SHOW IF: 
            # 1. I am the assigned teacher (High priority)
            # 2. I am the creator AND no one else is assigned (Fallback)
            
            if is_assigned:
                should_show = True
            elif is_creator and not has_assigned_teacher:
                should_show = True
            else:
                should_show = False
            
            if should_show:
                final_pending_notes.append(PendingNote(
                    id=n['id'],
                    title=n['title'],
                    content=n['content'],
                    chapter_id=chapter['id'],
                    chapter_name=chapter['name'],
                    author_id=n['uploaded_by'],
                    author_name=n['users']['name'],
                    status=n['approval_status'],
                    created_at=n['created_at'],
                    file_url=n.get('file_url'),
                    file_name=n.get('file_name')
                ))
                
        # Unanswered Questions Query
        unanswered_q_res = db.table("questions")\
            .select("*, user_id, users!user_id(name), chapters!inner(name, id, subject_id, subjects!inner(classroom_id, classrooms!inner(created_by)))")\
            .is_("answer", "null")\
            .execute()
            
        # Collect subject IDs from unanswered questions to check for assigned teachers
        question_subject_ids = set()
        for q in unanswered_q_res.data:
            question_subject_ids.add(q['chapters']['subject_id'])
            
        # Query which subjects have assigned teachers
        subjects_with_teachers_q = set()
        if question_subject_ids:
            has_teacher_res_q = db.table("teacher_access")\
                .select("subject_id")\
                .in_("subject_id", list(question_subject_ids))\
                .execute()
            subjects_with_teachers_q = {item['subject_id'] for item in has_teacher_res_q.data}
            
        final_pending_questions = []
        for q in unanswered_q_res.data:
            chapter = q['chapters']
            subject_id = chapter['subject_id']
            subject = chapter['subjects']
            classroom = subject['classrooms']
            
            # Check access (same logic as pending notes)
            is_creator = classroom['created_by'] == teacher_id
            is_assigned = subject_id in assigned_subject_ids
            has_assigned_teacher = subject_id in subjects_with_teachers_q
            
            # SHOW IF: 
            # 1. I am the assigned teacher (High priority)
            # 2. I am the creator AND no one else is assigned (Fallback)
            
            if is_assigned:
                should_show = True
            elif is_creator and not has_assigned_teacher:
                should_show = True
            else:
                should_show = False
            
            if should_show:
                final_pending_questions.append(PendingQuestion(
                    id=q['id'],
                    title=q['title'],
                    content=q['content'],
                    chapter_id=chapter['id'],
                    chapter_name=chapter['name'],
                    author_id=q['user_id'],
                    author_name=q['users']['name'],
                    is_private=q['is_private'],
                    created_at=q['created_at']
                ))

        return TeacherDashboardResponse(
            created_classrooms=created_classrooms,
            accessed_classrooms=accessed_classrooms,
            pending_notes=final_pending_notes,
            pending_questions=final_pending_questions
        )

# Global instance
dashboard_service = DashboardService()
