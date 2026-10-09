from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    score = Column(Integer, nullable=False)
