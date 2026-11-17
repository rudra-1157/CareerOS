from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    xp_reward = Column(Integer, default=0)

class StudentAchievement(Base):
    __tablename__ = "student_achievements"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
