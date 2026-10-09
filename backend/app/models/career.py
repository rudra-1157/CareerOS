from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class CareerGoal(Base):
    __tablename__ = "career_goals"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
