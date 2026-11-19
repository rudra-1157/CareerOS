import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
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
    demo_router,
    jobs_router,
    interview_router,
)
from app.database import engine, Base, SessionLocal
from app.routers.auth import seed_demo_users_if_needed
from app.data.company_seed import seed_companies_and_jobs
from app.utils.migrate_passport import run_passport_migrations

# Create tables on startup, run migrations, and seed demo records
try:
    Base.metadata.create_all(bind=engine)
    run_passport_migrations()

    # Additional inline migrations for github profiles
    _migrations = [
        "ALTER TABLE github_profiles ADD COLUMN last_synced_at DATETIME",
        "ALTER TABLE github_profiles ADD COLUMN bio TEXT",
        "ALTER TABLE github_profiles ADD COLUMN avatar_url TEXT",
    ]
    for _sql in _migrations:
        try:
            with engine.connect() as _conn:
                _conn.execute(text(_sql))
                _conn.commit()
        except Exception:
            pass

    with SessionLocal() as _db_init:
        seed_demo_users_if_needed(_db_init)
except Exception as e:
    print(f"DB init warning: {e}")

try:
    with SessionLocal() as _db_seed:
        seed_companies_and_jobs(_db_seed)
except Exception as e:
    print(f"[seed] Warning: company seed failed — {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CareerOS: AI-powered Career Operating System for Engineering Students"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://.*(vercel\.app|onrender\.com|embarko\.app|localhost|127\.0\.0\.1).*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static route
import tempfile
_data_dir = os.environ.get("DATA_DIR") or tempfile.gettempdir()
UPLOAD_DIR = os.path.join(_data_dir, "careeros_uploads")
try:
    os.makedirs(os.path.join(UPLOAD_DIR, "avatars"), exist_ok=True)
except Exception:
    pass
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR, check_dir=False), name="uploads")

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
app.include_router(jobs_router,          prefix=settings.API_V1_STR)
app.include_router(interview_router,     prefix=settings.API_V1_STR)

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
