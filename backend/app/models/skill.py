from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=True)
    percentage = Column(Integer, default=50)
    status = Column(String, default="Developing")
    evidence = Column(String, nullable=True)

class StudentSkill(Base):
    __tablename__ = "student_skills"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    proficiency = Column(Integer, default=1) # e.g. 1-100

class SkillGap(Base):
    __tablename__ = "skill_gaps"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    skill_id = Column(Integer, ForeignKey("skills.id"))
    reason = Column(String, nullable=True)
