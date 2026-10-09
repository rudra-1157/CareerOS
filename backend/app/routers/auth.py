from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, StudentProfile, FacultyProfile, AdminProfile, Role
from app.schemas.auth import UserLogin, UserRegister, Token
from app.schemas.user import UserResponse
from app.services.auth_service import verify_password, get_password_hash, create_access_token
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

def seed_demo_users_if_needed(db: Session):
    demo_accounts = [
        {
            "name": "Student Demo",
            "email": "student@careeros.edu",
            "password": "password123",
            "role": Role.STUDENT.value,
            "degree": "B.Tech Computer Science",
            "semester": "Semester 3",
            "career_goal": "AI/ML Engineer"
        },
        {
            "name": "Faculty Demo",
            "email": "faculty@careeros.edu",
            "password": "password123",
            "role": Role.FACULTY.value
        },
        {
            "name": "Admin Demo",
            "email": "admin@careeros.edu",
            "password": "password123",
            "role": Role.ADMINISTRATOR.value
        }
    ]
    for acc in demo_accounts:
        existing = db.query(User).filter(func.lower(User.email) == acc["email"].lower()).first()
        if not existing:
            hashed = get_password_hash(acc["password"])
            new_u = User(
                name=acc["name"],
                email=acc["email"].lower(),
                password_hash=hashed,
                role=acc["role"]
            )
            db.add(new_u)
            db.commit()
            db.refresh(new_u)

            if acc["role"] == Role.STUDENT.value:
                prof = StudentProfile(
                    user_id=new_u.id,
                    degree=acc.get("degree"),
                    semester=acc.get("semester"),
                    career_goal=acc.get("career_goal")
                )
                db.add(prof)
            elif acc["role"] == Role.FACULTY.value:
                prof = FacultyProfile(user_id=new_u.id)
                db.add(prof)
            elif acc["role"] == Role.ADMINISTRATOR.value:
                prof = AdminProfile(user_id=new_u.id)
                db.add(prof)
            db.commit()

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    seed_demo_users_if_needed(db)
    return [
        {"role": "student", "email": "student@careeros.edu", "password": "password123", "name": "Student Demo"},
        {"role": "faculty", "email": "faculty@careeros.edu", "password": "password123", "name": "Faculty Demo"},
        {"role": "admin", "email": "admin@careeros.edu", "password": "password123", "name": "Admin Demo"}
    ]

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    db_user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_data.password)
    
    # Normalize role to uppercase enum value
    raw_role = (user_data.role or "STUDENT").strip().upper()
    if raw_role in ["ADMIN", "ADMINISTRATOR"]:
        normalized_role = Role.ADMINISTRATOR.value
    elif raw_role in ["FACULTY", "TEACHER", "PROFESSOR"]:
        normalized_role = Role.FACULTY.value
    else:
        normalized_role = Role.STUDENT.value

    # Create the base user
    new_user = User(
        name=user_data.name.strip(),
        email=clean_email,
        password_hash=hashed_password,
        role=normalized_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create the corresponding profile based on role
    if normalized_role == Role.STUDENT.value:
        profile = StudentProfile(
            user_id=new_user.id,
            university=user_data.university,
            degree=user_data.degree,
            semester=user_data.semester,
            career_goal=user_data.career_goal,
            department=user_data.department
        )
        db.add(profile)
    elif normalized_role == Role.FACULTY.value:
        profile = FacultyProfile(user_id=new_user.id)
        db.add(profile)
    elif normalized_role == Role.ADMINISTRATOR.value:
        profile = AdminProfile(user_id=new_user.id)
        db.add(profile)
        
    db.commit()
    return new_user

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    
    # Auto-seed demo accounts if someone tries to log in with demo account
    if clean_email in ["student@careeros.edu", "faculty@careeros.edu", "admin@careeros.edu"]:
        seed_demo_users_if_needed(db)

    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user.last_login = datetime.utcnow()
    db.commit()
    
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}
