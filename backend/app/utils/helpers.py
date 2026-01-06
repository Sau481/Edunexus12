from datetime import datetime
from typing import Any


def format_timestamp(dt: datetime = None) -> str:
    """Format datetime to ISO string"""
    if dt is None:
        dt = datetime.utcnow()
    return dt.isoformat()


def generate_classroom_code() -> str:
    """Generate unique 6-character classroom code"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def paginate_results(data: list[Any], page: int = 1, per_page: int = 20) -> dict:
    """
    Paginate list results
    
    Args:
        data: Full list of items
        page: Page number (1-indexed)
        per_page: Items per page
        
    Returns:
        dict with 'items', 'total', 'page', 'per_page', 'pages'
    """
    total = len(data)
    pages = (total + per_page - 1) // per_page
    start = (page - 1) * per_page
    end = start + per_page
    
    return {
        'items': data[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': pages
    }


def sanitize_filename(filename: str) -> str:
    """Remove unsafe characters from filename"""
    import re
    # Keep alphanumeric, dots, dashes, underscores
    return re.sub(r'[^\w\-.]', '_', filename)
