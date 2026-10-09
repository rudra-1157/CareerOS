from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")
    xp = Column(Integer, default=100)
    category = Column(String, default="Algorithms")
    description = Column(Text, nullable=False)
    tags = Column(JSON, nullable=True)
    starter_code = Column(JSON, nullable=True)
    test_cases = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CodingProblem(Base):
    __tablename__ = "coding_problems"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    problem_id = Column(Integer, ForeignKey("coding_problems.id"), nullable=True)
    challenge_id = Column(String, nullable=True)
    challenge_title = Column(String, nullable=True)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    status = Column(String, default="Pending")
    passed = Column(Boolean, default=False)
    runtime = Column(String, nullable=True)
    memory = Column(String, nullable=True)
    xp_awarded = Column(Integer, default=0)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

class CodingTestCase(Base):
    __tablename__ = "coding_test_cases"
    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("coding_problems.id"))
    input_data = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
