import os
from typing import Optional
from anthropic import Anthropic
from dotenv import load_dotenv

from services.chat_service import classify_intent, retrieve_business_chunks, retrieve_products
from services.prompts import (
    SYSTEM_PROMPT,
    NO_MATCH_CONTEXT,
    BUSINESS_CONTEXT_HEADER,
    GODADDY_CONTEXT_HEADER,
)

load_dotenv()

_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def _build_context_block(chunks: list, products: list) -> str:
    parts = []

    if chunks:
        parts.append(BUSINESS_CONTEXT_HEADER)
        for chunk in chunks:
            parts.append(f"- {chunk['content']}")

    if products:
        parts.append(f"\n{GODADDY_CONTEXT_HEADER}")
        for p in products:
            parts.append(f"- {p['name']}: {p['description']}")

    if not parts:
        parts.append(NO_MATCH_CONTEXT)

    return "\n".join(parts)


def get_reply(query: str, history: Optional[list] = None) -> str:
    intent = classify_intent(query)

    chunks = retrieve_business_chunks(query) if intent in ("BUSINESS", "MIXED") else []
    products = retrieve_products(query) if intent in ("GODADDY", "MIXED") else []

    context = _build_context_block(chunks, products)
    user_content = f"{query}\n\n{context}"

    messages = list(history or [])
    messages.append({"role": "user", "content": user_content})

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    return response.content[0].text
