from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.study_plan import GenerateResourcesRequest, ResourceItem
from app.core.dependencies import get_guest_id

router = APIRouter()


@router.post("/generate", response_model=List[ResourceItem])
async def generate_resources(
    body: GenerateResourcesRequest,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import get_saved_course_by_id, save_resources
    from app.services.gemini import generate_resources as gemini_resources

    course = await get_saved_course_by_id(body.course_id)
    topic = body.topic or course.get("course_name", "")
    resources = await gemini_resources(topic, course.get("course_name", ""))
    await save_resources(body.course_id, resources)
    return resources


@router.get("/{course_id}", response_model=List[ResourceItem])
async def get_resources(course_id: str):
    from app.services.supabase_client import get_resources
    return await get_resources(course_id)
