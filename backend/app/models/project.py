from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="Full-Stack Dev")
    description = Column(Text, nullable=False)
    tech_stack = Column(JSON, default=list)  # ["Python", "FastAPI", "React"]
    github_url = Column(String, default="")
    demo_url = Column(String, default="")
    verified_status = Column(String, default="Pending Review")  # Faculty Verified, Peer Reviewed, Pending Review
    verified_by = Column(String, default="")
    evidence_score = Column(String, default="75/100")
    metrics = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="projects")
