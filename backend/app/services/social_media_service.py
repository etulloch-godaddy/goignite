import os
import uuid
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from dotenv import load_dotenv

load_dotenv()

MOCK_MODE = os.getenv("MOCK_SOCIAL_APIS", "true").lower() == "true"

META_APP_ID = os.getenv("META_APP_ID", "")
META_APP_SECRET = os.getenv("META_APP_SECRET", "")
META_REDIRECT_URI = os.getenv(
    "META_REDIRECT_URI", "http://localhost:8000/api/social/callback/instagram"
)

TIKTOK_CLIENT_KEY = os.getenv("TIKTOK_CLIENT_KEY", "")
TIKTOK_CLIENT_SECRET = os.getenv("TIKTOK_CLIENT_SECRET", "")
TIKTOK_REDIRECT_URI = os.getenv(
    "TIKTOK_REDIRECT_URI", "http://localhost:8000/api/social/callback/tiktok"
)

MOCK_STATS = {
    "instagram": {
        "platform": "instagram",
        "connected": True,
        "username": "demo_creator",
        "followers": 2847,
        "posts": 63,
        "profile_url": "https://instagram.com/demo_creator",
    },
    "tiktok": {
        "platform": "tiktok",
        "connected": True,
        "username": "demo_creator",
        "followers": 5120,
        "videos": 41,
        "profile_url": "https://tiktok.com/@demo_creator",
    },
    "facebook": {
        "platform": "facebook",
        "connected": True,
        "username": "Demo Creator",
        "followers": 890,
        "posts": 34,
        "profile_url": "https://facebook.com/democreator",
    },
}


def get_oauth_url(platform: str) -> dict:
    if MOCK_MODE:
        return {
            "platform": platform,
            "auth_url": f"http://localhost:8000/api/social/mock-oauth/{platform}",
            "mock": True,
        }

    if platform == "instagram":
        params = {
            "client_id": META_APP_ID,
            "redirect_uri": META_REDIRECT_URI,
            "scope": "instagram_basic,pages_read_engagement",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    if platform == "facebook":
        params = {
            "client_id": META_APP_ID,
            "redirect_uri": META_REDIRECT_URI,
            "scope": "pages_read_engagement,pages_show_list",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    if platform == "tiktok":
        params = {
            "client_key": TIKTOK_CLIENT_KEY,
            "redirect_uri": TIKTOK_REDIRECT_URI,
            "scope": "user.info.basic",
            "response_type": "code",
            "state": platform,
        }
        url = f"https://www.tiktok.com/v2/auth/authorize/?{urlencode(params)}"
        return {"platform": platform, "auth_url": url, "mock": False}

    raise ValueError(f"Unsupported platform: {platform}")


async def exchange_code_for_stats(platform: str, code: str) -> dict:
    if MOCK_MODE:
        return MOCK_STATS.get(platform, {"platform": platform, "connected": False})

    async with httpx.AsyncClient() as client:
        if platform in ("instagram", "facebook"):
            token_resp = await client.post(
                "https://graph.facebook.com/v19.0/oauth/access_token",
                params={
                    "client_id": META_APP_ID,
                    "client_secret": META_APP_SECRET,
                    "redirect_uri": META_REDIRECT_URI,
                    "code": code,
                },
            )
            token_resp.raise_for_status()
            access_token = token_resp.json()["access_token"]

            if platform == "instagram":
                me_resp = await client.get(
                    "https://graph.facebook.com/v19.0/me",
                    params={
                        "fields": "instagram_business_account",
                        "access_token": access_token,
                    },
                )
                ig_id = me_resp.json().get("instagram_business_account", {}).get("id")
                if ig_id:
                    stats_resp = await client.get(
                        f"https://graph.facebook.com/v19.0/{ig_id}",
                        params={
                            "fields": "username,followers_count,media_count",
                            "access_token": access_token,
                        },
                    )
                    data = stats_resp.json()
                    return {
                        "platform": "instagram",
                        "connected": True,
                        "username": data.get("username", ""),
                        "followers": data.get("followers_count", 0),
                        "posts": data.get("media_count", 0),
                        "profile_url": f"https://instagram.com/{data.get('username', '')}",
                    }

            if platform == "facebook":
                me_resp = await client.get(
                    "https://graph.facebook.com/v19.0/me",
                    params={"fields": "name,fan_count", "access_token": access_token},
                )
                data = me_resp.json()
                return {
                    "platform": "facebook",
                    "connected": True,
                    "username": data.get("name", ""),
                    "followers": data.get("fan_count", 0),
                    "profile_url": "",
                }

        if platform == "tiktok":
            token_resp = await client.post(
                "https://open.tiktokapis.com/v2/oauth/token/",
                data={
                    "client_key": TIKTOK_CLIENT_KEY,
                    "client_secret": TIKTOK_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": TIKTOK_REDIRECT_URI,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            token_resp.raise_for_status()
            access_token = token_resp.json()["access_token"]

            stats_resp = await client.get(
                "https://open.tiktokapis.com/v2/user/info/",
                params={"fields": "display_name,follower_count,video_count"},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            data = stats_resp.json().get("data", {}).get("user", {})
            return {
                "platform": "tiktok",
                "connected": True,
                "username": data.get("display_name", ""),
                "followers": data.get("follower_count", 0),
                "videos": data.get("video_count", 0),
                "profile_url": f"https://tiktok.com/@{data.get('display_name', '')}",
            }

    return {"platform": platform, "connected": False}


ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

MOCK_CONTENT_IDEAS = [
    {"day": 1, "post_type": "Reel", "hook": "POV: you just started your creator business with zero followers", "caption": "Everyone starts at zero. Here's the one thing I wish someone told me on day one. Save this for when you need it most.", "hashtags": ["#creatortips", "#contentcreator", "#growyouraudience", "#socialmediatips", "#creatoreconomy"], "best_time": "7:00 PM"},
    {"day": 2, "post_type": "Carousel", "hook": "5 things that actually grew my audience (none of them went viral)", "caption": "Consistency beats virality every time. Here are the 5 unglamorous things that actually moved the needle for me.", "hashtags": ["#audiencegrowth", "#creatortips", "#contentcreator", "#socialmedia", "#growyourbrand"], "best_time": "12:00 PM"},
    {"day": 3, "post_type": "Story Poll", "hook": "Quick question for you 👇", "caption": "I'm building something new and your opinion actually matters. Drop your vote — takes 2 seconds.", "hashtags": ["#askme", "#community", "#contentcreator", "#creatorlife", "#engagement"], "best_time": "6:00 PM"},
    {"day": 4, "post_type": "Photo", "hook": "Behind the scenes of how I actually create content", "caption": "Not the highlight reel. The real setup, the real process, the real me. What does your creative space look like?", "hashtags": ["#behindthescenes", "#contentcreator", "#creatorlife", "#mysetup", "#authentic"], "best_time": "11:00 AM"},
    {"day": 5, "post_type": "Reel", "hook": "I DM'd 10 brands this week — here's what happened", "caption": "Real results, no filters. This is exactly what I said, who responded, and what I learned about pitching as a small creator.", "hashtags": ["#branddeals", "#creatortips", "#influencermarketing", "#pitching", "#makemoneyonline"], "best_time": "7:00 PM"},
    {"day": 6, "post_type": "Carousel", "hook": "Your link in bio is losing you money — here's the fix", "caption": "Most creators leave serious money on the table because their link in bio does nothing. Here's the 5-minute fix.", "hashtags": ["#linkinbio", "#creatortips", "#monetise", "#contentcreator", "#growyourbusiness"], "best_time": "12:00 PM"},
    {"day": 7, "post_type": "Photo", "hook": "End of week reflection — what actually worked this week", "caption": "Weekly wins, weekly lessons. I'm sharing mine to keep myself accountable. Drop yours in the comments.", "hashtags": ["#weeklyreflection", "#creatorjourney", "#accountability", "#contentcreator", "#growth"], "best_time": "5:00 PM"},
]


async def generate_content_ideas(creator_type: str, stage: str, platform: str, onboarding: dict | None = None) -> list:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return MOCK_CONTENT_IDEAS

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Creator's business details:\n" + "\n".join(lines) + "\n\n"

    prompt = (
        f"You are a social media strategist for {creator_type} content creators at the '{stage}' stage "
        f"of building their creator business. Generate exactly 7 post ideas for {platform}. "
        f"Each idea should be action-oriented, realistic, and under 30 minutes to create.\n\n"
        f"{onboarding_context}"
        f"Return a JSON array of 7 objects. Each object must have these exact keys:\n"
        f"- day (integer 1-7)\n"
        f"- post_type (string: Photo, Reel, Carousel, Story, or Live)\n"
        f"- hook (string: one punchy opening line under 12 words)\n"
        f"- caption (string: 2-3 sentences, conversational, ends with engagement prompt)\n"
        f"- hashtags (array of exactly 5 strings including the # symbol)\n"
        f"- best_time (string: e.g. '7:00 PM')\n\n"
        f"Return only valid JSON, no explanation."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        return _json.loads(raw.strip())


def build_achievement(user_id: str, mission: dict) -> dict:
    return {
        "achievement_id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": mission.get("achievement_title", mission["title"]),
        "date": datetime.now(timezone.utc).isoformat(),
        "impact": f"Social Visibility · +{mission['xp_reward']} XP",
        "category": "social_visibility",
    }


async def update_user_xp(user_id: str, xp: int) -> bool:
    """Best-effort XP update to the users service. Silently skips if unavailable."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.patch(
                f"http://localhost:8000/api/users/{user_id}/xp",
                json={"xp": xp},
                timeout=2.0,
            )
            return resp.status_code == 200
    except Exception:
        return False


async def fetch_onboarding_data(user_id: str) -> dict:
    """Fetch the user's onboarding data from the shared users service. Returns {} on failure."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"http://localhost:8000/api/users/{user_id}/onboarding-data",
                timeout=3.0,
            )
            if resp.status_code == 200:
                return resp.json().get("onboarding_data", {})
    except Exception:
        pass
    return {}


MOCK_GROWTH_PLAN = {
    "plan_horizon": "30 days",
    "biggest_opportunity": "Your TikTok audience is growing 2x faster than Instagram right now — prioritise short-form video to maximise reach in the next 30 days.",
    "actions": [
        {
            "rank": 1,
            "title": "Post 3x Reels or TikToks per week",
            "why": "Short-form video is the highest-reach format on both platforms. 3 posts/week is the minimum threshold to trigger algorithmic distribution.",
            "time_estimate": "3–4 hrs/week",
            "expected_impact": "500–1,000 new followers in 30 days",
            "platform": "tiktok"
        },
        {
            "rank": 2,
            "title": "Send 5 brand collab DMs this week",
            "why": "At your stage, outreach volume is the fastest path to your first paid deal. 5 DMs typically yields 1–2 responses.",
            "time_estimate": "1 hr total",
            "expected_impact": "First brand conversation within 2 weeks",
            "platform": "instagram"
        },
        {
            "rank": 3,
            "title": "Run one audience engagement post (poll or AMA)",
            "why": "Engagement posts boost your content's reach by 30–50% — the algorithm shows your next post to more people when your last one got comments.",
            "time_estimate": "15 min",
            "expected_impact": "+30% reach on your next post",
            "platform": "instagram"
        },
        {
            "rank": 4,
            "title": "Cross-post your best content to a second platform",
            "why": "Repurposing costs zero extra time and doubles your distribution. One TikTok video uploaded to Instagram Reels can reach a completely new audience.",
            "time_estimate": "5 min per post",
            "expected_impact": "2x content output with the same effort",
            "platform": "all"
        },
        {
            "rank": 5,
            "title": "Apply to one affiliate program this week",
            "why": "Affiliate income is the fastest monetisation path at your follower count — no minimum requirement and passive income from day one.",
            "time_estimate": "30 min",
            "expected_impact": "First affiliate commission within 30 days",
            "platform": "all"
        }
    ],
    "mock": True
}


async def generate_growth_plan(
    creator_type: str,
    stage: str,
    platforms: list,
    completed_mission_ids: list,
    onboarding: dict | None = None,
) -> dict:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return MOCK_GROWTH_PLAN

    platform_summary = ", ".join(
        f"{p['platform']} ({p.get('followers', 0):,} followers)" for p in platforms
    )
    completed_summary = (
        ", ".join(completed_mission_ids) if completed_mission_ids else "none yet"
    )

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items()]
        onboarding_context = "Their onboarding answers:\n" + "\n".join(lines) + "\n\n"

    prompt = (
        f"You are a social media growth strategist helping a {creator_type} content creator "
        f"at the '{stage}' stage of their creator business.\n\n"
        f"Their current platform stats: {platform_summary}\n"
        f"Missions they have completed: {completed_summary}\n"
        f"{onboarding_context}"
        f"Generate a focused 30-day growth plan with exactly 5 prioritised actions. "
        f"Rank them by expected impact on follower growth and revenue. "
        f"Be specific — reference their actual platforms, follower counts, and business details in your reasoning. "
        f"Do not recommend things they have already completed.\n\n"
        f"Return a JSON object with these exact keys:\n"
        f"- plan_horizon: '30 days'\n"
        f"- biggest_opportunity: (string) one sentence identifying their single biggest growth lever right now\n"
        f"- actions: array of 5 objects, each with:\n"
        f"  - rank (integer 1-5)\n"
        f"  - title (string, concise action name)\n"
        f"  - why (string, 1-2 sentences explaining the impact using their specific numbers)\n"
        f"  - time_estimate (string, e.g. '3 hrs/week')\n"
        f"  - expected_impact (string, specific and measurable, e.g. '500-800 new followers in 30 days')\n"
        f"  - platform (string: instagram, tiktok, facebook, linkedin, email, or all)\n"
        f"- mock: false\n\n"
        f"Return only valid JSON, no explanation."
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 1500,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        raw = resp.json()["content"][0]["text"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        import json as _json
        return _json.loads(raw.strip())
