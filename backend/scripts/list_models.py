import google.generativeai as genai
from app.core.config import settings
import os

# Manual load since settings might depend on .env loaded by app
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
genai.configure(api_key=api_key)

print(f"API Key present: {bool(api_key)}")

try:
    print("Listing models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")
