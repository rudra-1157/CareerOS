from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserResponse(UserBase):
    id: int
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    university: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None
    career_goal: Optional[str] = None
    bio: Optional[str] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    interests: Optional[str] = None
