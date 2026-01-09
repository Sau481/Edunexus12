
import sys
try:
    import pydantic
    print(f"Pydantic Version: {pydantic.VERSION}")
except ImportError:
    print("Pydantic not found")

try:
    import pydantic_settings
    print(f"Pydantic Settings Version: {pydantic_settings.__version__}")
except ImportError:
    print("Pydantic Settings not found")

try:
    from app.core.config import settings
    print("Settings loaded successfully")
except Exception as e:
    print(f"Settings load failed: {e}")
