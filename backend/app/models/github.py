from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class GitHubProfile(Base):
    __tablename__ = "github_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    username = Column(String, nullable=False)
    avatar_url = Column(String, default="")
    bio = Column(String, default="")
    public_repos = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_commits = Column(Integer, default=0)
    streak = Column(String, default="0 days")
    github_score = Column(Integer, default=0)
    evidence_strength = Column(String, default="Moderate")
    languages = Column(JSON, default=list)        # [{"name": "Python", "percentage": 60, "color": "#3572A5"}]
    top_repositories = Column(JSON, default=list) # [{"name": "repo1", "desc": "...", "stars": 5, "language": "Python"}]
    last_synced_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="github_profile")
