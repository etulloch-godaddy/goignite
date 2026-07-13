from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.user import (
    CreateNewUserResponse,
    OnboardingDataResponse,
    UpsertOnboardingDataRequest,
    User,
)
from app.services.user_store import load_users, save_users

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/create-new-user", response_model=CreateNewUserResponse)
def create_new_user() -> CreateNewUserResponse:
    users = load_users()
    user = User(user_id=str(uuid4()))
    users[user.user_id] = user
    save_users(users)
    return CreateNewUserResponse(user_id=user.user_id)


@router.get("/{user_id}/onboarding-data", response_model=OnboardingDataResponse)
def get_user_onboarding_data(user_id: str) -> OnboardingDataResponse:
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return OnboardingDataResponse(user_id=user_id, onboarding_data=user.onboarding_data)


@router.patch("/{user_id}/onboarding-data", response_model=OnboardingDataResponse)
def upsert_onboarding_data(
    user_id: str,
    payload: UpsertOnboardingDataRequest,
) -> OnboardingDataResponse:
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.onboarding_data.update(payload.data)
    users[user_id] = user
    save_users(users)
    return OnboardingDataResponse(user_id=user_id, onboarding_data=user.onboarding_data)


@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: str) -> User:
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
