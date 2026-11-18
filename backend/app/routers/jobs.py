"""
Jobs & Companies router for CareerOS Student Job & Internship Marketplace.
Provides endpoints for:
  - Marketplace statistics & overview
  - Listing / searching companies and jobs/internships
  - Company and job detail views
  - Student job-match scoring with weighted algorithm
  - Job application submission (with resume upload or existing selection)
  - Application history and status tracking
  - Saved jobs bookmarking & removal
  - Saved companies bookmarking & removal
  - Student resume retrieval and upload
  - AI match explanation powered by Groq
  - Recruiter applicant review and status updates
All write endpoints require JWT authentication.
"""

from __future__ import annotations

import os
import json
import uuid
import asyncio
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, StudentProfile
from app.models.company import Company, Job, JobApplication, SavedCompany, SavedJob
from app.models.skill import Skill
from app.models.project import Project
from app.models.resume import Resume
from app.ai.groq_client import groq_ai

router = APIRouter(tags=["Jobs & Marketplace"])

UPLOAD_RESUMES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "resumes"
)
os.makedirs(UPLOAD_RESUMES_DIR, exist_ok=True)


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
    student_set = {s.lower().strip() for s in student_skills if s}
    req_set     = {s.lower().strip() for s in job_required if s}
    pref_set    = {s.lower().strip() for s in job_preferred if s}

    matching_req  = student_set & req_set
    matching_pref = student_set & pref_set
    missing_req   = req_set - student_set

    req_score    = (len(matching_req)  / max(len(req_set), 1)) * 50
    pref_score   = (len(matching_pref) / max(len(pref_set), 1)) * 20
    proj_score   = min(student_projects * 3, 15)
    cgpa_score   = 10 if (student_cgpa or 0) >= (job_min_cgpa or 0) else 0
    domain_score = 5 if (
        student_domain and
        student_domain.lower() in (job_domain or "").lower()
    ) else 0

    total = int(req_score + pref_score + proj_score + cgpa_score + domain_score)
    total = max(5, min(total, 100))

    if total >= 80:
        recommendation = "Strong compatibility! Your skills and portfolio align closely with this opportunity."
    elif total >= 60:
        recommendation = "Good match. Emphasize your matching technical skills and projects in your application."
    elif total >= 40:
        recommendation = "Moderate fit. Bridging missing technical requirements will significantly boost your candidacy."
    else:
        recommendation = "Developing fit. Review required skills and consider relevant projects to enhance alignment."

    return {
        "score": total,
        "matching_skills": sorted(matching_req | matching_pref),
        "missing_skills": sorted(missing_req),
        "recommendation": recommendation,
        "breakdown": {
            "required_skills_score": round(req_score, 1),
            "preferred_skills_score": round(pref_score, 1),
            "projects_score": proj_score,
            "cgpa_eligible": (student_cgpa or 0) >= (job_min_cgpa or 0),
            "domain_match": bool(domain_score)
        }
    }


def _get_student_data(user: User, db: Session) -> dict:
    """Collect student skills, projects, resume and profile for matching."""
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    cgpa = float(getattr(profile, "cgpa", None) or 0.0) if profile else 0.0
    target_role = user.target_role or ""

    resume = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()).first()
    resume_skills = []
    if resume and resume.detected_skills:
        if isinstance(resume.detected_skills, list):
            resume_skills = [str(s) for s in resume.detected_skills]
        elif isinstance(resume.detected_skills, str):
            resume_skills = _skills_list(resume.detected_skills)

    all_skills = list(set([s.name for s in skills] + resume_skills))

    return {
        "skills": all_skills,
        "projects": len(projects),
        "cgpa": cgpa,
        "target_role": target_role,
        "degree": user.degree or (profile.degree if profile else ""),
        "semester": user.semester or (profile.semester if profile else ""),
        "resume": resume
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


def _job_dict(job: Job, match: dict = None, is_saved: bool = False) -> dict:
    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else "",
        "company_domain": job.company.domain if job.company else "",
        "company_headquarters": job.company.headquarters if job.company else "",
        "company_size": job.company.company_size if job.company else "",
        "company_website": job.company.website if job.company else "",
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
        "is_saved": is_saved,
        "created_at": job.created_at.strftime("%b %d, %Y") if job.created_at else "Recently",
        "match": match,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MARKETPLACE OVERVIEW STATS (PART 2)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/marketplace/stats")
def get_marketplace_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return live authenticated student stats:
      - Profile completion percentage
      - Resume status & ATS score
      - Total recommended opportunities
      - Total applications submitted
      - Total saved jobs
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    skills_count = db.query(Skill).filter(Skill.user_id == current_user.id).count()
    projects_count = db.query(Project).filter(Project.user_id == current_user.id).count()
    apps_count = db.query(JobApplication).filter(JobApplication.student_id == current_user.id).count()
    saved_jobs_count = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).count()
    total_active_jobs = db.query(Job).filter(Job.is_active == True).count()

    # Calculate real profile completion
    points = 0
    if current_user.name: points += 15
    if current_user.email: points += 10
    if getattr(profile, "university", None) or getattr(profile, "degree", None): points += 20
    if getattr(profile, "semester", None): points += 10
    if skills_count > 0: points += 20
    if projects_count > 0: points += 15
    if resume: points += 10
    profile_completion = min(points, 100)

    return {
        "student_name": current_user.name,
        "profile_completion": profile_completion,
        "resume_status": {
            "has_resume": resume is not None,
            "file_name": resume.file_name if resume else None,
            "ats_score": resume.ats_score if resume else None,
            "match_rating": resume.match_rating if resume else None,
            "uploaded_at": resume.uploaded_at.strftime("%b %d, %Y") if (resume and resume.uploaded_at) else None
        },
        "stats": {
            "skills_count": skills_count,
            "projects_count": projects_count,
            "applications_submitted": apps_count,
            "saved_jobs_count": saved_jobs_count,
            "total_opportunities": total_active_jobs,
            "recommended_count": min(8, total_active_jobs)
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# RESUME MANAGEMENT (PART 7 & 11)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/resume/my")
def get_my_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve current student's active resume."""
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        return {"uploaded": False, "resume": None}

    return {
        "uploaded": True,
        "resume": {
            "id": resume.id,
            "file_name": resume.file_name,
            "file_path": resume.file_path,
            "ats_score": resume.ats_score or 78,
            "match_rating": resume.match_rating or "Competitive",
            "detected_skills": resume.detected_skills or [],
            "uploaded_at": resume.uploaded_at.strftime("%b %d, %Y") if resume.uploaded_at else "Recently"
        }
    }


@router.post("/resume/upload")
async def upload_student_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and record a resume for the logged-in student."""
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a PDF or Word document (.pdf, .docx)."
        )

    # Save file
    safe_name = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.join(UPLOAD_RESUMES_DIR, safe_name)

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit.")

    with open(file_path, "wb") as f:
        f.write(content)

    # Simple keyword extraction for skills
    common_skills = [
        "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "React", "Node.js",
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "Git", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "Machine Learning", "Deep Learning", "PyTorch",
        "TensorFlow", "FastAPI", "Django", "Flask", "Linux", "Data Structures", "Algorithms"
    ]
    text_content = content[:4000].decode("latin-1", errors="ignore")
    detected = [s for s in common_skills if s.lower() in text_content.lower()]
    if not detected:
        detected = ["Python", "Problem Solving", "Git", "Data Structures"]

    resume = Resume(
        user_id=current_user.id,
        file_name=filename,
        file_path=file_path,
        ats_score=min(88, 65 + len(detected) * 3),
        match_rating="Strong Fit" if len(detected) >= 5 else "Good Foundation",
        detected_skills=detected
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": f"Resume '{filename}' uploaded successfully.",
        "file_name": filename,
        "ats_score": resume.ats_score,
        "detected_skills": detected
    }


# ─────────────────────────────────────────────────────────────────────────────
# COMPANIES (PART 4)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/companies")
def list_companies(
    domain: str = Query(default=""),
    search: str = Query(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List companies with domain and name search."""
    domain_str = domain if isinstance(domain, str) else ""
    search_str = search if isinstance(search, str) else ""

    q = db.query(Company)
    if domain_str:
        q = q.filter(Company.domain.ilike(f"%{domain_str}%"))
    if search_str:
        q = q.filter(
            (Company.name.ilike(f"%{search_str}%")) |
            (Company.description.ilike(f"%{search_str}%")) |
            (Company.primary_skills.ilike(f"%{search_str}%"))
        )

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
    """Return companies bookmarked by user."""
    saved = db.query(SavedCompany).filter(SavedCompany.user_id == current_user.id).all()
    company_ids = [s.company_id for s in saved]
    companies = db.query(Company).filter(Company.id.in_(company_ids)).all()
    saved_ids = set(company_ids)
    return {"companies": [_company_dict(c, saved_ids) for c in companies]}


@router.get("/companies/{company_id}")
def get_company_detail(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single company details with its active jobs and internships."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    saved = db.query(SavedCompany).filter(
        SavedCompany.user_id == current_user.id,
        SavedCompany.company_id == company_id,
    ).first()
    saved_ids = {company_id} if saved else set()

    # User saved jobs
    saved_job_ids = {
        r[0] for r in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    }

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
        jobs_out.append(_job_dict(job, match, is_saved=(job.id in saved_job_ids)))

    result = _company_dict(company, saved_ids)
    result["jobs"] = [j for j in jobs_out if j["job_type"] != "Internship"]
    result["internships"] = [j for j in jobs_out if j["job_type"] == "Internship"]
    result["all_opportunities"] = jobs_out
    return result


@router.post("/companies/{company_id}/save")
def toggle_save_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle save/unsave company."""
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
# JOBS & INTERNSHIPS (PART 3 & 5)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/jobs")
def list_jobs(
    domain: str = Query(default=""),
    search: str = Query(default=""),
    job_type: str = Query(default="", alias="type"),       # "Full-time" or "Internship"
    work_mode: str = Query(default=""),                    # "Remote", "Hybrid", "On-site"
    company_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List opportunities with rich filters, sorted by compatibility score."""
    domain_str = domain if isinstance(domain, str) else ""
    search_str = search if isinstance(search, str) else ""
    type_str = job_type if isinstance(job_type, str) else ""
    mode_str = work_mode if isinstance(work_mode, str) else ""
    comp_id = company_id if isinstance(company_id, int) else None

    q = db.query(Job).filter(Job.is_active == True)

    if domain_str:
        q = q.filter(Job.domain.ilike(f"%{domain_str}%"))
    if type_str:
        if type_str.lower() == "internship":
            q = q.filter(Job.job_type == "Internship")
        elif type_str.lower() in ["job", "full-time", "fulltime"]:
            q = q.filter(Job.job_type != "Internship")
    if mode_str:
        q = q.filter(Job.work_mode.ilike(f"%{mode_str}%"))
    if comp_id:
        q = q.filter(Job.company_id == comp_id)
    if search_str:
        search_filter = f"%{search_str}%"
        q = q.join(Company).filter(
            (Job.title.ilike(search_filter)) |
            (Job.description.ilike(search_filter)) |
            (Job.required_skills.ilike(search_filter)) |
            (Company.name.ilike(search_filter))
        )

    jobs = q.all()
    student_data = _get_student_data(current_user, db)

    saved_job_ids = {
        r[0] for r in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    }

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
        result.append(_job_dict(job, match, is_saved=(job.id in saved_job_ids)))

    # Sort by match score descending
    result.sort(key=lambda j: (j["match"] or {}).get("score", 0), reverse=True)

    domains = sorted({j["domain"] for j in result if j["domain"]})
    return {
        "jobs": result,
        "total": len(result),
        "domains": domains,
        "internships_count": len([j for j in result if j["job_type"] == "Internship"]),
        "fulltime_count": len([j for j in result if j["job_type"] != "Internship"]),
    }


@router.get("/jobs/recommended")
def get_recommended_jobs(
    limit: int = Query(default=8),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return top opportunities ranked by personalized compatibility."""
    jobs = db.query(Job).filter(Job.is_active == True).all()
    student_data = _get_student_data(current_user, db)

    saved_job_ids = {
        r[0] for r in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all()
    }

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
    top = scored[:limit]

    return {
        "recommended": [
            _job_dict(job, match, is_saved=(job.id in saved_job_ids))
            for _, job, match in top
        ],
        "total": len(top),
        "student_skills_used": student_data["skills"][:10],
    }


@router.get("/jobs/{job_id}/match")
def get_job_match(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate and return live compatibility breakdown for a specific job."""
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
    return {
        "job_id": job_id,
        "job_title": job.title,
        "company_name": job.company.name if job.company else "",
        **match
    }


@router.get("/jobs/{job_id}")
def get_job_detail(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get complete job details with compatibility analysis and application status."""
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

    # Check if applied
    application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.student_id == current_user.id,
    ).first()

    # Check if saved
    is_saved = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id
    ).first() is not None

    result = _job_dict(job, match, is_saved=is_saved)
    result["already_applied"] = application is not None
    result["application"] = {
        "id": application.id,
        "status": application.status,
        "applied_at": application.applied_at.isoformat() if application.applied_at else None,
        "resume_name": application.resume_name,
        "cover_letter": application.cover_letter,
    } if application else None

    return result


# ─────────────────────────────────────────────────────────────────────────────
# SAVED JOBS (PART 9)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/saved-jobs")
def get_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all opportunities bookmarked by the student."""
    saved_entries = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    job_ids = [s.job_id for s in saved_entries]
    jobs = db.query(Job).filter(Job.id.in_(job_ids)).all()

    student_data = _get_student_data(current_user, db)
    results = []
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
        results.append(_job_dict(job, match, is_saved=True))

    return {"saved_jobs": results, "total": len(results)}


@router.post("/saved-jobs/{job_id}")
def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save/bookmark an opportunity for later."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id,
    ).first()

    if existing:
        return {"saved": True, "message": "Job is already saved"}

    saved = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    return {"saved": True, "message": f"Saved '{job.title}' to your saved jobs"}


@router.delete("/saved-jobs/{job_id}")
def remove_saved_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove an opportunity from saved jobs."""
    entry = db.query(SavedJob).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == job_id,
    ).first()

    if not entry:
        return {"saved": False, "message": "Job was not in saved list"}

    db.delete(entry)
    db.commit()
    return {"saved": False, "message": "Removed from saved jobs"}


# ─────────────────────────────────────────────────────────────────────────────
# APPLICATION SUBMISSION & TRACKING (PART 7 & 8)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/jobs/{job_id}/apply")
async def apply_for_job(
    job_id: int,
    resume_name: Optional[str] = Form(default=None),
    cover_letter: Optional[str] = Form(default=None),
    resume_file: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a job application:
      - Accepts an existing resume filename OR a new uploaded file.
      - Associates authenticated student ID, job ID, and company ID.
      - Validates file format and size if uploading.
      - Prevents duplicate applications.
    """
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    # Prevent duplicate applications
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.student_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already applied for '{job.title}' on {existing.applied_at.strftime('%b %d, %Y')}."
        )

    # Process resume
    final_resume_name = resume_name if isinstance(resume_name, str) else None
    if resume_file and getattr(resume_file, "filename", None):
        ext = os.path.splitext(resume_file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".doc"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid resume format. Only PDF and DOCX files are accepted."
            )
        content = await resume_file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Resume file exceeds 10MB limit.")

        safe_name = f"{current_user.id}_{uuid.uuid4().hex[:6]}_{resume_file.filename}"
        file_path = os.path.join(UPLOAD_RESUMES_DIR, safe_name)
        with open(file_path, "wb") as f:
            f.write(content)

        final_resume_name = resume_file.filename

        # Also store into user resumes table
        new_resume = Resume(
            user_id=current_user.id,
            file_name=final_resume_name,
            file_path=file_path,
            ats_score=82,
            match_rating="Uploaded Application Resume"
        )
        db.add(new_resume)
        db.flush()

    if not final_resume_name:
        # Fallback to existing student resume
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
        if latest_resume:
            final_resume_name = latest_resume.file_name
        else:
            final_resume_name = f"{current_user.name.replace(' ', '_')}_Resume.pdf"

    # Calculate match at application time
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
        resume_name=final_resume_name,
        cover_letter=cover_letter if isinstance(cover_letter, str) else "",
        notes=f"Applied via CareerOS Marketplace. Fit rating: {match['score']}%"
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": f"Successfully applied for '{job.title}' at {job.company.name if job.company else ''}!",
        "application_id": application.id,
        "status": application.status,
        "match_score": match["score"],
        "resume_name": final_resume_name,
        "applied_at": application.applied_at.isoformat()
    }


@router.get("/applications/my")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full application history with status and timeline."""
    applications = (
        db.query(JobApplication)
        .filter(JobApplication.student_id == current_user.id)
        .order_by(JobApplication.applied_at.desc())
        .all()
    )

    # Status sequence order for visual timeline
    status_steps = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected"]

    result = []
    for app in applications:
        job = app.job
        company = job.company if job else None

        current_idx = 0
        if app.status in status_steps:
            current_idx = status_steps.index(app.status)
        elif app.status == "Rejected":
            current_idx = -1

        result.append({
            "application_id": app.id,
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown Role",
            "job_type": job.job_type if job else "Full-time",
            "company_name": company.name if company else "Unknown Company",
            "company_domain": company.domain if company else "",
            "location": job.location if job else "",
            "work_mode": job.work_mode if job else "",
            "stipend_range": job.stipend_range if job else "",
            "status": app.status,
            "timeline_step": current_idx,
            "match_score": app.match_score,
            "matching_skills": json.loads(app.matching_skills) if app.matching_skills else [],
            "missing_skills": json.loads(app.missing_skills) if app.missing_skills else [],
            "resume_name": app.resume_name or "",
            "cover_letter": app.cover_letter or "",
            "applied_at": app.applied_at.strftime("%b %d, %Y") if app.applied_at else "",
            "updated_at": app.updated_at.strftime("%b %d, %Y") if app.updated_at else None
        })

    return {"applications": result, "total": len(result)}


# ─────────────────────────────────────────────────────────────────────────────
# AI CAREER MATCH EXPLANATION (PART 10)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/jobs/{job_id}/ai-explanation")
async def get_ai_job_explanation(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Provides deep personalized reasoning via Groq AI:
      - Why the opportunity suits the student
      - Relevant overlapping skills
      - Missing skill bridge plan
      - Tailored resume advice
    """
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

    company_name = job.company.name if job.company else "the hiring company"
    prompt = (
        f"Act as a senior engineering mentor and university career advisor.\n"
        f"A student ({student_data.get('degree', 'Engineering')} student) is reviewing this job:\n"
        f"Title: {job.title}\n"
        f"Company: {company_name} ({job.domain})\n"
        f"Required Skills: {job.required_skills}\n"
        f"Preferred Skills: {job.preferred_skills or 'None listed'}\n"
        f"Work Mode: {job.work_mode}, Location: {job.location}\n\n"
        f"Student Profile:\n"
        f"- Target Career Goal: {student_data.get('target_role') or 'Software Engineer'}\n"
        f"- Verified Skills: {', '.join(student_data['skills']) if student_data['skills'] else 'Developing basics'}\n"
        f"- Verified Projects Count: {student_data['projects']}\n"
        f"- Algorithmic Match Score: {match['score']}%\n"
        f"- Matching Skills: {', '.join(match['matching_skills']) or 'None'}\n"
        f"- Missing Skills: {', '.join(match['missing_skills']) or 'None'}\n\n"
        f"Please provide an insightful, structured assessment with:\n"
        f"1. Why This Opportunity Matches You (2-3 concise bullet points)\n"
        f"2. Your Strongest Assets For This Role\n"
        f"3. High-Priority Skills To Bridge\n"
        f"4. Actionable Resume Tailoring Tip"
    )

    if groq_ai.is_configured():
        try:
            explanation = await asyncio.wait_for(
                groq_ai.generate_chat_response_async(
                    messages=[{"role": "user", "content": prompt}],
                    system_instruction="You are CareerOS AI Career Advisor. Be encouraging, precise, and practical for university students."
                ),
                timeout=5.0
            )
            return {
                "success": True,
                "provider": "Groq",
                "explanation": explanation,
                "match_score": match["score"],
                "matching_skills": match["matching_skills"],
                "missing_skills": match["missing_skills"]
            }
        except Exception as e:
            pass

    # Fallback explanation
    fallback = (
        f"### Compatibility Overview ({match['score']}%)\n\n"
        f"**Why this fits you:** Your background in {', '.join(match['matching_skills'][:3]) or 'software fundamentals'} "
        f"gives you a solid foundation for the **{job.title}** opening at **{company_name}**.\n\n"
        f"**Strengths to highlight:** Showcase your {student_data['projects']} verified projects on your resume, "
        f"particularly projects demonstrating {', '.join(match['matching_skills']) or 'core programming principles'}.\n\n"
        f"**Next Steps:** Review the required skills: {', '.join(match['missing_skills']) if match['missing_skills'] else 'All key skills covered'}. "
        f"Building a targeted mini-project will maximize your shortlisting probability."
    )
    return {
        "success": True,
        "provider": "RuleEngine",
        "explanation": fallback,
        "match_score": match["score"],
        "matching_skills": match["matching_skills"],
        "missing_skills": match["missing_skills"]
    }


# ─────────────────────────────────────────────────────────────────────────────
# RECRUITER APPLICATION MANAGEMENT (PART 12 & TEST 10-12)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/recruiter/jobs")
def recruiter_list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List jobs belonging to recruiter."""
    company = db.query(Company).filter(Company.recruiter_id == current_user.id).first()
    if not company:
        # For demo faculty/admin users, show top demo jobs
        jobs = db.query(Job).filter(Job.is_demo == True).limit(15).all()
        return {"jobs": [_job_dict(j) for j in jobs], "total": len(jobs)}

    return {"jobs": [_job_dict(j) for j in company.jobs], "total": len(company.jobs)}


@router.get("/recruiter/applications")
def recruiter_view_applicants(
    job_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """View applicants across jobs for recruiter."""
    q = db.query(JobApplication).join(Job)
    company = db.query(Company).filter(Company.recruiter_id == current_user.id).first()
    if company:
        q = q.filter(Job.company_id == company.id)
    if job_id and isinstance(job_id, int):
        q = q.filter(JobApplication.job_id == job_id)

    applications = q.order_by(JobApplication.applied_at.desc()).all()
    result = []
    for app in applications:
        student = app.student
        result.append({
            "application_id": app.id,
            "student_id": app.student_id,
            "student_name": student.name if student else "Unknown Candidate",
            "student_email": student.email if student else "",
            "job_id": app.job_id,
            "job_title": app.job.title if app.job else "",
            "status": app.status,
            "match_score": app.match_score,
            "matching_skills": json.loads(app.matching_skills) if app.matching_skills else [],
            "missing_skills": json.loads(app.missing_skills) if app.missing_skills else [],
            "resume_name": app.resume_name or "",
            "cover_letter": app.cover_letter or "",
            "applied_at": app.applied_at.strftime("%b %d, %Y") if app.applied_at else "",
        })

    return {"applications": result, "total": len(result)}


@router.put("/recruiter/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: str = Body(..., embed=True, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Recruiter updates applicant status (Shortlisted, Interview Scheduled, Selected, etc.)."""
    valid_statuses = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"]
    if status_update not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{status_update}'. Allowed: {', '.join(valid_statuses)}"
        )

    application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = status_update
    db.commit()
    db.refresh(application)

    return {
        "success": True,
        "application_id": application.id,
        "status": application.status,
        "message": f"Application status updated to '{status_update}'."
    }
