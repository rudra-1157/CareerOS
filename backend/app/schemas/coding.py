from pydantic import BaseModel
from typing import Optional

class ChallengeResponse(BaseModel):
    id: int
    title: str
    difficulty: str
    xp_reward: int
    description: str

class CodingStatsResponse(BaseModel):
    todays_challenge: ChallengeResponse
    weekly_rank: str
    rank_percentile: str
    friend_vs: str
    friend_status: str
    problems_solved: int
    solved_this_month: int
