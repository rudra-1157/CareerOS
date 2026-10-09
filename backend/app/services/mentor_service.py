import re
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, StudentProfile
from app.models.skill import StudentSkill, Skill
from app.models.project import Project
from app.models.resume import Resume
from app.models.github import GithubProfile
from app.models.coding import CodingSubmission
from app.models.roadmap import RoadmapTask
from app.models.chat import ChatSession, ChatMessage
from app.ai.gemini_client import gemini_ai

PERSONAL_QUERY_PATTERNS = [
    r"\bwhat should i (learn|do|study|focus)\b",
    r"\b(my|for me|about me)\b",
    r"\b(study plan|learning plan|curriculum|roadmap)\b",
    r"\b(my resume|my skills|my projects|my github|my profile)\b",
    r"\b(prepare for|ready for|job ready|placement prep)\b",
    r"\b(how am i doing|am i ready|recommend for me|suggest for me)\b",
    r"\b(skill gap|interview prep for my)\b",
    r"\bhelp me prepare for an? (ai/ml|frontend|backend|full[- ]stack|data science|sde|software) interview\b",
    r"\bwhat to learn next\b",
]

def is_personalized_query(query: str) -> bool:
    """
    Determines whether a user query requires personalized context
    (e.g., 'What should I learn next?' vs generic 'What is recursion?').
    """
    lower = query.lower().strip()
    for pattern in PERSONAL_QUERY_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False

def build_user_context(user: User, db: Session) -> Optional[str]:
    """
    Extracts authentic database records for the student and formats
    a targeted, privacy-respecting context block for the LLM.
    Never fabricates missing data.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    parts = []

    # 1. Academic & Career Goal
    goal = profile.career_goal if profile and profile.career_goal else user.target_role
    degree = profile.degree if profile and profile.degree else user.degree
    semester = profile.semester if profile and profile.semester else user.semester
    
    if goal:
        parts.append(f"Target Career Goal: {goal}")
    if degree:
        parts.append(f"Degree & Program: {degree} ({semester or 'Current'})")

    # 2. Actual Skills from Database
    student_id = profile.id if profile else None
    skills_list = []
    if student_id:
        student_skills = (
            db.query(StudentSkill, Skill)
            .join(Skill, StudentSkill.skill_id == Skill.id)
            .filter(StudentSkill.student_id == student_id)
            .all()
        )
        for ss, s in student_skills:
            skills_list.append(f"{s.name} ({ss.proficiency}%)")
    
    # Also check generic Skill records for user
    user_skills = db.query(Skill).filter(Skill.user_id == user.id).all()
    for us in user_skills:
        skill_str = f"{us.name} ({us.percentage}%)"
        if skill_str not in skills_list:
            skills_list.append(skill_str)

    if skills_list:
        parts.append(f"Current Verified Skills: {', '.join(skills_list[:8])}")
    else:
        parts.append("Skills: No verified skills added yet.")

    # 3. Real Projects
    projects = db.query(Project).filter(
        (Project.user_id == user.id) | (Project.student_id == student_id)
    ).all()
    if projects:
        proj_summaries = [f"'{p.title}' ({', '.join(p.tech_stack or []) if p.tech_stack else 'Software'})" for p in projects[:4]]
        parts.append(f"Portfolio Projects: {', '.join(proj_summaries)}")
    else:
        parts.append("Portfolio Projects: None recorded.")

    # 4. Coding Performance
    submissions = db.query(CodingSubmission).filter(CodingSubmission.user_id == user.id).all()
    solved_count = sum(1 for s in submissions if s.status == "Accepted" or s.passed)
    total_xp = user.learning_xp or 0
    streak = user.streak_days or 0
    parts.append(f"Coding Arena Activity: {solved_count} problems solved ({len(submissions)} attempts), {total_xp} XP, {streak}-day practice streak")

    # 5. Resume Analysis
    resume = db.query(Resume).filter(
        (Resume.user_id == user.id) | (Resume.student_id == student_id)
    ).first()
    if resume and resume.ats_score:
        parts.append(f"Resume ATS Score: {resume.ats_score}% (Match Rating: {resume.match_rating or 'Assessed'})")
        if resume.weaknesses:
            parts.append(f"Resume Areas for Improvement: {'; '.join(resume.weaknesses[:2])}")

    # 6. GitHub Evidence
    github = db.query(GithubProfile).filter(
        (GithubProfile.user_id == user.id) | (GithubProfile.student_id == student_id)
    ).first()
    if github and github.username:
        parts.append(f"GitHub: @{github.username} ({github.public_repos or 0} public repos, Score: {github.github_score or 50})")

    # 7. Roadmap Progress
    roadmap_tasks = db.query(RoadmapTask).filter(RoadmapTask.user_id == user.id).all()
    if roadmap_tasks:
        completed = [t.task_title for t in roadmap_tasks if t.is_completed]
        pending = [t.task_title for t in roadmap_tasks if not t.is_completed]
        if completed:
            parts.append(f"Completed Roadmap Milestones: {', '.join(completed[:3])}")
        if pending:
            parts.append(f"Upcoming Roadmap Milestones: {', '.join(pending[:3])}")

    if not parts:
        return None

    return "=== Authenticated Student Background Context ===\n" + "\n".join(f"- {p}" for p in parts) + "\n================================================"

class MentorService:
    @staticmethod
    def get_sessions(user: User, db: Session) -> List[Dict[str, Any]]:
        sessions = (
            db.query(ChatSession)
            .filter(ChatSession.user_id == user.id)
            .order_by(ChatSession.updated_at.desc(), ChatSession.id.desc())
            .all()
        )
        result = []
        for s in sessions:
            msg_count = db.query(ChatMessage).filter(ChatMessage.session_id == s.id).count()
            # Get last message preview
            last_msg = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == s.id)
                .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
                .first()
            )
            preview = last_msg.content[:60] + "..." if last_msg and len(last_msg.content) > 60 else (last_msg.content if last_msg else "")
            
            result.append({
                "id": s.id,
                "title": s.title or "Conversation",
                "message_count": msg_count,
                "preview": preview,
                "created_at": s.created_at.isoformat() if s.created_at else datetime.utcnow().isoformat(),
                "updated_at": s.updated_at.isoformat() if s.updated_at else datetime.utcnow().isoformat(),
            })
        return result

    @staticmethod
    def create_session(user: User, title: Optional[str], db: Session) -> Dict[str, Any]:
        new_session = ChatSession(
            user_id=user.id,
            title=(title.strip() if title and title.strip() else "New Conversation")
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return {
            "id": new_session.id,
            "title": new_session.title,
            "messages": [],
            "created_at": new_session.created_at.isoformat() if new_session.created_at else datetime.utcnow().isoformat(),
            "updated_at": new_session.updated_at.isoformat() if new_session.updated_at else datetime.utcnow().isoformat(),
        }

    @staticmethod
    def get_session_details(user: User, session_id: int, db: Session) -> Dict[str, Any]:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Chat conversation not found.")

        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
            .all()
        )

        return {
            "id": session.id,
            "title": session.title,
            "messages": [
                {
                    "id": m.id,
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at.isoformat() if m.created_at else datetime.utcnow().isoformat()
                }
                for m in messages
            ],
            "created_at": session.created_at.isoformat() if session.created_at else datetime.utcnow().isoformat(),
            "updated_at": session.updated_at.isoformat() if session.updated_at else datetime.utcnow().isoformat(),
        }

    @staticmethod
    def delete_session(user: User, session_id: int, db: Session) -> Dict[str, Any]:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Chat conversation not found.")

        db.delete(session)
        db.commit()
        return {"status": "success", "message": "Conversation deleted successfully."}

    @staticmethod
    def chat(
        user: User,
        message: str,
        session_id: Optional[int],
        db: Session
    ) -> Dict[str, Any]:
        clean_query = message.strip()
        if not clean_query:
            raise HTTPException(status_code=400, detail="Message cannot be empty.")

        # 1. Error handling: If Gemini API is not configured, do NOT fake responses
        if not gemini_ai.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured."
            )

        # 2. Get or create session
        session = None
        if session_id:
            session = (
                db.query(ChatSession)
                .filter(ChatSession.id == session_id, ChatSession.user_id == user.id)
                .first()
            )
        
        if not session:
            # Generate initial title from query snippet
            init_title = clean_query[:35] + ("..." if len(clean_query) > 35 else "")
            session = ChatSession(user_id=user.id, title=init_title)
            db.add(session)
            db.commit()
            db.refresh(session)

        # 3. Check if user context is relevant
        personalized = is_personalized_query(clean_query)
        user_context = build_user_context(user, db) if personalized else None

        # 4. Fetch previous conversation turns for multi-turn context
        past_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.asc(), ChatMessage.id.asc())
            .limit(16)
            .all()
        )

        chat_turns = []
        for m in past_messages:
            chat_turns.append({
                "role": "user" if m.role == "user" else "assistant",
                "content": m.content
            })

        # Append current user query
        chat_turns.append({
            "role": "user",
            "content": clean_query
        })

        # 5. Build system instructions
        system_instruction = (
            "You are CareerOS AI Learning Mentor, an empathetic, highly knowledgeable, and articulate computer science professor and career advisor. "
            "You answer arbitrary questions across all domains: computer science concepts, algorithm explanations, programming languages (Python, C++, Java, JS, etc.), "
            "system design, database management, code debugging, and tech interview preparation.\n\n"
            "Format your answers using clean, elegant GitHub Markdown:\n"
            "- Use descriptive headings (##, ###) where appropriate.\n"
            "- Format code inside fenced code blocks with language identifiers (e.g. ```python ... ```).\n"
            "- Use bullet points for steps, checklists, and comparisons.\n"
            "- Provide accurate, pedagogical explanations with practical examples.\n"
        )

        if user_context:
            system_instruction += (
                f"\n\nBelow is the verified profile context of the student asking this question. "
                f"Tailor your response specifically to their stated goals, current skills, and progress without asking them to repeat this data:\n"
                f"{user_context}\n"
            )

        # 6. Call real Gemini LLM
        try:
            ai_text = gemini_ai.generate_chat_response(
                messages=chat_turns,
                system_instruction=system_instruction
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error: {str(e)}"
            )

        # 7. Persist user message and AI message to database
        user_msg = ChatMessage(session_id=session.id, role="user", content=clean_query)
        ai_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_text)
        db.add(user_msg)
        db.add(ai_msg)

        # Update session title if still generic
        if session.title in ["New Conversation", "Conversation"] and len(clean_query) > 0:
            session.title = clean_query[:35] + ("..." if len(clean_query) > 35 else "")

        session.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user_msg)
        db.refresh(ai_msg)

        return {
            "session_id": session.id,
            "session_title": session.title,
            "user_message": {
                "id": user_msg.id,
                "role": "user",
                "content": user_msg.content,
                "created_at": user_msg.created_at.isoformat() if user_msg.created_at else datetime.utcnow().isoformat()
            },
            "ai_message": {
                "id": ai_msg.id,
                "role": "assistant",
                "content": ai_msg.content,
                "created_at": ai_msg.created_at.isoformat() if ai_msg.created_at else datetime.utcnow().isoformat()
            },
            "context_used": bool(user_context)
        }

mentor_service = MentorService()
