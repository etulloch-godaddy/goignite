import json as _json
import os
from typing import Optional

from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY", "").strip()


def _gocaas() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url="https://caas-gocode-prod.caas-prod.prod.onkatana.net/v1",
        api_key=API_KEY,
    )


async def _chat(prompt: str, max_tokens: int = 2000) -> str:
    resp = await _gocaas().chat.completions.create(
        model="gpt-5.5",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )
    return (resp.choices[0].message.content or "").strip()


def _parse_json(raw: str):
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return _json.loads(raw.strip())


def _build_business_context(onboarding: dict) -> str:
    if not onboarding:
        return ""
    goal_labels = {
        "side-income": "earn side income",
        "full-time": "replace their full-time job",
        "passion": "pursue their passion project",
        "grow existing": "grow an existing business",
    }
    parts = []
    if onboarding.get("business_name"):
        parts.append(f"Business name: {onboarding['business_name']}")
    if onboarding.get("pitch"):
        parts.append(f"What they do: {onboarding['pitch']}")
    if onboarding.get("goal"):
        parts.append(f"Goal: {goal_labels.get(onboarding['goal'], onboarding['goal'])}")
    if onboarding.get("business_types"):
        types = onboarding["business_types"]
        parts.append(f"Business category: {', '.join(types) if isinstance(types, list) else types}")
    if onboarding.get("existing_assets"):
        assets = onboarding["existing_assets"]
        parts.append(f"What they already have: {', '.join(assets) if isinstance(assets, list) else assets}")
    if not parts:
        return ""
    return "About this business:\n" + "\n".join(f"- {p}" for p in parts) + "\n\n"


async def generate_funding_opportunities(
    stage: str,
    creator_type: str,
    onboarding: Optional[dict] = None,
) -> Optional[list]:
    if not API_KEY:
        return None

    business_context = _build_business_context(onboarding or {})

    prompt = (
        f"You are a funding advisor helping a business owner find relevant funding opportunities.\n\n"
        f"{business_context}"
        f"Their current stage: {stage}\n"
        f"Their business category: {creator_type}\n\n"
        f"Generate 4-6 real, specific funding opportunities highly relevant to this exact business. "
        f"Include a mix of grants, creator funds, accelerators, angel programs, and competitions "
        f"that genuinely match their business type, stage, and goals. "
        f"Tailor each description to explain WHY it fits their specific situation.\n\n"
        f"Return a JSON array where each item has exactly these fields:\n"
        f"- id: string (short slug, e.g. 'goldman-10k')\n"
        f"- name: string (full program name)\n"
        f"- type: one of: grant, creator_fund, accelerator, angel, revenue_based, competition\n"
        f"- description: string (2-3 sentences explaining why this fits THEIR business specifically)\n"
        f"- amount: string (e.g. '$10,000', 'Up to $150,000', 'Revenue share')\n"
        f"- deadline: string (e.g. 'Rolling', 'March 2026', 'Quarterly')\n"
        f"- eligibility_stages: [\"investor_ready\"]\n"
        f"- creator_types: [\"all\"] or specific list\n"
        f"- requirements: array of 3-4 concrete requirements\n"
        f"- application_url: string (real URL or '#' if unknown)\n"
        f"- tags: array of 2-4 relevant tags\n\n"
        f"Return only valid JSON array, no explanation."
    )

    try:
        raw = await _chat(prompt, max_tokens=3000)
        data = _parse_json(raw)
        if isinstance(data, list) and len(data) > 0:
            return data
        return None
    except Exception:
        return None
