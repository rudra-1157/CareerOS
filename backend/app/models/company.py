from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    logo_emoji = Column(String, nullable=True)
    headquarters = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False, index=True)

    job_listings = relationship("JobListing", back_populates="company", cascade="all, delete-orphan")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    status = Column(String, default="applied")
