from enum import Enum

from pydantic import BaseModel


class FundingType(str, Enum):
    grant = "grant"
    creator_fund = "creator_fund"
    accelerator = "accelerator"
    angel = "angel"
    revenue_based = "revenue_based"
    competition = "competition"


class FundingOpportunity(BaseModel):
    id: str
    name: str
    type: FundingType
    description: str
    amount: str
    deadline: str
    eligibility_stages: list[str]
    creator_types: list[str]
    requirements: list[str]
    application_url: str
    tags: list[str]
