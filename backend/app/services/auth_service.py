from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from fastapi import HTTPException, status

DEMO_USERS = [
    {
        "id": 1,
        "email": "student@careeros.edu",
        "raw_password": "password123",
        "name": "Rudra Padhy",
        "role": "student",
        "degree": "B.Tech CSE",
        "semester": "Semester 3",
        "department": "Computer Science & Engineering",
        "target_role": "AI/ML Engineer",
        "learning_xp": 4250,
        "streak_days": 12
    },
    {
        "id": 2,
        "email": "faculty@careeros.edu",
        "raw_password": "password123",
        "name": "Dr. Arvind Sharma",
        "role": "faculty",
        "degree": "Professor & HOD",
        "semester": "Faculty Lead",
        "department": "Department of CSE",
        "target_role": "Academic Mentor",
        "learning_xp": 9800,
        "streak_days": 45
    },
    {
        "id": 3,
        "email": "admin@careeros.edu",
        "raw_password": "password123",
        "name": "Dr. Neha Varma",
        "role": "admin",
        "degree": "Dean of Academic & Career Systems",
        "semester": "Administration",
        "department": "Institutional Directorate",
        "target_role": "System Administrator",
        "learning_xp": 12500,
        "streak_days": 90
    }
]

def init_demo_users(db: Session):
    for du in DEMO_USERS:
        existing = db.query(User).filter(User.email == du["email"]).first()
        if not existing:
            new_user = User(
                id=du["id"],
                email=du["email"],
                hashed_password=get_password_hash(du["raw_password"]),
                name=du["name"],
                role=du["role"],
                degree=du["degree"],
                semester=du["semester"],
                department=du["department"],
                target_role=du["target_role"],
                learning_xp=du["learning_xp"],
                streak_days=du["streak_days"]
            )
            db.add(new_user)
    try:
        db.commit()
    except Exception:
        db.rollback()

def register_user(req: RegisterRequest, db: Session) -> TokenResponse:
    # Check if email already exists
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user with 0 XP and clean profile
    new_user = User(
        name=req.name.strip(),
        email=req.email.strip().lower(),
        hashed_password=get_password_hash(req.password),
        role=req.role.strip().lower(),
        university=req.university or "National Institute of Technology",
        degree=req.degree or "",
        semester=req.semester or "",
        department=req.department or "Computer Science & Engineering",
        target_role=req.target_role or "",
        learning_xp=0,
        streak_days=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    user_initials = "".join([n[0] for n in new_user.name.split()[:2]]).upper() if new_user.name else "CO"

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=new_user.role,
            university=new_user.university,
            degree=new_user.degree,
            semester=new_user.semester,
            department=new_user.department,
            cgpa=new_user.cgpa,
            target_role=new_user.target_role,
            bio=new_user.bio,
            phone=new_user.phone,
            location=new_user.location,
            github_username=new_user.github_username,
            initials=user_initials,
            learning_xp=new_user.learning_xp,
            streak_days=new_user.streak_days
        )
    )

def authenticate_user(req: LoginRequest, db: Session) -> TokenResponse:
    # Find user by email
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user found with this email."
        )
    
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please verify your credentials."
        )

    if user.role != req.role.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"This account is registered as '{user.role}', not '{req.role}'."
        )

    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    user_initials = "".join([n[0] for n in user.name.split()[:2]]).upper() if user.name else "CO"

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            university=user.university,
            degree=user.degree,
            semester=user.semester,
            department=user.department,
            cgpa=user.cgpa,
            target_role=user.target_role,
            bio=user.bio,
            phone=user.phone,
            location=user.location,
            github_username=user.github_username,
            initials=user_initials,
            learning_xp=user.learning_xp or 0,
            streak_days=user.streak_days or 0
        )
    )
