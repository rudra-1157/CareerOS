from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base

class Skill(Base):
    """
    Skill model representing a student's technical competency record in the Skill Passport.
    Distinguishes between self-declared skills and independently verified skills.
    """
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False, default="Programming Languages")
    description = Column(Text, nullable=True)
    proficiency_level = Column(String, default="Intermediate")  # Beginner, Elementary, Intermediate, Advanced, Expert
    percentage = Column(Integer, default=50)  # Numeric confidence 0-100
    confidence = Column(String, nullable=True)  # String representation e.g. "75%"
    level = Column(String, nullable=True)  # Backward compatibility alias
    learning_start_date = Column(String, nullable=True)  # e.g. "2024-01-15"
    related_technology = Column(String, nullable=True)  # e.g. "Python 3.12, FastAPI"
    evidence_source = Column(String, nullable=True)  # e.g. "GitHub, Coding Arena"
    supporting_project = Column(String, nullable=True)
    github_repo_url = Column(String, nullable=True)
    learning_notes = Column(Text, nullable=True)
    
    # Verification statuses:
    # 1. Self-Declared
    # 2. Evidence Submitted
    # 3. Pending Review
    # 4. Verified
    # 5. Rejected
    # 6. Needs Improvement
    status = Column(String, default="Self-Declared", nullable=False)
    evidence = Column(String, nullable=True)  # Summary string for backward compatibility

    # Faculty / Admin Attestation details
    verified_date = Column(DateTime(timezone=True), nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_by_name = Column(String, nullable=True)
    verification_comments = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Automated Evaluation Benchmark
    automated_score = Column(Integer, nullable=True)
    automated_evidence_summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    evidences = relationship(
        "SkillEvidence",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="desc(SkillEvidence.submitted_at)"
    )
    verifications = relationship(
        "SkillVerification",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="desc(SkillVerification.verified_at)"
    )
    history = relationship(
        "SkillProgressHistory",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="desc(SkillProgressHistory.created_at)"
    )
    user = relationship("User", foreign_keys=[user_id])


# Alias for explicit naming in services
UserSkill = Skill


class SkillEvidence(Base):
    """
    Independent evidence record supporting a student's skill.
    Supports GitHub Repos, Coding Arena Submissions, Capstone/Personal Projects, Faculty Assessments, External Certs.
    """
    __tablename__ = "skill_evidences"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    evidence_type = Column(String, nullable=False)  # GitHub Repository, Coding Arena Submission, Capstone Project, Personal Project, Faculty Assessment, External Certification
    description = Column(Text, nullable=True)
    external_url = Column(String, nullable=True)
    related_submission_id = Column(Integer, nullable=True)
    related_project_id = Column(Integer, nullable=True)
    review_status = Column(String, default="Submitted")  # Submitted, Under Review, Verified, Rejected
    reviewer_comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    skill = relationship("Skill", back_populates="evidences")
    user = relationship("User", foreign_keys=[user_id])


class SkillVerification(Base):
    """
    Audit record of faculty or administrator verification decisions.
    """
    __tablename__ = "skill_verifications"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_name = Column(String, nullable=False)
    reviewer_role = Column(String, nullable=False)  # FACULTY, ADMINISTRATOR
    action = Column(String, nullable=False)  # APPROVED, REJECTED, NEEDS_IMPROVEMENT
    comments = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), server_default=func.now())

    skill = relationship("Skill", back_populates="verifications")
    reviewer = relationship("User", foreign_keys=[reviewer_id])


class SkillProgressHistory(Base):
    """
    Chronological progress and milestone history for a student's skill.
    Records actual events over time.
    """
    __tablename__ = "skill_progress_history"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False)  # SKILL_CREATED, PROFICIENCY_UPDATED, EVIDENCE_ADDED, EVIDENCE_REMOVED, VERIFICATION_REQUESTED, VERIFIED, REJECTED, NEEDS_IMPROVEMENT
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    previous_proficiency = Column(String, nullable=True)
    new_proficiency = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    skill = relationship("Skill", back_populates="history")
    user = relationship("User", foreign_keys=[user_id])


# Backward-compatibility models
class StudentSkill(Base):
    __tablename__ = "student_skills"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    proficiency = Column(Integer, default=1)


class SkillGap(Base):
    __tablename__ = "skill_gaps"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    reason = Column(String, nullable=True)
