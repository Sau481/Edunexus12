from fastapi import APIRouter, Depends, HTTPException
from app.modules.auth.schemas import UserCreate, UserResponse
from app.modules.auth.service import auth_service
from app.core.auth import get_current_user, CurrentUser
from app.core.supabase import get_db
from supabase import Client


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/profile", response_model=UserResponse)
async def create_profile(
    user_data: UserCreate,
    db: Client = Depends(get_db)
):
    """
    Create user profile after Firebase signup
    
    Frontend should call this after successful Firebase authentication
    """
    try:
        return await auth_service.create_user_profile(db, user_data)
    except Exception as e:
        print(f"Error creating profile: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get current authenticated user profile"""
    return UserResponse(
        id=current_user.user_id,
        firebase_uid=current_user.firebase_uid,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        created_at=""  # Will be populated from DB if needed
    )
