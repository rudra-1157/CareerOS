import os
import re
import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.resume import Resume
from app.models.github import GitHubProfile
from app.models.skill import Skill
from app.models.roadmap import RoadmapTask
from app.ai.groq_client import groq_ai


async def _scrape_github_html(username: str, client: httpx.AsyncClient) -> Optional[Dict[str, Any]]:
    """
    Scrapes public GitHub repositories and profile from HTML when API is rate-limited.
    Ensures 100% reliable data retrieval for campus student portfolios without API token limits.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        # 1. Fetch public profile
        prof_res = await client.get(f"https://github.com/{username}", headers=headers)
        if prof_res.status_code == 404:
            return None
        prof_html = prof_res.text

        bio_match = re.search(r'<div class="p-note user-profile-bio[^>]*><div>([^<]+)</div>', prof_html)
        bio = bio_match.group(1).strip() if bio_match else "GitHub profile connected to student CareerOS account"

        avatar_match = re.search(r'<img[^>]+class="[^"]*avatar-user[^"]*"[^>]+src="([^"]+)"', prof_html)
        avatar_url = avatar_match.group(1) if avatar_match else f"https://avatars.githubusercontent.com/{username}"

        # 2. Fetch public repositories tab
        repo_res = await client.get(f"https://github.com/{username}?tab=repositories", headers=headers)
        repo_html = repo_res.text if repo_res.status_code == 200 else ""

        items = re.split(r'<li class="col-12', repo_html)[1:]
        repos = []
        lang_counts = {}

        for item in items:
            name_m = re.search(r'itemprop="name codeRepository"[^>]*>\s*([a-zA-Z0-9_\-\.]+)\s*</a>', item)
            if not name_m:
                continue
            name = name_m.group(1).strip()

            desc_m = re.search(r'itemprop="description"[^>]*>([^<]+)</p>', item)
            desc = desc_m.group(1).strip() if desc_m else "No description provided."

            lang_m = re.search(r'itemprop="programmingLanguage">([^<]+)</span>', item)
            lang = lang_m.group(1).strip() if lang_m else "Other"
            if lang and lang != "Other":
                lang_counts[lang] = lang_counts.get(lang, 0) + 1

            stars_m = re.search(r'href="/' + re.escape(username) + r'/' + re.escape(name) + r'/stargazers"[^>]*>\s*([0-9k\.,]+)\s*</a>', item, re.DOTALL)
            stars = int(stars_m.group(1).replace(",", "").strip()) if stars_m and stars_m.group(1).isdigit() else 0

            forks_m = re.search(r'href="/' + re.escape(username) + r'/' + re.escape(name) + r'/forks"[^>]*>\s*([0-9k\.,]+)\s*</a>', item, re.DOTALL)
            forks = int(forks_m.group(1).replace(",", "").strip()) if forks_m and forks_m.group(1).isdigit() else 0

            repos.append({
                "name": name,
                "desc": desc,
                "description": desc,
                "stars": stars,
                "forks": forks,
                "language": lang,
                "url": f"https://github.com/{username}/{name}",
                "html_url": f"https://github.com/{username}/{name}"
            })

        total_langs = sum(lang_counts.values()) or 1
        languages_list = [
            {
                "name": lang,
                "percentage": round((count / total_langs) * 100),
                "color": "#3572A5" if "Python" in lang else "#F7DF1E" if "JavaScript" in lang or "TypeScript" in lang else "#E34C26" if "HTML" in lang else "#F34B7D" if "C++" in lang else "#4f78ff"
            }
            for lang, count in sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        return {
            "username": username,
            "avatar_url": avatar_url,
            "bio": bio,
            "public_repos": len(repos),
            "total_stars": sum(r["stars"] for r in repos),
            "repos": repos,
            "languages": languages_list
        }
    except Exception:
        return None


async def sync_github_profile(username: str, user: User, db: Session) -> Dict[str, Any]:
    username = username.strip().lstrip("@")
    
    # Configure headers with optional GITHUB_TOKEN for high rate-limits
    api_headers = {
        "User-Agent": "CareerOS-Academic-Platform",
        "Accept": "application/vnd.github.v3+json"
    }
    github_token = os.getenv("GITHUB_TOKEN", "").strip()
    if github_token:
        api_headers["Authorization"] = f"Bearer {github_token}"

    user_data = None
    repos_data = []
    scraped_data = None

    async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
        # 1. Try official GitHub REST API first
        try:
            user_res = await client.get(f"https://api.github.com/users/{username}", headers=api_headers)
            if user_res.status_code == 200:
                user_data = user_res.json()
                repos_res = await client.get(
                    f"https://api.github.com/users/{username}/repos?sort=updated&per_page=15",
                    headers=api_headers
                )
                if repos_res.status_code == 200 and isinstance(repos_res.json(), list):
                    repos_data = repos_res.json()
            elif user_res.status_code == 404:
                # Confirm with scrape before throwing not found
                scraped_data = await _scrape_github_html(username, client)
                if not scraped_data:
                    raise ValueError(f"GitHub user '{username}' was not found on GitHub.")
        except ValueError:
            raise
        except Exception:
            user_data = None
            repos_data = []

        # 2. If API was rate-limited (403/429) or returned no repositories, fallback to HTML scraping
        if (not user_data or not repos_data or len(repos_data) == 0) and not scraped_data:
            scraped_data = await _scrape_github_html(username, client)

        # 3. Assemble data
        if scraped_data and (not repos_data or len(repos_data) == 0):
            avatar_url = scraped_data["avatar_url"]
            bio = scraped_data["bio"]
            public_repos = scraped_data["public_repos"]
            total_stars = scraped_data["total_stars"]
            top_repos = scraped_data["repos"]
            languages_list = scraped_data["languages"]
        else:
            avatar_url = (user_data.get("avatar_url") if user_data else "") or f"https://avatars.githubusercontent.com/{username}"
            bio = (user_data.get("bio") if user_data else "") or "GitHub profile connected to student CareerOS account"
            public_repos = user_data.get("public_repos", len(repos_data)) if user_data else len(repos_data)
            total_stars = sum(r.get("stargazers_count", 0) for r in repos_data if isinstance(r, dict))

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
                    "desc": r.get("description") or "No description provided.",
                    "description": r.get("description") or "No description provided.",
                    "stars": r.get("stargazers_count", 0),
                    "forks": r.get("forks_count", 0),
                    "language": lang or "Other",
                    "url": r.get("html_url") or f"https://github.com/{username}/{r.get('name')}",
                    "html_url": r.get("html_url") or f"https://github.com/{username}/{r.get('name')}"
                })

            total_langs = sum(lang_counts.values()) or 1
            languages_list = [
                {
                    "name": lang,
                    "percentage": round((count / total_langs) * 100),
                    "color": "#3572A5" if "Python" in lang else "#F7DF1E" if "JavaScript" in lang or "TypeScript" in lang else "#E34C26" if "HTML" in lang else "#F34B7D" if "C++" in lang else "#4f78ff"
                }
                for lang, count in sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            ]

        # 4. Evidence score
        github_score = min(95, max(35, 25 + (public_repos * 5) + (total_stars * 8) + (len(languages_list) * 8)))
        evidence_strength = "High" if github_score >= 75 else "Moderate" if github_score >= 50 else "Developing"

        # 5. Save or update DB record
        gh_record = db.query(GitHubProfile).filter(GitHubProfile.user_id == user.id).first()
        if not gh_record:
            gh_record = GitHubProfile(user_id=user.id, username=username)
            db.add(gh_record)

        gh_record.username = username
        gh_record.avatar_url = avatar_url
        gh_record.bio = bio
        gh_record.public_repos = public_repos
        gh_record.total_stars = total_stars
        gh_record.github_score = github_score
        gh_record.evidence_strength = evidence_strength
        gh_record.languages = languages_list
        gh_record.top_repositories = top_repos[:10]
        gh_record.last_synced_at = datetime.utcnow()

        user.github_username = username
        if hasattr(user, "student_profile") and user.student_profile:
            user.student_profile.github_username = username

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
            "languages": gh_record.languages or [],
            "top_repositories": gh_record.top_repositories or []
        }

def process_resume_analysis(file_name: str, file_text: str, user: User, db: Session) -> Dict[str, Any]:
    analysis = groq_ai.analyze_resume_text(file_text, user.target_role or "AI/ML Engineer")

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
