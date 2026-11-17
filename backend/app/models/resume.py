from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    file_name = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    parsed_content = Column(Text, nullable=True)
    raw_text = Column(Text, nullable=True)
    ats_score = Column(Integer, nullable=True)
    match_rating = Column(String, nullable=True)
    detected_skills = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
