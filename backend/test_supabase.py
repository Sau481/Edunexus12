import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

print(f"Connecting to {url}...")
try:
    supabase: Client = create_client(url, key)
    # Try to list tables or select from users
    print("Attempting to select from 'users'...")
    response = supabase.table("users").select("*").limit(1).execute()
    print("Success!")
    print(response.data)
except Exception as e:
    print(f"Error: {e}")
