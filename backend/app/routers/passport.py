from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import re

from app.database import get_db
from app.dependencies.auth import get_current_user, require_faculty_or_admin, require_student
from app.models.user import User, Role
from app.models.skill import Skill, SkillEvidence, SkillVerification, SkillProgressHistory, StudentSkill
from app.models.project import Project
from app.models.coding import CodingSubmission, Challenge, CodingProblem
from app.models.github import GithubProfile

router = APIRouter(prefix="/passport", tags=["Skill Passport"])

# ─────────────────────────────────────────────────────────────────────────────
# Allowed Enums & Constants
# ─────────────────────────────────────────────────────────────────────────────
VALID_CATEGORIES = [
    "Programming Languages",
    "Data Structures and Algorithms",
    "Web Development",
    "Database Management",
    "Artificial Intelligence and Machine Learning",
    "Computer Science Fundamentals",
    "Software Engineering",
    "Cloud and DevOps",
    "Cybersecurity",
    "Tools and Frameworks"
]

VALID_PROFICIENCIES = [
    "Beginner",
    "Elementary",
    "Intermediate",
    "Advanced",
    "Expert"
]

PROFICIENCY_PERCENTAGES = {
    "Beginner": 35,
    "Elementary": 50,
    "Intermediate": 68,
    "Advanced": 85,
    "Expert": 96
}

VALID_STATUSES = [
    "Self-Declared",
    "Evidence Submitted",
    "Pending Review",
    "Verified",
    "Rejected",
    "Needs Improvement"
]

VALID_EVIDENCE_TYPES = [
    "GitHub Repository",
    "Coding Arena Submission",
    "Capstone Project",
    "Personal Project",
    "Faculty Assessment",
    "External Certification"
]

# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────────────────────────────
class AddSkillRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: str = Field(default="Programming Languages")
    description: Optional[str] = ""
    proficiency_level: str = Field(default="Intermediate")
    percentage: Optional[int] = None
    learning_start_date: Optional[str] = ""
    related_technology: Optional[str] = ""
    evidence_source: Optional[str] = ""
    supporting_project: Optional[str] = ""
    github_repo_url: Optional[str] = ""
    learning_notes: Optional[str] = ""

class UpdateSkillRequest(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    proficiency_level: Optional[str] = None
    percentage: Optional[int] = None
    learning_start_date: Optional[str] = None
    related_technology: Optional[str] = None
    evidence_source: Optional[str] = None
    supporting_project: Optional[str] = None
    github_repo_url: Optional[str] = None
    learning_notes: Optional[str] = None

class AddEvidenceRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    evidence_type: str = Field(..., min_length=1)
    description: Optional[str] = ""
    external_url: Optional[str] = ""
    related_submission_id: Optional[int] = None
    related_project_id: Optional[int] = None

class VerifySkillRequest(BaseModel):
    action: str = Field(..., description="APPROVED, REJECTED, or NEEDS_IMPROVEMENT")
    comments: Optional[str] = ""
    rejection_reason: Optional[str] = ""


# ─────────────────────────────────────────────────────────────────────────────
# Analytics Helper Functions
# ─────────────────────────────────────────────────────────────────────────────
def calculate_passport_analytics(user_id: int, skills: List[Skill], db: Session) -> Dict[str, Any]:
    """
    Computes rigorous, evidence-based Skill Passport analytics:
    - Overall Confidence (ONLY verified skills count)
    - Verified Projects (actual faculty reviewed projects)
    - Coding Benchmark (actual accepted submissions and difficulties)
    - Indicative Interview Readiness (weighted formula with explicit disclaimer)
    """
    total_skills = len(skills)
    verified_skills = [s for s in skills if s.status == "Verified"]
    pending_skills = [s for s in skills if s.status in ["Pending Review", "Evidence Submitted"]]
    needs_attention_skills = [s for s in skills if s.status in ["Needs Improvement", "Rejected"]]

    # 1. Overall Confidence Score:
    # Strictly evidence-based: does not simply average unverified self-declared ratings!
    if verified_skills:
        avg_confidence = round(sum(s.percentage for s in verified_skills) / len(verified_skills))
        has_sufficient_evidence = True
        overall_confidence_str = f"{avg_confidence}%"
        confidence_explanation = (
            f"Based on {len(verified_skills)} faculty-verified skills backed by code repositories and coursework. "
            "Self-declared skills do not artificially inflate this verified score."
        )
    else:
        avg_confidence = 0
        has_sufficient_evidence = False
        overall_confidence_str = "0%"
        confidence_explanation = (
            "Insufficient verified evidence to calculate confidence score. "
            "Self-declared skills do not inflate your verified ledger. "
            "Submit repository artifacts or coding solutions for faculty attestation to unlock this score."
        )

    # 2. Verified Projects:
    # Genuine projects from the database
    user_projects = db.query(Project).filter(Project.user_id == user_id).all()
    verified_projects = [p for p in user_projects if "Verified" in (p.verified_status or "")]
    verified_projects_count = len(verified_projects)

    # 3. Coding Benchmark:
    # Query actual accepted submissions for the user
    user_submissions = (
        db.query(CodingSubmission)
        .filter(
            CodingSubmission.user_id == user_id,
            or_(
                CodingSubmission.status == "Accepted",
                CodingSubmission.passed == True
            )
        )
        .all()
    )

    # Collect unique challenges solved to prevent double counting
    solved_challenge_ids = set()
    accepted_count = 0
    easy_count = 0
    medium_count = 0
    hard_count = 0
    solved_categories = set()

    for sub in user_submissions:
        cid = sub.challenge_id or str(sub.problem_id or sub.id)
        if cid not in solved_challenge_ids:
            solved_challenge_ids.add(cid)
            accepted_count += 1
            # Check challenge metadata if available
            ch = db.query(Challenge).filter(Challenge.id == cid).first() if sub.challenge_id else None
            if ch:
                diff = (ch.difficulty or "Medium").lower()
                if "easy" in diff:
                    easy_count += 1
                elif "hard" in diff:
                    hard_count += 1
                else:
                    medium_count += 1
                if ch.category:
                    solved_categories.add(ch.category)
            else:
                medium_count += 1

    # Realistic benchmark formula: target is 10 accepted problems (3 easy, 5 medium, 2 hard)
    if accepted_count > 0:
        coding_score_raw = min(100, (easy_count * 10) + (medium_count * 20) + (hard_count * 35))
        coding_benchmark_pct = f"{coding_score_raw}%"
    else:
        coding_score_raw = 0
        coding_benchmark_pct = "0%"

    coding_benchmark_data = {
        "score": coding_benchmark_pct,
        "raw_score": coding_score_raw,
        "total_solved": accepted_count,
        "easy_solved": easy_count,
        "medium_solved": medium_count,
        "hard_solved": hard_count,
        "categories_covered": list(solved_categories) if solved_categories else ["Algorithmic Foundations"]
    }

    # 4. Indicative Interview Readiness:
    # Weighted calculation based on real evidence:
    # - Verified Technical Skills (30%)
    # - Coding Benchmark (30%)
    # - Verified Projects (25%)
    # - Profile completeness & learning consistency (15%)
    readiness_components = []
    if verified_skills:
        readiness_components.append(avg_confidence * 0.30)
    if coding_score_raw > 0:
        readiness_components.append(coding_score_raw * 0.30)
    if verified_projects_count > 0:
        proj_score = min(100, verified_projects_count * 35)
        readiness_components.append(proj_score * 0.25)
    
    # Base baseline if user has active skills
    if total_skills > 0:
        readiness_components.append(min(15, total_skills * 3))

    readiness_score = round(sum(readiness_components)) if readiness_components else 0
    readiness_pct = f"{min(100, readiness_score)}%"

    interview_readiness_data = {
        "score": readiness_pct,
        "is_indicative": True,
        "disclaimer": "Indicative CareerOS assessment based on verified skills, projects, and Coding Arena performance. Not a guaranteed placement prediction.",
        "breakdown": {
            "verified_skills_contribution": f"{round(avg_confidence * 0.30)}%",
            "coding_arena_contribution": f"{round(coding_score_raw * 0.30)}%",
            "verified_projects_contribution": f"{round(min(100, verified_projects_count * 35) * 0.25)}%"
        }
    }

    return {
        "overall_confidence": overall_confidence_str,
        "has_sufficient_evidence": has_sufficient_evidence,
        "confidence_explanation": confidence_explanation,
        "skills_count": total_skills,
        "verified_skills_count": len(verified_skills),
        "pending_verifications_count": len(pending_skills),
        "needs_improvement_count": len(needs_attention_skills),
        "verified_projects": verified_projects_count,
        "coding_score": coding_benchmark_pct,
        "coding_benchmark": coding_benchmark_data,
        "interview_readiness": readiness_pct,
        "interview_readiness_detail": interview_readiness_data
    }


def format_skill_dict(s: Skill) -> Dict[str, Any]:
    """Helper to convert Skill ORM instance into clean, standardized response dict."""
    evidences_list = [
        {
            "id": ev.id,
            "title": ev.title,
            "evidence_type": ev.evidence_type,
            "description": ev.description or "",
            "external_url": ev.external_url or "",
            "review_status": ev.review_status,
            "reviewer_comments": ev.reviewer_comments or "",
            "submitted_at": ev.submitted_at.isoformat() if ev.submitted_at else None
        }
        for ev in (s.evidences or [])
    ]

    history_list = [
        {
            "id": h.id,
            "event_type": h.event_type,
            "title": h.title,
            "description": h.description or "",
            "previous_proficiency": h.previous_proficiency,
            "new_proficiency": h.new_proficiency,
            "status": h.status,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in (s.history or [])
    ]

    return {
        "id": s.id,
        "user_id": s.user_id,
        "name": s.name,
        "category": s.category,
        "description": s.description or "",
        "proficiency_level": s.proficiency_level or "Intermediate",
        "percentage": s.percentage or 50,
        "confidence": f"{s.percentage or 50}%",
        "level": s.proficiency_level or "Intermediate",
        "learning_start_date": s.learning_start_date or "",
        "related_technology": s.related_technology or "",
        "evidence_source": s.evidence_source or "",
        "supporting_project": s.supporting_project or "",
        "github_repo_url": s.github_repo_url or "",
        "learning_notes": s.learning_notes or "",
        "status": s.status or "Self-Declared",
        "evidence": s.evidence or (f"{len(evidences_list)} Evidence Records" if evidences_list else "Coursework & Practice"),
        "evidence_count": len(evidences_list),
        "verified_date": s.verified_date.strftime("%b %d, %Y") if s.verified_date else None,
        "verifiedDate": s.verified_date.strftime("%b %d, %Y") if s.verified_date else ("In Review" if s.status == "Pending Review" else "Self-Declared"),
        "verified_by_name": s.verified_by_name,
        "verification_comments": s.verification_comments,
        "rejection_reason": s.rejection_reason,
        "evidences": evidences_list,
        "history": history_list,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. Main Get Passport Route
# ─────────────────────────────────────────────────────────────────────────────
@router.get("")
def get_passport(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated student's full verified skill passport,
    including calculated analytics, skills list, evidence summaries, and dynamic badges.
    """
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).order_by(Skill.id.desc()).all()
    stats = calculate_passport_analytics(current_user.id, skills, db)

    # Dynamic earned technical badges
    earned_badges = []
    if (current_user.learning_xp or 0) >= 500:
        earned_badges.append({"icon": "⚡", "title": "500+ XP Achiever", "subtitle": "Active Learner"})
    if (current_user.streak_days or 0) >= 7:
        earned_badges.append({"icon": "🔥", "title": f"{current_user.streak_days}-Day Streak", "subtitle": "Consistent"})
    if any(s.status == "Verified" for s in skills):
        earned_badges.append({"icon": "🛡️", "title": "Faculty Verified", "subtitle": "Endorsed Skills"})
    if stats["verified_projects"] >= 1:
        earned_badges.append({"icon": "📦", "title": "Portfolio Builder", "subtitle": f"{stats['verified_projects']} Projects"})
    if stats["coding_benchmark"]["total_solved"] >= 5:
        earned_badges.append({"icon": "💻", "title": "Algorithm Solver", "subtitle": f"{stats['coding_benchmark']['total_solved']} Challenges"})

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "degree": current_user.degree or "B.Tech Computer Science",
            "semester": current_user.semester or "Semester 3",
            "target_role": current_user.target_role or "AI/ML Engineer",
            "university": current_user.university or "MIT-ADT University",
            "public_url": f"https://careeros.edu/passport/{current_user.id}"
        },
        "stats": stats,
        "skills": [format_skill_dict(s) for s in skills],
        "badges": earned_badges
    }


# ─────────────────────────────────────────────────────────────────────────────
# 2. Add Skill Route
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/skills", status_code=status.HTTP_201_CREATED)
def add_skill(
    req: AddSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a new technical skill to the student's passport.
    - Prevents duplicates (case-insensitive for the user)
    - Validates inputs
    - Always marks new skills as 'Self-Declared' (or 'Evidence Submitted' if repo attached)
    - Never automatically marks as 'Verified'!
    - Records creation event in SkillProgressHistory
    """
    clean_name = req.name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Skill name cannot be empty.")

    # Duplicate check for the authenticated student
    existing_skill = (
        db.query(Skill)
        .filter(
            Skill.user_id == current_user.id,
            func.lower(Skill.name) == clean_name.lower()
        )
        .first()
    )
    if existing_skill:
        raise HTTPException(
            status_code=400,
            detail=f"Skill '{clean_name}' already exists in your Skill Passport. You can edit it or add evidence instead."
        )

    # Validate category
    category = req.category.strip()
    if category not in VALID_CATEGORIES and not category:
        category = "Programming Languages"

    # Validate proficiency & calculate percentage
    prof_level = req.proficiency_level.strip() if req.proficiency_level else "Intermediate"
    if prof_level not in VALID_PROFICIENCIES:
        prof_level = "Intermediate"

    if req.percentage is not None and 10 <= req.percentage <= 100:
        percentage = req.percentage
    else:
        percentage = PROFICIENCY_PERCENTAGES.get(prof_level, 68)

    # Determine initial status
    has_initial_evidence = bool(req.github_repo_url and req.github_repo_url.strip()) or bool(req.supporting_project and req.supporting_project.strip())
    initial_status = "Evidence Submitted" if has_initial_evidence else "Self-Declared"

    # Evidence summary string
    evidence_summary = req.evidence_source.strip() if req.evidence_source else ("GitHub & Project" if has_initial_evidence else "Self-Assessment")

    skill = Skill(
        user_id=current_user.id,
        name=clean_name,
        category=category,
        description=req.description.strip() if req.description else "",
        proficiency_level=prof_level,
        percentage=percentage,
        confidence=f"{percentage}%",
        level=prof_level,
        learning_start_date=req.learning_start_date.strip() if req.learning_start_date else None,
        related_technology=req.related_technology.strip() if req.related_technology else None,
        evidence_source=evidence_summary,
        supporting_project=req.supporting_project.strip() if req.supporting_project else None,
        github_repo_url=req.github_repo_url.strip() if req.github_repo_url else None,
        learning_notes=req.learning_notes.strip() if req.learning_notes else "",
        status=initial_status,
        evidence=evidence_summary
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    # Record creation in progress history
    creation_history = SkillProgressHistory(
        skill_id=skill.id,
        user_id=current_user.id,
        event_type="SKILL_CREATED",
        title=f"Skill Added ({prof_level})",
        description=f"Initial self-declared skill created with {percentage}% confidence level.",
        new_proficiency=f"{prof_level} ({percentage}%)",
        status=initial_status
    )
    db.add(creation_history)

    # If GitHub repo URL or supporting project was provided, automatically record as an evidence entry
    if req.github_repo_url and req.github_repo_url.strip():
        repo_evidence = SkillEvidence(
            skill_id=skill.id,
            user_id=current_user.id,
            title=f"GitHub Repository: {clean_name}",
            evidence_type="GitHub Repository",
            description=f"Supporting repository provided during skill initialization: {req.supporting_project or clean_name}",
            external_url=req.github_repo_url.strip(),
            review_status="Submitted"
        )
        db.add(repo_evidence)

        evidence_history = SkillProgressHistory(
            skill_id=skill.id,
            user_id=current_user.id,
            event_type="EVIDENCE_ADDED",
            title="GitHub Repository Linked",
            description=f"Attached repository evidence: {req.github_repo_url.strip()}",
            new_proficiency=f"{prof_level} ({percentage}%)",
            status=initial_status
        )
        db.add(evidence_history)

    db.commit()
    db.refresh(skill)

    return {
        "status": "success",
        "message": f"Skill '{skill.name}' added to Skill Passport as {initial_status}.",
        "skill": format_skill_dict(skill)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. Get Single Skill Details Route
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/skills/{skill_id}")
def get_skill_details(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full details for a single skill:
    - Metadata, proficiency, verification status
    - All attached evidence records
    - Chronological progress history
    - Related coding challenges or projects
    Enforces user ownership unless requested by faculty or administrator.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    # Check permission
    is_owner = skill.user_id == current_user.id
    is_reviewer = str(current_user.role or "").strip().upper() in [
        Role.FACULTY.value, Role.ADMINISTRATOR.value, "FACULTY", "ADMINISTRATOR", "ADMIN"
    ]
    if not is_owner and not is_reviewer:
        raise HTTPException(status_code=403, detail="You do not have permission to view this private skill record.")

    # Query related coding arena submissions matching skill name or technology
    related_submissions = []
    try:
        subs = (
            db.query(CodingSubmission)
            .filter(
                CodingSubmission.user_id == skill.user_id,
                or_(
                    CodingSubmission.language.ilike(f"%{skill.name}%"),
                    CodingSubmission.challenge_title.ilike(f"%{skill.name}%")
                )
            )
            .limit(5)
            .all()
        )
        related_submissions = [
            {
                "id": sub.id,
                "challenge_title": sub.challenge_title or f"Challenge #{sub.challenge_id}",
                "language": sub.language,
                "passed": sub.passed,
                "status": sub.status,
                "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None
            }
            for sub in subs
        ]
    except Exception:
        pass

    # Query related projects
    related_projects = []
    try:
        projs = (
            db.query(Project)
            .filter(
                Project.user_id == skill.user_id,
                or_(
                    Project.title.ilike(f"%{skill.name}%"),
                    Project.category.ilike(f"%{skill.category}%")
                )
            )
            .limit(3)
            .all()
        )
        related_projects = [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "verified_status": p.verified_status,
                "github_url": p.github_url or p.repo_url
            }
            for p in projs
        ]
    except Exception:
        pass

    skill_dict = format_skill_dict(skill)
    skill_dict["related_coding_submissions"] = related_submissions
    skill_dict["related_projects"] = related_projects

    return {
        "status": "success",
        "skill": skill_dict
    }


# ─────────────────────────────────────────────────────────────────────────────
# 4. Update Skill Details & Proficiency Route
# ─────────────────────────────────────────────────────────────────────────────
@router.put("/skills/{skill_id}")
def update_skill(
    skill_id: int,
    req: UpdateSkillRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates skill metadata, description, learning notes, or proficiency level.
    Enforces user ownership.
    Records update in SkillProgressHistory.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if skill.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own skills.")

    old_prof = f"{skill.proficiency_level} ({skill.percentage}%)"
    changes_made = []

    if req.category is not None:
        cat = req.category.strip()
        if cat in VALID_CATEGORIES or cat:
            skill.category = cat
            changes_made.append(f"Category changed to {cat}")

    if req.description is not None:
        skill.description = req.description.strip()

    if req.learning_notes is not None:
        skill.learning_notes = req.learning_notes.strip()

    if req.learning_start_date is not None:
        skill.learning_start_date = req.learning_start_date.strip()

    if req.related_technology is not None:
        skill.related_technology = req.related_technology.strip()

    if req.supporting_project is not None:
        skill.supporting_project = req.supporting_project.strip()

    if req.github_repo_url is not None:
        skill.github_repo_url = req.github_repo_url.strip()

    # Proficiency update
    proficiency_updated = False
    if req.proficiency_level is not None:
        new_prof_level = req.proficiency_level.strip()
        if new_prof_level in VALID_PROFICIENCIES:
            skill.proficiency_level = new_prof_level
            skill.level = new_prof_level
            proficiency_updated = True

    if req.percentage is not None and 10 <= req.percentage <= 100:
        skill.percentage = req.percentage
        skill.confidence = f"{req.percentage}%"
        proficiency_updated = True
    elif proficiency_updated:
        # Default percentage if only level was updated
        default_pct = PROFICIENCY_PERCENTAGES.get(skill.proficiency_level, skill.percentage)
        skill.percentage = default_pct
        skill.confidence = f"{default_pct}%"

    new_prof = f"{skill.proficiency_level} ({skill.percentage}%)"
    if proficiency_updated and old_prof != new_prof:
        changes_made.append(f"Proficiency updated from {old_prof} to {new_prof}")

    skill.updated_at = datetime.now(timezone.utc)
    db.commit()

    # Log in history if meaningful changes
    if changes_made:
        history_entry = SkillProgressHistory(
            skill_id=skill.id,
            user_id=current_user.id,
            event_type="PROFICIENCY_UPDATED" if proficiency_updated else "SKILL_UPDATED",
            title="Skill Details Updated",
            description="; ".join(changes_made),
            previous_proficiency=old_prof,
            new_proficiency=new_prof,
            status=skill.status
        )
        db.add(history_entry)
        db.commit()

    db.refresh(skill)
    return {
        "status": "success",
        "message": f"Skill '{skill.name}' updated successfully.",
        "skill": format_skill_dict(skill)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5. Delete Skill Route
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a skill and cascades deletion to associated evidence,
    verification records, and progress history.
    Enforces user ownership.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if skill.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own skills.")

    skill_name = skill.name
    # Clean up any legacy student_skills joins if present
    try:
        db.query(StudentSkill).filter(StudentSkill.skill_id == skill_id).delete()
    except Exception:
        pass

    db.delete(skill)
    db.commit()

    return {
        "status": "success",
        "message": f"Skill '{skill_name}' and all associated records have been removed."
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6. Add Evidence to Skill Route
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/skills/{skill_id}/evidence", status_code=status.HTTP_201_CREATED)
def add_evidence(
    skill_id: int,
    req: AddEvidenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds a verified evidence record (GitHub Repo, Coding Arena Submission, Project, etc.) to a skill.
    Updates skill status to 'Evidence Submitted' if it was 'Self-Declared'.
    Validates external URL format if provided.
    Records event in SkillProgressHistory.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if skill.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only attach evidence to your own skills.")

    clean_title = req.title.strip()
    if not clean_title:
        raise HTTPException(status_code=400, detail="Evidence title cannot be empty.")

    clean_type = req.evidence_type.strip()
    if clean_type not in VALID_EVIDENCE_TYPES:
        clean_type = "Personal Project"

    # Validate URL if provided
    clean_url = req.external_url.strip() if req.external_url else ""
    if clean_url:
        if not (clean_url.startswith("http://") or clean_url.startswith("https://")):
            raise HTTPException(status_code=400, detail="External URL must start with http:// or https://")

    evidence = SkillEvidence(
        skill_id=skill.id,
        user_id=current_user.id,
        title=clean_title,
        evidence_type=clean_type,
        description=req.description.strip() if req.description else "",
        external_url=clean_url if clean_url else None,
        related_submission_id=req.related_submission_id,
        related_project_id=req.related_project_id,
        review_status="Submitted"
    )
    db.add(evidence)

    # Transition skill status if it was Self-Declared or Rejected/Needs Improvement
    old_status = skill.status
    if skill.status in ["Self-Declared", "Rejected", "Needs Improvement"]:
        skill.status = "Evidence Submitted"

    # Update summary evidence string on skill
    total_ev = len(skill.evidences or []) + 1
    skill.evidence = f"{total_ev} Evidence Records ({clean_type})"
    skill.updated_at = datetime.now(timezone.utc)

    # Log in progress history
    history_entry = SkillProgressHistory(
        skill_id=skill.id,
        user_id=current_user.id,
        event_type="EVIDENCE_ADDED",
        title=f"Evidence Attached: {clean_title}",
        description=f"Type: {clean_type}. {req.description or ''}".strip(),
        new_proficiency=f"{skill.proficiency_level} ({skill.percentage}%)",
        status=skill.status
    )
    db.add(history_entry)

    db.commit()
    db.refresh(skill)

    return {
        "status": "success",
        "message": f"Evidence '{clean_title}' attached to skill '{skill.name}'.",
        "evidence": {
            "id": evidence.id,
            "title": evidence.title,
            "evidence_type": evidence.evidence_type,
            "description": evidence.description,
            "external_url": evidence.external_url,
            "review_status": evidence.review_status,
            "submitted_at": evidence.submitted_at.isoformat() if evidence.submitted_at else None
        },
        "skill": format_skill_dict(skill)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 7. Delete Evidence Route
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/skills/{skill_id}/evidence/{evidence_id}")
def delete_evidence(
    skill_id: int,
    evidence_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes an evidence record from a skill.
    Enforces user ownership.
    Logs removal in history.
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if skill.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only remove evidence from your own skills.")

    evidence = (
        db.query(SkillEvidence)
        .filter(SkillEvidence.id == evidence_id, SkillEvidence.skill_id == skill_id)
        .first()
    )
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence record not found.")

    ev_title = evidence.title
    db.delete(evidence)
    db.commit()

    # Refresh skill evidence count and status
    remaining_evidences = db.query(SkillEvidence).filter(SkillEvidence.skill_id == skill_id).all()
    if not remaining_evidences and skill.status == "Evidence Submitted":
        skill.status = "Self-Declared"
    skill.evidence = f"{len(remaining_evidences)} Evidence Records" if remaining_evidences else "Coursework & Practice"
    skill.updated_at = datetime.now(timezone.utc)

    # Log in progress history
    history_entry = SkillProgressHistory(
        skill_id=skill.id,
        user_id=current_user.id,
        event_type="EVIDENCE_REMOVED",
        title=f"Evidence Removed: {ev_title}",
        description=f"Evidence record '{ev_title}' was deleted by student.",
        new_proficiency=f"{skill.proficiency_level} ({skill.percentage}%)",
        status=skill.status
    )
    db.add(history_entry)
    db.commit()

    return {
        "status": "success",
        "message": f"Evidence '{ev_title}' removed.",
        "skill": format_skill_dict(skill)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8. Request Faculty Verification Route
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/skills/{skill_id}/request-verification")
def request_verification(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student submits a formal verification request for faculty/admin review.
    - Transitions skill status to 'Pending Review'
    - Cannot request verification if already 'Verified'
    - Records request event in SkillProgressHistory
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    if skill.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only request verification for your own skills.")

    if skill.status == "Verified":
        raise HTTPException(status_code=400, detail="This skill is already verified by faculty.")

    if skill.status == "Pending Review":
        raise HTTPException(status_code=400, detail="Verification request is already pending faculty review.")

    skill.status = "Pending Review"
    skill.updated_at = datetime.now(timezone.utc)

    history_entry = SkillProgressHistory(
        skill_id=skill.id,
        user_id=current_user.id,
        event_type="VERIFICATION_REQUESTED",
        title="Verification Requested",
        description="Formal verification submitted for faculty and institutional audit.",
        new_proficiency=f"{skill.proficiency_level} ({skill.percentage}%)",
        status="Pending Review"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(skill)

    return {
        "status": "success",
        "message": f"Verification requested for '{skill.name}'. Awaiting faculty attestation.",
        "skill": format_skill_dict(skill)
    }


# ─────────────────────────────────────────────────────────────────────────────
# 9. Faculty / Admin: List Pending Verifications Queue
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/faculty/pending-verifications")
def get_pending_verifications(
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db)
):
    """
    Retrieves all pending skill verification requests submitted by students.
    Only authorized faculty members or administrators can view this queue.
    """
    pending_skills = (
        db.query(Skill)
        .filter(Skill.status.in_(["Pending Review", "Evidence Submitted"]))
        .order_by(Skill.updated_at.desc())
        .all()
    )

    queue = []
    for s in pending_skills:
        student = db.query(User).filter(User.id == s.user_id).first()
        queue.append({
            "skill_id": s.id,
            "skill_name": s.name,
            "category": s.category,
            "proficiency_level": s.proficiency_level,
            "percentage": s.percentage,
            "status": s.status,
            "evidence_count": len(s.evidences or []),
            "evidences": [
                {
                    "id": ev.id,
                    "title": ev.title,
                    "evidence_type": ev.evidence_type,
                    "external_url": ev.external_url,
                    "description": ev.description
                }
                for ev in (s.evidences or [])
            ],
            "github_repo_url": s.github_repo_url,
            "supporting_project": s.supporting_project,
            "learning_notes": s.learning_notes,
            "student_id": student.id if student else None,
            "student_name": student.name if student else "Student",
            "student_email": student.email if student else "",
            "student_degree": student.degree or "B.Tech Computer Science",
            "student_semester": student.semester or "Semester 3",
            "submitted_at": s.updated_at.isoformat() if s.updated_at else None
        })

    return {
        "status": "success",
        "count": len(queue),
        "queue": queue
    }


# ─────────────────────────────────────────────────────────────────────────────
# 10. Faculty / Admin: Review & Verify Skill Route
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/skills/{skill_id}/verify")
def verify_skill(
    skill_id: int,
    req: VerifySkillRequest,
    current_user: User = Depends(require_faculty_or_admin),
    db: Session = Depends(get_db)
):
    """
    Reviews and decides on a skill verification request.
    Authorized for FACULTY or ADMINISTRATOR roles only!
    Students cannot call this endpoint (returns 403 Forbidden).
    
    Actions:
    - APPROVED: sets status='Verified', records reviewer name & timestamp
    - REJECTED: sets status='Rejected', records rejection reason
    - NEEDS_IMPROVEMENT: sets status='Needs Improvement', records faculty feedback
    """
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found.")

    action = req.action.strip().upper()
    if action not in ["APPROVED", "REJECTED", "NEEDS_IMPROVEMENT"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'APPROVED', 'REJECTED', or 'NEEDS_IMPROVEMENT'."
        )

    reviewer_role = str(current_user.role or "FACULTY").upper()
    now_time = datetime.now(timezone.utc)
    comments = req.comments.strip() if req.comments else ""
    reason = req.rejection_reason.strip() if req.rejection_reason else comments

    if action == "APPROVED":
        skill.status = "Verified"
        skill.verified_date = now_time
        skill.verified_by_user_id = current_user.id
        skill.verified_by_name = current_user.name
        skill.verification_comments = comments or "Attested and endorsed by faculty based on verified project and coursework evidence."
        skill.rejection_reason = None
        event_title = f"Skill Verified by {current_user.name}"
        event_desc = comments or "Faculty completed independent audit of student artifacts and approved competency."
        
        # Also mark all attached evidences as verified
        for ev in (skill.evidences or []):
            ev.review_status = "Verified"
            ev.reviewer_comments = comments

    elif action == "REJECTED":
        if not reason:
            raise HTTPException(status_code=400, detail="A rejection reason is required when rejecting a skill.")
        skill.status = "Rejected"
        skill.verified_by_user_id = current_user.id
        skill.verified_by_name = current_user.name
        skill.rejection_reason = reason
        skill.verification_comments = comments
        event_title = "Skill Verification Rejected"
        event_desc = f"Rejected with reason: {reason}"

        for ev in (skill.evidences or []):
            ev.review_status = "Rejected"
            ev.reviewer_comments = reason

    else:  # NEEDS_IMPROVEMENT
        skill.status = "Needs Improvement"
        skill.verified_by_user_id = current_user.id
        skill.verified_by_name = current_user.name
        skill.verification_comments = comments or "Additional repository evidence or lab assignments required."
        event_title = "Faculty Requested Improvement"
        event_desc = comments or "Faculty reviewed the submission and requested further evidence."

        for ev in (skill.evidences or []):
            ev.review_status = "Under Review"
            ev.reviewer_comments = comments

    skill.updated_at = now_time

    # Record verification decision in audit table
    audit_record = SkillVerification(
        skill_id=skill.id,
        reviewer_id=current_user.id,
        reviewer_name=current_user.name,
        reviewer_role=reviewer_role,
        action=action,
        comments=comments or reason,
        verified_at=now_time
    )
    db.add(audit_record)

    # Record in student's skill history
    history_entry = SkillProgressHistory(
        skill_id=skill.id,
        user_id=skill.user_id,
        event_type=action,
        title=event_title,
        description=event_desc,
        new_proficiency=f"{skill.proficiency_level} ({skill.percentage}%)",
        status=skill.status
    )
    db.add(history_entry)

    db.commit()
    db.refresh(skill)

    return {
        "status": "success",
        "action": action,
        "message": f"Skill '{skill.name}' verification set to {skill.status}.",
        "skill": format_skill_dict(skill)
    }
