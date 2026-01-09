# EduNexus Backend

Production-grade backend for **EduNexus – Smart Collaborative Classroom & Notebook**.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Firebase Authentication** - Token verification only
- **Supabase Postgres** - Relational database
- **Supabase Storage** - File storage
- **Google Gemini** - LLM for AI features
- **Qdrant** - Vector database for RAG

## Architecture

### Authentication Flow
1. Frontend handles Firebase Auth (login/signup)
2. Backend verifies Firebase ID tokens
3. Maps Firebase UID to database user

### Data Layer
- **Supabase Postgres**: All relational data
- **Supabase Storage**: All file uploads
- **Qdrant**: Note embeddings for RAG
- **NO Firestore or Firebase Storage**

### Key Design Principles
- **Chapter-centric**: All interactions scoped to chapters
- **Role-based filtering**: Same services for students/teachers
- **Student visibility**: Own notes + approved public notes
- **Teacher approval**: Student notes require approval

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
# Firebase (AUTH ONLY)
FIREBASE_CREDENTIALS_PATH=firebase/secrets/firebase-admin.json

# Supabase (DATABASE + STORAGE)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional-api-key
```

### 3. Setup Firebase

1. Create Firebase project
2. Download service account JSON
3. Save to `firebase/secrets/firebase-admin.json`

### 4. Setup Supabase

1. Create Supabase project
2. Run migrations (see `supabase_migrations/migrations/`)
3. Create storage bucket: `notes`

### 5. Run Qdrant (Local)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 6. Run Server

```bash
cd backend
uvicorn app.main:app --reload
```

Server runs on `http://localhost:8000`

API docs: `http://localhost:8000/docs`

## API Structure

### Core Modules

- **Auth** (`/api/v1/auth`)
  - Create profile
  - Get current user

- **Classrooms** (`/api/v1/classrooms`)
  - Create classroom (teacher)
  - Join classroom (student)
  - List classrooms

- **Subjects** (`/api/v1/subjects`)
  - Create subject (teacher)
  - Create chapter (teacher)
  - List subjects/chapters

- **Teacher Access** (`/api/v1/teacher-access`)
  - Assign teachers to subjects

- **Questions** (`/api/v1/questions`)
  - Ask questions (students)
  - Answer questions (teachers)

### Chapter Features

- **Notes** (`/api/v1/notes`)
  - List notes (visibility filtered)
  - Approve/reject notes (teacher)

- **Upload** (`/api/v1/upload`)
  - Upload PDF/TXT notes
  - Auto-approval for teachers

- **AI Notebook** (`/api/v1/notebook`)
  - Query with RAG (chapter-scoped)

- **Community** (`/api/v1/community`)
  - Post announcements (teacher)
  - View announcements (all)

## Database Schema

See `supabase_migrations/migrations/` for full schema.

Key tables:
- `users` - User profiles
- `classrooms` - Classrooms
- `classroom_members` - Student memberships
- `subjects` - Subjects in classrooms
- `teacher_access` - Teacher→Subject assignments
- `chapters` - Chapters in subjects
- `notes` - Uploaded notes with approval
- `questions` - Student Q&A
- `announcements` - Teacher announcements

## RAG Pipeline

1. **Upload**: Extract text from PDF/TXT
2. **Approval**: Teacher approves note
3. **Embedding**: Generate with Gemini, store in Qdrant
4. **Query**: Retrieve relevant notes, generate AI response
5. **Chapter-scoped**: Only uses notes from current chapter

## Role-Based Access

### Students
- Join classrooms via code
- Upload notes (pending approval)
- See: approved public notes + own notes
- Ask questions (public/private)
- Query AI notebook

### Teachers
- Create classrooms & subjects
- Auto-approved note uploads
- See all notes & questions
- Approve/reject student notes
- Answer questions
- Post announcements

## Development

### Project Structure

```
backend/
├── app/
│   ├── core/           # Config, auth, permissions
│   ├── modules/        # Feature modules
│   ├── services/       # AI, RAG, Qdrant, docs
│   ├── utils/          # Helpers
│   └── main.py         # FastAPI app
├── firebase/
│   └── secrets/        # Firebase credentials
├── supabase_migrations/
│   └── migrations/     # Database schema
├── .env
└── requirements.txt
```

### Adding New Features

1. Create module in `app/modules/`
2. Define schemas (Pydantic)
3. Implement service logic
4. Create routes with permission checks
5. Register router in `main.py`

## Deployment

1. Setup production Supabase instance
2. Setup production Qdrant instance
3. Configure environment variables
4. Deploy with:
   - Docker
   - AWS Lambda + API Gateway
   - Google Cloud Run
   - Azure App Service

## License

MIT
