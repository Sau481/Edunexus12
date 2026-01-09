from supabase import Client
from app.modules.auth.schemas import UserCreate, UserResponse
from datetime import datetime


class AuthService:
    """User authentication and profile service"""
    
    def create_user_profile(self, db: Client, user_data: UserCreate) -> UserResponse:
        """
        Create user profile in database
        
        Called after Firebase signup on frontend
        """
        # Check if user already exists
        existing = db.table("users")\
            .select("*")\
            .eq("firebase_uid", user_data.firebase_uid)\
            .execute()
        
        if existing.data:
            raise Exception("User profile already exists")
            
        # Check if email already exists
        email_check = db.table("users")\
            .select("*")\
            .eq("email", user_data.email)\
            .execute()
            
        if email_check.data:
            raise Exception("Email already registered")
        
        # Insert new user
        response = db.table("users").insert({
            "firebase_uid": user_data.firebase_uid,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return UserResponse(**response.data[0])
    
    def get_user_profile(self, db: Client, user_id: str) -> UserResponse:
        """Get user profile by ID"""
        response = db.table("users")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        if not response.data:
            raise Exception("User not found")
        
        return UserResponse(**response.data)
    
    def get_user_by_firebase_uid(self, db: Client, firebase_uid: str) -> UserResponse | None:
        """Get user profile by Firebase UID"""
        response = db.table("users")\
            .select("*")\
            .eq("firebase_uid", firebase_uid)\
            .execute()
        
        if not response.data:
            return None
        
        return UserResponse(**response.data[0])


# Global instance
auth_service = AuthService()
