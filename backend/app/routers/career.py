from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User
from app.models.resume import Resume
from app.models.github import GitHubProfile
from app.models.roadmap import RoadmapTask
from app.services.resume_service import process_resume_analysis, sync_github_profile, get_career_intelligence

router = APIRouter(prefix="/career", tags=["Career Intelligence"])

class GitHubSyncRequest(BaseModel):
    username: str

class ToggleTaskRequest(BaseModel):
    phase_number: int
    task_title: str

@router.get("/intelligence")
def get_intelligence(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_career_intelligence(current_user, db)

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        # Decode text from uploaded resume
        try:
            text_content = content.decode("utf-8", errors="ignore")
        except Exception:
            text_content = f"Resume document: {file.filename}"
        
        result = process_resume_analysis(file.filename, text_content, current_user, db)
        return {
            "status": "success",
            "message": f"Resume '{file.filename}' parsed and analyzed successfully.",
            "data": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )

@router.get("/resume")
def get_resume(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if not resume:
        return {"uploaded": False, "resume": None}
    return {
        "uploaded": True,
        "resume": {
            "file_name": resume.file_name,
            "ats_score": resume.ats_score,
            "match_rating": resume.match_rating,
            "detected_skills": resume.detected_skills or [],
            "strengths": resume.strengths or [],
            "weaknesses": resume.weaknesses or [],
            "suggestions": resume.suggestions or [],
            "uploaded_at": resume.uploaded_at.strftime("%b %d, %Y") if resume.uploaded_at else "Recently"
        }
    }

@router.post("/github/sync")
async def sync_github(
    req: GitHubSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.username.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username cannot be empty."
        )
    try:
        result = await sync_github_profile(req.username, current_user, db)
        return {
            "status": "success",
            "message": f"GitHub account @{req.username} synced successfully.",
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync GitHub profile: {str(e)}"
        )

@router.get("/github")
def get_github(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    gh = db.query(GitHubProfile).filter(GitHubProfile.user_id == current_user.id).first()
    if not gh:
        return {"connected": False, "profile": None}
    return {
        "connected": True,
        "profile": {
            "username": gh.username,
            "avatar_url": gh.avatar_url,
            "bio": gh.bio,
            "stats": {
                "public_repos": gh.public_repos,
                "total_stars": gh.total_stars,
                "total_commits": gh.total_commits,
                "streak": gh.streak,
                "github_score": gh.github_score,
                "evidence_strength": gh.evidence_strength
            },
            "languages": gh.languages or [],
            "top_repositories": gh.top_repositories or [],
            "last_synced_at": gh.last_synced_at.strftime("%b %d, %Y") if gh.last_synced_at else "Recently"
        }
    }

@router.get("/roadmap")
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == current_user.id).all()
    completed_task_titles = {t.task_title for t in user_tasks if t.is_completed}

    target_role = current_user.target_role or "Software Engineering"
    
    # Standard phases adapted to target role
    base_phases = [
        {
            "phaseNumber": 1,
            "title": "Foundations & Algorithmic Core",
            "timeline": "Month 1 - 2",
            "skills": ["Data Structures", "Sorting & Searching", "Git & GitHub", "Time Complexity Big-O"],
            "tasks": [
                {"title": "Master Core Programming Language Concepts & OOP"},
                {"title": "Solve 50 Easy & Medium Algorithmic Challenges"},
                {"title": "Understand Asymptotic Analysis & Memory Management"}
            ],
            "resources": [
                {"name": "CS Foundations & Data Structures", "type": "Course"},
                {"name": "Algorithm Design Manual", "type": "Reading"}
            ]
        },
        {
            "phaseNumber": 2,
            "title": f"Domain Specialization ({target_role})",
            "timeline": "Month 3 - 4",
            "skills": ["Domain Frameworks", "API Design", "Database Systems", "Testing"],
            "tasks": [
                {"title": f"Build full-featured application for {target_role}"},
                {"title": "Implement automated unit testing & CI/CD workflow"},
                {"title": "Connect relational / NoSQL database with migrations"}
            ],
            "resources": [
                {"name": f"{target_role} Official Architecture Guide", "type": "Documentation"},
                {"name": "Domain Best Practices & Patterns", "type": "Interactive"}
            ]
        },
        {
            "phaseNumber": 3,
            "title": "Systems, Cloud & Capstone Deployment",
            "timeline": "Month 5",
            "skills": ["Docker", "Cloud Deploy", "Monitoring", "System Design"],
            "tasks": [
                {"title": "Containerize project with Dockerfile and compose"},
                {"title": "Deploy live production demo on cloud provider"},
                {"title": "Document architecture and API benchmarks in README"}
            ],
            "resources": [
                {"name": "Cloud Deployment & Containers", "type": "Guide"}
            ]
        },
        {
            "phaseNumber": 4,
            "title": "Placement Prep & Technical Interviews",
            "timeline": "Month 6",
            "skills": ["System Design", "Behavioral Rounds", "Live Coding", "Resume ATS 90%+"],
            "tasks": [
                {"title": "Complete 5 Mock Technical Coding Interviews"},
                {"title": "Get Skill Passport verified by Department Faculty"},
                {"title": "Apply to Target Campus Placement Drives"}
            ],
            "resources": [
                {"name": "Technical Interview Playbook", "type": "Platform"}
            ]
        }
    ]

    # Compute completion per phase
    total_tasks = 0
    total_completed = 0
    for phase in base_phases:
        phase_completed = 0
        for task in phase["tasks"]:
            total_tasks += 1
            task["done"] = task["title"] in completed_task_titles
            if task["done"]:
                phase_completed += 1
                total_completed += 1
        phase["completion"] = round((phase_completed / len(phase["tasks"])) * 100) if phase["tasks"] else 0
        phase["status"] = "Completed" if phase["completion"] == 100 else "In Progress" if phase["completion"] > 0 else "Upcoming"

    overall_progress = round((total_completed / total_tasks) * 100) if total_tasks > 0 else 0

    return {
        "targetRole": target_role,
        "estimatedTimeline": "6 Months",
        "overallProgress": overall_progress,
        "phases": base_phases
    }

@router.post("/roadmap/task/toggle")
def toggle_roadmap_task(
    req: ToggleTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(RoadmapTask).filter(
        RoadmapTask.user_id == current_user.id,
        RoadmapTask.task_title == req.task_title
    ).first()

    if not task:
        task = RoadmapTask(
            user_id=current_user.id,
            phase_number=req.phase_number,
            phase_title=f"Phase {req.phase_number}",
            task_title=req.task_title,
            is_completed=True
        )
        db.add(task)
    else:
        task.is_completed = not task.is_completed

    db.commit()
    return {"status": "success", "is_completed": task.is_completed}
