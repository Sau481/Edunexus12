from fastapi import Header, HTTPException, Depends
from app.core.firebase import verify_firebase_token
from app.core.supabase import get_db
from supabase import Client


class CurrentUser:
    """Current authenticated user context"""
    
    def __init__(self, user_id: str, firebase_uid: str, email: str, role: str, name: str):
        self.user_id = user_id
        self.firebase_uid = firebase_uid
        self.email = email
        self.role = role  # 'student' or 'teacher'
        self.name = name
    
    def is_teacher(self) -> bool:
        return self.role == "teacher"
    
    def is_student(self) -> bool:
        return self.role == "student"


async def get_current_user(
    authorization: str = Header(..., description="Bearer <firebase_token>"),
    db: Client = Depends(get_db)
) -> CurrentUser:
    """
    Extract and verify Firebase token, then fetch user from database
    
    Args:
        authorization: Bearer token from request header
        db: Supabase client
        
    Returns:
        CurrentUser object with user details
        
    Raises:
        HTTPException if authentication fails
    """
    # Extract token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # Verify Firebase token
    try:
        decoded_token = verify_firebase_token(token)
        firebase_uid = decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    # Fetch user from database
    try:
        response = db.table("users").select("*").eq("firebase_uid", firebase_uid).single().execute()
        user_data = response.data
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return CurrentUser(
            user_id=user_data['id'],
            firebase_uid=user_data['firebase_uid'],
            email=user_data['email'],
            role=user_data['role'],
            name=user_data['name']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")
