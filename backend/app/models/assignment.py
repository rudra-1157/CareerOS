from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.database import Base

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    content = Column(Text, nullable=False)
    grade = Column(String, nullable=True)
