from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.models.course import CourseSearchResult, SaveCourseRequest, SavedCourse, UpdateCourseRequest
from app.core.dependencies import get_guest_id

router = APIRouter()


@router.get("/search", response_model=List[CourseSearchResult])
async def search_courses(
    q: str = Query(..., description="Course name or number, e.g. 'CS 3345'"),
    semester: Optional[str] = Query(default=None, description="e.g. '24F'"),
):
    from app.services.nebula import search_courses as nebula_search
    return await nebula_search(q, semester)


@router.get("/saved", response_model=List[SavedCourse])
async def get_saved_courses(guest_id: Optional[str] = Depends(get_guest_id)):
    from app.services.supabase_client import get_saved_courses
    return await get_saved_courses(guest_id)


@router.post("/save", response_model=SavedCourse)
async def save_course(
    body: SaveCourseRequest,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    # Enrich with professor name if missing (skipped during fast search)
    if not body.professor and body.nebula_course_id:
        try:
            from app.services.nebula import _get_sections_for_course, _resolve_professor_from_sections
            sections = await _get_sections_for_course(body.nebula_course_id)
            professor = await _resolve_professor_from_sections(sections)
            if professor:
                body = body.model_copy(update={"professor": professor})
        except Exception:
            pass

    from app.services.supabase_client import save_course
    return await save_course(body, guest_id)


@router.put("/saved/{course_id}", response_model=SavedCourse)
async def update_saved_course(
    course_id: str,
    body: UpdateCourseRequest,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import update_saved_course
    updates = body.model_dump(exclude_none=True)
    return await update_saved_course(course_id, updates)


@router.delete("/saved/{course_id}", status_code=204)
async def delete_saved_course(
    course_id: str,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import delete_saved_course
    await delete_saved_course(course_id)


@router.get("/{course_id}", response_model=CourseSearchResult)
async def get_course(course_id: str):
    from app.services.nebula import get_course_by_id
    return await get_course_by_id(course_id)
