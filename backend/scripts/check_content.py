import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from supabase import create_client
from app.core.config import settings

# Initialize Supabase
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

async def check_note_content():
    print("--- CHECKING NOTE CONTENT ---")
    
    # Fetch note
    res = supabase.table("notes").select("id, title, content").ilike("title", "%DSA unit A%").execute()
    
    if not res.data:
        print("Note 'DSA unit A' not found.")
        return
        
    for note in res.data:
        print(f"\nID: {note['id']}")
        print(f"Title: {note['title']}")
        print(f"Content Length: {len(note['content'])}")
        print("--- CONTENT PREVIEW (First 500 chars) ---")
        print(note['content'][:500])
        print("--- CONTENT SEARCH ('generate and test') ---")
        if "generate and test" in note['content'].lower():
            print("FOUND exact phrase 'generate and test'")
            # Print context around it
            idx = note['content'].lower().find("generate and test")
            start = max(0, idx - 100)
            end = min(len(note['content']), idx + 300)
            print(f"...{note['content'][start:end]}...")
        else:
            print("Phrase 'generate and test' NOT FOUND in content.")

if __name__ == "__main__":
    asyncio.run(check_note_content())
