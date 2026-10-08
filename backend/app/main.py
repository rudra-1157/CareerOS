from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth_router,
    student_router,
    faculty_router,
    admin_router,
    mentor_router,
    coding_router,
    career_router,
    passport_router,
    company_router,
    projects_router
)
from app.database import engine, Base, SessionLocal
from app.services.auth_service import init_demo_users

# Create tables and seed demo users on startup
Base.metadata.create_all(bind=engine)
try:
    with SessionLocal() as db:
        init_demo_users(db)
except Exception:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerOS — AI-powered Career Operating System for Students"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,     prefix=settings.API_V1_STR)
app.include_router(student_router,  prefix=settings.API_V1_STR)
app.include_router(faculty_router,  prefix=settings.API_V1_STR)
app.include_router(admin_router,    prefix=settings.API_V1_STR)
app.include_router(mentor_router,   prefix=settings.API_V1_STR)
app.include_router(coding_router,   prefix=settings.API_V1_STR)
app.include_router(career_router,   prefix=settings.API_V1_STR)
app.include_router(passport_router, prefix=settings.API_V1_STR)
app.include_router(company_router,  prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)

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
