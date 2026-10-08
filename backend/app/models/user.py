from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # student, faculty, admin
    
    # Profile information
    university = Column(String, default="National Institute of Technology")
    degree = Column(String, default="")
    semester = Column(String, default="")
    department = Column(String, default="Computer Science & Engineering")
    cgpa = Column(String, default="")
    target_role = Column(String, default="")
    bio = Column(Text, default="")
    phone = Column(String, default="")
    location = Column(String, default="")
    github_username = Column(String, default="")
    linkedin_url = Column(String, default="")
    portfolio_url = Column(String, default="")
    
    # Real metrics (computed from activity)
    learning_xp = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    resume = relationship("Resume", back_populates="user", uselist=False, cascade="all, delete-orphan")
    github_profile = relationship("GitHubProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete-orphan")
    roadmap_tasks = relationship("RoadmapTask", back_populates="user", cascade="all, delete-orphan")
