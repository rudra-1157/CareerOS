from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.skill import Skill
from app.models.project import Project
from app.models.coding import CodingSubmission

router = APIRouter(prefix="/company", tags=["Company Dashboard"])

@router.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db),
    role_filter: str = Query(default="", alias="role")
):
    """Return real student profiles suitable for company review."""
    students = db.query(User).filter(User.role == "student").all()

    if not students:
        return {
            "candidates": [],
            "total_candidates": 0,
            "message": "No student profiles available yet."
        }

    candidates = []
    for student in students:
        # Skip profiles with no meaningful data
        if not student.name:
            continue

        skills = db.query(Skill).filter(Skill.user_id == student.id).all()
        projects = db.query(Project).filter(Project.user_id == student.id).all()
        solved_count = db.query(CodingSubmission).filter(CodingSubmission.user_id == student.id).count()

        avg_skill = round(sum(s.percentage for s in skills) / len(skills)) if skills else 0

        # Compute a career readiness score from real data
        readiness = min(100, (
            (avg_skill * 0.35) +
            (min(solved_count * 5, 30)) +  # up to 30 pts from coding
            (min(len(projects) * 10, 25)) +  # up to 25 pts from projects
            (10 if (student.learning_xp or 0) > 200 else 0)
        ))

        # Apply optional role filter
        if role_filter and student.target_role:
            if role_filter.lower() not in (student.target_role or "").lower():
                continue

        candidates.append({
            "id": student.id,
            "name": student.name,
            "degree": student.degree or "Not specified",
            "target_role": student.target_role or "Not specified",
            "semester": student.semester or "",
            "avatar": "".join(w[0].upper() for w in student.name.split()[:2]) if student.name else "?",
            "skills_count": len(skills),
            "top_skills": [s.name for s in skills[:3]],
            "avg_skill_confidence": f"{avg_skill}%",
            "projects_count": len(projects),
            "coding_solved": solved_count,
            "readiness": f"{int(readiness)}%",
            "xp": student.learning_xp or 0,
            "streak": student.streak_days or 0
        })

    # Sort by readiness descending
    candidates.sort(key=lambda c: int(c["readiness"].rstrip("%")), reverse=True)

    return {
        "candidates": candidates,
        "total_candidates": len(candidates)
    }

@router.get("/stats")
def get_company_stats(db: Session = Depends(get_db)):
    """Aggregated stats for company recruiter view."""
    student_count = db.query(User).filter(User.role == "student").count()
    total_projects = db.query(Project).count()
    total_solved = db.query(CodingSubmission).count()

    return {
        "registered_students": student_count,
        "total_projects": total_projects,
        "total_submissions": total_solved
    }
