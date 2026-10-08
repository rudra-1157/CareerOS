from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, default=1)
    ats_readiness = Column(Integer, default=84)
    resume_skills = Column(String, default="Python, Git, DSA, React")
    github_evidence = Column(String, default="5 Python repos • 2 React repos • Good documentation")
    github_strength = Column(String, default="High")
    gap_priorities = Column(JSON, default=lambda: ["Machine Learning", "DSA", "SQL"])
    roadmap_steps = Column(JSON, default=lambda: [
        {"step": 1, "topic": "DSA", "duration": "4 weeks"},
        {"step": 2, "topic": "Machine Learning", "duration": "6 weeks"},
        {"step": 3, "topic": "SQL", "duration": "3 weeks"},
        {"step": 4, "topic": "ML Project", "duration": "5 weeks"}
    ])
