from fastapi import APIRouter, HTTPException

from app.models.achievement import Achievement
from app.services import store

router = APIRouter(prefix="/api/users", tags=["achievements"])


@router.get("/{user_id}/achievements", response_model=list[Achievement])
def get_achievements(user_id: str) -> list[Achievement]:
    if user_id not in store.USERS:
        raise HTTPException(status_code=404, detail="User not found")
    return store.ACHIEVEMENTS_STORE.get(user_id, [])
