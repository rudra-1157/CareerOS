from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import authenticate_user, register_user, DEMO_USERS
from app.utils.auth import get_current_user
from app.models.user import User

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(req, db)

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(req, db)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    user_initials = "".join([n[0] for n in current_user.name.split()[:2]]).upper() if current_user.name else "CO"
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        university=current_user.university,
        degree=current_user.degree,
        semester=current_user.semester,
        department=current_user.department,
        cgpa=current_user.cgpa,
        target_role=current_user.target_role,
        bio=current_user.bio,
        phone=current_user.phone,
        location=current_user.location,
        github_username=current_user.github_username,
        initials=user_initials,
        learning_xp=current_user.learning_xp or 0,
        streak_days=current_user.streak_days or 0
    )

@router.get("/demo-users")
def get_demo_users():
    return [
        {
            "role": u["role"],
            "email": u["email"],
            "name": u["name"],
            "password": u["raw_password"],
            "title": f"{u['name']} ({u['role'].capitalize()})"
        }
        for u in DEMO_USERS
    ]
