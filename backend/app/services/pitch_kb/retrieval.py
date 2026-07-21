import json
from pathlib import Path
from typing import List, Optional

from app.services.pitch_kb.prompts import PITCH_CONTEXT_HEADER

_DATA_FILE = Path(__file__).parent / "data" / "pitch_knowledge.json"
_knowledge_base: Optional[List[dict]] = None


def _load() -> list:
    global _knowledge_base
    if _knowledge_base is None:
        with open(_DATA_FILE) as f:
            _knowledge_base = json.load(f)["entries"]
    return _knowledge_base


def retrieve_pitch_context(query: str) -> str:
    """Return top 3 relevant pitch KB entries as a formatted context string."""
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
    top = scored[:3]

    blocks = []
    for _, entry in top:
        block = f"Q: {entry['question']}\nA: {entry['answer']}"
        if entry.get("godaddy_products"):
            products = ", ".join(entry["godaddy_products"])
            block += f"\nRelevant GoDaddy products: {products}"
        blocks.append(block)

    return PITCH_CONTEXT_HEADER + "\n" + "\n\n".join(blocks)
