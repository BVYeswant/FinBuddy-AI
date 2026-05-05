"""
FinBuddy AI — Session Memory Manager
Tries Redis first; falls back to in-process dict if unavailable.
"""
import json
import logging
import time
from typing import Optional
from core.config import settings

logger = logging.getLogger(__name__)

_in_memory_store: dict[str, dict] = {}  # fallback


class MemoryManager:
    def __init__(self):
        self._redis = None
        self._use_redis = False
        self._ttl = settings.DEFAULT_SESSION_TTL

    async def _get_redis(self):
        if self._redis is not None:
            return self._redis
        try:
            import redis.asyncio as aioredis
            self._redis = await aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            self._use_redis = True
            logger.info("✅ Redis connected")
        except Exception as e:
            logger.warning(f"Redis unavailable, using in-memory store: {e}")
            self._use_redis = False
        return self._redis

    async def get_history(self, session_id: str) -> list[dict]:
        await self._get_redis()
        if self._use_redis and self._redis:
            try:
                raw = await self._redis.get(f"session:{session_id}")
                if raw:
                    data = json.loads(raw)
                    return data.get("history", [])
            except Exception as e:
                logger.warning(f"Redis get error: {e}")
        # fallback
        return _in_memory_store.get(session_id, {}).get("history", [])

    async def save_message(self, session_id: str, role: str, content: str):
        history = await self.get_history(session_id)
        history.append({"role": role, "content": content, "ts": int(time.time())})
        # Keep last N turns
        max_turns = settings.MAX_HISTORY_TURNS * 2
        if len(history) > max_turns:
            history = history[-max_turns:]

        payload = json.dumps({"history": history})
        await self._get_redis()
        if self._use_redis and self._redis:
            try:
                await self._redis.setex(f"session:{session_id}", self._ttl, payload)
                return
            except Exception as e:
                logger.warning(f"Redis set error: {e}")
        _in_memory_store[session_id] = {"history": history}

    async def clear_session(self, session_id: str):
        await self._get_redis()
        if self._use_redis and self._redis:
            try:
                await self._redis.delete(f"session:{session_id}")
            except Exception:
                pass
        _in_memory_store.pop(session_id, None)


memory_manager = MemoryManager()
