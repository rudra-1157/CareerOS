from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from app.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    title = Column(String, nullable=False)

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"))
    title = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phase_number = Column(Integer, nullable=False, default=1)
    task_title = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
