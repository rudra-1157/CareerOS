from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id = Column(String, nullable=False)
    challenge_title = Column(String, nullable=False)
    language = Column(String, default="python")
    code = Column(Text, nullable=False)
    status = Column(String, default="Accepted")  # Accepted, Wrong Answer, Runtime Error
    runtime = Column(String, default="42 ms")
    memory = Column(String, default="16.4 MB")
    xp_awarded = Column(Integer, default=100)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="submissions")

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Easy")  # Easy, Medium, Hard
    xp = Column(Integer, default=100)
    category = Column(String, default="Algorithms")
    description = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    starter_code = Column(JSON, default=dict)
    test_cases = Column(JSON, default=list)
