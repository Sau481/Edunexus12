from fastapi import HTTPException
from app.core.auth import CurrentUser
from supabase import Client


def require_teacher(user: CurrentUser):
    """Ensure user is a teacher"""
    if not user.is_teacher():
        raise HTTPException(status_code=403, detail="Teacher access required")


def require_student(user: CurrentUser):
    """Ensure user is a student"""
    if not user.is_student():
        raise HTTPException(status_code=403, detail="Student access required")


def check_classroom_access(db: Client, user_id: str, classroom_id: str) -> bool:
    """
    Check if user has access to classroom
    
    - Students: must be a member
    - Teachers: must be creator or assigned to a subject in that classroom
    """
    # Check if student member
    member_check = db.table("classroom_members")\
        .select("id")\
        .eq("classroom_id", classroom_id)\
        .eq("user_id", user_id)\
        .execute()
    
    if member_check.data:
        return True
    
    # Check if teacher creator
    classroom = db.table("classrooms")\
        .select("created_by")\
        .eq("id", classroom_id)\
        .single()\
        .execute()
    
    if classroom.data and classroom.data['created_by'] == user_id:
        return True
    
    # Check if assigned teacher for any subject in classroom
    teacher_check = db.table("subjects")\
        .select("teacher_access!inner(teacher_id)")\
        .eq("classroom_id", classroom_id)\
        .execute()
    
    for subject in teacher_check.data:
        if any(access['teacher_id'] == user_id for access in subject.get('teacher_access', [])):
            return True
    
    return False


def check_subject_teacher_access(db: Client, user_id: str, subject_id: str) -> bool:
    """
    Check if user is a teacher for given subject
    
    Returns True if:
    - User has explicit teacher_access entry for this subject, OR
    - User is the creator of the classroom containing this subject
    """
    # Check explicit teacher access
    access_check = db.table("teacher_access")\
        .select("id")\
        .eq("subject_id", subject_id)\
        .eq("teacher_id", user_id)\
        .execute()
    
    if access_check.data:
        return True
    
    # Check if user is the classroom creator
    subject = db.table("subjects")\
        .select("classroom_id, classrooms!inner(created_by)")\
        .eq("id", subject_id)\
        .limit(1)\
        .execute()
    
    if subject.data and subject.data[0]['classrooms']['created_by'] == user_id:
        return True
    
    return False



def check_chapter_access(db: Client, user_id: str, role: str, chapter_id: str) -> dict:
    """
    Check if user has access to chapter and return access details
    
    Returns:
        dict with 'allowed', 'classroom_id', 'subject_id', 'is_teacher'
    """
    # Get chapter details
    chapter = db.table("chapters")\
        .select("id, subject_id, subjects!inner(classroom_id)")\
        .eq("id", chapter_id)\
        .single()\
        .execute()
    
    if not chapter.data:
        return {'allowed': False}
    
    classroom_id = chapter.data['subjects']['classroom_id']
    subject_id = chapter.data['subject_id']
    
    # Check classroom access
    has_classroom_access = check_classroom_access(db, user_id, classroom_id)
    
    if not has_classroom_access:
        return {'allowed': False}
    
    # Check if teacher for this subject
    is_teacher = False
    if role == "teacher":
        is_teacher = check_subject_teacher_access(db, user_id, subject_id)
    
    return {
        'allowed': True,
        'classroom_id': classroom_id,
        'subject_id': subject_id,
        'is_teacher': is_teacher
    }
