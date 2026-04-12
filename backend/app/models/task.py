from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date, datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    course_id: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    completed: Optional[bool] = None
    course_id: Optional[str] = None


class Task(BaseModel):
    id: str
    user_id: Optional[str] = None
    course_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    completed: bool = False
    priority: Optional[Literal["low", "medium", "high"]] = None
    created_at: Optional[datetime] = None
