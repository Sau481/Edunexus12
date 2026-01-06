import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
from functools import lru_cache


@lru_cache()
def init_firebase():
    """Initialize Firebase Admin SDK - AUTH ONLY"""
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    return firebase_admin.get_app()


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify Firebase ID token and return decoded token
    
    Args:
        id_token: Firebase ID token from request header
        
    Returns:
        Decoded token containing uid, email, etc.
        
    Raises:
        Exception if token is invalid
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid Firebase token: {str(e)}")


# Initialize on module load
init_firebase()
