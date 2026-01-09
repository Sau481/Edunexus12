import asyncio
import io
from app.services.document_processor import document_processor
from app.services.recommendation_service import recommendation_service

async def verify_changes():
    print("--- VERIFICATION START ---")

    # 1. Verify Text Extraction (Mock PDF)
    print("\n[1] Verifying PDF Extraction (Mock)...")
    try:
        # Create a simple PDF using reportlab if available, or just skip full PDF gen 
        # since we don't have reportlab in requirements.
        # Instead, we will test if the method exists and handles bytes 
        # (getting an expected error is better than import error).
        
        # Actually, let's just check imports and method signature
        import pdfminer.high_level
        print("SUCCESS: pdfminer.six imported successfully.")
        
        # Mock bytes (invalid PDF but should trigger 'pdfminer' related error or generic error, not import error)
        try:
            document_processor.extract_text_from_pdf(b"%PDF-1.4 mock content")
        except Exception as e:
            # We expect an error, but we want to make sure it's from pdfminer or our wrapper
            print(f"Extraction attempted (expected failure on mock data): {e}")

    except Exception as e:
        print(f"FAILURE: {e}")

    # 2. Verify Recommendations Logic
    print("\n[2] Verifying Dynamic Recommendations...")
    try:
        # Test with a specific topic
        topic = "generate and test"
        print(f"Fetching recommendations for topic: '{topic}'...")
        
        result = await recommendation_service.get_recommendations(
            chapter_name="Search",
            subject_name="Artificial Intelligence",
            topic=topic
        )
        
        print(f"Result keys: {result.keys()}")
        recs = result.get('recommendations', [])
        print(f"Found {len(recs)} recommendations.")
        
        for rec in recs:
            print(f"- [{rec['type']}] {rec['title']} ({rec['url']})")
            
        if len(recs) > 0:
             print("SUCCESS: Recommendations returned.")
        else:
             print("WARNING: No recommendations returned (check API key or mock).")

    except Exception as e:
        print(f"FAILURE: {e}")

    print("\n--- VERIFICATION END ---")

if __name__ == "__main__":
    asyncio.run(verify_changes())
