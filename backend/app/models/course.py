from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class CourseSearchResult(BaseModel):
    nebula_course_id: str
    course_name: str
    course_number: str
    professor: Optional[str] = None
    semester: Optional[str] = None
    syllabus_url: Optional[str] = None


class SaveCourseRequest(BaseModel):
    nebula_course_id: str
    course_name: str
    course_number: str
    professor: Optional[str] = None
    semester: Optional[str] = None
    syllabus_url: Optional[str] = None


class UpdateCourseRequest(BaseModel):
    course_name: Optional[str] = None
    course_number: Optional[str] = None
    professor: Optional[str] = None
    semester: Optional[str] = None


class SavedCourse(BaseModel):
    id: str
    nebula_course_id: str
    course_name: str
    course_number: str
    professor: Optional[str] = None
    semester: Optional[str] = None
    syllabus_raw: Optional[str] = None
    syllabus_parsed: Optional[Any] = None
    created_at: Optional[datetime] = None
