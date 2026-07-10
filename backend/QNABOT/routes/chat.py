from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import get_reply

router = APIRouter()

# In-memory session store: { session_id: [{"role": ..., "content": ...}, ...] }
_sessions: dict[str, list[dict]] = {}

# Keep the last N turns per session to avoid unbounded context growth
_MAX_HISTORY_TURNS = 10


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    history = _sessions.get(body.session_id, [])

    reply = get_reply(body.message, history=history)

    # Persist this turn (raw message, not context-injected)
    history = history + [
        {"role": "user", "content": body.message},
        {"role": "assistant", "content": reply},
    ]

    # Trim to last N turns (each turn = 2 messages)
    if len(history) > _MAX_HISTORY_TURNS * 2:
        history = history[-(_MAX_HISTORY_TURNS * 2):]

    _sessions[body.session_id] = history

    return ChatResponse(reply=reply, session_id=body.session_id)
