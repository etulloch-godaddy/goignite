from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.qnabot import get_reply
from app.services.user_store import load_users

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


def _build_user_context(user_id: str) -> Optional[str]:
    users = load_users()
    user = users.get(user_id)
    if user is None:
        return None
    lines = []
    if user.creator_type:
        lines.append(f"Creator type: {user.creator_type.value}")
    lines.append(f"Stage: {user.stage.value}")
    data = user.onboarding_data
    for key in ("first_name", "business_name", "pitch", "goal", "budget"):
        if data.get(key):
            lines.append(f"{key.replace('_', ' ').title()}: {data[key]}")
    if user.business_profile.bio:
        lines.append(f"Bio: {user.business_profile.bio}")
    if user.business_profile.revenue_goal:
        lines.append(f"Revenue goal: {user.business_profile.revenue_goal}")
    return "\n".join(lines) if lines else None


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    user_context = _build_user_context(body.user_id) if body.user_id else None
    reply = await get_reply(body.message, session_id=body.session_id, user_context=user_context)

    return ChatResponse(reply=reply, session_id=body.session_id)
