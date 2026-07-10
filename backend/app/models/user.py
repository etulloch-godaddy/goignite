from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class CreatorType(str, Enum):
    fashion = "fashion"
    gaming = "gaming"
    fitness = "fitness"
    art = "art"
    food = "food"


class Stage(str, Enum):
    starter = "starter"
    builder = "builder"
    brand = "brand"
    investor_ready = "investor_ready"


class BusinessProfile(BaseModel):
    bio: str = ""
    pitch: str = ""
    revenue_goal: str = ""


class User(BaseModel):
    user_id: str
    creator_type: Optional[CreatorType] = None
    stage: Stage = Stage.starter
    xp_total: int = 0
    completed_missions: list[str] = Field(default_factory=list)
    business_profile: BusinessProfile = Field(default_factory=BusinessProfile)
    onboarding_data: dict[str, Any] = Field(default_factory=dict)
    godaddy_domain: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CreateNewUserResponse(BaseModel):
    user_id: str


class UpsertOnboardingDataRequest(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)


class OnboardingDataResponse(BaseModel):
    user_id: str
    onboarding_data: dict[str, Any]
