from typing import Any, List, Optional
from app.core.config import settings

_client = None


def _get_client():
    global _client
    if _client is None:
        from supabase import create_client
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


# ── Courses ──────────────────────────────────────────────────────────────────

async def save_course(body, guest_id: Optional[str]) -> dict:
    client = _get_client()
    data = {
        "nebula_course_id": body.nebula_course_id,
        "course_name": body.course_name,
        "course_number": body.course_number,
        "professor": body.professor,
        "semester": body.semester,
        "user_id": guest_id,
    }
    resp = client.table("saved_courses").insert(data).execute()
    return resp.data[0]


async def get_saved_courses(guest_id: Optional[str]) -> List[dict]:
    client = _get_client()
    query = client.table("saved_courses").select("*")
    if guest_id:
        query = query.eq("user_id", guest_id)
    resp = query.order("created_at", desc=True).execute()
    return resp.data


async def get_saved_course_by_id(course_id: str) -> dict:
    client = _get_client()
    resp = client.table("saved_courses").select("*").eq("id", course_id).single().execute()
    return resp.data


async def update_syllabus_parsed(course_id: str, raw_text: str, parsed: Any):
    client = _get_client()
    client.table("saved_courses").update({
        "syllabus_raw": raw_text,
        "syllabus_parsed": parsed,
    }).eq("id", course_id).execute()


# ── Study Plans ───────────────────────────────────────────────────────────────

async def save_study_plan(course_id: str, plan_content: Any):
    client = _get_client()
    # Upsert: replace existing plan for this course
    existing = client.table("study_plans").select("id").eq("course_id", course_id).execute()
    if existing.data:
        client.table("study_plans").update({"plan_content": plan_content}).eq("course_id", course_id).execute()
    else:
        client.table("study_plans").insert({"course_id": course_id, "plan_content": plan_content}).execute()


async def get_study_plan(course_id: str) -> Any:
    client = _get_client()
    resp = client.table("study_plans").select("plan_content").eq("course_id", course_id).execute()
    if resp.data:
        return resp.data[0]["plan_content"]
    return []


# ── Tasks ─────────────────────────────────────────────────────────────────────

async def get_tasks(guest_id: Optional[str], course_id: Optional[str] = None) -> List[dict]:
    client = _get_client()
    query = client.table("tasks").select("*")
    if guest_id:
        query = query.eq("user_id", guest_id)
    if course_id:
        query = query.eq("course_id", course_id)
    resp = query.order("created_at", desc=True).execute()
    return resp.data


async def create_task(body, guest_id: Optional[str]) -> dict:
    client = _get_client()
    data = {
        "title": body.title,
        "description": body.description,
        "due_date": body.due_date.isoformat() if body.due_date else None,
        "priority": body.priority,
        "course_id": body.course_id,
        "user_id": guest_id,
        "completed": False,
    }
    resp = client.table("tasks").insert(data).execute()
    return resp.data[0]


async def update_task(task_id: str, body, guest_id: Optional[str]) -> dict:
    client = _get_client()
    updates = body.model_dump(exclude_none=True)
    if "due_date" in updates and updates["due_date"]:
        updates["due_date"] = updates["due_date"].isoformat()
    resp = client.table("tasks").update(updates).eq("id", task_id).execute()
    return resp.data[0]


async def delete_task(task_id: str, guest_id: Optional[str]):
    client = _get_client()
    client.table("tasks").delete().eq("id", task_id).execute()


# ── Resources ─────────────────────────────────────────────────────────────────

async def save_resources(course_id: str, resources: List[dict]):
    client = _get_client()
    # Clear old recommendations for this course then insert fresh ones
    client.table("resource_recommendations").delete().eq("course_id", course_id).execute()
    rows = [{"course_id": course_id, **r} for r in resources]
    if rows:
        client.table("resource_recommendations").insert(rows).execute()


async def get_resources(course_id: str) -> List[dict]:
    client = _get_client()
    resp = client.table("resource_recommendations").select("*").eq("course_id", course_id).execute()
    return resp.data
