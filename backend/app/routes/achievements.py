from fastapi import APIRouter, HTTPException

from app.models.achievement import Achievement
from app.services import store
from app.services.user_store import load_users

router = APIRouter(prefix="/api/users", tags=["achievements"])


@router.get("/{user_id}/achievements", response_model=list[Achievement])
def get_achievements(user_id: str) -> list[Achievement]:
    users = load_users()
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    return store.ACHIEVEMENTS_STORE.get(user_id, [])
