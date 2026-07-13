import json
from pathlib import Path
from typing import List, Optional

from app.services.qnabot.prompts import (
    BUSINESS_CONTEXT_HEADER,
    GODADDY_CONTEXT_HEADER,
)

_DATA_FILE = Path(__file__).parent.parent / "data" / "business_knowledge.json"
_knowledge_base: Optional[List[dict]] = None


def _load() -> list:
    global _knowledge_base
    if _knowledge_base is None:
        with open(_DATA_FILE) as f:
            _knowledge_base = json.load(f)["entries"]
    return _knowledge_base


def retrieve_context(query: str) -> str:
    """Return relevant knowledge base entries as a formatted context string."""
    query_lower = query.lower()
    entries = _load()

    scored = []
    for entry in entries:
        score = sum(1 for kw in entry["keywords"] if kw in query_lower)
        if score > 0:
            scored.append((score, entry))

    if not scored:
        return ""

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:2]

    business_blocks = []
    godaddy_blocks = []

    for _, entry in top:
        block = f"Q: {entry['question']}\nA: {entry['answer']}"
        is_godaddy = entry.get("type") == "godaddy" or entry.get("godaddy_products")
        if is_godaddy:
            if entry.get("godaddy_products"):
                products = ", ".join(entry["godaddy_products"])
                block += f"\nRelevant GoDaddy products: {products}"
            godaddy_blocks.append(block)
        else:
            business_blocks.append(block)

    parts = []
    if business_blocks:
        parts.append(BUSINESS_CONTEXT_HEADER + "\n" + "\n\n".join(business_blocks))
    if godaddy_blocks:
        parts.append(GODADDY_CONTEXT_HEADER + "\n" + "\n\n".join(godaddy_blocks))

    return "\n\n".join(parts)
