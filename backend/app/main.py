import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import (
    auth_router,
    student_router,
    coding_router,
    career_router,
    projects_router,
    passport_router,
    mentor_router,
    faculty_router,
    admin_router,
    company_router,
    friends_router,
    challenges_router,
    notifications_router,
    external_router,
    demo_router
)
from app.database import engine, Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerOS: AI-powered Career Operating System for Engineering Students"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static route
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(os.path.join(UPLOAD_DIR, "avatars"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router,          prefix=settings.API_V1_STR)
app.include_router(student_router,       prefix=settings.API_V1_STR)
app.include_router(coding_router,        prefix=settings.API_V1_STR)
app.include_router(career_router,        prefix=settings.API_V1_STR)
app.include_router(projects_router,      prefix=settings.API_V1_STR)
app.include_router(passport_router,      prefix=settings.API_V1_STR)
app.include_router(mentor_router,        prefix=settings.API_V1_STR)
app.include_router(faculty_router,       prefix=settings.API_V1_STR)
app.include_router(admin_router,         prefix=settings.API_V1_STR)
app.include_router(company_router,       prefix=settings.API_V1_STR)
app.include_router(friends_router,       prefix=settings.API_V1_STR)
app.include_router(challenges_router,    prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(external_router,      prefix=settings.API_V1_STR)
app.include_router(demo_router,          prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": "CareerOS",
        "tagline": "One Journey. First Year -> Placement.",
        "status": "healthy",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CareerOS Backend API"}
