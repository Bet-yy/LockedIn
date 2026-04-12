from fastapi import Header, HTTPException, Query
from typing import Optional


async def get_guest_id(guest_id: Optional[str] = Query(default=None)) -> Optional[str]:
    """Extract guest_id from query params. Used for data isolation without auth."""
    return guest_id
