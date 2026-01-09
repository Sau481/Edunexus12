from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import all routers
from app.modules.auth.routes import router as auth_router
from app.modules.classroom.routes import router as classroom_router
from app.modules.subject.routes import router as subject_router
from app.modules.teacher_access.routes import router as teacher_access_router
from app.modules.questions.routes import router as questions_router
from app.modules.chapter.notes.routes import router as notes_router
from app.modules.chapter.upload.routes import router as upload_router
from app.modules.chapter.notebook.routes import router as notebook_router
from app.modules.chapter.community.routes import router as community_router
from app.modules.dashboard.routes import router as dashboard_router


# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="EduNexus - Smart Collaborative Classroom & Notebook Backend"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(classroom_router, prefix=settings.API_V1_STR)
app.include_router(subject_router, prefix=settings.API_V1_STR)
app.include_router(teacher_access_router, prefix=settings.API_V1_STR)
app.include_router(questions_router, prefix=settings.API_V1_STR)
app.include_router(notes_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)
app.include_router(notebook_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "EduNexus Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": settings.APP_ENV
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
