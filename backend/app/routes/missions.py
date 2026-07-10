import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.achievement import Achievement, AchievementCategory
from app.models.mission import Mission
from app.services import store
from app.services.xp_service import award_xp

router = APIRouter(prefix="/api/missions", tags=["missions"])

_MISSIONS_PATH = Path(__file__).parent.parent / "data" / "missions.json"
_MISSIONS: list[Mission] = [Mission(**m) for m in json.loads(_MISSIONS_PATH.read_text())]
_MISSIONS_BY_ID: dict[str, Mission] = {m.mission_id: m for m in _MISSIONS}


class CompleteMissionRequest(BaseModel):
    user_id: str


class CompleteMissionResponse(BaseModel):
    user_id: str
    xp_total: int
    stage: str
    achievements_earned: list[Achievement]


@router.get("/today/{user_id}", response_model=list[Mission])
def get_today_missions(user_id: str) -> list[Mission]:
    user = store.USERS.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    eligible = [
        m for m in _MISSIONS
        if m.stage == user.stage.value
        and ("all" in m.creator_types or user.creator_type.value in m.creator_types)
        and m.mission_id not in user.completed_missions
    ]
    return eligible[:5]


@router.post("/{mission_id}/complete", response_model=CompleteMissionResponse)
def complete_mission(mission_id: str, body: CompleteMissionRequest) -> CompleteMissionResponse:
    user = store.USERS.get(body.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    mission = _MISSIONS_BY_ID.get(mission_id)
    if mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission_id in user.completed_missions:
        raise HTTPException(status_code=409, detail="Mission already completed")

    milestone_achievements = award_xp(user, mission.xp_reward)

    mission_achievement = Achievement(
        user_id=user.user_id,
        title=mission.achievement_title,
        impact=f"{mission.achievement_title} · +{mission.xp_reward} XP",
        category=AchievementCategory(mission.achievement_category),
    )

    all_achievements = [mission_achievement] + milestone_achievements

    store.ACHIEVEMENTS_STORE.setdefault(user.user_id, []).extend(all_achievements)
    user.completed_missions.append(mission_id)

    return CompleteMissionResponse(
        user_id=user.user_id,
        xp_total=user.xp_total,
        stage=user.stage.value,
        achievements_earned=all_achievements,
    )
