from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class CreatorType(str, Enum):
    fashion = "fashion"
    gaming = "gaming"
    fitness = "fitness"
    art = "art"
    food = "food"


class Stage(str, Enum):
    starter = "starter"


class BusinessProfile(BaseModel):
    bio: str = ""
    revenue_goal: str = ""


class User(BaseModel):
    user_id: str
    creator_type: CreatorType | None = None
    stage: Stage = Stage.starter
    business_profile: BusinessProfile = Field(default_factory=BusinessProfile)
    onboarding_data: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateNewUserResponse(BaseModel):
    user_id: str


class UpsertOnboardingDataRequest(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)


class OnboardingDataResponse(BaseModel):
    user_id: str
    onboarding_data: dict[str, Any]
