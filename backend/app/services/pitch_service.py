import asyncio
import json as _json
import logging
import os
from typing import Optional

from openai import APIConnectionError, APIStatusError, AsyncOpenAI

from app.models.user import User
from app.services.pitch_kb.prompts import NO_MATCH_CONTEXT, PITCH_SYSTEM_PROMPT
from app.services.pitch_kb.retrieval import retrieve_pitch_context

logger = logging.getLogger(__name__)

PHASES = [
    {
        "name": "Foundation",
        "slides": ["Cover", "Problem", "Solution"],
        "kb_query": "pitch cover problem solution founder story why now origin",
    },
    {
        "name": "Market & Proof",
        "slides": ["Market Opportunity", "Traction"],
        "kb_query": "market size tam traction metrics proof engagement creator social following",
    },
    {
        "name": "Business & Financials",
        "slides": ["Business Model", "Financials & Ask"],
        "kb_query": "revenue model unit economics funding ask use of funds seed safe",
    },
    {
        "name": "Future & Close",
        "slides": ["Next Steps"],
        "kb_query": "roadmap milestones next steps call to action llc entity incorporate",
    },
]

SLIDE_ORDER = [
    "Cover",
    "Problem",
    "Solution",
    "Market Opportunity",
    "Traction",
    "Business Model",
    "Financials & Ask",
    "Next Steps",
]


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url="https://caas-gocode-prod.caas-prod.prod.onkatana.net/v1",
        api_key=os.getenv("API_KEY", "").strip(),
    )


def _build_user_profile(user: User, achievements: list, onboarding: Optional[dict]) -> str:
    ob = onboarding or {}
    lines = [
        f"Name: {ob.get('first_name', 'Founder')}",
        f"Business: {ob.get('business_name', 'My Business')}",
        f"Creator type: {user.creator_type.value if user.creator_type else 'creator'}",
        f"Niche: {ob.get('niche', 'not specified')}",
        f"Bio: {user.business_profile.bio or 'No bio yet'}",
        f"One-sentence pitch: {user.business_profile.pitch or ob.get('pitch', 'No pitch yet')}",
        f"Revenue goal: {user.business_profile.revenue_goal or ob.get('goal', 'Not set')}",
        f"Budget: {ob.get('budget', 'Not specified')}",
        f"Domain: {user.godaddy_domain or 'not registered yet'}",
        f"Social: {ob.get('social_link', 'not linked')}",
        f"Stage: {user.stage.value}",
    ]

    milestones = "\n".join(f"  - {a.title}: {a.impact}" for a in achievements)
    if milestones:
        lines.append(f"Completed milestones:\n{milestones}")

    extra = [f"  {k}: {v}" for k, v in ob.items() if v and k not in {"first_name", "business_name", "niche", "pitch", "goal", "budget", "social_link"}]
    if extra:
        lines.append("Additional context:\n" + "\n".join(extra))

    return "\n".join(lines)


async def _generate_phase_slides(
    phase: dict,
    user_profile: str,
    slide_start_number: int,
) -> list:
    kb_context = retrieve_pitch_context(phase["kb_query"]) or NO_MATCH_CONTEXT

    slide_names = ", ".join(f'"{s}"' for s in phase["slides"])
    count = len(phase["slides"])
    end_number = slide_start_number + count - 1
    number_range = (
        f"{slide_start_number}"
        if count == 1
        else f"{slide_start_number}-{end_number}"
    )

    system = "\n\n".join([
        PITCH_SYSTEM_PROMPT,
        f"[USER PROFILE]\n{user_profile}",
        kb_context,
    ])

    user_msg = (
        f"Generate exactly {count} investor pitch slide(s) for the '{phase['name']}' phase.\n"
        f"Slides to generate (in order): {slide_names}\n"
        f"Slide numbers: {number_range}\n\n"
        f"Return a JSON array of {count} slide object(s), each with:\n"
        f"  - slide_number (integer, starting at {slide_start_number})\n"
        f"  - title (string: one of {slide_names})\n"
        f"  - headline (string: the single bold statement on this slide)\n"
        f"  - key_points (array of exactly 3 strings grounded in the founder's data)\n"
        f"  - speaker_notes (string: 1-2 sentences the founder says out loud, first-person)\n\n"
        f"Ground every bullet in the founder's actual details. No generic filler.\n"
        f"Return only a valid JSON array — no markdown, no wrapper object."
    )

    response = await _client().chat.completions.create(
        model="gpt-5.5",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
    )

    raw = (response.choices[0].message.content or "").strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return _json.loads(raw.strip())


async def generate_pitch_outline(
    user: User,
    achievements: list,
    onboarding: Optional[dict] = None,
) -> dict:
    ob = onboarding or {}
    business_name = ob.get("business_name", "My Business")
    first_name = ob.get("first_name", "Founder")
    revenue_goal = user.business_profile.revenue_goal or ob.get("goal", "")

    user_profile = _build_user_profile(user, achievements, ob)

    slide_starts = []
    n = 1
    for phase in PHASES:
        slide_starts.append(n)
        n += len(phase["slides"])

    async def _safe_phase(phase: dict, start: int) -> list:
        try:
            return await _generate_phase_slides(phase, user_profile, start)
        except (APIStatusError, APIConnectionError, _json.JSONDecodeError) as exc:
            logger.error("Phase '%s' generation failed: %s", phase["name"], exc)
            return _fallback_slides(phase["slides"], start)

    results = await asyncio.gather(
        *[_safe_phase(phase, start) for phase, start in zip(PHASES, slide_starts)]
    )

    all_slides = []
    phases_meta = []
    for phase, slides in zip(PHASES, results):
        all_slides.extend(slides)
        phases_meta.append({
            "name": phase["name"],
            "slide_numbers": [s["slide_number"] for s in slides],
        })

    funding_ask = f"Seeking funding" if not revenue_goal else f"Seeking capital to reach {revenue_goal}"

    return {
        "deck_title": f"{business_name} — Investor Brief",
        "tagline": f"Built by {first_name} for the {user.creator_type.value if user.creator_type else 'creator'} economy.",
        "funding_ask": funding_ask,
        "slides": all_slides,
        "phases": phases_meta,
    }


async def generate_pitch_phase(
    phase_number: int,
    user: User,
    achievements: list,
    onboarding: Optional[dict] = None,
) -> dict:
    if phase_number < 1 or phase_number > len(PHASES):
        raise ValueError(f"phase_number must be 1-{len(PHASES)}")

    phase = PHASES[phase_number - 1]
    slide_start = sum(len(PHASES[i]["slides"]) for i in range(phase_number - 1)) + 1
    user_profile = _build_user_profile(user, achievements, onboarding or {})

    slides = await _generate_phase_slides(phase, user_profile, slide_start)

    return {
        "phase_number": phase_number,
        "phase_name": phase["name"],
        "slides": slides,
    }


def _fallback_slides(slide_titles: list, start_number: int) -> list:
    return [
        {
            "slide_number": start_number + i,
            "title": title,
            "headline": f"{title} — content generation failed, please retry.",
            "key_points": ["Retry the pitch generation.", "Check API connectivity.", "Fill in your business profile for better results."],
            "speaker_notes": "This slide failed to generate. Please retry.",
        }
        for i, title in enumerate(slide_titles)
    ]
