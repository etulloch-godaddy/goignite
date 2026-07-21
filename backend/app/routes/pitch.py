from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

<<<<<<< HEAD
from app.services import store
from app.services.pitch_service import generate_pitch_outline, generate_pitch_phase
=======
from app.services.achievement_store import load_achievements
from app.services.pitch_service import generate_pitch_outline
>>>>>>> origin/main
from app.services.user_store import load_users

router = APIRouter(prefix="/api/pitch", tags=["pitch"])


class PitchOutlineRequest(BaseModel):
    user_id: str


class PitchPhaseRequest(BaseModel):
    user_id: str
    phase_number: int


@router.post("/outline")
async def create_pitch_outline(body: PitchOutlineRequest):
    users = load_users()
    user = users.get(body.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    achievements = load_achievements(body.user_id)
    return await generate_pitch_outline(user, achievements, user.onboarding_data)


@router.post("/phase")
async def create_pitch_phase(body: PitchPhaseRequest):
    if body.phase_number < 1 or body.phase_number > 4:
        raise HTTPException(status_code=400, detail="phase_number must be 1-4")

    users = load_users()
    user = users.get(body.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    achievements = store.ACHIEVEMENTS_STORE.get(body.user_id, [])
    return await generate_pitch_phase(body.phase_number, user, achievements, user.onboarding_data)
