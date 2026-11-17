from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/projects", tags=["Projects"])

class CreateProjectRequest(BaseModel):
    title: str
    category: str = "Full-Stack Dev"
    description: str
    tech_stack: List[str] = []
    github_url: Optional[str] = ""
    demo_url: Optional[str] = ""
    metrics: Optional[str] = ""

@router.get("")
def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "desc": p.description,
            "techStack": p.tech_stack or [],
            "githubUrl": p.github_url,
            "demoUrl": p.demo_url,
            "verifiedStatus": p.verified_status,
            "verifiedBy": p.verified_by or "Pending Faculty Endorsement",
            "evidenceScore": p.evidence_score,
            "metrics": p.metrics,
            "date": p.created_at.strftime("%b %Y") if p.created_at else "Recently"
        }
        for p in projects
    ]

@router.post("")
def create_project(
    req: CreateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        user_id=current_user.id,
        title=req.title.strip(),
        category=req.category,
        description=req.description.strip(),
        tech_stack=req.tech_stack,
        github_url=req.github_url or "",
        demo_url=req.demo_url or "",
        verified_status="Pending Review",
        verified_by="Submitted for Verification",
        evidence_score="80/100",
        metrics=req.metrics or ""
    )
    db.add(project)
    
    # Award portfolio XP
    current_user.learning_xp = (current_user.learning_xp or 0) + 150
    db.commit()
    db.refresh(project)

    return {
        "status": "success",
        "message": f"Project '{project.title}' added to portfolio (+150 XP awarded).",
        "project": {
            "id": project.id,
            "title": project.title,
            "category": project.category,
            "desc": project.description,
            "techStack": project.tech_stack,
            "verifiedStatus": project.verified_status
        }
    }
