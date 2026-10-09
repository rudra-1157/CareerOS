from sqlalchemy import (
    Column, Integer, String, ForeignKey, Text, Boolean, DateTime, JSON, UniqueConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class JobListing(Base):
    """A job listing posted by a company (demo or verified)."""
    __tablename__ = "job_listings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    # Core Fields
    title = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)          # e.g. "AI/ML"
    description = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    employment_type = Column(String, default="Internship")        # Internship / Full-Time / Contract
    work_arrangement = Column(String, default="Hybrid")           # Remote / Hybrid / On-Site
    location = Column(String, nullable=True)

    # Requirements
    education_requirement = Column(String, nullable=True)         # e.g. "B.Tech/B.E. in CS"
    experience_requirement = Column(String, nullable=True)        # e.g. "0-1 years"
    openings = Column(Integer, nullable=True)

    # Lifecycle
    deadline = Column(DateTime(timezone=True), nullable=True)
    is_published = Column(Boolean, default=True)
    is_closed = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False, index=True)          # True = demo listing, not a real vacancy

    # Metadata
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null for demo listings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="job_listings")
    skill_requirements = relationship("JobSkillRequirement", back_populates="job_listing", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job_listing", cascade="all, delete-orphan")


class JobSkillRequirement(Base):
    """A skill required or preferred for a specific job listing."""
    __tablename__ = "job_skill_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_listing_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)

    skill_name = Column(String, nullable=False)           # e.g. "Python"
    is_mandatory = Column(Boolean, default=True)          # True = required; False = preferred/optional
    min_proficiency = Column(Integer, nullable=True)      # 0-100, null means no minimum

    job_listing = relationship("JobListing", back_populates="skill_requirements")

    __table_args__ = (
        UniqueConstraint("job_listing_id", "skill_name", "is_mandatory", name="uq_job_skill"),
    )


class JobApplication(Base):
    """A student's application to a job listing."""
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_listing_id = Column(Integer, ForeignKey("job_listings.id"), nullable=False)
    student_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Eligibility snapshot at application time
    eligibility_status = Column(String, nullable=False)   # ELIGIBLE, NOT_ELIGIBLE, etc.
    mandatory_matched = Column(Integer, default=0)
    mandatory_total = Column(Integer, default=0)
    skill_coverage_pct = Column(Integer, default=0)
    eligibility_detail = Column(JSON, nullable=True)      # Full breakdown stored as JSON

    # Application status (company-controlled)
    status = Column(String, default="APPLIED")            # APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → SELECTED / REJECTED
    status_history = Column(JSON, nullable=True)          # [{status, timestamp, note}]

    withdrawn = Column(Boolean, default=False)

    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    job_listing = relationship("JobListing", back_populates="applications")

    __table_args__ = (
        UniqueConstraint("job_listing_id", "student_user_id", name="uq_student_job_application"),
    )


class StudentJobPreference(Base):
    """A student's job discovery preferences (domains, roles, work type, etc.)."""
    __tablename__ = "student_job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    preferred_domains = Column(JSON, nullable=True)       # ["AI/ML", "Data Science"]
    preferred_roles = Column(JSON, nullable=True)         # ["ML Intern", "Data Analyst"]
    preferred_employment_types = Column(JSON, nullable=True)  # ["Internship", "Full-Time"]
    preferred_work_arrangement = Column(JSON, nullable=True)  # ["Remote", "Hybrid"]
    preferred_locations = Column(JSON, nullable=True)     # ["Bangalore", "Remote"]

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
