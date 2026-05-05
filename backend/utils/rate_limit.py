"""
FinBuddy AI — Simple in-process rate limiter
Falls back gracefully; won't crash if Redis is absent.
"""
import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from core.config import settings

logger = logging.getLogger(__name__)

# In-memory fallback: {ip: [timestamps]}
_request_log: dict[str, list[float]] = defaultdict(list)
_WINDOW = 60.0  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Only rate-limit the chat endpoint
        if request.url.path != "/chat":
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Purge old entries
        _request_log[ip] = [t for t in _request_log[ip] if now - t < _WINDOW]

        if len(_request_log[ip]) >= settings.RATE_LIMIT_PER_MINUTE:
            logger.warning(f"Rate limit hit for {ip}")
            raise HTTPException(
                status_code=429,
                detail=f"Too many requests. Limit: {settings.RATE_LIMIT_PER_MINUTE}/min.",
            )

        _request_log[ip].append(now)
        return await call_next(request)
