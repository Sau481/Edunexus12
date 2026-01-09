import asyncio
from app.modules.chapter.notebook.service import notebook_service
from app.core.supabase import get_db
from app.core.config import settings
from supabase import create_client

async def debug_notebook_query():
    print("--- DEBUGGING NOTEBOOK QUERY ---")
    
    # Setup manual db client since we can't easily mock Depends(get_db) dependencies in simple script
    # exactly as FastAPI does, but we can pass the client.
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    
    # We need a valid chapter ID. 
    # From the user's screenshot, it's "Unit 1: Database Management Systems".
    # Let's try to find it or pick any chapter.
    chapters = supabase.table("chapters").select("id, name").limit(1).execute()
    if not chapters.data:
        print("No chapters found.")
        return

    chapter_id = chapters.data[0]['id']
    chapter_name = chapters.data[0]['name']
    print(f"Testing with Chapter: {chapter_name} ({chapter_id})")
    
    question = "what is generate and test"
    
    try:
        print(f"Querying: {question}")
        response = await notebook_service.query_notebook(supabase, chapter_id, question)
        print("Response received:")
        print(f"Answer: {response.answer[:100]}...")
        print(f"Sources: {response.sources}")
    except Exception as e:
        print(f"ERROR CAUGHT: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_notebook_query())
