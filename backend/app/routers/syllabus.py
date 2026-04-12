from fastapi import APIRouter, Depends
from typing import Optional
from app.models.study_plan import ParseSyllabusRequest, ParseSyllabusResponse
from app.core.dependencies import get_guest_id

router = APIRouter()


@router.post("/parse", response_model=ParseSyllabusResponse)
async def parse_syllabus(
    body: ParseSyllabusRequest,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.nebula import get_syllabus_text
    from app.services.gemini import parse_syllabus as gemini_parse
    from app.services.supabase_client import update_syllabus_parsed

    raw_text = body.raw_text
    if not raw_text:
        raw_text = await get_syllabus_text(body.course_id)

    parsed = await gemini_parse(raw_text)
    await update_syllabus_parsed(body.course_id, raw_text, parsed)
    return ParseSyllabusResponse(course_id=body.course_id, syllabus_parsed=parsed)


@router.get("/{course_id}", response_model=ParseSyllabusResponse)
async def get_syllabus(course_id: str):
    from app.services.supabase_client import get_saved_course_by_id
    course = await get_saved_course_by_id(course_id)
    return ParseSyllabusResponse(
        course_id=course_id,
        syllabus_parsed=course.get("syllabus_parsed"),
    )
