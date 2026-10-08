from sqlalchemy import Column, Integer, String
from app.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Easy")
    xp_reward = Column(Integer, default=100)
    description = Column(String, default="")
    status = Column(String, default="Active")
