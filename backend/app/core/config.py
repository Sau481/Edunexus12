from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    PROJECT_NAME: str = "EduNexus"
    API_V1_STR: str = "/api/v1"
    
    # Firebase (AUTH ONLY)
    FIREBASE_CREDENTIALS_PATH: str = "firebase/secrets/firebase-admin.json"
    
    # Supabase (DATABASE + STORAGE)
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str
    
    # Gemini AI
    GEMINI_API_KEY: str
    
    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080","https://edunexus12.vercel.app/"]
    
    model_config = ConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra='ignore'
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()


settings = get_settings()
