from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.ai.gemini_client import gemini_ai
from app.rag.retriever import rag_retriever

router = APIRouter(prefix="/mentor", tags=["AI Mentor"])

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def ask_mentor(req: ChatRequest, current_user: User = Depends(get_current_user)):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # Retrieve relevant institutional context based on the question
    retrieved_docs = rag_retriever.retrieve(req.query)
    context_str = None
    sources = []

    if retrieved_docs:
        context_str = "\n".join([f"[{d['topic']}]: {d['content']}" for d in retrieved_docs])
        sources = [f"{d['topic']} — {d['title']}" for d in retrieved_docs]

    # Build user context from actual profile
    user_context_parts = []
    if current_user.target_role:
        user_context_parts.append(f"Student's target career goal: {current_user.target_role}")
    if current_user.degree:
        user_context_parts.append(f"Academic program: {current_user.degree} ({current_user.semester or ''})")

    if user_context_parts:
        user_ctx = "Student Profile Context:\n" + "\n".join(user_context_parts)
        context_str = f"{user_ctx}\n\n{context_str}" if context_str else user_ctx

    ai_text = gemini_ai.generate_response(req.query, context=context_str)

    return {
        "query": req.query,
        "response": ai_text,
        "sources": sources,
        "rag_enabled": bool(retrieved_docs),
        "ai_configured": gemini_ai.is_configured()
    }

@router.get("/resources")
def get_institutional_resources(current_user: User = Depends(get_current_user)):
    return {
        "resources": [
            {"id": 1, "title": "Operating Systems", "count": "5 lecture units indexed", "icon": "📄", "category": "Core CS",
             "topics": ["Processes & Threads", "Scheduling Algorithms", "Memory Management", "File Systems", "Deadlocks"]},
            {"id": 2, "title": "Data Structures & Algorithms", "count": "8 modules indexed", "icon": "🧮", "category": "CS Core",
             "topics": ["Arrays & Hashing", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching", "Greedy Algorithms"]},
            {"id": 3, "title": "Database Management Systems", "count": "6 units indexed", "icon": "🗄️", "category": "Databases",
             "topics": ["Normalization & Schema Design", "SQL Queries & Optimization", "Transactions & ACID", "Indexing Strategies"]},
            {"id": 4, "title": "Machine Learning", "count": "7 units indexed", "icon": "🤖", "category": "AI/ML",
             "topics": ["Supervised Learning", "Model Evaluation Metrics", "Neural Networks", "Feature Engineering"]},
            {"id": 5, "title": "System Design", "count": "4 units indexed", "icon": "🏗️", "category": "Architecture",
             "topics": ["Scalability Patterns", "Microservices", "Load Balancing", "CAP Theorem"]}
        ]
    }

@router.get("/ai-status")
def get_ai_status():
    configured = gemini_ai.is_configured()
    return {
        "configured": configured,
        "model": "gemini-2.5-flash",
        "status": "Active" if configured else "API key required",
        "message": (
            "Gemini AI is active and ready for natural language academic conversations."
            if configured
            else "Set GEMINI_API_KEY in your .env file to enable live AI responses."
        )
    }
