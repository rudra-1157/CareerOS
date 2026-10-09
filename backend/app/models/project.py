from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    category = Column(String, default="Full-Stack Dev")
    description = Column(Text, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    github_url = Column(String, nullable=True)
    demo_url = Column(String, nullable=True)
    repo_url = Column(String, nullable=True)
    verified_status = Column(String, default="Pending Review")
    verified_by = Column(String, nullable=True)
    evidence_score = Column(String, default="80/100")
    metrics = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProjectTechnology(Base):
    __tablename__ = "project_technologies"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    technology = Column(String, nullable=False)
