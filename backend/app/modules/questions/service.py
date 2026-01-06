from supabase import Client
from app.modules.questions.schemas import QuestionResponse
from datetime import datetime


class QuestionService:
    """Question management service"""
    
    async def create_question(
        self,
        db: Client,
        user_id: str,
        chapter_id: str,
        title: str,
        content: str,
        is_private: bool
    ) -> QuestionResponse:
        """Create new question"""
        response = db.table("questions").insert({
            "chapter_id": chapter_id,
            "user_id": user_id,
            "title": title,
            "content": content,
            "is_private": is_private,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Fetch with user details
        question_id = response.data[0]['id']
        full_response = db.table("questions")\
            .select("*, users!inner(name)")\
            .eq("id", question_id)\
            .single()\
            .execute()
        
        question = full_response.data
        return QuestionResponse(
            id=question['id'],
            chapter_id=question['chapter_id'],
            user_id=question['user_id'],
            title=question['title'],
            content=question['content'],
            is_private=question['is_private'],
            answer=question.get('answer'),
            answered_by=question.get('answered_by'),
            answered_at=question.get('answered_at'),
            created_at=question['created_at'],
            user_name=question['users']['name']
        )
    
    async def list_questions(
        self,
        db: Client,
        chapter_id: str,
        user_id: str,
        role: str
    ) -> list[QuestionResponse]:
        """
        List questions for chapter
        
        - Students: own questions + public questions
        - Teachers: all questions
        """
        query = db.table("questions")\
            .select("*, users!questions_user_id_fkey!inner(name), users!questions_answered_by_fkey(name)")\
            .eq("chapter_id", chapter_id)
        
        if role == "student":
            # Get public questions + own questions
            query = query.or_(f"is_private.eq.false,user_id.eq.{user_id}")
        
        response = query.execute()
        
        questions = []
        for q in response.data:
            questions.append(QuestionResponse(
                id=q['id'],
                chapter_id=q['chapter_id'],
                user_id=q['user_id'],
                title=q['title'],
                content=q['content'],
                is_private=q['is_private'],
                answer=q.get('answer'),
                answered_by=q.get('answered_by'),
                answered_at=q.get('answered_at'),
                created_at=q['created_at'],
                user_name=q['users']['name'],
                answerer_name=q.get('users', {}).get('name') if q.get('answered_by') else None
            ))
        
        return questions
    
    async def answer_question(
        self,
        db: Client,
        question_id: str,
        teacher_id: str,
        answer_content: str
    ) -> QuestionResponse:
        """Answer question (teacher only)"""
        response = db.table("questions").update({
            "answer": answer_content,
            "answered_by": teacher_id,
            "answered_at": datetime.utcnow().isoformat()
        }).eq("id", question_id).execute()
        
        # Fetch with user details
        full_response = db.table("questions")\
            .select("*, users!questions_user_id_fkey!inner(name), users!questions_answered_by_fkey!inner(name)")\
            .eq("id", question_id)\
            .single()\
            .execute()
        
        q = full_response.data
        return QuestionResponse(
            id=q['id'],
            chapter_id=q['chapter_id'],
            user_id=q['user_id'],
            title=q['title'],
            content=q['content'],
            is_private=q['is_private'],
            answer=q['answer'],
            answered_by=q['answered_by'],
            answered_at=q['answered_at'],
            created_at=q['created_at'],
            user_name=q['users']['name'],
            answerer_name=q['users']['name'] if q.get('answered_by') else None
        )


# Global instance
question_service = QuestionService()
