from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    jobs_router
)
from app.database import engine, SessionLocal, Base
from app.services.seed_service import seed_job_portal_data

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Seed demo data if needed
try:
    with SessionLocal() as db_session:
        seed_job_portal_data(db_session)
except Exception as e:
    print(f"Warning during seed: {e}")


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
app.include_router(coding_router,   prefix=settings.API_V1_STR)
app.include_router(career_router,   prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(passport_router, prefix=settings.API_V1_STR)
app.include_router(mentor_router,   prefix=settings.API_V1_STR)
app.include_router(faculty_router,  prefix=settings.API_V1_STR)
app.include_router(admin_router,    prefix=settings.API_V1_STR)
app.include_router(company_router,  prefix=settings.API_V1_STR)
app.include_router(jobs_router,     prefix=settings.API_V1_STR)

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
