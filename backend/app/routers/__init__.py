from app.routers.auth import router as auth_router
from app.routers.student import router as student_router
from app.routers.coding import router as coding_router
from app.routers.career import router as career_router
from app.routers.projects import router as projects_router
from app.routers.passport import router as passport_router
from app.routers.mentor import router as mentor_router
from app.routers.faculty import router as faculty_router
from app.routers.admin import router as admin_router
from app.routers.company import router as company_router
from app.routers.friends import router as friends_router
from app.routers.challenges import router as challenges_router
from app.routers.notifications import router as notifications_router
from app.routers.external import router as external_router
from app.routers.demo import router as demo_router
from app.routers.jobs import router as jobs_router
from app.routers.interview import router as interview_router

__all__ = [
    "auth_router",
    "student_router",
    "coding_router",
    "career_router",
    "projects_router",
    "passport_router",
    "mentor_router",
    "faculty_router",
    "admin_router",
    "company_router",
    "friends_router",
    "challenges_router",
    "notifications_router",
    "external_router",
    "demo_router",
    "jobs_router",
    "interview_router",
]
