from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class AchievementCategory(str, Enum):
    stage_milestone = "stage_milestone"
    business_setup = "business_setup"
    funding = "funding"
    monetization = "monetization"


class Achievement(BaseModel):
    achievement_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    title: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    impact: str
    category: AchievementCategory
