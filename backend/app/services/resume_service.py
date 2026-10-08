import httpx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.resume import Resume
from app.models.github import GitHubProfile
from app.models.skill import Skill
from app.models.roadmap import RoadmapTask
from app.ai.gemini_client import gemini_ai

async def sync_github_profile(username: str, user: User, db: Session) -> Dict[str, Any]:
    username = username.strip().lstrip("@")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # 1. Fetch user profile from GitHub API
            user_res = await client.get(f"https://api.github.com/users/{username}", headers={"User-Agent": "CareerOS-Backend"})
            if user_res.status_code == 404:
                raise ValueError(f"GitHub user '{username}' was not found on GitHub.")
            user_data = user_res.json()

            # 2. Fetch public repositories
            repos_res = await client.get(f"https://api.github.com/users/{username}/repos?sort=updated&per_page=10", headers={"User-Agent": "CareerOS-Backend"})
            repos_data = repos_res.json() if repos_res.status_code == 200 else []

            # 3. Calculate statistics
            public_repos = user_data.get("public_repos", len(repos_data))
            total_stars = sum(r.get("stargazers_count", 0) for r in repos_data if isinstance(r, dict))
            
            # Extract language frequency
            lang_counts = {}
            top_repos = []
            for r in repos_data:
                if not isinstance(r, dict):
                    continue
                lang = r.get("language")
                if lang:
                    lang_counts[lang] = lang_counts.get(lang, 0) + 1
                top_repos.append({
                    "name": r.get("name"),
                    "desc": r.get("description") or "No description provided",
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "language": lang or "Other",
                    "url": r.get("html_url")
                })

            total_langs = sum(lang_counts.values()) or 1
            languages_list = [
                {
                    "name": lang,
                    "percentage": round((count / total_langs) * 100),
                    "color": "#3572A5" if "Python" in lang else "#F7DF1E" if "JavaScript" in lang or "TypeScript" in lang else "#F34B7D" if "C++" in lang else "#4f78ff"
                }
                for lang, count in sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ]

            # Compute evidence score
            github_score = min(95, max(30, (public_repos * 4) + (total_stars * 6) + (len(languages_list) * 8)))
            evidence_strength = "High" if github_score >= 75 else "Moderate" if github_score >= 50 else "Developing"

            # Save or update in DB
            gh_record = db.query(GitHubProfile).filter(GitHubProfile.user_id == user.id).first()
            if not gh_record:
                gh_record = GitHubProfile(user_id=user.id, username=username)
                db.add(gh_record)

            gh_record.username = username
            gh_record.avatar_url = user_data.get("avatar_url", "")
            gh_record.bio = user_data.get("bio", "")
            gh_record.public_repos = public_repos
            gh_record.total_stars = total_stars
            gh_record.github_score = github_score
            gh_record.evidence_strength = evidence_strength
            gh_record.languages = languages_list
            gh_record.top_repositories = top_repos[:5]
            
            user.github_username = username
            db.commit()
            db.refresh(gh_record)

            return {
                "username": gh_record.username,
                "avatar_url": gh_record.avatar_url,
                "bio": gh_record.bio,
                "stats": {
                    "public_repos": gh_record.public_repos,
                    "total_stars": gh_record.total_stars,
                    "github_score": gh_record.github_score,
                    "evidence_strength": gh_record.evidence_strength
                },
                "languages": gh_record.languages,
                "top_repositories": gh_record.top_repositories
            }
        except ValueError as ve:
            raise ve
        except Exception as e:
            # If network error or rate limit, save basic username
            gh_record = db.query(GitHubProfile).filter(GitHubProfile.user_id == user.id).first()
            if not gh_record:
                gh_record = GitHubProfile(user_id=user.id, username=username, public_repos=0, total_stars=0, github_score=50)
                db.add(gh_record)
            user.github_username = username
            db.commit()
            return {
                "username": username,
                "stats": {"public_repos": 0, "total_stars": 0, "github_score": 50, "evidence_strength": "Connected"},
                "languages": [],
                "top_repositories": []
            }

def process_resume_analysis(file_name: str, file_text: str, user: User, db: Session) -> Dict[str, Any]:
    analysis = gemini_ai.analyze_resume_text(file_text, user.target_role or "AI/ML Engineer")

    resume_record = db.query(Resume).filter(Resume.user_id == user.id).first()
    if not resume_record:
        resume_record = Resume(user_id=user.id, file_name=file_name)
        db.add(resume_record)

    resume_record.file_name = file_name
    resume_record.ats_score = analysis.get("ats_score", 70)
    resume_record.match_rating = analysis.get("match_rating", "Evaluated")
    resume_record.detected_skills = analysis.get("detected_skills", [])
    resume_record.strengths = analysis.get("strengths", [])
    resume_record.weaknesses = analysis.get("weaknesses", [])
    resume_record.suggestions = analysis.get("suggestions", [])
    resume_record.raw_text = file_text[:3000]

    db.commit()
    db.refresh(resume_record)

    return {
        "file_name": resume_record.file_name,
        "ats_score": resume_record.ats_score,
        "match_rating": resume_record.match_rating,
        "detected_skills": resume_record.detected_skills,
        "strengths": resume_record.strengths,
        "weaknesses": resume_record.weaknesses,
        "suggestions": resume_record.suggestions,
        "uploaded_at": resume_record.uploaded_at.strftime("%b %d, %Y") if resume_record.uploaded_at else "Just now"
    }

def get_career_intelligence(user: User, db: Session) -> Dict[str, Any]:
    skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    resume = db.query(Resume).filter(Resume.user_id == user.id).first()
    github = db.query(GitHubProfile).filter(GitHubProfile.user_id == user.id).first()

    # Dynamic target skill map based on target_role
    target_role = user.target_role or "General Software Engineer"
    
    # Calculate skill gaps from real skills
    skill_map = {s.name.lower(): s.percentage for s in skills}
    
    gaps = []
    if "ai" in target_role.lower() or "ml" in target_role.lower():
        targets = [("Python", 80), ("Machine Learning", 80), ("DSA", 80), ("SQL", 75), ("Deep Learning", 70)]
    elif "full" in target_role.lower() or "web" in target_role.lower():
        targets = [("JavaScript/TypeScript", 80), ("React", 80), ("Node/Backend", 75), ("SQL/DB", 75), ("DSA", 70)]
    elif "cloud" in target_role.lower() or "devops" in target_role.lower():
        targets = [("Linux/OS", 80), ("Docker/K8s", 80), ("CI/CD", 75), ("Cloud (AWS/GCP)", 75), ("Python/Go", 70)]
    else:
        targets = [("Core Programming", 80), ("DSA", 80), ("Database Systems", 75), ("Git & Collaboration", 75)]

    for skill_name, target_score in targets:
        current_score = skill_map.get(skill_name.lower(), 0)
        gap_val = current_score - target_score
        status = "Target Met" if gap_val >= 0 else "High Priority" if gap_val <= -20 else "Medium Priority"
        gaps.append({
            "skill": skill_name,
            "current": current_score,
            "target": target_score,
            "gap": f"{'+' if gap_val >= 0 else ''}{gap_val}%",
            "status": status
        })

    return {
        "target_role": target_role,
        "resume_score": resume.ats_score if resume else None,
        "resume_name": resume.file_name if resume else None,
        "github_score": github.github_score if github else None,
        "github_username": github.username if github else None,
        "skill_gaps": gaps,
        "has_resume": bool(resume),
        "has_github": bool(github),
        "has_skills": bool(skills)
    }
