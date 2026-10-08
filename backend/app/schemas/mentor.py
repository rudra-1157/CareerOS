from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str
    student_id: Optional[int] = 1

class ChatResponse(BaseModel):
    query: str
    response: str
    sources: Optional[List[str]] = []
    rag_enabled: bool = True

class ResourceItem(BaseModel):
    title: str
    count_info: str
    icon: str = "📄"
