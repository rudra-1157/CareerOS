from pydantic import BaseModel
from typing import List

class CandidateItem(BaseModel):
    name: str
    python_score: str
    dsa_score: str
    projects_count: int
    readiness: str
    avatar: str

class CompanyDashboardResponse(BaseModel):
    candidates: List[CandidateItem]
    total_candidates: int
