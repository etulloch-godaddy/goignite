from uuid import uuid4
from typing import Any

from fastapi import APIRouter, HTTPException

from app.models.user import OnboardUserRequest, OnboardUserResponse, User
from app.services.user_store import load_users, save_users

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/onboard", response_model=OnboardUserResponse)
def onboard_user(payload: OnboardUserRequest) -> OnboardUserResponse:
    users = load_users()
    user = User(
        user_id=str(uuid4()),
        creator_type=payload.creator_type,
    )
    user.business_profile.bio = payload.bio
    user.business_profile.revenue_goal = payload.revenue_goal
    users[user.user_id] = user
    save_users(users)
    return OnboardUserResponse(user_id=user.user_id, user=user)


@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: str) -> User:
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/onboarding-data", response_model=User)
def upsert_onboarding_data(payload: dict[str, Any]) -> User:
    user_id = payload.get("user_id")
    if not isinstance(user_id, str) or not user_id.strip():
        raise HTTPException(status_code=400, detail="user_id is required")

    updates = {
        key: value
        for key, value in payload.items()
        if key != "user_id"
    }

    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.onboarding_data.update(updates)
    users[user_id] = user
    save_users(users)
    return user
