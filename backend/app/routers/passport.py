from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User, StudentProfile
from app.models.skill import Skill, StudentSkill
from app.models.project import Project

router = APIRouter(prefix="/passport", tags=["Skill Passport"])

class AddSkillRequest(BaseModel):
    name: str
    category: str = "Core"
    percentage: int = 50
    evidence: Optional[str] = "Coursework & Practice"

@router.get("")
def get_passport(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    avg_confidence = round(sum(s.percentage for s in skills) / len(skills)) if skills else 0
    verified_projects_count = len([p for p in projects if "Verified" in p.verified_status])

    # Dynamic earned badges based on real user achievements
    earned_badges = []
    if (current_user.learning_xp or 0) >= 500:
        earned_badges.append({"icon": "⚡", "title": "500+ XP Achiever", "subtitle": "Active Learner"})
    if (current_user.streak_days or 0) >= 7:
        earned_badges.append({"icon": "🔥", "title": f"{current_user.streak_days}-Day Streak", "subtitle": "Consistent"})
    if any(s.status == "Verified" for s in skills):
        earned_badges.append({"icon": "🛡️", "title": "Faculty Verified", "subtitle": "Endorsed Skills"})
    if len(projects) >= 2:
        earned_badges.append({"icon": "📦", "title": "Portfolio Builder", "subtitle": f"{len(projects)} Projects"})

    return {
        "user": {
            "name": current_user.name,
            "degree": current_user.degree,
            "semester": current_user.semester,
            "target_role": current_user.target_role,
            "public_url": f"https://careeros.edu/passport/{current_user.id}"
        },
        "stats": {
            "overall_confidence": f"{avg_confidence}%",
            "skills_count": len(skills),
            "verified_skills_count": len([s for s in skills if s.status == "Verified"]),
            "verified_projects": verified_projects_count,
            "coding_score": f"{min(100, (current_user.learning_xp or 0) // 50)}%" if current_user.learning_xp else "0%",
            "interview_readiness": f"{avg_confidence}%"
        },
        "skills": [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "percentage": s.percentage,
                "confidence": f"{s.percentage}%",
                "evidence": s.evidence or "Coursework",
                "status": s.status,
                "level": s.level,
                "verifiedDate": s.verified_date or "In Review"
            }
            for s in skills
        ],
        "badges": earned_badges
    }

@router.post("/skills")
def add_skill(
    req: AddSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    percentage = max(1, min(100, int(req.percentage)))
    status_str = "Verified" if percentage >= 75 else "Developing"
    level_str = "Beginner" if percentage < 60 else "Intermediate" if percentage < 80 else "Advanced"

    skill = Skill(
        user_id=current_user.id,
        name=req.name.strip(),
        category=req.category,
        percentage=percentage,
        confidence=f"{percentage}%",
        evidence=req.evidence or "Coursework & Laboratory",
        status=status_str,
        level=level_str,
        verified_date="Recent"
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    # Keep student_skills in sync if StudentProfile exists
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        ss = StudentSkill(student_id=profile.id, skill_id=skill.id, proficiency=percentage)
        db.add(ss)
        db.commit()

    return {
        "status": "success",
        "message": f"Skill '{skill.name}' added to Skill Passport.",
        "skill": {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "percentage": skill.percentage,
            "confidence": skill.confidence,
            "evidence": skill.evidence,
            "status": skill.status,
            "level": skill.level,
            "verifiedDate": skill.verified_date
        }
    }

@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    # Also clean up student_skills join
    db.query(StudentSkill).filter(StudentSkill.skill_id == skill_id).delete()
    db.delete(skill)
    db.commit()

    return {"status": "success", "message": f"Skill deleted successfully"}
