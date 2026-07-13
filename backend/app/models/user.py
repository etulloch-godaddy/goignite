from datetime import datetime, timezone
from enum import Enum
from typing import Optional

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
    creator_type: Optional[CreatorType] = None
    stage: Stage = Stage.starter
    business_profile: BusinessProfile = Field(default_factory=BusinessProfile)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OnboardUserRequest(BaseModel):
    creator_type: CreatorType
    bio: str = ""
    revenue_goal: str = ""


class OnboardUserResponse(BaseModel):
    user: User


class CreateUserResponse(BaseModel):
    user_id: str


class OnboardingDataResponse(BaseModel):
    user_id: str
    onboarding_data: dict
