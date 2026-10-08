from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str  # student, faculty, admin

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"
    university: Optional[str] = "National Institute of Technology"
    degree: Optional[str] = "B.Tech CSE"
    semester: Optional[str] = "Semester 3"
    department: Optional[str] = "Computer Science & Engineering"
    target_role: Optional[str] = ""

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
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
    initials: Optional[str] = "CO"
    learning_xp: Optional[int] = 0
    streak_days: Optional[int] = 0

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
