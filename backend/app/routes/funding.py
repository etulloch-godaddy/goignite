import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter

from app.models.funding import FundingOpportunity

router = APIRouter(prefix="/api/funding", tags=["funding"])

_FUNDING_PATH = Path(__file__).parent.parent / "data" / "funding.json"
_FUNDING: list[FundingOpportunity] = [
    FundingOpportunity(**f) for f in json.loads(_FUNDING_PATH.read_text())
]


@router.get("", response_model=list[FundingOpportunity])
def get_funding_opportunities(
    stage: Optional[str] = None,
    creator_type: Optional[str] = None,
) -> list[FundingOpportunity]:
    results = _FUNDING

    if stage:
        results = [f for f in results if stage in f.eligibility_stages]

    if creator_type:
        results = [
            f for f in results
            if "all" in f.creator_types or creator_type in f.creator_types
        ]

    return results
