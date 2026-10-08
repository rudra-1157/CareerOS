from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.user import User
from app.services.student_service import get_student_dashboard_data

router = APIRouter(prefix="/student", tags=["Student"])

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None
    department: Optional[str] = None
    cgpa: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_student_dashboard_data(current_user, db)

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = get_student_dashboard_data(current_user, db)
    return data["student"]

@router.put("/profile")
def update_profile(req: ProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return {
        "status": "success",
        "message": "Profile updated successfully in database",
        "student": get_student_dashboard_data(current_user, db)["student"]
    }
