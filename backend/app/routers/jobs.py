"""
Jobs & Companies router for CareerOS Job Portal.
Provides endpoints for:
  - Listing / searching companies and jobs
  - Company and job detail views
  - Student job-match scoring
  - Student job applications
  - Saved companies
  - Recruiter job management (create/update/view applicants)
All write endpoints require JWT authentication.
"""

from __future__ import annotations

import json
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, StudentProfile
from app.models.company import Company, Job, JobApplication, SavedCompany
from app.models.skill import Skill
from app.models.project import Project

router = APIRouter(tags=["Jobs & Companies"])


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _skills_list(raw: Optional[str]) -> List[str]:
    """Split a comma-separated skill string into a cleaned list."""
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


def _calculate_match(
    student_skills: List[str],
    job_required: List[str],
    job_preferred: List[str],
    student_projects: int,
    student_cgpa: float,
    job_min_cgpa: float,
    student_domain: Optional[str],
    job_domain: str,
) -> dict:
    """
    Weighted match score (0–100):
      - Required skills overlap : 50 pts
      - Preferred skills overlap : 20 pts
      - Project count            : 15 pts (3 pts/project, max 15)
      - CGPA eligibility         : 10 pts
      - Domain match             : 5  pts
    """
    student_set = {s.lower() for s in student_skills}
    req_set     = {s.lower() for s in job_required}
    pref_set    = {s.lower() for s in job_preferred}

    matching_req  = student_set & req_set
    matching_pref = student_set & pref_set
    missing_req   = req_set - student_set

    req_score    = (len(matching_req)  / max(len(req_set), 1)) * 50
    pref_score   = (len(matching_pref) / max(len(pref_set), 1)) * 20
    proj_score   = min(student_projects * 3, 15)
    cgpa_score   = 10 if (student_cgpa or 0) >= (job_min_cgpa or 0) else 0
    domain_score = 5 if (
        student_domain and
        student_domain.lower() in job_domain.lower()
    ) else 0

    total = int(req_score + pref_score + proj_score + cgpa_score + domain_score)
    total = min(total, 100)

    if total >= 80:
        recommendation = "Excellent fit! Apply now — your profile strongly matches this role."
    elif total >= 60:
        recommendation = "Good fit. Consider applying and highlighting your matching skills."
    elif total >= 40:
        recommendation = "Partial fit. Build the missing skills to improve your candidacy."
    else:
        recommendation = "Not a strong match yet. Focus on the required skills first."

    return {
        "score": total,
        "matching_skills": sorted(matching_req | matching_pref),
        "missing_skills": sorted(missing_req),
        "recommendation": recommendation,
    }


def _get_student_data(user: User, db: Session) -> dict:
    """Collect student skills, projects and profile for matching."""
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    # cgpa may not exist on older DB schemas — use getattr with a safe fallback
    cgpa = float(getattr(profile, "cgpa", None) or 0.0) if profile else 0.0
    target_role = user.target_role or ""
    return {
        "skills": [s.name for s in skills],
        "projects": len(projects),
        "cgpa": cgpa,
        "target_role": target_role,
    }


def _company_dict(company: Company, saved_ids: set = None) -> dict:
    return {
        "id": company.id,
        "name": company.name,
        "domain": company.domain or "",
        "industry": company.industry or "",
        "description": company.description or "",
        "logo_url": company.logo_url or "",
        "website": company.website or "",
        "headquarters": company.headquarters or "",
        "company_size": company.company_size or "",
        "primary_skills": _skills_list(company.primary_skills),
        "preferred_qualifications": company.preferred_qualifications or "",
        "is_demo": company.is_demo,
        "openings": len([j for j in company.jobs if j.is_active]),
        "is_saved": (company.id in saved_ids) if saved_ids is not None else False,
    }


def _job_dict(job: Job, match: dict = None) -> dict:
    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else "",
        "company_domain": job.company.domain if job.company else "",
        "title": job.title,
        "domain": job.domain,
        "description": job.description,
        "required_skills": _skills_list(job.required_skills),
        "preferred_skills": _skills_list(job.preferred_skills),
        "eligibility_criteria": job.eligibility_criteria or "",
        "min_cgpa": job.min_cgpa,
        "experience_level": job.experience_level,
        "job_type": job.job_type,
        "location": job.location,
        "work_mode": job.work_mode,
        "stipend_range": job.stipend_range,
        "deadline": job.deadline,
        "openings": job.openings,
        "is_active": job.is_active,
        "is_demo": job.is_demo,
        "match": match,
    }


# ─────────────────────────────────────────────────────────────────────────────
# COMPANIES
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/companies")
def list_companies(
    domain: str = Query(default=""),
    search: str = Query(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all companies with optional domain and search filters."""
    q = db.query(Company)
    if domain:
        q = q.filter(Company.domain.ilike(f"%{domain}%"))
    if search:
        q = q.filter(Company.name.ilike(f"%{search}%"))

    companies = q.order_by(Company.name).all()
    saved = db.query(SavedCompany.company_id).filter(
        SavedCompany.user_id == current_user.id
    ).all()
    saved_ids = {r[0] for r in saved}

    return {
        "companies": [_company_dict(c, saved_ids) for c in companies],
        "total": len(companies),
        "domains": sorted({c.domain for c in companies if c.domain}),
    }


@router.get("/companies/saved")
def get_saved_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the list of companies saved by the current user."""
    saved = (
        db.query(SavedCompany)
        .filter(SavedCompany.user_id == current_user.id)
        .all()
    )
    company_ids = [s.company_id for s in saved]
    companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
    saved_ids = set(company_ids)
    return {"companies": [_company_dict(c, saved_ids) for c in companies]}


@router.get("/companies/{company_id}")
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single company with its active jobs."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    saved = db.query(SavedCompany).filter(
        SavedCompany.user_id == current_user.id,
        SavedCompany.company_id == company_id,
    ).first()
    saved_ids = {company_id} if saved else set()

    student_data = _get_student_data(current_user, db)
    active_jobs = [j for j in company.jobs if j.is_active]
    jobs_out = []
    for job in active_jobs:
        match = _calculate_match(
            student_data["skills"],
            _skills_list(job.required_skills),
            _skills_list(job.preferred_skills),
            student_data["projects"],
            student_data["cgpa"],
            job.min_cgpa,
            student_data["target_role"],
            job.domain,
        )
        jobs_out.append(_job_dict(job, match))

    result = _company_dict(company, saved_ids)
    result["jobs"] = jobs_out
    return result


@router.post("/companies/{company_id}/save")
def toggle_save_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle save/unsave a company for the current user."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    existing = db.query(SavedCompany).filter(
        SavedCompany.user_id == current_user.id,
        SavedCompany.company_id == company_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": f"Removed {company.name} from saved companies"}
    else:
        sc = SavedCompany(user_id=current_user.id, company_id=company_id)
        db.add(sc)
        db.commit()
        return {"saved": True, "message": f"Saved {company.name}"}


# ─────────────────────────────────────────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/jobs")
def list_jobs(
    domain: str = Query(default=""),
    search: str = Query(default=""),
    company_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active jobs with optional filters. Includes match score for students."""
    q = db.query(Job).filter(Job.is_active == True)
    if domain:
        q = q.filter(Job.domain.ilike(f"%{domain}%"))
    if search:
        q = q.filter(
            (Job.title.ilike(f"%{search}%")) | (Job.description.ilike(f"%{search}%"))
        )
    if company_id:
        q = q.filter(Job.company_id == company_id)

    jobs = q.order_by(Job.title).all()
    student_data = _get_student_data(current_user, db)

    result = []
    for job in jobs:
        match = _calculate_match(
            student_data["skills"],
            _skills_list(job.required_skills),
            _skills_list(job.preferred_skills),
            student_data["projects"],
            student_data["cgpa"],
            job.min_cgpa,
            student_data["target_role"],
            job.domain,
        )
        result.append(_job_dict(job, match))

    # Sort by match score descending
    result.sort(key=lambda j: (j["match"] or {}).get("score", 0), reverse=True)

    domains = sorted({j["domain"] for j in result if j["domain"]})
    return {"jobs": result, "total": len(result), "domains": domains}


@router.get("/jobs/recommended")
def get_recommended_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return top-10 recommended jobs for the current student based on match score."""
    jobs = db.query(Job).filter(Job.is_active == True).all()
    student_data = _get_student_data(current_user, db)

    scored = []
    for job in jobs:
        match = _calculate_match(
            student_data["skills"],
            _skills_list(job.required_skills),
            _skills_list(job.preferred_skills),
            student_data["projects"],
            student_data["cgpa"],
            job.min_cgpa,
            student_data["target_role"],
            job.domain,
        )
        scored.append((match["score"], job, match))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:10]
    return {
        "jobs": [_job_dict(job, match) for _, job, match in top],
        "total": len(top),
    }


@router.get("/jobs/{job_id}/match")
def get_job_match(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate and return the match score for the current student vs a specific job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student_data = _get_student_data(current_user, db)
    match = _calculate_match(
        student_data["skills"],
        _skills_list(job.required_skills),
        _skills_list(job.preferred_skills),
        student_data["projects"],
        student_data["cgpa"],
        job.min_cgpa,
        student_data["target_role"],
        job.domain,
    )
    return {"job_id": job_id, "job_title": job.title, **match}


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single job with full detail and match score for current user."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student_data = _get_student_data(current_user, db)
    match = _calculate_match(
        student_data["skills"],
        _skills_list(job.required_skills),
        _skills_list(job.preferred_skills),
        student_data["projects"],
        student_data["cgpa"],
        job.min_cgpa,
        student_data["target_role"],
        job.domain,
    )

    # Has user applied?
    application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.student_id == current_user.id,
    ).first()

    result = _job_dict(job, match)
    result["already_applied"] = application is not None
    result["application_status"] = application.status if application else None
    return result


# ─────────────────────────────────────────────────────────────────────────────
# APPLICATIONS (STUDENT)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/jobs/{job_id}/apply")
def apply_for_job(
    job_id: int,
    resume_name: str = Body(default="", embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a job application for the current student. Prevents duplicate applications."""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer accepting applications")

    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.student_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied for this job")

    student_data = _get_student_data(current_user, db)
    match = _calculate_match(
        student_data["skills"],
        _skills_list(job.required_skills),
        _skills_list(job.preferred_skills),
        student_data["projects"],
        student_data["cgpa"],
        job.min_cgpa,
        student_data["target_role"],
        job.domain,
    )

    application = JobApplication(
        job_id=job_id,
        student_id=current_user.id,
        status="Applied",
        match_score=match["score"],
        matching_skills=json.dumps(match["matching_skills"]),
        missing_skills=json.dumps(match["missing_skills"]),
        resume_name=resume_name or "",
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": f"Successfully applied for {job.title} at {job.company.name if job.company else ''}",
        "application_id": application.id,
        "match_score": match["score"],
        "status": "Applied",
    }


@router.get("/applications/my")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all job applications submitted by the current student."""
    applications = (
        db.query(JobApplication)
        .filter(JobApplication.student_id == current_user.id)
        .order_by(JobApplication.applied_at.desc())
        .all()
    )

    result = []
    for app in applications:
        job = app.job
        result.append({
            "application_id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "company_name": job.company.name if job and job.company else "Unknown",
            "domain": job.domain if job else "",
            "location": job.location if job else "",
            "work_mode": job.work_mode if job else "",
            "stipend_range": job.stipend_range if job else "",
            "status": app.status,
            "match_score": app.match_score,
            "matching_skills": json.loads(app.matching_skills) if app.matching_skills else [],
            "missing_skills": json.loads(app.missing_skills) if app.missing_skills else [],
            "resume_name": app.resume_name or "",
            "applied_at": app.applied_at.isoformat() if app.applied_at else "",
        })

    return {"applications": result, "total": len(result)}


# ─────────────────────────────────────────────────────────────────────────────
# RECRUITER ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/recruiter/jobs")
def recruiter_list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all jobs posted by the recruiter's company."""
    company = db.query(Company).filter(Company.recruiter_id == current_user.id).first()
    if not company:
        # Return demo jobs for non-company users who access this endpoint
        jobs = db.query(Job).filter(Job.is_demo == True).limit(10).all()
        return {"jobs": [_job_dict(j) for j in jobs], "total": len(jobs)}

    return {"jobs": [_job_dict(j) for j in company.jobs], "total": len(company.jobs)}


@router.get("/recruiter/applications")
def recruiter_view_applicants(
    job_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """View all applicants for the recruiter's job listings."""
    company = db.query(Company).filter(Company.recruiter_id == current_user.id).first()
    if not company:
        return {"applications": [], "total": 0}

    q = db.query(JobApplication).join(Job).filter(Job.company_id == company.id)
    if job_id:
        q = q.filter(JobApplication.job_id == job_id)

    applications = q.order_by(JobApplication.applied_at.desc()).all()
    result = []
    for app in applications:
        student = app.student
        result.append({
            "application_id": app.id,
            "student_name": student.name if student else "Unknown",
            "student_email": student.email if student else "",
            "job_title": app.job.title if app.job else "",
            "status": app.status,
            "match_score": app.match_score,
            "matching_skills": json.loads(app.matching_skills) if app.matching_skills else [],
            "missing_skills": json.loads(app.missing_skills) if app.missing_skills else [],
            "resume_name": app.resume_name or "",
            "applied_at": app.applied_at.isoformat() if app.applied_at else "",
        })

    return {"applications": result, "total": len(result)}
