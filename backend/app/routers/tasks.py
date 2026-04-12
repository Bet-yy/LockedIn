from fastapi import APIRouter, Depends
from typing import List, Optional
from app.models.task import Task, TaskCreate, TaskUpdate
from app.core.dependencies import get_guest_id

router = APIRouter()


@router.get("", response_model=List[Task])
async def list_tasks(
    course_id: Optional[str] = None,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import get_tasks
    return await get_tasks(guest_id, course_id)


@router.post("", response_model=Task)
async def create_task(
    body: TaskCreate,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import create_task
    return await create_task(body, guest_id)


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import update_task
    return await update_task(task_id, body, guest_id)


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    guest_id: Optional[str] = Depends(get_guest_id),
):
    from app.services.supabase_client import delete_task
    await delete_task(task_id, guest_id)
    return {"deleted": task_id}
