"""
FinBuddy AI — /chat route
"""
import uuid
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.finbuddy_graph import run_agent
from memory.session_memory import memory_manager

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str = ""


class ChatResponse(BaseModel):
    response: str
    session_id: str
    intent: str
    raw_data: dict | list | None = None
    provider: str
    timestamp: int


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session_id = req.session_id or str(uuid.uuid4())
    history = await memory_manager.get_history(session_id)

    result = await run_agent(req.message, session_id, history)

    # Save to memory
    await memory_manager.save_message(session_id, "user", req.message)
    await memory_manager.save_message(session_id, "assistant", result["response"])

    return ChatResponse(
        response=result["response"],
        session_id=session_id,
        intent=result["intent"],
        raw_data=result.get("raw_data"),
        provider=result.get("provider", "unknown"),
        timestamp=int(time.time()),
    )


@router.delete("/{session_id}")
async def clear_chat(session_id: str):
    await memory_manager.clear_session(session_id)
    return {"status": "cleared", "session_id": session_id}


@router.get("/{session_id}/history")
async def get_history(session_id: str):
    history = await memory_manager.get_history(session_id)
    return {"session_id": session_id, "history": history}
