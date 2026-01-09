"""
Seed script to add dummy data to Supabase database
Run this script to populate your database with test data
"""
import asyncio
from supabase import create_client, Client
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise Exception("Missing Supabase credentials in .env file")

# Create admin client
db: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def generate_classroom_code():
    """Generate a random 6-character classroom code"""
    import random
    import string
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


async def seed_data():
    """Seed the database with dummy data"""
    print("🌱 Starting database seeding...")
    
    try:
        # 1. Create Teacher User
        print("\n📝 Creating teacher user...")
        teacher_data = {
            "firebase_uid": "dummy-teacher-firebase-uid",
            "email": "teacher@edunexus.com",
            "name": "Dr. Sarah Miller",
            "role": "teacher",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Check if teacher already exists
        existing_teacher = db.table("users").select("*").eq("email", teacher_data["email"]).execute()
        if existing_teacher.data:
            print("   ✓ Teacher user already exists")
            teacher_id = existing_teacher.data[0]["id"]
        else:
            teacher_response = db.table("users").insert(teacher_data).execute()
            teacher_id = teacher_response.data[0]["id"]
            print(f"   ✓ Created teacher: {teacher_data['name']} (ID: {teacher_id})")
        
        # 2. Create Student User
        print("\n📝 Creating student user...")
        student_data = {
            "firebase_uid": "dummy-student-firebase-uid",
            "email": "student@edunexus.com",
            "name": "Alex Johnson",
            "role": "student",
            "created_at": datetime.utcnow().isoformat()
        }
        
        existing_student = db.table("users").select("*").eq("email", student_data["email"]).execute()
        if existing_student.data:
            print("   ✓ Student user already exists")
            student_id = existing_student.data[0]["id"]
        else:
            student_response = db.table("users").insert(student_data).execute()
            student_id = student_response.data[0]["id"]
            print(f"   ✓ Created student: {student_data['name']} (ID: {student_id})")
        
        # 3. Create Classroom
        print("\n📝 Creating classroom...")
        classroom_code = generate_classroom_code()
        classroom_data = {
            "name": "Computer Science Engineering - FY",
            "description": "Final Year Computer Science classroom",
            "code": classroom_code,
            "created_by": teacher_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        classroom_response = db.table("classrooms").insert(classroom_data).execute()
        classroom_id = classroom_response.data[0]["id"]
        print(f"   ✓ Created classroom: {classroom_data['name']}")
        print(f"   ✓ Classroom code: {classroom_code}")
        
        # 4. Add student as classroom member
        print("\n📝 Adding student to classroom...")
        member_data = {
            "classroom_id": classroom_id,
            "user_id": student_id,
            "joined_at": datetime.utcnow().isoformat()
        }
        db.table("classroom_members").insert(member_data).execute()
        print("   ✓ Student added to classroom")
        
        # 5. Create Subjects
        print("\n📝 Creating subjects...")
        subjects = [
            {
                "name": "Operating Systems",
                "description": "Study of OS concepts and implementation",
                "chapters": [
                    {"name": "Unit 1: Introduction to OS", "description": "Basic concepts"},
                    {"name": "Unit 2: Process Management", "description": "Processes and threads"},
                    {"name": "Unit 3: Memory Management", "description": "Virtual memory"},
                    {"name": "Unit 4: File Systems", "description": "File organization"},
                ]
            },
            {
                "name": "Computer Networks",
                "description": "Networking fundamentals and protocols",
                "chapters": [
                    {"name": "Unit 1: Network Fundamentals", "description": "OSI model"},
                    {"name": "Unit 2: TCP/IP Protocol Suite", "description": "Internet protocols"},
                    {"name": "Unit 3: Network Security", "description": "Cryptography"},
                    {"name": "Unit 4: Wireless Networks", "description": "WiFi and mobile"},
                ]
            },
        ]
        
        for subject_data in subjects:
            chapters = subject_data.pop("chapters")
            subject_data["classroom_id"] = classroom_id
            subject_data["created_at"] = datetime.utcnow().isoformat()
            
            subject_response = db.table("subjects").insert(subject_data).execute()
            subject_id = subject_response.data[0]["id"]
            print(f"   ✓ Created subject: {subject_data['name']}")
            
            # Create chapters for this subject
            for chapter_data in chapters:
                chapter_data["subject_id"] = subject_id
                chapter_data["created_at"] = datetime.utcnow().isoformat()
                db.table("chapters").insert(chapter_data).execute()
            print(f"     ✓ Created {len(chapters)} chapters")
        
        # 6. Get first chapter for notes/questions
        first_subject = db.table("subjects").select("*").eq("classroom_id", classroom_id).limit(1).execute()
        first_subject_id = first_subject.data[0]["id"]
        
        first_chapter = db.table("chapters").select("*").eq("subject_id", first_subject_id).limit(1).execute()
        chapter_id = first_chapter.data[0]["id"]
        
        # 7. Create Notes
        print("\n📝 Creating sample notes...")
        notes = [
            {
                "chapter_id": chapter_id,
                "title": "Complete OS Overview",
                "content": "The Operating System is system software that manages computer hardware and software resources.",
                "visibility": "public",
                "approval_status": "approved",
                "uploaded_by": teacher_id,
                "approved_by": teacher_id,
                "approved_at": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "chapter_id": chapter_id,
                "title": "Process vs Thread",
                "content": "A process is an instance of a program. A thread is a lightweight process.",
                "visibility": "public",
                "approval_status": "approved",
                "uploaded_by": student_id,
                "approved_by": teacher_id,
                "approved_at": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            },
        ]
        
        for note in notes:
            db.table("notes").insert(note).execute()
        print(f"   ✓ Created {len(notes)} notes")
        
        # 8. Create Questions
        print("\n📝 Creating sample questions...")
        questions = [
            {
                "chapter_id": chapter_id,
                "user_id": student_id,
                "title": "Process Scheduling",
                "content": "What is the difference between preemptive and non-preemptive scheduling?",
                "is_private": False,
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "chapter_id": chapter_id,
                "user_id": student_id,
                "title": "Deadlock",
                "content": "Can you explain the four conditions for deadlock?",
                "is_private": False,
                "answer": "The four conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
                "answered_by": teacher_id,
                "answered_at": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat()
            },
        ]
        
        for question in questions:
            db.table("questions").insert(question).execute()
        print(f"   ✓ Created {len(questions)} questions")
        
        # 9. Create Announcements
        print("\n📝 Creating sample announcements...")
        announcements = [
            {
                "chapter_id": chapter_id,
                "title": "Quiz on Unit 1",
                "content": "There will be a quiz on OS fundamentals next week.",
                "created_by": teacher_id,
                "created_at": datetime.utcnow().isoformat()
            },
        ]
        
        for announcement in announcements:
            db.table("announcements").insert(announcement).execute()
        print(f"   ✓ Created {len(announcements)} announcements")
        
        print("\n✅ Database seeding completed successfully!")
        print(f"\n📊 Summary:")
        print(f"   - Teacher: {teacher_data['email']}")
        print(f"   - Student: {student_data['email']}")
        print(f"   - Classroom: {classroom_data['name']} (Code: {classroom_code})")
        print(f"   - Subjects: {len(subjects)}")
        print(f"   - Notes: {len(notes)}")
        print(f"   - Questions: {len(questions)}")
        print(f"   - Announcements: {len(announcements)}")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(seed_data())
