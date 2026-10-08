from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.models.coding import CodingSubmission
from app.services.coding_service import CURATED_CHALLENGES, submit_coding_challenge

router = APIRouter(prefix="/coding", tags=["Coding Arena"])

class RunCodeRequest(BaseModel):
    challenge_id: str
    language: str
    code: str

class SubmitCodeRequest(BaseModel):
    challenge_id: str
    language: str
    code: str

@router.get("/challenges")
def get_challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    solved_ids = {
        s.challenge_id
        for s in db.query(CodingSubmission.challenge_id).filter(CodingSubmission.user_id == current_user.id).all()
    }
    
    return [
        {
            "id": c["id"],
            "title": c["title"],
            "difficulty": c["difficulty"],
            "xp": c["xp"],
            "category": c["category"],
            "tags": c["tags"],
            "description": c["description"],
            "starter_code": c["starter_code"],
            "test_cases": c["test_cases"],
            "solved": c["id"] in solved_ids
        }
        for c in CURATED_CHALLENGES
    ]

@router.post("/run")
def run_code(req: RunCodeRequest):
    # Simulated execution against test cases
    return {
        "status": "Passed",
        "passed": 3,
        "total": 3,
        "runtime": "42 ms",
        "memory": "16.4 MB",
        "output": "Test Case 1: Match\nTest Case 2: Match\nTest Case 3: Match\nAll local test cases executed successfully."
    }

@router.post("/submit")
def submit_code(
    req: SubmitCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = submit_coding_challenge(current_user, req.challenge_id, req.code, req.language, db)
    return {
        "status": "success",
        "message": f"Solution accepted! +{result['xp_awarded']} XP awarded.",
        "data": result
    }

@router.get("/stats")
def get_coding_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    solved_count = db.query(CodingSubmission).filter(CodingSubmission.user_id == current_user.id).count()
    return {
        "solved_count": solved_count,
        "total_xp": current_user.learning_xp or 0,
        "streak_days": current_user.streak_days or 0,
        "batch_rank": f"#{max(1, 20 - solved_count)}" if solved_count > 0 else "Unranked",
        "percentile": "Top 8%" if solved_count > 5 else "Getting Started"
    }
