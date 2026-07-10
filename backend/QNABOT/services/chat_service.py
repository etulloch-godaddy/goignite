import json
import re
from pathlib import Path

_DATA_DIR = Path(__file__).parent.parent / "data"

with open(_DATA_DIR / "business_kb.json") as f:
    BUSINESS_KB: list[dict] = json.load(f)

with open(_DATA_DIR / "godaddy_products.json") as f:
    GODADDY_PRODUCTS: list[dict] = json.load(f)

# Phrases that indicate the user is asking about a GoDaddy product specifically
_GODADDY_SIGNALS = {
    "godaddy", "domain", "hosting", "ssl", "wordpress",
    "website builder", "workspace email", "microsoft 365", "sitelock",
    "woocommerce", "professional email", "online store", "web hosting",
    "website security", "register a domain", "custom domain", "custom email",
}

# Topic keywords used to detect business-advice intent
_TOPIC_KEYWORDS: dict[str, set[str]] = {
    "starting_a_business": {
        "start", "llc", "incorporate", "register", "sole", "proprietor",
        "ein", "license", "permit", "launch", "business plan", "mvp",
    },
    "finance": {
        "cash", "flow", "invoice", "budget", "profit", "price", "pricing",
        "funding", "loan", "grant", "revenue", "expense", "tax", "bank",
    },
    "marketing": {
        "market", "brand", "seo", "social", "media", "email", "advertise",
        "promote", "content", "tiktok", "instagram", "linkedin", "audience",
    },
    "online_presence": {
        "website", "domain", "online", "presence", "credibility", "google",
        "web", "profile", "listing",
    },
    "ecommerce": {
        "sell", "shop", "store", "ecommerce", "shipping", "payment",
        "stripe", "square", "product", "inventory", "checkout",
    },
    "hiring": {
        "hire", "employee", "contractor", "assistant", "va", "team",
        "delegate", "onboard", "job",
    },
    "growth": {
        "grow", "scale", "referral", "retention", "churn", "partner",
        "metric", "kpi", "analytics",
    },
}


def _tokenize(text: str) -> set[str]:
    return set(re.sub(r"[^\w\s]", "", text.lower()).split())


def classify_intent(query: str) -> str:
    """Route query into GODADDY, BUSINESS, or MIXED."""
    query_lower = query.lower()
    tokens = _tokenize(query)

    godaddy_hit = any(sig in query_lower for sig in _GODADDY_SIGNALS)
    business_hit = any(tokens & kws for kws in _TOPIC_KEYWORDS.values())

    if godaddy_hit and business_hit:
        return "MIXED"
    if godaddy_hit:
        return "GODADDY"
    return "BUSINESS"


def retrieve_business_chunks(query: str, top_n: int = 3) -> list[dict]:
    """Return the top N KB entries by token overlap with the query."""
    tokens = _tokenize(query)
    scored = []
    for entry in BUSINESS_KB:
        entry_tokens = _tokenize(entry["content"] + " " + entry["topic"])
        overlap = len(tokens & entry_tokens)
        if overlap > 0:
            scored.append((overlap, entry))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [e for _, e in scored[:top_n]]


def retrieve_products(query: str, threshold: float = 0.2) -> list[dict]:
    """Return up to 2 GoDaddy products whose use_cases overlap the query above threshold.

    Threshold is overlap / query_token_count, so it scales with query length.
    The LLM prompt acts as a second filter — cast a slightly wider net here.
    """
    tokens = _tokenize(query)
    if not tokens:
        return []

    results = []
    for product in GODADDY_PRODUCTS:
        use_case_tokens = _tokenize(" ".join(product["use_cases"]))
        overlap = len(tokens & use_case_tokens)
        score = overlap / len(tokens)
        if score >= threshold:
            results.append((score, product))

    results.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in results[:2]]
