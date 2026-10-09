from typing import List, Optional, Any, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.job import JobListing, JobSkillRequirement, JobApplication, StudentJobPreference
from app.services.eligibility_service import assess_job_eligibility, extract_student_skills
from app.schemas.job import (
    JobListingOut,
    JobApplicationOut,
    EligibilityResult,
    StudentJobPreferenceOut,
    StudentJobPreferenceUpdate,
    JobSkillRequirementOut
)

router = APIRouter(prefix="/jobs", tags=["Jobs & Opportunities"])

DOMAINS_LIST = [
    "AI / ML",
    "Data Science & Analytics",
    "Full Stack Web Development",
    "Backend Engineering",
    "Frontend Engineering",
    "Mobile App Development",
    "Cloud & DevOps",
    "Cybersecurity",
    "Embedded Systems & IoT",
    "UI/UX & Product Design"
]


@router.get("/domains")
def get_domains(db: Session = Depends(get_db)):
    """Returns available career domains along with active job counts."""
    counts = {}
    for d in DOMAINS_LIST:
        c = db.query(JobListing).filter(
            JobListing.domain == d,
            JobListing.is_published == True,
            JobListing.is_closed == False
        ).count()
        counts[d] = c

    return [
        {"domain": d, "job_count": counts.get(d, 0)}
        for d in DOMAINS_LIST
    ]


@router.get("/preferences", response_model=StudentJobPreferenceOut)
def get_student_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current student's job preferences."""
    pref = db.query(StudentJobPreference).filter(StudentJobPreference.user_id == current_user.id).first()
    if not pref:
        return StudentJobPreferenceOut()
    return StudentJobPreferenceOut(
        preferred_domains=pref.preferred_domains or [],
        preferred_roles=pref.preferred_roles or [],
        preferred_employment_types=pref.preferred_employment_types or [],
        preferred_work_arrangement=pref.preferred_work_arrangement or [],
        preferred_locations=pref.preferred_locations or []
    )


@router.put("/preferences", response_model=StudentJobPreferenceOut)
def update_student_preferences(
    payload: StudentJobPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current student's career and job preferences."""
    pref = db.query(StudentJobPreference).filter(StudentJobPreference.user_id == current_user.id).first()
    if not pref:
        pref = StudentJobPreference(user_id=current_user.id)
        db.add(pref)

    if payload.preferred_domains is not None:
        pref.preferred_domains = payload.preferred_domains
    if payload.preferred_roles is not None:
        pref.preferred_roles = payload.preferred_roles
    if payload.preferred_employment_types is not None:
        pref.preferred_employment_types = payload.preferred_employment_types
    if payload.preferred_work_arrangement is not None:
        pref.preferred_work_arrangement = payload.preferred_work_arrangement
    if payload.preferred_locations is not None:
        pref.preferred_locations = payload.preferred_locations

    db.commit()
    db.refresh(pref)

    return StudentJobPreferenceOut(
        preferred_domains=pref.preferred_domains or [],
        preferred_roles=pref.preferred_roles or [],
        preferred_employment_types=pref.preferred_employment_types or [],
        preferred_work_arrangement=pref.preferred_work_arrangement or [],
        preferred_locations=pref.preferred_locations or []
    )


@router.get("", response_model=List[JobListingOut])
def list_jobs(
    domain: Optional[str] = None,
    search: Optional[str] = None,
    employment_type: Optional[str] = None,
    work_arrangement: Optional[str] = None,
    is_demo: Optional[bool] = None,
    eligible_only: bool = False,
    recommended_only: bool = False,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List published job opportunities with filtering, search, and dynamic eligibility assessment.
    """
    query = db.query(JobListing).filter(
        JobListing.is_published == True,
        JobListing.is_closed == False
    )

    if domain and domain != "All":
        query = query.filter(JobListing.domain == domain)

    if employment_type and employment_type != "All":
        query = query.filter(JobListing.employment_type == employment_type)

    if work_arrangement and work_arrangement != "All":
        query = query.filter(JobListing.work_arrangement == work_arrangement)

    if is_demo is not None:
        query = query.filter(JobListing.is_demo == is_demo)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.join(Company).filter(
            or_(
                JobListing.title.ilike(search_term),
                JobListing.description.ilike(search_term),
                Company.name.ilike(search_term),
                JobListing.domain.ilike(search_term)
            )
        )

    # If student wants recommendations based on preferences
    if recommended_only and current_user:
        pref = db.query(StudentJobPreference).filter(StudentJobPreference.user_id == current_user.id).first()
        if pref and pref.preferred_domains:
            query = query.filter(JobListing.domain.in_(pref.preferred_domains))

    jobs = query.order_by(desc(JobListing.created_at)).all()

    results = []
    for job in jobs:
        company = job.company
        skill_reqs = [
            JobSkillRequirementOut(
                id=sr.id,
                skill_name=sr.skill_name,
                is_mandatory=sr.is_mandatory,
                min_proficiency=sr.min_proficiency
            )
            for sr in job.skill_requirements
        ]

        eligibility_result = None
        if current_user:
            elig = assess_job_eligibility(db, job, current_user.id)
            eligibility_result = EligibilityResult(**elig)

            # Filter if eligible_only flag is set
            if eligible_only and not elig.get("eligible", False):
                continue

        results.append(
            JobListingOut(
                id=job.id,
                company_id=job.company_id,
                company_name=company.name if company else "Company",
                company_industry=company.industry if company else None,
                company_logo_emoji=company.logo_emoji if company else "🏢",
                company_headquarters=company.headquarters if company else None,
                title=job.title,
                domain=job.domain,
                description=job.description,
                responsibilities=job.responsibilities,
                employment_type=job.employment_type,
                work_arrangement=job.work_arrangement,
                location=job.location,
                education_requirement=job.education_requirement,
                experience_requirement=job.experience_requirement,
                openings=job.openings,
                deadline=job.deadline,
                is_published=job.is_published,
                is_closed=job.is_closed,
                is_demo=job.is_demo,
                created_at=job.created_at,
                skill_requirements=skill_reqs,
                eligibility=eligibility_result
            )
        )

    return results


@router.get("/applications/me", response_model=List[JobApplicationOut])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all job applications submitted by the current student."""
    apps = db.query(JobApplication).filter(
        JobApplication.student_user_id == current_user.id
    ).order_by(desc(JobApplication.applied_at)).all()

    results = []
    for a in apps:
        job = a.job_listing
        if not job:
            continue
        company = job.company
        results.append(
            JobApplicationOut(
                id=a.id,
                job_listing_id=job.id,
                job_title=job.title,
                company_name=company.name if company else "Company",
                company_logo_emoji=company.logo_emoji if company else "🏢",
                domain=job.domain,
                employment_type=job.employment_type,
                work_arrangement=job.work_arrangement,
                location=job.location,
                is_demo=job.is_demo,
                eligibility_status=a.eligibility_status,
                mandatory_matched=a.mandatory_matched,
                mandatory_total=a.mandatory_total,
                skill_coverage_pct=a.skill_coverage_pct,
                status=a.status,
                withdrawn=a.withdrawn,
                applied_at=a.applied_at,
                updated_at=a.updated_at,
                eligibility_detail=a.eligibility_detail
            )
        )

    return results


@router.get("/{job_id}", response_model=JobListingOut)
def get_job_detail(
    job_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full details for a single job listing, including eligibility analysis."""
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    company = job.company
    skill_reqs = [
        JobSkillRequirementOut(
            id=sr.id,
            skill_name=sr.skill_name,
            is_mandatory=sr.is_mandatory,
            min_proficiency=sr.min_proficiency
        )
        for sr in job.skill_requirements
    ]

    eligibility_result = None
    if current_user:
        elig = assess_job_eligibility(db, job, current_user.id)
        eligibility_result = EligibilityResult(**elig)

    return JobListingOut(
        id=job.id,
        company_id=job.company_id,
        company_name=company.name if company else "Company",
        company_industry=company.industry if company else None,
        company_logo_emoji=company.logo_emoji if company else "🏢",
        company_headquarters=company.headquarters if company else None,
        title=job.title,
        domain=job.domain,
        description=job.description,
        responsibilities=job.responsibilities,
        employment_type=job.employment_type,
        work_arrangement=job.work_arrangement,
        location=job.location,
        education_requirement=job.education_requirement,
        experience_requirement=job.experience_requirement,
        openings=job.openings,
        deadline=job.deadline,
        is_published=job.is_published,
        is_closed=job.is_closed,
        is_demo=job.is_demo,
        created_at=job.created_at,
        skill_requirements=skill_reqs,
        eligibility=eligibility_result
    )


@router.get("/{job_id}/eligibility", response_model=EligibilityResult)
def check_job_eligibility(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluate current student's skill eligibility for a specific job listing."""
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    elig = assess_job_eligibility(db, job, current_user.id)
    return EligibilityResult(**elig)


@router.post("/{job_id}/apply")
def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits student application for a job listing with validation and an eligibility snapshot.
    """
    job = db.query(JobListing).filter(JobListing.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job listing not found.")

    if job.is_closed or not job.is_published:
        raise HTTPException(status_code=400, detail="This job listing is no longer accepting applications.")

    # Check existing application
    existing_app = db.query(JobApplication).filter(
        JobApplication.job_listing_id == job.id,
        JobApplication.student_user_id == current_user.id
    ).first()

    if existing_app and not existing_app.withdrawn:
        raise HTTPException(status_code=400, detail="You have already submitted an active application for this role.")

    # Evaluate eligibility snapshot
    elig = assess_job_eligibility(db, job, current_user.id)

    # If student is not eligible, prevent submission or notify
    if not elig.get("eligible", False) and elig.get("status") == "NOT_ELIGIBLE":
        missing = [m["skill_name"] for m in elig.get("missing_mandatory", [])]
        raise HTTPException(
            status_code=400,
            detail=f"You do not currently meet the mandatory skill requirements for this role: {', '.join(missing)}"
        )

    if existing_app and existing_app.withdrawn:
        # Re-apply
        existing_app.withdrawn = False
        existing_app.status = "APPLIED"
        existing_app.eligibility_status = elig.get("status", "ELIGIBLE")
        existing_app.mandatory_matched = elig.get("mandatory_matched", 0)
        existing_app.mandatory_total = elig.get("mandatory_total", 0)
        existing_app.skill_coverage_pct = elig.get("skill_coverage_pct", 0)
        existing_app.eligibility_detail = elig
        existing_app.applied_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing_app)
        return {
            "message": "Application submitted successfully!",
            "application_id": existing_app.id,
            "status": existing_app.status
        }

    # Create new application
    app = JobApplication(
        job_listing_id=job.id,
        student_user_id=current_user.id,
        eligibility_status=elig.get("status", "ELIGIBLE"),
        mandatory_matched=elig.get("mandatory_matched", 0),
        mandatory_total=elig.get("mandatory_total", 0),
        skill_coverage_pct=elig.get("skill_coverage_pct", 0),
        eligibility_detail=elig,
        status="APPLIED",
        withdrawn=False,
        status_history=[{
            "status": "APPLIED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "note": "Application submitted by student."
        }]
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    return {
        "message": "Application submitted successfully!",
        "application_id": app.id,
        "status": app.status
    }


@router.post("/applications/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw an existing job application."""
    app = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.student_user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if app.withdrawn:
        raise HTTPException(status_code=400, detail="Application is already withdrawn.")

    app.withdrawn = True
    app.status = "WITHDRAWN"
    
    history = app.status_history or []
    history.append({
        "status": "WITHDRAWN",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": "Application withdrawn by student."
    })
    app.status_history = history

    db.commit()
    return {"message": "Application withdrawn successfully."}
