from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "STUDENT"
    university: Optional[str] = None
    degree: Optional[str] = None
    semester: Optional[str] = None
    career_goal: Optional[str] = None
    department: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
