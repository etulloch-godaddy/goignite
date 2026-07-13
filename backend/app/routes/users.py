from fastapi import APIRouter, HTTPException
from uuid import uuid4

from app.models.user import (
    CreateUserResponse,
    OnboardUserRequest,
    OnboardUserResponse,
    OnboardingDataResponse,
    User,
)
from app.store import USERS

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/create-new-user", response_model=CreateUserResponse)
def create_new_user() -> CreateUserResponse:
    user = User(user_id=str(uuid4()))
    USERS[user.user_id] = user
    return CreateUserResponse(user_id=user.user_id)


@router.post("/onboard", response_model=OnboardUserResponse)
def onboard_user(payload: OnboardUserRequest) -> OnboardUserResponse:
    user = User(
        user_id=str(uuid4()),
        creator_type=payload.creator_type,
    )
    user.business_profile.bio = payload.bio
    user.business_profile.revenue_goal = payload.revenue_goal
    USERS[user.user_id] = user
    return OnboardUserResponse(user=user)


@router.get("/{user_id}/onboarding-data", response_model=OnboardingDataResponse)
def get_onboarding_data(user_id: str) -> OnboardingDataResponse:
    user = USERS.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return OnboardingDataResponse(
        user_id=user.user_id,
        onboarding_data={
            "creator_type": user.creator_type.value if user.creator_type else None,
            "stage": user.stage.value,
            "bio": user.business_profile.bio,
            "revenue_goal": user.business_profile.revenue_goal,
        },
    )


@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: str) -> User:
    user = USERS.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
