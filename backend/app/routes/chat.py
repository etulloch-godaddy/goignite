from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.qnabot import get_reply

router = APIRouter()


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

    reply = await get_reply(body.message, session_id=body.session_id)

    return ChatResponse(reply=reply, session_id=body.session_id)
