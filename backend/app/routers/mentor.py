from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.mentor_service import mentor_service
from app.ai.gemini_client import gemini_ai

router = APIRouter(prefix="/mentor", tags=["AI Mentor"])

class ChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None  # Compatibility alias
    session_id: Optional[int] = None

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Conversation"

@router.get("/status")
@router.get("/ai-status")
def get_ai_status():
    configured = gemini_ai.is_configured()
    return {
        "configured": configured,
        "model": "gemini-2.5-flash",
        "status": "Active" if configured else "Not Configured",
        "message": (
            "Gemini AI Mentor is active and ready for live conversational guidance."
            if configured
            else "AI service is not configured. Set GEMINI_API_KEY in backend/.env to enable live AI responses."
        )
    }

@router.get("/sessions")
def list_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all conversations for the authenticated user."""
    return mentor_service.get_sessions(current_user, db)

@router.post("/sessions")
def create_chat_session(
    req: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat conversation."""
    return mentor_service.create_session(current_user, req.title, db)

@router.get("/sessions/{session_id}")
def get_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve messages for a specific conversation."""
    return mentor_service.get_session_details(current_user, session_id, db)

@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation and all its messages."""
    return mentor_service.delete_session(current_user, session_id, db)

@router.post("/chat")
def ask_mentor(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the AI Mentor.
    If GEMINI_API_KEY is missing, returns HTTP 503 stating 'AI service is not configured.'
    """
    query_text = (req.message or req.query or "").strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query or message cannot be empty.")

    return mentor_service.chat(
        user=current_user,
        message=query_text,
        session_id=req.session_id,
        db=db
    )

@router.get("/resources")
def get_institutional_resources(current_user: User = Depends(get_current_user)):
    return {
        "resources": [
            {
                "id": 1, "title": "Operating Systems", "count": "5 lecture units indexed", "icon": "📄", "category": "Core CS",
                "topics": ["Processes & Threads", "CPU Scheduling", "Memory Management", "File Systems", "Deadlocks"]
            },
            {
                "id": 2, "title": "Data Structures & Algorithms", "count": "8 modules indexed", "icon": "🧮", "category": "CS Core",
                "topics": ["Arrays & Hashing", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching", "Recursion & Backtracking"]
            },
            {
                "id": 3, "title": "Database Management Systems", "count": "6 units indexed", "icon": "🗄️", "category": "Databases",
                "topics": ["Normalization & Schema Design", "SQL Queries & Optimization", "Transactions & ACID", "Indexing Strategies"]
            },
            {
                "id": 4, "title": "Machine Learning & AI", "count": "7 units indexed", "icon": "🤖", "category": "AI/ML",
                "topics": ["Supervised Learning", "Evaluation Metrics", "Neural Networks", "Feature Engineering", "Transformers"]
            },
            {
                "id": 5, "title": "System Design & Architecture", "count": "4 units indexed", "icon": "🏗️", "category": "Architecture",
                "topics": ["Scalability Patterns", "Microservices", "Load Balancing", "CAP Theorem", "Caching & CDNs"]
            }
        ]
    }
