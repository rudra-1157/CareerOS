from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime


class JobSkillRequirementOut(BaseModel):
    id: Optional[int] = None
    skill_name: str
    is_mandatory: bool = True
    min_proficiency: Optional[int] = None

    class Config:
        from_attributes = True


class CompanyOut(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo_emoji: Optional[str] = None
    headquarters: Optional[str] = None
    is_demo: bool = False

    class Config:
        from_attributes = True


class EligibilityResult(BaseModel):
    status: str
    eligible: bool
    already_applied: bool
    application_id: Optional[int] = None
    application_status: Optional[str] = None
    reason: str
    mandatory_matched: int
    mandatory_total: int
    optional_matched: int
    optional_total: int
    skill_coverage_pct: int
    matched_skills: List[Dict[str, Any]] = []
    missing_mandatory: List[Dict[str, Any]] = []
    missing_optional: List[Dict[str, Any]] = []
    total_student_skills: int = 0


class JobListingOut(BaseModel):
    id: int
    company_id: int
    company_name: str
    company_industry: Optional[str] = None
    company_logo_emoji: Optional[str] = None
    company_headquarters: Optional[str] = None
    title: str
    domain: str
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    employment_type: str
    work_arrangement: str
    location: Optional[str] = None
    education_requirement: Optional[str] = None
    experience_requirement: Optional[str] = None
    openings: Optional[int] = None
    deadline: Optional[datetime] = None
    is_published: bool
    is_closed: bool
    is_demo: bool
    created_at: Optional[datetime] = None
    skill_requirements: List[JobSkillRequirementOut] = []
    eligibility: Optional[EligibilityResult] = None

    class Config:
        from_attributes = True


class JobApplicationOut(BaseModel):
    id: int
    job_listing_id: int
    job_title: str
    company_name: str
    company_logo_emoji: Optional[str] = None
    domain: str
    employment_type: str
    work_arrangement: str
    location: Optional[str] = None
    is_demo: bool = False
    eligibility_status: str
    mandatory_matched: int
    mandatory_total: int
    skill_coverage_pct: int
    status: str
    withdrawn: bool
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    eligibility_detail: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class StudentJobPreferenceOut(BaseModel):
    preferred_domains: List[str] = []
    preferred_roles: List[str] = []
    preferred_employment_types: List[str] = []
    preferred_work_arrangement: List[str] = []
    preferred_locations: List[str] = []


class StudentJobPreferenceUpdate(BaseModel):
    preferred_domains: Optional[List[str]] = None
    preferred_roles: Optional[List[str]] = None
    preferred_employment_types: Optional[List[str]] = None
    preferred_work_arrangement: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None


class JobListingCreate(BaseModel):
    title: str
    domain: str
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    employment_type: str = "Full-Time"
    work_arrangement: str = "Hybrid"
    location: Optional[str] = None
    education_requirement: Optional[str] = None
    experience_requirement: Optional[str] = None
    openings: Optional[int] = 1
    deadline: Optional[datetime] = None
    mandatory_skills: List[str] = []
    optional_skills: List[str] = []


class ApplicationStatusUpdate(BaseModel):
    status: str  # APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    note: Optional[str] = None
