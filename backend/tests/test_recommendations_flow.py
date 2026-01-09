import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from app.services.recommendation_service import recommendation_service

async def test_recommendations():
    print("--- Testing Recommendation Service ---")
    
    chapter_name = "Photosynthesis"
    subject_name = "Biology"
    
    # Test case 1: General recommendations (no topic)
    print(f"\n1. Testing General Recommendations for {subject_name} - {chapter_name}...")
    try:
        result_general = await recommendation_service.get_recommendations(
            chapter_name=chapter_name,
            subject_name=subject_name
        )
        print("   Success!")
        print(f"   Received {len(result_general.get('recommendations', []))} recommendations.")
        # print(result_general)
    except Exception as e:
        print(f"   Failed: {e}")

    # Test case 2: Topic-specific recommendations
    topic = "Light Dependent Reactions"
    print(f"\n2. Testing Query-Based Recommendations for topic: '{topic}'...")
    try:
        result_topic = await recommendation_service.get_recommendations(
            chapter_name=chapter_name,
            subject_name=subject_name,
            topic=topic
        )
        print("   Success!")
        print(f"   Received {len(result_topic.get('recommendations', []))} recommendations.")
        
        # Verify relevance (simple check)
        recs = result_topic.get('recommendations', [])
        relevant_count = 0
        for rec in recs:
            print(f"     - {rec['title']}")
            if "light" in rec['title'].lower() or "reaction" in rec['title'].lower():
                relevant_count += 1
        
        if relevant_count > 0:
             print(f"   Verified: Found {relevant_count} clearly relevant titles.")
        else:
             print("   Warning: Titles might not bestatistically relevant, but API call succeeded.")

    except Exception as e:
        print(f"   Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_recommendations())
