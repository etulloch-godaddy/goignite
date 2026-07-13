from pydantic import BaseModel


class Mission(BaseModel):
    mission_id: str
    stage: str
    creator_types: list[str]
    title: str
    description: str
    xp_reward: int
    completion_prompt: str
    achievement_title: str
    achievement_category: str
