import json as _json
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

from app.models.user import User

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
MOCK_MODE = os.getenv("MOCK_PITCH", "true").lower() == "true"

MOCK_PITCH_OUTLINE = {
    "deck_title": "Abuela's Fire — Investor Brief",
    "tagline": "Grandma's hot sauce recipe, bottled for the world.",
    "funding_ask": "Seeking $40,000 seed round",
    "slides": [
        {
            "slide_number": 1,
            "title": "Cover",
            "headline": "Abuela's Fire",
            "key_points": [
                "Founded by Valentina Reyes — food creator, 18,000 followers and growing",
                "Small-batch hot sauce rooted in a 60-year-old family recipe from Oaxaca",
                "From TikTok kitchen to 3 local retailers in 8 months",
            ],
            "speaker_notes": "Hi, I'm Valentina. Abuela's Fire started the day I filmed myself making my grandmother's hot sauce and 200,000 people watched it overnight. That's when I knew this was bigger than a recipe.",
        },
        {
            "slide_number": 2,
            "title": "The Problem",
            "headline": "The hot sauce shelf is full — but none of it has a real story behind it.",
            "key_points": [
                "Mass-market hot sauces (Tabasco, Cholula) dominate shelves but taste identical and lack authenticity",
                "Consumers are actively seeking food with cultural roots and a human face behind it",
                "Independent sauce makers can't scale past farmers markets without capital and distribution know-how",
            ],
            "speaker_notes": "Walk down any condiment aisle and you'll see the same five brands. Shoppers are bored. They're buying craft hot sauce at three times the price because it means something. We have the story. We just need the scale.",
        },
        {
            "slide_number": 3,
            "title": "The Solution",
            "headline": "Abuela's Fire: authentic Oaxacan hot sauce sold direct and through retail, backed by a creator audience.",
            "key_points": [
                "Three SKUs: Original, Smoky Morita, and Seasonal — all small-batch, preservative-free",
                "DTC via abuelasfire.com + retail placement in 3 local specialty grocery stores",
                "Creator-led marketing: Valentina's TikTok and Instagram drive organic demand before any ad spend",
            ],
            "speaker_notes": "We're not starting from zero on awareness — we already have 18,000 people who've watched Valentina cook. Every new video is a product launch. The content IS the marketing budget.",
        },
        {
            "slide_number": 4,
            "title": "Market Opportunity",
            "headline": "The US hot sauce market is $1.65B and growing 6% per year — craft is the fastest segment.",
            "key_points": [
                "$1.65B total US hot sauce market; craft and artisan segment growing at 12% annually",
                "Hispanic food culture is mainstream — 68% of non-Hispanic Americans cook with Latin ingredients weekly",
                "Creator-commerce food brands (Fly By Jing, TRUFF) have proven the playbook at $10M+ ARR",
            ],
            "speaker_notes": "Hot sauce is no longer a niche condiment. It's a $1.65 billion staple, and the fastest-growing slice of that market is exactly what we make — authentic, story-driven, small-batch. We have timing on our side.",
        },
        {
            "slide_number": 5,
            "title": "Traction",
            "headline": "18,000 followers, 3 retail doors, first revenue — bootstrapped in under a year.",
            "key_points": [
                "18,000 social followers; one TikTok video reached 200,000 views organically",
                "Listed in 3 local specialty retailers; first wholesale purchase orders received",
                "DTC store live at abuelasfire.com; first online orders shipped within 60 days of launch",
            ],
            "speaker_notes": "Everything you see was built without outside capital. A co-packer relationship, a registered business, a live website, and paying wholesale customers. The foundation is real.",
        },
        {
            "slide_number": 6,
            "title": "Business Model",
            "headline": "DTC at 68% margin + wholesale at 42% margin + creator brand deals.",
            "key_points": [
                "DTC (abuelasfire.com): $12 per bottle, 68% gross margin — highest-value channel",
                "Wholesale: $6.50/bottle to retailers, 42% margin — volume and shelf presence",
                "Brand partnerships: food and lifestyle brand deals at 18K followers ($800–$2,500/post)",
            ],
            "speaker_notes": "Three revenue streams that reinforce each other. The creator content drives DTC. DTC data proves demand to retailers. Retail shelf presence builds legitimacy for bigger brand deals. It compounds.",
        },
        {
            "slide_number": 7,
            "title": "Financials & Ask",
            "headline": "Seeking $40,000 to reach 20 retail doors and $150,000 revenue by month 18.",
            "key_points": [
                "$20,000 → co-packing scale-up: 5,000-bottle run across 3 SKUs (reduces COGS by 30%)",
                "$12,000 → regional retail broker + food show entry fees for 20-door expansion",
                "$8,000 → LLC via GoDaddy Airo, food safety certifications, and working capital buffer",
            ],
            "speaker_notes": "This isn't speculative. We have purchase orders waiting and a retailer who asked us to come back when we can supply 200 units a month. This raise is about fulfilling demand that already exists.",
        },
        {
            "slide_number": 8,
            "title": "Next Steps",
            "headline": "20 retail doors by Q3. Techstars Food & Bev application in. LLC registered.",
            "key_points": [
                "LLC registered via GoDaddy Airo — investor-ready entity, ready to receive funds",
                "Techstars Food & Beverage accelerator application submitted for spring cohort",
                "Letter of intent from regional distributor covering TX, NM, and AZ — pending this raise",
            ],
            "speaker_notes": "My grandmother made this sauce for 60 years and gave it away for free. It's time the world gets to taste it — and she gets the credit she deserves. Let's build this together.",
        },
    ],
    "mock": True,
}


async def generate_pitch_outline(
    user: User,
    achievements: list,
    onboarding: Optional[dict] = None,
) -> dict:
    if MOCK_MODE or not ANTHROPIC_API_KEY:
        return MOCK_PITCH_OUTLINE

    business_name = (onboarding or {}).get("business_name", "My Business")
    first_name = (onboarding or {}).get("first_name", "Founder")
    niche = (onboarding or {}).get("niche", "")
    social_link = (onboarding or {}).get("social_link", "")

    bio = user.business_profile.bio or "No bio yet"
    pitch = user.business_profile.pitch or "No pitch yet"
    revenue_goal = user.business_profile.revenue_goal or "Not set"
    creator_type = user.creator_type.value if user.creator_type else "creator"
    stage = user.stage.value
    domain = user.godaddy_domain or "not registered yet"

    achievements_block = "\n".join(
        f"  - {a.title}: {a.impact}" for a in achievements
    ) or "  - No milestones logged yet"

    onboarding_context = ""
    if onboarding:
        lines = [f"  - {k}: {v}" for k, v in onboarding.items() if v]
        if lines:
            onboarding_context = "Additional founder context:\n" + "\n".join(lines) + "\n\n"

    prompt = (
        f"You are a startup pitch coach helping a young entrepreneur prepare a short investor pitch deck.\n\n"
        f"Founder context:\n"
        f"  - Name: {first_name}\n"
        f"  - Business: {business_name}\n"
        f"  - Creator type: {creator_type}\n"
        f"  - Niche: {niche or 'not specified'}\n"
        f"  - Bio: {bio}\n"
        f"  - One-sentence pitch: {pitch}\n"
        f"  - Revenue goal: {revenue_goal}\n"
        f"  - Domain: {domain}\n"
        f"  - Social: {social_link or 'not linked'}\n"
        f"  - Stage reached: {stage}\n\n"
        f"Proof points (completed milestones):\n{achievements_block}\n\n"
        f"{onboarding_context}"
        f"Generate a concise 8-slide investor pitch deck outline.\n\n"
        f"Return a JSON object with these exact keys:\n"
        f"- deck_title (string: \"{business_name} — Investor Brief\")\n"
        f"- tagline (string: one punchy sentence summarising the business)\n"
        f"- funding_ask (string: derived from revenue_goal, e.g. \"Seeking $25,000 seed\")\n"
        f"- slides (array of 8 objects), each with:\n"
        f"  - slide_number (integer 1-8)\n"
        f"  - title (string: slide name, e.g. \"The Problem\", \"Traction\", \"The Ask\")\n"
        f"  - headline (string: the one bold statement on this slide)\n"
        f"  - key_points (array of exactly 3 strings)\n"
        f"  - speaker_notes (string: 1-2 sentences the founder says out loud)\n\n"
        f"Slide order: Cover → Problem → Solution → Market → Traction → Business Model → Financials & Ask → Next Steps.\n"
        f"Ground every slide in the founder's actual details above — no generic filler.\n"
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
                "max_tokens": 2500,
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
        return _json.loads(raw.strip())
