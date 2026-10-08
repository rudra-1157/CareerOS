from pydantic import BaseModel
from typing import List, Optional

class SkillBase(BaseModel):
    name: str
    progress_percentage: int
    confidence: str
    evidence: str
    status: str

class SkillResponse(SkillBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class StudentStats(BaseModel):
    learning_xp: int
    xp_this_week: int
    skill_confidence: int
    career_readiness: int
    streak_days: int
    target_role: str

class StudentProfileResponse(BaseModel):
    name: str
    degree: str
    semester: str
    target_role: str
    stats: StudentStats
    skills: List[SkillBase]
