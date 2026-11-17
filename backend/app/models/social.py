from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="accepted")  # 'accepted', 'pending', 'blocked'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "friend_id", name="uq_user_friend"),)

class CodingBattle(Base):
    __tablename__ = "coding_battles"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String, unique=True, index=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    challenge_id = Column(String, nullable=True)
    challenge_title = Column(String, nullable=True)
    category = Column(String, default="Algorithms")
    difficulty = Column(String, default="Medium")
    language = Column(String, default="python")
    duration_mins = Column(Integer, default=30)
    status = Column(String, default="lobby")  # 'invitation', 'lobby', 'in_progress', 'completed', 'cancelled'
    creator_ready = Column(Boolean, default=False)
    opponent_ready = Column(Boolean, default=False)
    winner_id = Column(Integer, nullable=True)
    creator_score = Column(Integer, default=0)
    opponent_score = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BattleSubmission(Base):
    __tablename__ = "battle_submissions"

    id = Column(Integer, primary_key=True, index=True)
    battle_id = Column(Integer, ForeignKey("coding_battles.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String, nullable=False)
    tests_passed = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    runtime_ms = Column(Float, default=0.0)
    status = Column(String, default="Submitted")
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
