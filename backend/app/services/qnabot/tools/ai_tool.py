import logging
import os
from typing import Optional

from openai import APIConnectionError, APIStatusError, AsyncOpenAI

from app.services.qnabot.prompts import NO_MATCH_CONTEXT, SYSTEM_PROMPT
from app.services.qnabot.tools.retrieval import retrieve_context

logger = logging.getLogger(__name__)


def _client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url="https://caas-gocode-prod.caas-prod.prod.onkatana.net/v1",
        api_key=os.getenv("API_KEY", "").strip(),
    )


async def get_reply(query: str, session_id: str, user_context: Optional[str] = None) -> str:
    parts = [SYSTEM_PROMPT]

    if user_context:
        parts.append(f"[USER PROFILE]\n{user_context}")

    parts.append(retrieve_context(query) or NO_MATCH_CONTEXT)

    full_system = "\n\n".join(parts)

    try:
        response = await _client().chat.completions.create(
            model="gpt-5.5",
            messages=[
                {"role": "system", "content": full_system},
                {"role": "user", "content": query},
            ],
        )
    except APIStatusError as e:
        logger.error("Gateway returned %s: %s", e.status_code, e.response.text)
        raise
    except APIConnectionError as e:
        logger.error("Gateway connection failed: %s", e)
        raise

    return response.choices[0].message.content or "No response"
