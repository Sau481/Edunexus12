from supabase import create_client, Client
from app.core.config import settings
from functools import lru_cache


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get Supabase client for database operations
    Uses anon key for row-level security
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


@lru_cache()
def get_supabase_admin_client() -> Client:
    """
    Get Supabase admin client for admin operations
    Uses service role key to bypass RLS
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_db() -> Client:
    """Dependency for database access"""
    return get_supabase_client()


def get_admin_db() -> Client:
    """Dependency for admin database access"""
    return get_supabase_admin_client()
