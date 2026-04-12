from fastapi import APIRouter, Depends
from typing import Optional
from app.models.study_plan import GenerateStudyPlanRequest, StudyPlanResponse
from app.core.dependencies import get_guest_id

router = APIRouter()


@router.post("/generate", response_model=StudyPlanResponse)
async def generate_study_plan(
    body: GenerateStudyPlanRequest,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import get_saved_course_by_id, save_study_plan
    from app.services.gemini import generate_study_plan as gemini_plan

    course = await get_saved_course_by_id(body.course_id)
    parsed_syllabus = course.get("syllabus_parsed")
    plan = await gemini_plan(parsed_syllabus, body.weeks_available)
    await save_study_plan(body.course_id, plan)
    return StudyPlanResponse(course_id=body.course_id, plan_content=plan)


@router.get("/{course_id}", response_model=StudyPlanResponse)
async def get_study_plan(course_id: str):
    from app.services.supabase_client import get_study_plan
    plan = await get_study_plan(course_id)
    return StudyPlanResponse(course_id=course_id, plan_content=plan)
