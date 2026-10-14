"""IL Guide settings edited in the web admin (Firestore cms_config/ilGuide), cached for 60s.
Missing service account or doc -> empty dict, so the built-in defaults apply."""

import time

from .firebase_admin_client import get_app

_TTL_SECONDS = 60
_cache: dict = {"at": 0.0, "value": {}}


def il_guide_config() -> dict:
    now = time.time()
    if now - _cache["at"] < _TTL_SECONDS:
        return _cache["value"]
    value = _cache["value"]
    try:
        if get_app() is not None:
            from firebase_admin import firestore

            snap = firestore.client().collection("cms_config").document("ilGuide").get()
            value = snap.to_dict() or {} if snap.exists else {}
    except Exception as exc:  # keep serving the last good config
        print(f"IL Guide config read failed: {exc}")
    _cache.update(at=now, value=value)
    return value


def active_quotations(cfg: dict) -> list[dict]:
    return [
        {"id": q.get("id"), "text": q["text"], "author": q["author"]}
        for q in cfg.get("quotations") or []
        if q.get("active", True) and q.get("text") and q.get("author")
    ]
