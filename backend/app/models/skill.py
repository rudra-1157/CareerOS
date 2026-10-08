from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="Core")
    percentage = Column(Integer, default=0)
    confidence = Column(String, default="0%")
    evidence = Column(String, default="")
    status = Column(String, default="Developing")  # Verified, Developing, Needs Work
    level = Column(String, default="Beginner")     # Beginner, Intermediate, Proficient, Advanced
    verified_by = Column(String, nullable=True)
    verified_date = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="skills")
