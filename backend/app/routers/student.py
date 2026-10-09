from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User, StudentProfile
from app.schemas.user import StudentProfileUpdate
from app.services.student_service import get_student_dashboard_data

router = APIRouter(prefix="/student", tags=["Student"])

@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    return get_student_dashboard_data(current_user, db)

@router.get("/profile")
def get_profile(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    data = get_student_dashboard_data(current_user, db)
    return data.get("student", {})

@router.put("/profile")
def update_profile(req: StudentProfileUpdate, current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
    
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return {
        "status": "success",
        "message": "Profile updated successfully in database",
        "student": get_student_dashboard_data(current_user, db).get("student", {})
    }
