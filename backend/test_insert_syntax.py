import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

# Test data
test_email = f"test_{int(time.time())}@example.com"
test_uid = f"uid_{int(time.time())}"

print(f"Testing insert for {test_email}...")

try:
    # Try insert WITHOUT .select()
    data = {
        "firebase_uid": test_uid,
        "email": test_email,
        "name": "Test User",
        "role": "student"
    }
    print("Running: supabase.table('users').insert(data).execute()")
    response = supabase.table("users").insert(data).execute()
    
    print("Response data:", response.data)
    
    if response.data and len(response.data) > 0 and 'id' in response.data[0]:
        print("SUCCESS: usage of insert().execute() returns data with ID.")
    else:
        print("FAILURE: response.data is empty or missing ID.")
        
except Exception as e:
    print(f"Error: {e}")
