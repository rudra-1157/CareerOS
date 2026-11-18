from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=True, index=True)
    industry = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    headquarters = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    primary_skills = Column(String, nullable=True)
    preferred_qualifications = Column(String, nullable=True)
    is_demo = Column(Boolean, default=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)  # comma-separated string
    preferred_skills = Column(Text, nullable=True)   # comma-separated string
    eligibility_criteria = Column(String, nullable=True)
    min_cgpa = Column(Float, default=6.5)
    experience_level = Column(String, default="Internship")
    job_type = Column(String, default="Internship")
    location = Column(String, default="Bengaluru, India")
    work_mode = Column(String, default="Hybrid")
    stipend_range = Column(String, default="₹35,000 - ₹50,000 / month")
    deadline = Column(String, default="Rolling Admissions")
    openings = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="Applied")  # Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected
    match_score = Column(Integer, default=0)
    matching_skills = Column(Text, nullable=True)  # JSON or comma-separated
    missing_skills = Column(Text, nullable=True)   # JSON or comma-separated
    resume_name = Column(String, nullable=True)
    cover_letter = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job = relationship("Job", back_populates="applications")
    student = relationship("User")


class SavedJob(Base):
    __tablename__ = "saved_jobs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job")
    user = relationship("User")


class SavedCompany(Base):
    __tablename__ = "saved_companies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    status = Column(String, default="applied")
