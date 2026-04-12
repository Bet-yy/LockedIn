from pydantic import BaseModel
from typing import Optional, Any, List, Literal
from datetime import datetime


class ParseSyllabusRequest(BaseModel):
    course_id: str
    raw_text: Optional[str] = None  # Manual paste fallback


class ParseSyllabusResponse(BaseModel):
    course_id: str
    syllabus_parsed: Any  # Structured JSON from Gemini


class GenerateStudyPlanRequest(BaseModel):
    course_id: str
    weeks_available: int = 15


class StudyPlanWeek(BaseModel):
    week: int
    topic: str
    daily_tasks: List[str]
    estimated_hours: float


class StudyPlanResponse(BaseModel):
    course_id: str
    plan_content: List[StudyPlanWeek]
    generated_at: Optional[datetime] = None


class GenerateResourcesRequest(BaseModel):
    course_id: str
    topic: Optional[str] = None  # If None, derive from parsed syllabus


class ResourceItem(BaseModel):
    resource_type: Literal["video", "article", "practice"]
    title: str
    url: Optional[str] = None
    description: Optional[str] = None
