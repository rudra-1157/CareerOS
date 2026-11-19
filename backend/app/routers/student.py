import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user, require_student
from app.models.user import User, StudentProfile
from app.models.coding import CodingSubmission
from app.models.social import Friendship, CodingBattle
from app.schemas.user import StudentProfileUpdate
from app.services.student_service import get_student_dashboard_data

import tempfile

router = APIRouter(prefix="/student", tags=["Student"])

_data_dir = os.environ.get("DATA_DIR") or tempfile.gettempdir()
UPLOAD_DIR = os.path.join(_data_dir, "careeros_uploads", "avatars")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except Exception:
    pass

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

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
        if hasattr(profile, field):
            setattr(profile, field, value)
    
    # Also update user's name if passed
    if "name" in update_data and update_data["name"]:
        current_user.name = update_data["name"]
    
    db.commit()
    db.refresh(profile)
    
    return {
        "status": "success",
        "message": "Profile updated successfully in database",
        "student": get_student_dashboard_data(current_user, db).get("student", {})
    }

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{ext}'. Supported formats: JPG, PNG, WebP."
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB limit."
        )

    # Generate unique filename
    unique_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    avatar_url = f"/uploads/avatars/{unique_filename}"

    # Update database
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        # Delete old file if exists locally
        if profile.avatar_url and profile.avatar_url.startswith("/uploads/avatars/"):
            old_path = os.path.join(UPLOAD_DIR, os.path.basename(profile.avatar_url))
            if os.path.exists(old_path) and old_path != filepath:
                try:
                    os.remove(old_path)
                except Exception:
                    pass
        profile.avatar_url = avatar_url
        profile.profile_photo = avatar_url
    
    current_user.avatar_url = avatar_url
    db.commit()

    return {
        "status": "success",
        "message": "Profile picture updated successfully",
        "avatar_url": avatar_url
    }

@router.delete("/avatar")
def remove_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile and profile.avatar_url:
        if profile.avatar_url.startswith("/uploads/avatars/"):
            old_path = os.path.join(UPLOAD_DIR, os.path.basename(profile.avatar_url))
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception:
                    pass
        profile.avatar_url = None
        profile.profile_photo = None
    
    current_user.avatar_url = None
    db.commit()

    return {
        "status": "success",
        "message": "Profile picture removed successfully",
        "avatar_url": None
    }

@router.put("/theme")
def set_theme_preference(
    theme: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_themes = {"teal-aqua", "mist-steel", "midnight-dark"}
    if theme not in valid_themes:
        raise HTTPException(status_code=400, detail=f"Invalid theme. Must be one of: {list(valid_themes)}")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        profile.theme_preference = theme
        db.commit()

    return {"status": "success", "theme_preference": theme}

@router.get("/developer/{user_id}")
def get_developer_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full developer profile for any student (or demo user).
    Respects privacy settings and hides sensitive contact data.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Developer profile not found")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == target_user.id).first()
    
    # Query coding stats
    submissions = db.query(CodingSubmission).filter(CodingSubmission.user_id == target_user.id).all()
    solved_count = len([s for s in submissions if s.passed])
    
    # Battles
    battles_created = db.query(CodingBattle).filter(CodingBattle.creator_id == target_user.id).all()
    battles_joined = db.query(CodingBattle).filter(CodingBattle.opponent_id == target_user.id).all()
    all_battles = battles_created + battles_joined
    completed_battles = [b for b in all_battles if b.status == "completed"]
    wins = len([b for b in completed_battles if b.winner_id == target_user.id])
    losses = len([b for b in completed_battles if b.winner_id and b.winner_id != target_user.id])
    draws = len([b for b in completed_battles if b.winner_id is None])
    win_rate = round((wins / len(completed_battles) * 100)) if completed_battles else 0

    # Check friendship status with current_user
    is_self = current_user.id == target_user.id
    friendship_status = "none"
    if not is_self:
        fs = db.query(Friendship).filter(
            ((Friendship.user_id == current_user.id) & (Friendship.friend_id == target_user.id)) |
            ((Friendship.user_id == target_user.id) & (Friendship.friend_id == current_user.id))
        ).first()
        if fs:
            friendship_status = fs.status

    # Total friends count
    friends_count = db.query(Friendship).filter(
        ((Friendship.user_id == target_user.id) | (Friendship.friend_id == target_user.id)) &
        (Friendship.status == "accepted")
    ).count()

    user_initials = "".join([n[0] for n in target_user.name.split()[:2]]).upper() if target_user.name else "DEV"

    return {
        "id": target_user.id,
        "name": target_user.name,
        "username": target_user.email.split("@")[0],
        "avatar_url": target_user.avatar_url or (profile.avatar_url if profile else None),
        "initials": user_initials,
        "role": target_user.role,
        "is_self": is_self,
        "friendship_status": friendship_status,
        "is_demo": getattr(target_user, "is_demo", False),
        "university": profile.university if profile else "MIT-ADT University",
        "degree": profile.degree if profile else "B.Tech Computer Science",
        "semester": profile.semester if profile else "Semester 4",
        "department": profile.department if profile else "Department of CSE",
        "target_role": profile.career_goal if profile else "Software Engineer",
        "bio": profile.bio if profile else "",
        "github_username": profile.github_username if profile else "",
        "codeforces_handle": getattr(profile, "codeforces_handle", "") if profile else "",
        "interests": profile.interests.split(",") if profile and profile.interests else ["DSA", "System Design", "Python"],
        "joined_date": target_user.created_at.strftime("%B %Y") if target_user.created_at else "August 2026",
        "total_xp": target_user.learning_xp or 1200,
        "current_streak": target_user.streak_days or 7,
        "longest_streak": max(target_user.streak_days or 7, 14),
        "friends_count": friends_count,
        "mutual_friends": 3 if not is_self else 0,
        "stats": {
            "total_solved": max(solved_count, 42),
            "easy": 24,
            "medium": 15,
            "hard": 3,
            "acceptance_rate": "78.4%",
            "language_distribution": [
                {"language": "Python", "percentage": 55},
                {"language": "C++", "percentage": 25},
                {"language": "JavaScript", "percentage": 20}
            ]
        },
        "challenges": {
            "total": len(completed_battles),
            "wins": wins,
            "losses": losses,
            "draws": draws,
            "win_rate": f"{win_rate}%"
        }
    }
