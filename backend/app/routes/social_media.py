import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.services.achievement_store import load_achievements, save_achievements
from app.services.user_store import load_users, save_users
from app.services.social_media_service import (
    analyze_seo_profile,
    build_achievement,
    exchange_code_for_stats,
    fetch_onboarding_data,
    generate_content_ideas,
    generate_growth_plan,
    get_oauth_url,
    optimize_seo_content,
)

router = APIRouter()

# In-memory store — keyed by user_id. Swap for DynamoDB without changing route signatures.
_outreach_store: dict[str, list] = {}

DATA_DIR = Path(__file__).parent.parent / "data"

_VALID_PLATFORMS = ("instagram", "tiktok", "facebook")
_VALID_CREATOR_TYPES = ("fashion", "gaming", "fitness", "art", "food")


def _load(filename: str) -> dict:
    with open(DATA_DIR / filename) as f:
        return json.load(f)


# --- OAuth ---

@router.get("/connect/{platform}")
def connect_platform(platform: str):
    """Return the OAuth authorization URL for the requested platform."""
    if platform not in ("instagram", "tiktok", "facebook"):
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
    return get_oauth_url(platform)


@router.get("/callback/{platform}")
async def oauth_callback(platform: str, code: Optional[str] = None, error: Optional[str] = None):
    """Handle OAuth callback, exchange code for stats, and redirect to frontend."""
    if error or not code:
        return RedirectResponse(url=f"http://localhost:5173/social?error={error or 'cancelled'}")

    stats = await exchange_code_for_stats(platform, code)
    # In a real app, store the token + stats in DynamoDB here.
    # For hackathon: return the stats directly (frontend stores in sessionStorage).
    return RedirectResponse(
        url=f"http://localhost:5173/social?platform={platform}&connected=true&username={stats.get('username', '')}&followers={stats.get('followers', 0)}"
    )


@router.get("/mock-oauth/{platform}")
async def mock_oauth(platform: str):
    """Mock OAuth completion — returns fake stats without a real redirect flow."""
    from app.services.social_media_service import MOCK_STATS
    stats = MOCK_STATS.get(platform, {"platform": platform, "connected": False})
    return {"mock": True, **stats}


# --- Stats ---

@router.get("/stats/{user_id}")
def get_stats(user_id: str):
    """Return connected platform stats for a user. Mock data in MOCK_SOCIAL_APIS mode."""
    from app.services.social_media_service import MOCK_MODE, MOCK_STATS
    if MOCK_MODE:
        return {"user_id": user_id, "platforms": list(MOCK_STATS.values())}
    # Production: look up stored tokens from DynamoDB and refresh stats.
    # Stub for now — integrator wires DynamoDB reads here.
    return {"user_id": user_id, "platforms": []}


# --- Missions ---

@router.get("/missions/all")
def get_all_social_missions(
    stage: Optional[str] = Query(None),
    creator_type: Optional[str] = Query(None),
):
    """Return all social missions without filtering by completion status."""
    data = _load("social_missions.json")
    missions = data["missions"]
    if stage:
        missions = [m for m in missions if m["stage"] == stage]
    if creator_type:
        missions = [
            m for m in missions
            if "all" in m["creator_types"] or creator_type in m["creator_types"]
        ]
    return {"missions": missions}


@router.get("/missions/{user_id}")
def get_social_missions(
    user_id: str,
    stage: Optional[str] = Query(None),
    creator_type: Optional[str] = Query(None),
):
    """Return social visibility missions filtered by stage and/or creator_type, excluding already-completed ones."""
    data = _load("social_missions.json")
    missions = data["missions"]

    if stage:
        missions = [m for m in missions if m["stage"] == stage]

    if creator_type:
        missions = [
            m for m in missions
            if "all" in m["creator_types"] or creator_type in m["creator_types"]
        ]

    # Filter out missions the user already completed
    try:
        from app.services.user_store import load_users
        users = load_users()
        user = users.get(user_id)
        if user:
            done = set(user.completed_missions)
            missions = [m for m in missions if m["mission_id"] not in done]
    except Exception:
        pass

    return {"user_id": user_id, "missions": missions}


@router.post("/missions/{mission_id}/complete")
async def complete_social_mission(mission_id: str, payload: dict):
    """
    Mark a social mission complete and write a social achievement.

    Body: { "user_id": "...", "completion_text": "..." }
    """
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    data = _load("social_missions.json")
    mission = next((m for m in data["missions"] if m["mission_id"] == mission_id), None)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    users = load_users()
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if mission_id in user.completed_missions:
        raise HTTPException(status_code=409, detail="Mission already completed")

    achievement = build_achievement(user_id, mission)
    save_achievements([achievement])

    user.completed_missions.append(mission_id)
    users[user_id] = user
    save_users(users)

    return {
        "success": True,
        "mission_id": mission_id,
        "achievement": achievement,
    }


# --- Templates ---

@router.get("/templates")
def get_templates(stage: Optional[str] = Query(None), platform: Optional[str] = Query(None)):
    """Return outreach templates, optionally filtered by stage or platform."""
    data = _load("social_templates.json")
    templates = data["social_outreach"]

    stage_order = ["starter", "builder", "brand", "investor_ready"]

    if stage and stage in stage_order:
        max_index = stage_order.index(stage)
        templates = [
            t for t in templates
            if stage_order.index(t["stage"]) <= max_index
        ]

    if platform:
        templates = [t for t in templates if t["platform"] == platform or t["platform"] == "all"]

    return {"templates": templates}


# --- Platform Guides ---

@router.get("/guides")
def get_guides(stage: Optional[str] = Query(None)):
    """Return platform guides, filtered to those available at the given stage."""
    data = _load("social_platform_guides.json")
    guides = data["guides"]

    stage_order = ["starter", "builder", "brand", "investor_ready"]

    if stage and stage in stage_order:
        current_index = stage_order.index(stage)
        guides = [
            g for g in guides
            if stage_order.index(g["min_stage"]) <= current_index
        ]

    return {"guides": guides}


# --- Content Ideas ---

@router.post("/content-ideas")
async def get_content_ideas(payload: dict):
    """
    Generate a 7-day content plan using Claude.
    Body: { "user_id", "creator_type", "stage", "platform" }
    """
    user_id = payload.get("user_id")
    creator_type = payload.get("creator_type", "all")
    stage = payload.get("stage", "starter")
    platform = payload.get("platform", "instagram")

    onboarding = await fetch_onboarding_data(user_id) if user_id else {}
    ideas = await generate_content_ideas(creator_type, stage, platform, onboarding=onboarding)
    return {"creator_type": creator_type, "stage": stage, "platform": platform, "ideas": ideas}


# --- Outreach Tracker ---

@router.get("/outreach/{user_id}")
def get_outreach(user_id: str):
    """Return the outreach log for a user."""
    entries = _outreach_store.get(user_id, [])
    contacted = len(entries)
    replied = sum(1 for e in entries if e["status"] in ("replied", "deal"))
    deals = sum(1 for e in entries if e["status"] == "deal")
    return {
        "user_id": user_id,
        "summary": {"contacted": contacted, "replied": replied, "deals": deals},
        "entries": entries,
    }


@router.post("/outreach/{user_id}")
def add_outreach(user_id: str, payload: dict):
    """Log a new outreach entry."""
    import uuid as _uuid
    from datetime import datetime, timezone
    entry = {
        "entry_id": str(_uuid.uuid4()),
        "brand": payload.get("brand", ""),
        "platform": payload.get("platform", ""),
        "template_used": payload.get("template_used", ""),
        "status": payload.get("status", "sent"),
        "notes": payload.get("notes", ""),
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }
    _outreach_store.setdefault(user_id, []).append(entry)
    return {"success": True, "entry": entry}


@router.patch("/outreach/{user_id}/{entry_id}")
def update_outreach_status(user_id: str, entry_id: str, payload: dict):
    """Update the status of an outreach entry. When set to 'deal', fires an achievement."""
    entries = _outreach_store.get(user_id, [])
    entry = next((e for e in entries if e["entry_id"] == entry_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    new_status = payload.get("status", entry["status"])
    entry["status"] = new_status
    if payload.get("notes") is not None:
        entry["notes"] = payload["notes"]

    achievement = None
    if new_status == "deal" and sum(1 for e in entries if e["status"] == "deal") == 1:
        import uuid as _uuid
        from datetime import datetime, timezone
        achievement = {
            "achievement_id": str(_uuid.uuid4()),
            "user_id": user_id,
            "title": f"First Brand Deal Logged — {entry['brand']}",
            "date": datetime.now(timezone.utc).isoformat(),
            "impact": "Social Visibility · First Brand Deal",
            "category": "social_visibility",
        }

    return {"success": True, "entry": entry, "achievement": achievement}


# --- Stage Gate ---

@router.get("/stage-gate/{stage}")
def get_stage_gate(stage: str):
    """Return the social visibility prompt shown at each stage unlock."""
    data = _load("social_stage_gates.json")
    gate = next((g for g in data["stage_gates"] if g["stage"] == stage), None)
    if not gate:
        raise HTTPException(status_code=404, detail=f"No stage gate for stage: {stage}")
    return gate


# --- Achievements ---

@router.get("/achievements/{user_id}")
def get_achievements(user_id: str):
    """Return all social achievements for a user."""
    achievements = load_achievements(user_id)
    return {
        "user_id": user_id,
        "missions_completed": len(achievements),
        "achievements": achievements,
    }


# --- Growth Advisor ---

@router.post("/growth-plan")
async def get_growth_plan(payload: dict):
    """
    AI-powered 30-day growth plan personalised to the user's platforms, stage, and completed missions.
    Body: { "user_id", "creator_type", "stage", "platforms": [...], "completed_mission_ids": [...] }
    """
    user_id = payload.get("user_id")
    creator_type = payload.get("creator_type", "all")
    stage = payload.get("stage", "starter")
    platforms = payload.get("platforms", [])
    completed = payload.get("completed_mission_ids", [])

    onboarding = await fetch_onboarding_data(user_id) if user_id else {}
    plan = await generate_growth_plan(creator_type, stage, platforms, completed, onboarding=onboarding)
    return {"user_id": user_id, **plan}


# --- Next Best Action ---

@router.get("/next-action/{user_id}")
def get_next_action(
    user_id: str,
    stage: Optional[str] = Query(None),
    creator_type: Optional[str] = Query(None),
    completed_mission_ids: Optional[str] = Query(None),
):
    """
    Returns the single highest-impact incomplete mission for the user right now.
    completed_mission_ids: comma-separated list of already-completed mission IDs.
    """
    completed = set(completed_mission_ids.split(",")) if completed_mission_ids else set()

    data = _load("social_missions.json")
    missions = data["missions"]

    if stage:
        missions = [m for m in missions if m["stage"] == stage]
    if creator_type:
        missions = [
            m for m in missions
            if "all" in m["creator_types"] or creator_type in m["creator_types"]
        ]

    candidates = [m for m in missions if m["mission_id"] not in completed]
    if not candidates:
        return {"user_id": user_id, "next_mission": None, "message": "All missions complete for this stage!"}

    best = min(candidates, key=lambda m: m["xp_reward"])

    return {
        "user_id": user_id,
        "next_mission": {
            "mission_id": best["mission_id"],
            "title": best["title"],
            "why_now": best["description"],
            "xp_reward": best["xp_reward"],
            "time_estimate": best["time_estimate"],
            "platform": best["platform"],
        },
    }


# --- Monetization Paths ---

@router.get("/monetization-advice")
async def get_monetization_advice(
    creator_type: Optional[str] = Query("all"),
    instagram_followers: Optional[int] = Query(0),
    tiktok_followers: Optional[int] = Query(0),
    user_id: Optional[str] = Query(None),
):
    """
    Returns actionable monetization paths for the user's creator type and follower count.
    Each path includes a concrete first step and specific programs to apply to.
    Pass user_id to enrich advice with onboarding context (revenue_goal, business_name).
    """
    from app.services.social_media_service import fetch_onboarding_data
    data = _load("social_monetization.json")
    max_followers = max(instagram_followers, tiktok_followers)

    onboarding = await fetch_onboarding_data(user_id) if user_id else {}

    relevant = [
        m for m in data["methods"]
        if creator_type in m["creator_types"] or "all" in m["creator_types"]
    ]

    paths = []
    for method in relevant:
        paths.append({
            "method": method["method"],
            "description": method["description"],
            "available_now": max_followers >= method["min_followers"],
            "first_step": method["first_step"],
            "programs": method["programs"],
        })

    paths.sort(key=lambda x: (not x["available_now"], x["method"]))

    bracket_key = "0-999"
    for key in ("100000+", "10000-99999", "1000-9999"):
        thresholds = {"100000+": 100000, "10000-99999": 10000, "1000-9999": 1000}
        if max_followers >= thresholds[key]:
            bracket_key = key
            break

    where_to_start = data["where_to_start_by_followers"][bracket_key]

    revenue_goal = onboarding.get("revenue_goal") or onboarding.get("monthly_revenue")
    business_name = onboarding.get("business_name")
    if business_name or revenue_goal:
        context_parts = []
        if business_name:
            context_parts.append(f"for {business_name}")
        if revenue_goal:
            context_parts.append(f"targeting ${revenue_goal}/month")
        where_to_start = f"{where_to_start} ({', '.join(context_parts)})"

    return {
        "creator_type": creator_type,
        "monetization_paths": paths,
        "where_to_start": where_to_start,
    }


# --- SEO Tools ---

@router.post("/seo/profile")
async def seo_profile_analysis(payload: dict):
    """
    Score a creator's bio for SEO quality and return a rewritten version optimized for discoverability.
    Body: { "user_id", "platform", "bio", "creator_type" }
    """
    user_id = payload.get("user_id")
    platform = (payload.get("platform") or "").lower()
    bio = (payload.get("bio") or "").strip()
    creator_type = (payload.get("creator_type") or "").lower()

    if platform not in _VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"platform must be one of: {', '.join(_VALID_PLATFORMS)}")
    if not bio:
        raise HTTPException(status_code=400, detail="bio must not be empty")
    if creator_type not in _VALID_CREATOR_TYPES:
        raise HTTPException(status_code=400, detail=f"creator_type must be one of: {', '.join(_VALID_CREATOR_TYPES)}")

    business_name = (payload.get("business_name") or "").strip()
    niche = (payload.get("niche") or "").strip()

    onboarding = await fetch_onboarding_data(user_id) if user_id else {}
    if business_name:
        onboarding["business_name"] = business_name
    if niche:
        onboarding["niche"] = niche

    result = await analyze_seo_profile(platform, bio, creator_type, onboarding=onboarding)
    return {"user_id": user_id, "platform": platform, **result}


@router.get("/seo/keywords")
async def get_seo_keywords(
    creator_type: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    niche: Optional[str] = Query(None),
    business_name: Optional[str] = Query(None),
):
    """
    Return ranked SEO keywords personalized to the user's business.
    When niche or business_name is provided, uses AI to generate relevant keywords.
    Falls back to static lookup by creator_type + platform.
    """
    from app.services.social_media_service import generate_seo_keywords

    platform_clean = (platform or "").lower() or "instagram"
    if platform_clean not in _VALID_PLATFORMS:
        platform_clean = "instagram"

    creator_clean = (creator_type or "").lower()
    if creator_clean not in _VALID_CREATOR_TYPES:
        creator_clean = "fashion"

    # Use AI when user has provided their actual business context
    if niche or business_name:
        keywords = await generate_seo_keywords(
            creator_type=creator_clean,
            platform=platform_clean,
            niche=niche or "",
            business_name=business_name or "",
        )
        return {"keywords": keywords, "personalized": True}

    # Fall back to static JSON lookup
    data = _load("seo_keywords.json")
    keywords_db = data["keywords"]
    keywords = keywords_db.get(creator_clean, {}).get(platform_clean, [])
    return {"creator_type": creator_clean, "platform": platform_clean, "keywords": keywords, "count": len(keywords)}


@router.post("/seo/content")
async def seo_content_optimization(payload: dict):
    """
    Rewrite a caption or post for maximum discoverability on the given platform.
    Body: { "user_id", "platform", "content", "creator_type" }
    """
    user_id = payload.get("user_id")
    platform = (payload.get("platform") or "").lower()
    content = (payload.get("content") or "").strip()
    creator_type = (payload.get("creator_type") or "").lower()

    if platform not in _VALID_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"platform must be one of: {', '.join(_VALID_PLATFORMS)}")
    if not content:
        raise HTTPException(status_code=400, detail="content must not be empty")
    if creator_type not in _VALID_CREATOR_TYPES:
        raise HTTPException(status_code=400, detail=f"creator_type must be one of: {', '.join(_VALID_CREATOR_TYPES)}")

    business_name = (payload.get("business_name") or "").strip()
    niche = (payload.get("niche") or "").strip()

    onboarding = await fetch_onboarding_data(user_id) if user_id else {}
    if business_name:
        onboarding["business_name"] = business_name
    if niche:
        onboarding["niche"] = niche

    result = await optimize_seo_content(platform, content, creator_type, onboarding=onboarding)
    return {"user_id": user_id, "platform": platform, **result}

