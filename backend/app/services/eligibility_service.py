import re
from typing import Dict, List, Set, Any, Optional
from sqlalchemy.orm import Session

from app.models.user import User, StudentProfile
from app.models.skill import Skill, StudentSkill
from app.models.resume import Resume, ResumeAnalysis
from app.models.github import GithubProfile, GitHubProfile
from app.models.coding import CodingSubmission
from app.models.project import Project, ProjectTechnology
from app.models.job import JobListing, JobSkillRequirement, JobApplication

# Skill normalizer and alias dictionary
SKILL_ALIASES: Dict[str, str] = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "react.js": "react",
    "reactjs": "react",
    "react native": "react native",
    "node": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",
    "express": "express",
    "express.js": "express",
    "expressjs": "express",
    "fastapi": "fastapi",
    "fast api": "fastapi",
    "django": "django",
    "flask": "flask",
    "vue": "vue.js",
    "vue.js": "vue.js",
    "vuejs": "vue.js",
    "next": "next.js",
    "next.js": "next.js",
    "nextjs": "next.js",
    "nuxt": "nuxt.js",
    "nuxt.js": "nuxt.js",
    "nuxtjs": "nuxt.js",
    "c++": "cpp",
    "cpp": "cpp",
    "c#": "csharp",
    "csharp": "csharp",
    "golang": "go",
    "go": "go",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "mongodb": "mongodb",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "docker": "docker",
    "containers": "docker",
    "cicd": "ci/cd",
    "ci/cd": "ci/cd",
    "ci / cd": "ci/cd",
    "github actions": "ci/cd",
    "sklearn": "scikit-learn",
    "scikit learn": "scikit-learn",
    "scikit-learn": "scikit-learn",
    "tf": "tensorflow",
    "tensorflow": "tensorflow",
    "torch": "pytorch",
    "pytorch": "pytorch",
    "nlp": "natural language processing",
    "natural language processing": "natural language processing",
    "cv": "computer vision",
    "computer vision": "computer vision",
    "ml": "machine learning",
    "machine learning": "machine learning",
    "ai": "artificial intelligence",
    "artificial intelligence": "machine learning",
    "deep learning": "deep learning",
    "ui/ux": "ui/ux design",
    "ui / ux": "ui/ux design",
    "ui/ux design": "ui/ux design",
    "ui design": "ui/ux design",
    "ux design": "ui/ux design",
    "product design": "ui/ux design",
    "figma": "figma",
    "html": "html",
    "html5": "html",
    "css": "css",
    "css3": "css",
    "html/css": "html/css",
    "tailwind": "tailwind css",
    "tailwindcss": "tailwind css",
    "tailwind css": "tailwind css",
    "aws": "aws",
    "amazon web services": "aws",
    "gcp": "google cloud",
    "google cloud platform": "google cloud",
    "google cloud": "google cloud",
    "azure": "azure",
    "microsoft azure": "azure",
    "sql": "sql",
    "relational databases": "sql",
    "nosql": "nosql",
    "rest": "rest apis",
    "rest api": "rest apis",
    "rest apis": "rest apis",
    "restful apis": "rest apis",
    "graphql": "graphql",
    "embedded": "embedded systems",
    "embedded systems": "embedded systems",
    "embedded c": "embedded systems",
    "iot": "iot",
    "internet of things": "iot",
    "rtos": "rtos",
    "freertos": "rtos",
    "security": "cybersecurity",
    "cybersecurity": "cybersecurity",
    "infosec": "cybersecurity",
    "information security": "cybersecurity",
    "network security": "network security",
    "networking": "networking",
    "computer networks": "networking",
    "pen testing": "penetration testing",
    "penetration testing": "penetration testing",
    "ethical hacking": "penetration testing",
    "owasp": "owasp",
    "mobile development": "mobile app development",
    "mobile app development": "mobile app development",
    "flutter": "flutter",
    "dart": "dart",
    "kotlin": "kotlin",
    "swift": "swift",
    "ios": "ios",
    "android": "android",
    "linux": "linux",
    "bash": "bash",
    "shell": "bash",
    "git": "git",
    "github": "git",
}

def normalize_skill(name: str) -> str:
    """Normalize skill name string to a canonical form."""
    if not name:
        return ""
    clean = name.strip().lower()
    clean = re.sub(r"\s+", " ", clean)
    return SKILL_ALIASES.get(clean, clean)


def extract_student_skills(db: Session, user_id: int) -> Dict[str, Dict[str, Any]]:
    """
    Gathers all skill evidence for a student from various tables:
    - StudentSkill + Skill (explicit verified skills)
    - Resume / ResumeAnalysis (detected skills in parsed CV)
    - GithubProfile (languages used in repositories)
    - CodingSubmissions (languages successfully executed)
    - Projects + ProjectTechnology (tech stack in student projects)
    
    Returns a dict keyed by canonical skill name:
    {
       "python": {"canonical": "python", "sources": ["Profile Skill (Level 80)", "Resume Detection", "Project: CareerOS"], "score": 80}
    }
    """
    skill_map: Dict[str, Dict[str, Any]] = {}

    def add_evidence(raw_name: str, source_label: str, score: Optional[int] = None):
        if not raw_name:
            return
        
        # Handle compound skills like "HTML/CSS" or comma separated
        parts = [p.strip() for p in re.split(r"[,/&]", raw_name) if p.strip()]
        if len(parts) > 1 and raw_name.lower() not in ["ui/ux", "ui/ux design", "ci/cd"]:
            for part in parts:
                add_evidence(part, source_label, score)
            return

        canon = normalize_skill(raw_name)
        if not canon:
            return

        if canon not in skill_map:
            skill_map[canon] = {
                "canonical": canon,
                "display_name": raw_name.title() if len(raw_name) > 3 else raw_name.upper(),
                "sources": [],
                "score": score or 0
            }
        
        if source_label not in skill_map[canon]["sources"]:
            skill_map[canon]["sources"].append(source_label)
            
        if score and (skill_map[canon]["score"] is None or score > skill_map[canon]["score"]):
            skill_map[canon]["score"] = score

    # 1. Direct Skills by user_id
    user_skills = db.query(Skill).filter(Skill.user_id == user_id).all()
    for s in user_skills:
        score = s.percentage or 70
        status_str = s.status or "Proficient"
        add_evidence(s.name, f"Student Skill ({status_str})", score)

    # Also check StudentSkill via StudentProfile
    student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if student_profile:
        student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_profile.id).all()
        for ss in student_skills:
            skill_obj = db.query(Skill).filter(Skill.id == ss.skill_id).first()
            if skill_obj:
                score = ss.proficiency or 70
                add_evidence(skill_obj.name, f"Verified Skill (Level {score})", score)

    # 2. Resumes & Resume Analysis
    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    for r in resumes:
        analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).all()
        for a in analyses:
            if a.detected_skills and isinstance(a.detected_skills, list):
                for s in a.detected_skills:
                    if isinstance(s, str):
                        add_evidence(s, "Detected in Resume")
                    elif isinstance(s, dict) and "name" in s:
                        add_evidence(s["name"], "Detected in Resume")

    # 3. GitHub Profile & Repositories
    gh_profiles = db.query(GithubProfile).filter(GithubProfile.user_id == user_id).all()
    if not gh_profiles:
        gh_profiles = db.query(GitHubProfile).filter(GitHubProfile.user_id == user_id).all()
    
    for gh in gh_profiles:
        if hasattr(gh, "languages") and gh.languages:
            if isinstance(gh.languages, dict):
                for lang in gh.languages.keys():
                    add_evidence(lang, "GitHub Repository Language")
            elif isinstance(gh.languages, list):
                for lang in gh.languages:
                    add_evidence(str(lang), "GitHub Repository Language")

    # 4. Coding Submissions (languages used)
    submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == user_id,
        CodingSubmission.status == "ACCEPTED"
    ).all()
    for sub in submissions:
        if sub.language:
            add_evidence(sub.language, "Verified Coding Challenge")

    # 5. Student Projects
    if student_profile:
        projects = db.query(Project).filter(Project.student_id == student_profile.id).all()
        for p in projects:
            p_techs = db.query(ProjectTechnology).filter(ProjectTechnology.project_id == p.id).all()
            for pt in p_techs:
                if pt.technology_name:
                    add_evidence(pt.technology_name, f"Project Portfolio: {p.title}")

    return skill_map


def assess_job_eligibility(db: Session, job: JobListing, user_id: int) -> Dict[str, Any]:
    """
    Evaluates student eligibility for a specific JobListing based on real evidence.
    Returns status: ELIGIBLE, NOT_ELIGIBLE, INSUFFICIENT_EVIDENCE, CLOSED, EXPIRED, ALREADY_APPLIED.
    """
    # 1. Check if already applied
    existing_app = db.query(JobApplication).filter(
        JobApplication.job_listing_id == job.id,
        JobApplication.student_user_id == user_id,
        JobApplication.withdrawn == False
    ).first()

    already_applied = existing_app is not None

    # 2. Check if job is closed or inactive
    if job.is_closed or not job.is_published:
        return {
            "status": "CLOSED",
            "eligible": False,
            "already_applied": already_applied,
            "application_id": existing_app.id if existing_app else None,
            "reason": "This job listing is no longer accepting applications.",
            "mandatory_matched": 0,
            "mandatory_total": 0,
            "optional_matched": 0,
            "optional_total": 0,
            "skill_coverage_pct": 0,
            "matched_skills": [],
            "missing_mandatory": [],
            "missing_optional": [],
            "total_student_skills": 0
        }

    # 3. Gather student skills
    student_skills = extract_student_skills(db, user_id)
    total_student_skills = len(student_skills)

    # 4. Extract job skill requirements
    reqs = db.query(JobSkillRequirement).filter(JobSkillRequirement.job_listing_id == job.id).all()
    mandatory_reqs = [r for r in reqs if r.is_mandatory]
    optional_reqs = [r for r in reqs if not r.is_mandatory]

    matched_skills = []
    missing_mandatory = []
    missing_optional = []

    # Check mandatory
    for req in mandatory_reqs:
        canon = normalize_skill(req.skill_name)
        if canon in student_skills:
            matched_skills.append({
                "skill_name": req.skill_name,
                "is_mandatory": True,
                "evidence": student_skills[canon]["sources"],
                "score": student_skills[canon]["score"]
            })
        else:
            missing_mandatory.append({
                "skill_name": req.skill_name,
                "is_mandatory": True
            })

    # Check optional
    for req in optional_reqs:
        canon = normalize_skill(req.skill_name)
        if canon in student_skills:
            matched_skills.append({
                "skill_name": req.skill_name,
                "is_mandatory": False,
                "evidence": student_skills[canon]["sources"],
                "score": student_skills[canon]["score"]
            })
        else:
            missing_optional.append({
                "skill_name": req.skill_name,
                "is_mandatory": False
            })

    mandatory_matched = len(mandatory_reqs) - len(missing_mandatory)
    mandatory_total = len(mandatory_reqs)
    optional_matched = len(optional_reqs) - len(missing_optional)
    optional_total = len(optional_reqs)

    total_reqs_count = mandatory_total + optional_total
    total_matched_count = mandatory_matched + optional_matched
    
    skill_coverage_pct = int((total_matched_count / total_reqs_count * 100)) if total_reqs_count > 0 else 100

    # Determine eligibility status
    if already_applied:
        status = "ALREADY_APPLIED"
        eligible = True
        reason = f"You have already applied for this role. (Application status: {existing_app.status})"
    elif total_student_skills == 0:
        status = "INSUFFICIENT_EVIDENCE"
        eligible = False
        reason = "No skill evidence found in your profile, resume, projects, or coding activity. Complete your profile or upload a resume to evaluate eligibility."
    elif len(missing_mandatory) == 0:
        status = "ELIGIBLE"
        eligible = True
        reason = f"You satisfy all {mandatory_total} mandatory skill requirements for this position!"
    else:
        status = "NOT_ELIGIBLE"
        eligible = False
        missing_names = [m["skill_name"] for m in missing_mandatory]
        reason = f"Missing {len(missing_mandatory)} mandatory skill(s): {', '.join(missing_names)}. Add verified projects, skills, or resume experience to qualify."

    return {
        "status": status,
        "eligible": eligible,
        "already_applied": already_applied,
        "application_id": existing_app.id if existing_app else None,
        "application_status": existing_app.status if existing_app else None,
        "reason": reason,
        "mandatory_matched": mandatory_matched,
        "mandatory_total": mandatory_total,
        "optional_matched": optional_matched,
        "optional_total": optional_total,
        "skill_coverage_pct": skill_coverage_pct,
        "matched_skills": matched_skills,
        "missing_mandatory": missing_mandatory,
        "missing_optional": missing_optional,
        "total_student_skills": total_student_skills
    }
