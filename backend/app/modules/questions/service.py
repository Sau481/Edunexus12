from supabase import Client
from app.modules.questions.schemas import QuestionResponse
from datetime import datetime


class QuestionService:
    """Question management service"""
    
    async def create_question(
        self,
        db: Client,
        user_id: str,
        user_name: str,
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
        
        # Construct response directly from insert result + known user info
        question = response.data[0]
        return QuestionResponse(
            id=question['id'],
            chapter_id=question['chapter_id'],
            user_id=question['user_id'],
            title=question['title'],
            content=question['content'],
            is_private=question['is_private'],
            answer=None,
            answered_by=None,
            answered_at=None,
            created_at=question['created_at'],
            user_name=user_name
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
            .select("*, author:users!questions_user_id_fkey(name), answerer:users!questions_answered_by_fkey(name)")\
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
                user_name=q.get('author', {}).get('name') if q.get('author') else 'Unknown User',
                answerer_name=q.get('answerer', {}).get('name') if q.get('answerer') else None
            ))
        
        return questions

    async def list_community_questions(
        self,
        db: Client,
        chapter_id: str
    ) -> list[QuestionResponse]:
        """List public answered questions for community view"""
        response = db.table("questions")\
            .select("*, author:users!questions_user_id_fkey(name), answerer:users!questions_answered_by_fkey(name)")\
            .eq("chapter_id", chapter_id)\
            .eq("is_private", False)\
            .not_.is_("answer", "null")\
            .execute()
            
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
                user_name=q.get('author', {}).get('name') if q.get('author') else 'Unknown User',
                answerer_name=q.get('answerer', {}).get('name') if q.get('answerer') else None
            ))
        return questions

    async def list_user_questions(
        self,
        db: Client,
        user_id: str
    ) -> list[QuestionResponse]:
        """List all questions by user"""
        response = db.table("questions")\
            .select("*, author:users!questions_user_id_fkey(name), answerer:users!questions_answered_by_fkey(name)")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
            
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
                user_name=q.get('author', {}).get('name') if q.get('author') else 'Unknown User',
                answerer_name=q.get('answerer', {}).get('name') if q.get('answerer') else None
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
            .select("*, author:users!questions_user_id_fkey(name), answerer:users!questions_answered_by_fkey(name)")\
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
            user_name=q.get('author', {}).get('name') if q.get('author') else 'Unknown User',
            answerer_name=q.get('answerer', {}).get('name') if q.get('answerer') else None
        )



    def delete_question(
        self,
        db: Client,
        user_id: str,
        question_id: str
    ) -> bool:
        """Delete question (author only)"""
        # Check ownership
        response = db.table("questions")\
            .select("user_id")\
            .eq("id", question_id)\
            .single()\
            .execute()
            
        if not response.data:
            return False
            
        if response.data['user_id'] != user_id:
            return False
            
        db.table("questions").delete().eq("id", question_id).execute()
        return True


# Global instance
question_service = QuestionService()
