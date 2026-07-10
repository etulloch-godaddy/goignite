from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.user import OnboardUserRequest, OnboardUserResponse, User
from app.services import store

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/onboard", response_model=OnboardUserResponse)
def onboard_user(payload: OnboardUserRequest) -> OnboardUserResponse:
    user = User(
        user_id=str(uuid4()),
        creator_type=payload.creator_type,
    )
    user.business_profile.bio = payload.bio
    user.business_profile.revenue_goal = payload.revenue_goal
    store.USERS[user.user_id] = user
    return OnboardUserResponse(user=user)


@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: str) -> User:
    user = store.USERS.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
