from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import store
from app.services.pitch_service import generate_pitch_outline
from app.services.user_store import load_users

router = APIRouter(prefix="/api/pitch", tags=["pitch"])


class PitchOutlineRequest(BaseModel):
    user_id: str


@router.post("/outline")
async def create_pitch_outline(body: PitchOutlineRequest):
    users = load_users()
    user = users.get(body.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    achievements = store.ACHIEVEMENTS_STORE.get(body.user_id, [])
    return await generate_pitch_outline(user, achievements, user.onboarding_data)
