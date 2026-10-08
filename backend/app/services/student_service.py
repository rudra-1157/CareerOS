from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.skill import Skill
from app.models.project import Project
from app.models.resume import Resume
from app.models.github import GitHubProfile
from app.models.coding import CodingSubmission

def calculate_profile_completion(user: User, has_resume: bool, has_github: bool, skills_count: int, projects_count: int) -> int:
    score = 20  # Base account created
    if user.name and user.email:
        score += 10
    if user.degree and user.semester:
        score += 15
    if user.target_role:
        score += 15
    if user.bio:
        score += 10
    if has_resume:
        score += 10
    if has_github:
        score += 10
    if skills_count > 0:
        score += 5
    if projects_count > 0:
        score += 5
    return min(100, score)

def get_student_dashboard_data(user: User, db: Session) -> Dict[str, Any]:
    # Query user's actual database records
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    resume = db.query(Resume).filter(Resume.user_id == user.id).first()
    github = db.query(GitHubProfile).filter(GitHubProfile.user_id == user.id).first()
    submissions = db.query(CodingSubmission).filter(CodingSubmission.user_id == user.id).order_by(CodingSubmission.submitted_at.desc()).limit(5).all()

    # Calculate real skill confidence
    if skills:
        avg_confidence = round(sum(s.percentage for s in skills) / len(skills))
    else:
        avg_confidence = 0

    # Calculate real career readiness score based on evidence:
    # Skills (30%), Projects (30%), Resume ATS (20%), Coding XP/Submissions (20%)
    readiness_components = []
    if skills:
        readiness_components.append(avg_confidence * 0.3)
    if projects:
        proj_score = min(100, len(projects) * 25)
        readiness_components.append(proj_score * 0.3)
    if resume and resume.ats_score:
        readiness_components.append(resume.ats_score * 0.2)
    if user.learning_xp > 0:
        xp_score = min(100, user.learning_xp / 40)
        readiness_components.append(xp_score * 0.2)

    career_readiness = round(sum(readiness_components)) if readiness_components else 0

    user_initials = "".join([n[0] for n in user.name.split()[:2]]).upper() if user.name else "CO"
    completion_pct = calculate_profile_completion(user, bool(resume), bool(github), len(skills), len(projects))

    # Format skills for frontend
    formatted_skills = [
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
    ]

    # Format recent activity from actual events
    recent_activity = []
    for sub in submissions:
        recent_activity.append({
            "id": sub.id,
            "type": "coding",
            "icon": "💻",
            "title": f"Solved '{sub.challenge_title}'",
            "time": sub.submitted_at.strftime("%b %d, %H:%M") if sub.submitted_at else "Recently",
            "xp": f"+{sub.xp_awarded} XP",
            "tag": "Coding Arena"
        })
    for proj in projects[:2]:
        recent_activity.append({
            "id": f"p-{proj.id}",
            "type": "project",
            "icon": "📦",
            "title": f"Added project '{proj.title}'",
            "time": proj.created_at.strftime("%b %d") if proj.created_at else "Recently",
            "xp": "+150 XP",
            "tag": "Projects"
        })

    return {
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "university": user.university or "",
            "degree": user.degree or "",
            "semester": user.semester or "",
            "department": user.department or "",
            "cgpa": user.cgpa or "",
            "target_role": user.target_role or "",
            "bio": user.bio or "",
            "phone": user.phone or "",
            "location": user.location or "",
            "github_username": user.github_username or (github.username if github else ""),
            "initials": user_initials,
            "profile_completion": completion_pct,
            "resume_name": resume.file_name if resume else None,
            "resume_ats_score": resume.ats_score if resume else None
        },
        "stats": {
            "learning_xp": user.learning_xp or 0,
            "xp_this_week": f"+{min(user.learning_xp, 320)} this week" if user.learning_xp > 0 else "0 XP this week",
            "skill_confidence": f"{avg_confidence}%",
            "skill_subtitle": "Evidence-based profile" if skills else "No skills added yet",
            "career_readiness": f"{career_readiness}%",
            "career_subtitle": f"Target: {user.target_role}" if user.target_role else "Choose a career goal",
            "streak_days": f"{user.streak_days or 0} 🔥",
            "streak_subtitle": "days continuous" if user.streak_days > 0 else "Start a streak today",
            "coding_score": f"{min(100, (len(submissions) * 12))}%" if submissions else "0%",
            "interview_readiness": f"{career_readiness}%",
            "verified_projects": len([p for p in projects if "Verified" in p.verified_status])
        },
        "skills": formatted_skills,
        "journey_steps": [
            {"step": 1, "icon": "📚", "title": "Learn", "desc": "Institution resources + AI Mentor", "progress": "100%"},
            {"step": 2, "icon": "💻", "title": "Practice", "desc": "Coding challenges & weekly viva", "progress": f"{min(100, len(submissions) * 20)}%"},
            {"step": 3, "icon": "🛠️", "title": "Build", "desc": "Projects & GitHub evidence", "progress": f"{min(100, len(projects) * 25)}%"},
            {"step": 4, "icon": "🛡️", "title": "Verify", "desc": "Faculty review & skill assessments", "progress": f"{min(100, len([s for s in skills if s.status == 'Verified']) * 25)}%"},
            {"step": 5, "icon": "🌟", "title": "Showcase", "desc": "Verified Skill Passport for recruiters", "progress": f"{career_readiness}%"},
            {"step": 6, "icon": "🚀", "title": "Get Hired", "desc": "Campus drives & target roles", "progress": f"{max(0, career_readiness - 20)}%"}
        ],
        "recent_activity": recent_activity,
        "ai_recommendations": {
            "headline": f"AI Guidance for {user.target_role}" if user.target_role else "Set Your Career Goal",
            "summary": (
                f"Your target role is {user.target_role}. Keep adding verified project artifacts and solving Coding Arena problems to improve recruiter visibility."
                if user.target_role else
                "Choose a target role in your Profile (e.g. AI/ML Engineer, Full-Stack Developer) to unlock personalized skill gap recommendations."
            )
        }
    }
