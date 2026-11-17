from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from app.database import Base

class GithubProfile(Base):
    __tablename__ = "github_profiles"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    public_repos = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_commits = Column(Integer, default=0)
    github_score = Column(Integer, default=50)
    evidence_strength = Column(String, default="Developing")
    languages = Column(JSON, nullable=True)
    top_repositories = Column(JSON, nullable=True)

# Alias for compatibility with routers/services importing GitHubProfile
GitHubProfile = GithubProfile

class GithubRepository(Base):
    __tablename__ = "github_repositories"
    id = Column(Integer, primary_key=True, index=True)
    github_profile_id = Column(Integer, ForeignKey("github_profiles.id"))
    name = Column(String, nullable=False)
    is_private = Column(Boolean, default=False)
    language = Column(String, nullable=True)
