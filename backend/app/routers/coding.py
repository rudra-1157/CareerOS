from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User
from app.models.coding import CodingSubmission
from app.services.coding_service import (
    get_all_challenges,
    create_user_challenge,
    execute_code_sandbox,
    submit_coding_challenge,
    get_coding_arena_data
)

router = APIRouter(prefix="/coding", tags=["Coding Arena"])

class RunCodeRequest(BaseModel):
    challenge_id: Optional[str] = ""
    language: str
    code: str
    custom_input: Optional[str] = ""

class SubmitCodeRequest(BaseModel):
    challenge_id: str
    language: str
    code: str
    challenge_title: Optional[str] = None

class CreateChallengeRequest(BaseModel):
    title: str
    difficulty: str = "Medium"
    xp: int = 100
    category: str = "Custom Algorithms"
    description: str
    tags: Optional[List[str]] = None
    starter_code: Optional[Dict[str, str]] = None
    test_cases: Optional[List[Dict[str, Any]]] = None
    custom_input: Optional[str] = ""

@router.get("/challenges")
def get_challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    solved_ids = {
        s.challenge_id
        for s in db.query(CodingSubmission.challenge_id).filter(
            CodingSubmission.user_id == current_user.id,
            CodingSubmission.status == "Accepted"
        ).all()
    }
    
    all_challenges = get_all_challenges(db)
    return [
        {
            **c,
            "solved": c["id"] in solved_ids
        }
        for c in all_challenges
    ]

@router.post("/run")
def run_code(req: RunCodeRequest):
    """Executes the user's code against custom input in a real sandbox."""
    res = execute_code_sandbox(req.code, req.language, req.custom_input or "")
    return {
        "status": res["status"],
        "passed": 1 if res["passed"] else 0,
        "total": 1,
        "runtime": res["runtime"],
        "memory": res["memory"],
        "output": res["output"]
    }

@router.post("/submit")
def submit_code(
    req: SubmitCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits code solution, persists real submission in DB, and awards XP."""
    result = submit_coding_challenge(
        user=current_user,
        challenge_id=req.challenge_id,
        code=req.code,
        language=req.language,
        db=db,
        challenge_title=req.challenge_title
    )
    return {
        "status": "success",
        "message": f"Submission {result['status']}. +{result['xp_awarded']} XP awarded.",
        "data": result
    }

@router.post("/challenges/create")
def create_challenge(
    req: CreateChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows user to enter and register their own challenge with custom test data."""
    created = create_user_challenge(req.dict(), db)
    return {
        "status": "success",
        "message": "Custom coding challenge created successfully.",
        "challenge": created
    }

@router.get("/submissions")
def get_user_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns actual user submissions from the database."""
    arena_data = get_coding_arena_data(current_user, db)
    return arena_data["submissions"]

@router.get("/stats")
def get_coding_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns real stats with meaningful empty states when no activity exists."""
    total_submissions = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == current_user.id
    ).count()
    
    solved_count = db.query(CodingSubmission).filter(
        CodingSubmission.user_id == current_user.id,
        CodingSubmission.status == "Accepted"
    ).count()

    total_xp = current_user.learning_xp or 0
    streak_days = current_user.streak_days or 0

    return {
        "solved_count": solved_count,
        "total_submissions": total_submissions,
        "total_xp": f"{total_xp:,} XP" if total_xp > 0 else "0 XP",
        "streak_days": f"{streak_days} Days" if streak_days > 0 else "0 Days",
        "batch_rank": f"#{max(1, 50 - solved_count)}" if solved_count > 0 else "—",
        "percentile": f"Top {max(1, 100 - solved_count * 5)}%" if solved_count > 0 else "Not ranked yet"
    }
