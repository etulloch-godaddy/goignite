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
    builder = "builder"
    brand = "brand"
    investor_ready = "investor_ready"


class BusinessProfile(BaseModel):
    bio: str = ""
    pitch: str = ""
    revenue_goal: str = ""


class User(BaseModel):
    user_id: str
    creator_type: CreatorType
    stage: Stage = Stage.starter
    xp_total: int = 0
    completed_missions: list[str] = Field(default_factory=list)
    business_profile: BusinessProfile = Field(default_factory=BusinessProfile)
    godaddy_domain: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OnboardUserRequest(BaseModel):
    creator_type: CreatorType
    bio: str = ""
    revenue_goal: str = ""


class OnboardUserResponse(BaseModel):
    user: User
