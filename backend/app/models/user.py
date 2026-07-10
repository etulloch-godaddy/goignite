from datetime import datetime, timezone
from enum import Enum

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
    creator_type: CreatorType
    stage: Stage = Stage.starter
    business_profile: BusinessProfile = Field(default_factory=BusinessProfile)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OnboardUserRequest(BaseModel):
    creator_type: CreatorType
    bio: str = ""
    revenue_goal: str = ""


class OnboardUserResponse(BaseModel):
    user_id: str
    user: User
