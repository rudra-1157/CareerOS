from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, StudentProfile
from app.models.skill import Skill, StudentSkill
from app.models.project import Project
from app.models.coding import CodingSubmission
from app.models.company import Company
from app.models.job import JobListing, JobSkillRequirement, JobApplication
from app.schemas.job import JobListingCreate, ApplicationStatusUpdate

router = APIRouter(prefix="/company", tags=["Company Dashboard & Recruitment"])


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
        if not student.name:
            continue

        skills = db.query(Skill).filter(Skill.user_id == student.id).all()
        projects = db.query(Project).filter(Project.user_id == student.id).all()
        solved_count = db.query(CodingSubmission).filter(CodingSubmission.user_id == student.id).count()

        avg_skill = round(sum(s.percentage for s in skills) / len(skills)) if skills else 0

        readiness = min(100, (
            (avg_skill * 0.35) +
            (min(solved_count * 5, 30)) +
            (min(len(projects) * 10, 25)) +
            (10 if (student.learning_xp or 0) > 200 else 0)
        ))

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
    total_jobs = db.query(JobListing).count()
    total_applications = db.query(JobApplication).count()

    return {
        "registered_students": student_count,
        "total_projects": total_projects,
        "total_submissions": total_solved,
        "total_jobs": total_jobs,
        "total_applications": total_applications
    }


@router.get("/jobs")
def get_company_jobs(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List job postings with application statistics."""
    jobs = db.query(JobListing).order_by(desc(JobListing.created_at)).all()

    results = []
    for job in jobs:
        app_count = db.query(JobApplication).filter(
            JobApplication.job_listing_id == job.id,
            JobApplication.withdrawn == False
        ).count()

        shortlisted_count = db.query(JobApplication).filter(
            JobApplication.job_listing_id == job.id,
            JobApplication.status.in_(["SHORTLISTED", "INTERVIEW", "SELECTED"]),
            JobApplication.withdrawn == False
        ).count()

        company = job.company
        results.append({
            "id": job.id,
            "title": job.title,
            "company_name": company.name if company else "CareerOS Partner",
            "company_logo_emoji": company.logo_emoji if company else "🏢",
            "domain": job.domain,
            "employment_type": job.employment_type,
            "work_arrangement": job.work_arrangement,
            "location": job.location,
            "is_closed": job.is_closed,
            "is_published": job.is_published,
            "is_demo": job.is_demo,
            "openings": job.openings,
            "deadline": job.deadline,
            "created_at": job.created_at,
            "applicant_count": app_count,
            "shortlisted_count": shortlisted_count,
            "mandatory_skills": [sr.skill_name for sr in job.skill_requirements if sr.is_mandatory],
            "optional_skills": [sr.skill_name for sr in job.skill_requirements if not sr.is_mandatory]
        })

    return results


@router.post("/jobs")
def create_job_listing(
    payload: JobListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job opportunity listing."""
    # Find or create a default company for this user if not attached
    company = db.query(Company).first()
    if not company:
        company = Company(
            name="CareerOS Enterprise Hub",
            industry="Technology & Software",
            domain=payload.domain,
            description="Verified enterprise hiring partner on CareerOS.",
            logo_emoji="🚀",
            is_demo=False
        )
        db.add(company)
        db.flush()

    job = JobListing(
        company_id=company.id,
        title=payload.title,
        domain=payload.domain,
        description=payload.description,
        responsibilities=payload.responsibilities,
        employment_type=payload.employment_type,
        work_arrangement=payload.work_arrangement,
        location=payload.location,
        education_requirement=payload.education_requirement,
        experience_requirement=payload.experience_requirement,
        openings=payload.openings or 1,
        deadline=payload.deadline,
        is_published=True,
        is_closed=False,
        is_demo=False,
        created_by_user_id=current_user.id
    )
    db.add(job)
    db.flush()

    for skill_name in payload.mandatory_skills:
        if skill_name.strip():
            req = JobSkillRequirement(
                job_listing_id=job.id,
                skill_name=skill_name.strip(),
                is_mandatory=True
            )
            db.add(req)

    for skill_name in payload.optional_skills:
        if skill_name.strip():
            req = JobSkillRequirement(
                job_listing_id=job.id,
                skill_name=skill_name.strip(),
                is_mandatory=False
            )
            db.add(req)

    db.commit()
    db.refresh(job)

    return {
        "message": "Job listing created successfully!",
        "job_id": job.id,
        "title": job.title
    }


@router.post("/jobs/{job_id}/toggle-status")
def toggle_job_status(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a job listing between Open and Closed."""
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    job.is_closed = not job.is_closed
    db.commit()
    return {
        "message": f"Job is now {'Closed' if job.is_closed else 'Open'}.",
        "is_closed": job.is_closed
    }


@router.get("/jobs/{job_id}/applications")
def get_job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all applicants for a specific job listing."""
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    apps = db.query(JobApplication).filter(
        JobApplication.job_listing_id == job.id
    ).order_by(desc(JobApplication.applied_at)).all()

    results = []
    for a in apps:
        student_user = db.query(User).filter(User.id == a.student_user_id).first()
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == a.student_user_id).first() if student_user else None

        results.append({
            "id": a.id,
            "student_id": a.student_user_id,
            "student_name": student_user.name if student_user else "Student",
            "student_email": student_user.email if student_user else "",
            "degree": student_user.degree if student_user else (student_profile.degree if student_profile else None),
            "applied_at": a.applied_at,
            "status": a.status,
            "withdrawn": a.withdrawn,
            "eligibility_status": a.eligibility_status,
            "mandatory_matched": a.mandatory_matched,
            "mandatory_total": a.mandatory_total,
            "skill_coverage_pct": a.skill_coverage_pct,
            "eligibility_detail": a.eligibility_detail
        })

    return {
        "job_id": job.id,
        "job_title": job.title,
        "total_applicants": len(results),
        "applications": results
    }


@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application progress status (e.g. SHORTLISTED, INTERVIEW, SELECTED, REJECTED)."""
    app = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    valid_statuses = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    app.status = payload.status
    history = app.status_history or []
    history.append({
        "status": payload.status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": payload.note or f"Status updated to {payload.status} by recruiter."
    })
    app.status_history = history

    db.commit()
    return {
        "message": f"Application status updated to {payload.status}",
        "status": app.status
    }
