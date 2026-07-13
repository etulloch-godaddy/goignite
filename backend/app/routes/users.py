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
@router.post("/create-new-user", response_model=CreateNewUserResponse)
def create_new_user() -> CreateNewUserResponse:
    """
    Create a new user and return only user_id.

    Example request (frontend):
    fetch("http://localhost:8000/api/users/create-new-user", {
      method: "POST",
    })
    """
    users = load_users()
    user = User(
        user_id=str(uuid4()),
    )
    users[user.user_id] = user
    save_users(users)
    return CreateNewUserResponse(user_id=user.user_id)


@router.get("/{user_id}", response_model=User)
def get_user_profile(user_id: str) -> User:
    """
    Fetch the full user profile.

    Example request (frontend):
    fetch(`http://localhost:8000/api/users/${user_id}`)
    """
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/onboarding-data", response_model=OnboardingDataResponse)
def get_user_onboarding_data(user_id: str) -> OnboardingDataResponse:
    """
    Fetch only the onboarding key-value dictionary for a user.

    Example request (frontend):
    fetch(`http://localhost:8000/api/users/${user_id}/onboarding-data`)
    """
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
    """
    Upsert onboarding key-value pairs for a user.

    Example request (frontend):
    fetch(`http://localhost:8000/api/users/${user_id}/onboarding-data`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          business_name: "Study Survival Kits",
          monthly_revenue: 1000,
          team_size: 1,
        },
      }),
    })
    """
    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.onboarding_data.update(payload.data)
    users[user_id] = user
    save_users(users)
    return OnboardingDataResponse(user_id=user_id, onboarding_data=user.onboarding_data)
