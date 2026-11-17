from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class LearningResource(Base):
    __tablename__ = "learning_resources"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    type = Column(String, nullable=True)

class LearningActivity(Base):
    __tablename__ = "learning_activities"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    resource_id = Column(Integer, ForeignKey("learning_resources.id"))
    status = Column(String, default="started")
