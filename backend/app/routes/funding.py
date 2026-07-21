import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query

from app.models.funding import FundingOpportunity

router = APIRouter(prefix="/api/funding", tags=["funding"])

_FUNDING_PATH = Path(__file__).parent.parent / "data" / "funding.json"
_FUNDING: list[FundingOpportunity] = [
    FundingOpportunity(**f) for f in json.loads(_FUNDING_PATH.read_text())
]


def _static_fallback(stage: Optional[str], creator_type: Optional[str]) -> list[dict]:
    results = _FUNDING
    if stage:
        results = [f for f in results if stage in f.eligibility_stages]
    if creator_type:
        results = [f for f in results if "all" in f.creator_types or creator_type in f.creator_types]
    return [f.dict() for f in results]


@router.get("")
async def get_funding_opportunities(
    stage: Optional[str] = None,
    creator_type: Optional[str] = None,
    user_id: Optional[str] = Query(None),
):
    from app.services.funding_service import generate_funding_opportunities
    from app.services.user_store import load_users

    onboarding = {}
    inferred_creator_type = creator_type
    if user_id:
        try:
            users = load_users()
            user = users.get(user_id)
            if user:
                onboarding = user.onboarding_data or {}
                if not inferred_creator_type:
                    label = onboarding.get("creator_type_label", "")
                    inferred_creator_type = label.lower() if label else creator_type
        except Exception:
            pass

    ai_results = await generate_funding_opportunities(
        stage=stage or "investor_ready",
        creator_type=inferred_creator_type or "all",
        onboarding=onboarding,
    )

    if ai_results:
        return {"opportunities": ai_results, "fallback": False}

    return {
        "opportunities": _static_fallback(stage, creator_type),
        "fallback": True,
    }
