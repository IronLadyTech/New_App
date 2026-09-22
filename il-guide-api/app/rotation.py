"""Track last whisper per participant/surface — Redis with in-memory fallback."""

from __future__ import annotations

import time
from typing import Optional

from .config import settings

_memory: dict[str, tuple[str, float]] = {}
_redis = None
_redis_checked = False


def _get_redis():
    global _redis, _redis_checked
    if _redis_checked:
        return _redis
    _redis_checked = True
    if not settings.redis_url:
        return None
    try:
        import redis

        client = redis.from_url(settings.redis_url, decode_responses=True)
        client.ping()
        _redis = client
    except Exception:
        _redis = None
    return _redis


def _key(participant_id: str, surface: str) -> str:
    return f"ilguide:last:{participant_id}:{surface}"


def get_last_message_id(participant_id: str, surface: str) -> Optional[str]:
    client = _get_redis()
    if client:
        try:
            return client.get(_key(participant_id, surface))
        except Exception:
            pass
    entry = _memory.get(_key(participant_id, surface))
    return entry[0] if entry else None


def set_last_message_id(participant_id: str, surface: str, message_id: str) -> None:
    client = _get_redis()
    if client:
        try:
            client.setex(_key(participant_id, surface), 60 * 60 * 24 * 30, message_id)
            return
        except Exception:
            pass
    _memory[_key(participant_id, surface)] = (message_id, time.time())
