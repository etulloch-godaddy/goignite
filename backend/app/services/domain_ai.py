import json as _json
import os
import re
from typing import Any

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

API_KEY = os.getenv("API_KEY", "").strip()

_SUFFIXES = ["hq", "co", "hub", "studio", "collective", "labs", "shop", "club"]
_PREFIXES = ["get", "try", "the", "shop"]


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url="https://caas-gocode-prod.caas-prod.prod.onkatana.net/v1",
        api_key=API_KEY,
    )


def _slugify(value: Any) -> str:
    """Lowercase alphanumeric-only slug, matching GoDaddy domain label rules."""
    return re.sub(r"[^a-z0-9]", "", str(value or "").lower())


def _clean_candidates(raw_candidates: list, count: int) -> list[str]:
    seen: set[str] = set()
    cleaned: list[str] = []
    for c in raw_candidates:
        slug = _slugify(c)[:20]
        if slug and slug not in seen:
            seen.add(slug)
            cleaned.append(slug)
    return cleaned[:count]


def _mock_candidates(context: dict, count: int) -> list[str]:
    """Deterministic, profile-based fallback base names (no TLD). Used when
    API_KEY is unset or the model's response can't be used."""
    business_name = _slugify(context.get("business_name"))
    niche_source = context.get("niche") or context.get("pitch") or ""
    niche_words = re.findall(r"[A-Za-z]+", str(niche_source))
    niche_slug = _slugify("".join(niche_words[:2]))
    creator_slug = _slugify(context.get("creator_type"))

    seeds = [s for s in [business_name, niche_slug, creator_slug] if s]
    if not seeds:
        seeds = ["mybrand"]

    candidates: list[str] = list(seeds)
    for seed in seeds:
        for suffix in _SUFFIXES:
            candidates.append(f"{seed}{suffix}")
    for prefix in _PREFIXES:
        for seed in seeds:
            candidates.append(f"{prefix}{seed}")

    return _clean_candidates(candidates, count)


async def generate_domain_candidates(context: dict, count: int = 8) -> list[str]:
    """Returns up to `count` lowercase alphanumeric base domain names (no TLD)
    derived from the user's business context. Falls back to a deterministic
    local generator when API_KEY is empty or the response can't be parsed as
    a JSON array."""
    if not API_KEY:
        return _mock_candidates(context, count)

    business_name = context.get("business_name") or "not provided"
    pitch = context.get("pitch") or "not provided"
    niche = context.get("niche") or "not provided"
    creator_type = context.get("creator_type") or "creator"
    goal = context.get("goal") or "not provided"

    prompt = (
        f"You are a branding assistant helping a {creator_type} creator choose a domain name "
        f"for their business.\n\n"
        f"Business context:\n"
        f"- Business name: {business_name}\n"
        f"- Pitch: {pitch}\n"
        f"- Niche: {niche}\n"
        f"- Goal: {goal}\n\n"
        f"Suggest {count} short, brandable domain name candidates (base name only, no TLD/extension).\n"
        f"Rules:\n"
        f"- lowercase letters and numbers only — no spaces, hyphens, or special characters\n"
        f"- each candidate between 3 and 20 characters\n"
        f"- memorable, easy to spell, and relevant to the business context above\n"
        f"- do not repeat the exact business name verbatim more than once\n\n"
        f"Return a JSON array of exactly {count} strings. Return only valid JSON, no explanation, "
        f"no markdown fences."
    )

    response = await _client().chat.completions.create(
        model="gpt-5.5",
        messages=[{"role": "user", "content": prompt}],
    )
    raw = (response.choices[0].message.content or "").strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        parsed = _json.loads(raw.strip())
    except _json.JSONDecodeError:
        return _mock_candidates(context, count)

    if not isinstance(parsed, list):
        return _mock_candidates(context, count)

    cleaned = _clean_candidates(parsed, count)
    return cleaned or _mock_candidates(context, count)
