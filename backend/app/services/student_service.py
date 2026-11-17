from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User, StudentProfile
from app.models.skill import StudentSkill, Skill
from app.models.project import Project
from app.models.resume import Resume, ResumeAnalysis
from app.models.github import GithubProfile
from app.models.coding import CodingSubmission
from datetime import datetime

def calculate_profile_completion(user: User, profile: StudentProfile, has_resume: bool, has_github: bool, skills_count: int, projects_count: int) -> int:
    score = 20  # Base account created
    if user.name and user.email:
        score += 10
    if profile.degree and profile.semester:
        score += 15
    if profile.career_goal:
        score += 15
    if profile.bio:
        score += 10
    if profile.avatar_url or profile.profile_photo:
        score += 5
    if has_resume:
        score += 10
    if has_github:
        score += 10
    if skills_count > 0:
        score += 5
    return min(100, score)

def get_student_dashboard_data(user: User, db: Session) -> Dict[str, Any]:
    # Query user's profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    student_id = profile.id
    # Query user's actual database records
    student_skills = db.query(StudentSkill, Skill).join(Skill).filter(StudentSkill.student_id == student_id).all()
    projects = db.query(Project).filter(Project.student_id == student_id).all()
    resume = db.query(Resume).filter(Resume.student_id == student_id).first()
    resume_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).first() if resume else None
    github = db.query(GithubProfile).filter(GithubProfile.student_id == student_id).first()
    submissions = db.query(CodingSubmission).filter(CodingSubmission.student_id == student_id).limit(10).all()

    # Calculate real skill confidence
    if student_skills:
        avg_confidence = round(sum(ss[0].proficiency for ss in student_skills) / len(student_skills))
    else:
        avg_confidence = 0

    # Calculate real career readiness score based on evidence:
    readiness_components = []
    if student_skills:
        readiness_components.append(avg_confidence * 0.3)
    if projects:
        proj_score = min(100, len(projects) * 25)
        readiness_components.append(proj_score * 0.3)
    if resume_analysis and resume_analysis.score:
        readiness_components.append(resume_analysis.score * 0.2)
    
    learning_xp = user.learning_xp or (len(submissions) * 25 + len(projects) * 50)
    if learning_xp > 0:
        xp_score = min(100, learning_xp / 40)
        readiness_components.append(xp_score * 0.2)

    career_readiness = round(sum(readiness_components)) if readiness_components else 0

    user_initials = "".join([n[0] for n in user.name.split()[:2]]).upper() if user.name else "ST"
    completion_pct = calculate_profile_completion(user, profile, bool(resume), bool(github), len(student_skills), len(projects))

    # Format skills for frontend
    formatted_skills = [
        {
            "id": ss[0].id,
            "name": ss[1].name,
            "category": ss[1].category or "General",
            "percentage": ss[0].proficiency,
            "confidence": f"{ss[0].proficiency}%",
            "evidence": "Coursework & Laboratory",
            "status": "Verified" if ss[0].proficiency >= 70 else "Developing",
            "level": "Advanced" if ss[0].proficiency >= 80 else "Intermediate",
            "verifiedDate": "Verified"
        }
        for ss in student_skills
    ]

    # Format recent activity from actual events
    recent_activity = []
    for sub in submissions[:5]:
        recent_activity.append({
            "id": sub.id,
            "type": "coding",
            "icon": "Code2",
            "title": f"Submission #{sub.id} - {'Passed' if sub.passed else 'Pending'}",
            "time": "Recently",
            "xp": "+25 XP",
            "tag": "Coding Arena"
        })

    for proj in projects[:3]:
        recent_activity.append({
            "id": f"p-{proj.id}",
            "type": "project",
            "icon": "FolderGit2",
            "title": f"Project artifact '{proj.title}'",
            "time": "Recently",
            "xp": "+50 XP",
            "tag": "Projects"
        })

    # Contextual Action Step logic based on real profile completeness
    if not profile.career_goal or profile.career_goal == "Not set":
        action_headline = "Set Your Target Career Goal"
        action_summary = "Select your desired engineering track (Software Engineer, AI/ML Specialist, Full-Stack Dev) to activate personalized curriculum roadmaps."
        action_label = "Configure Target Role"
        action_route = "/profile"
    elif not student_skills:
        action_headline = "Add Foundation Skills to Passport"
        action_summary = "Add programming languages and core CS competencies to build your verified evidence ledger."
        action_label = "Add Core Skills"
        action_route = "/passport"
    elif len(projects) == 0:
        action_headline = "Register Your Capstone Project"
        action_summary = "Add your repository link and architecture description for faculty verification."
        action_label = "Register Project"
        action_route = "/projects"
    elif not resume:
        action_headline = "Upload Resume for ATS Benchmark"
        action_summary = "Benchmark your resume against tech industry criteria and identify missing keywords."
        action_label = "Analyze Resume"
        action_route = "/resume"
    else:
        action_headline = f"Ready for Placement Practice: {profile.career_goal}"
        action_summary = "Your profile and project artifacts are verified. Begin technical and behavioral interview preparation."
        action_label = "Practice Interview"
        action_route = "/interview"

    # Avatar resolution
    avatar_url = profile.avatar_url or profile.profile_photo or user.avatar_url or ""

    return {
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "university": profile.university or "",
            "degree": profile.degree or "",
            "semester": profile.semester or "",
            "department": profile.department or "",
            "target_role": profile.career_goal or "",
            "bio": profile.bio or "",
            "github_username": profile.github_username or (github.username if github else ""),
            "codeforces_handle": getattr(profile, "codeforces_handle", "") or "",
            "linkedin_url": profile.linkedin_url or "",
            "interests": profile.interests or "",
            "initials": user_initials,
            "avatar_url": avatar_url,
            "theme_preference": getattr(profile, "theme_preference", "teal-aqua") or "teal-aqua",
            "profile_completion": completion_pct,
            "resume_name": resume.file_path if resume else None,
            "resume_ats_score": resume_analysis.score if resume_analysis else None
        },
        "stats": {
            "learning_xp": learning_xp,
            "xp_this_week": f"+{learning_xp} this week" if learning_xp > 0 else "0 XP this week",
            "skill_confidence": f"{avg_confidence}%",
            "skill_subtitle": "Evidence-based profile" if student_skills else "No skills added yet",
            "career_readiness": f"{career_readiness}%",
            "career_subtitle": f"Target: {profile.career_goal}" if profile.career_goal else "Choose a career goal",
            "streak_days": str(user.streak_days or 0),
            "streak_subtitle": "days continuous practice",
            "coding_score": f"{min(100, (len(submissions) * 12))}%" if submissions else "0%",
            "interview_readiness": f"{career_readiness}%",
            "verified_projects": len(projects)
        },
        "skills": formatted_skills,
        "journey_steps": [
            {"step": 1, "icon": "BookOpen", "title": "Learn", "desc": "Institution resources & AI Mentor", "progress": "100%"},
            {"step": 2, "icon": "Code2", "title": "Practice", "desc": "Coding challenges & XP tracking", "progress": f"{min(100, len(submissions) * 20)}%"},
            {"step": 3, "icon": "FolderGit2", "title": "Build", "desc": "Projects & GitHub evidence", "progress": f"{min(100, len(projects) * 25)}%"},
            {"step": 4, "icon": "ShieldCheck", "title": "Verify", "desc": "Faculty review & skill assessments", "progress": f"{min(100, len(student_skills) * 25)}%"},
            {"step": 5, "icon": "Award", "title": "Showcase", "desc": "Verified Skill Passport for recruiters", "progress": f"{career_readiness}%"},
            {"step": 6, "icon": "Target", "title": "Get Hired", "desc": "Campus placement drives", "progress": f"{max(0, career_readiness - 15)}%"}
        ],
        "recent_activity": recent_activity,
        "ai_recommendations": {
            "headline": action_headline,
            "summary": action_summary,
            "action_label": action_label,
            "action_route": action_route
        }
    }
