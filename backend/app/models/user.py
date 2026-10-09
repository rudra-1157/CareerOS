from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class Role(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    ADMINISTRATOR = "ADMINISTRATOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default=Role.STUDENT.value)
    is_active = Column(Boolean, default=True)
    learning_xp = Column(Integer, default=0, nullable=True)
    streak_days = Column(Integer, default=0, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", backref="user", cascade="all, delete-orphan")

    @property
    def degree(self):
        return self.student_profile.degree if self.student_profile else None

    @property
    def semester(self):
        return self.student_profile.semester if self.student_profile else None

    @property
    def target_role(self):
        return self.student_profile.career_goal if self.student_profile else None

    @property
    def university(self):
        return self.student_profile.university if self.student_profile else None

    @property
    def github_username(self):
        return self.student_profile.github_username if self.student_profile else None

    @github_username.setter
    def github_username(self, val):
        if self.student_profile:
            self.student_profile.github_username = val

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    profile_photo = Column(String, nullable=True)
    university = Column(String, nullable=True)
    department = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    github_username = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    interests = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String, nullable=True)
    title = Column(String, nullable=True)

    user = relationship("User", back_populates="faculty_profile")

class AdminProfile(Base):
    __tablename__ = "admin_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    level = Column(String, nullable=True)

    user = relationship("User", back_populates="admin_profile")
