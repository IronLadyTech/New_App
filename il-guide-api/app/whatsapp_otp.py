"""WhatsApp Cloud API OTP: send a code with an authentication template, verify it,
then mint a Firebase custom token so the app can signInWithCustomToken."""

import hashlib
import hmac
import json
import re
import secrets
import threading
import time

import httpx
from fastapi import HTTPException

from .config import settings

CODE_TTL_SECONDS = 300
RESEND_COOLDOWN_SECONDS = 30
MAX_ATTEMPTS = 5
MAX_SENDS_PER_HOUR = 5

# phone -> {hash, expires, attempts, sent_at: [timestamps]}
# In-memory: fine for one instance (Render free). Move to Redis if you scale out.
_store: dict[str, dict] = {}
_lock = threading.Lock()
_secret = secrets.token_bytes(32)


def normalize_phone(raw: str) -> str:
    """Return digits-only E.164 (no '+'), defaulting 10-digit numbers to India."""
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 10:
        digits = "91" + digits
    if not 11 <= len(digits) <= 15:
        raise HTTPException(status_code=400, detail="Enter a valid mobile number.")
    return digits


def _hash(phone: str, code: str) -> str:
    return hmac.new(_secret, f"{phone}:{code}".encode(), hashlib.sha256).hexdigest()


def is_configured() -> bool:
    return bool(settings.whatsapp_token and settings.whatsapp_phone_number_id)


async def _send_template(phone: str, code: str) -> None:
    url = (
        f"https://graph.facebook.com/{settings.whatsapp_api_version}/"
        f"{settings.whatsapp_phone_number_id}/messages"
    )
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": {
            "name": settings.whatsapp_otp_template,
            "language": {"code": settings.whatsapp_otp_language},
            "components": [
                {"type": "body", "parameters": [{"type": "text", "text": code}]},
                # Authentication templates carry a copy-code / one-tap button.
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [{"type": "text", "text": code}],
                },
            ],
        },
    }
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {settings.whatsapp_token}"},
        )
    if res.status_code >= 400:
        try:
            err = res.json().get("error", {})
        except ValueError:
            err = {}
        print(f"WhatsApp send failed {res.status_code}: {err or res.text}")
        raise HTTPException(
            status_code=502,
            detail="Could not send the WhatsApp code. Check the number has WhatsApp.",
        )


async def send_otp(raw_phone: str) -> dict:
    if not is_configured():
        raise HTTPException(status_code=503, detail="WhatsApp OTP is not configured.")
    phone = normalize_phone(raw_phone)
    now = time.time()

    with _lock:
        entry = _store.get(phone) or {"sent_at": []}
        sent_at = [t for t in entry["sent_at"] if now - t < 3600]
        if sent_at and now - sent_at[-1] < RESEND_COOLDOWN_SECONDS:
            wait = int(RESEND_COOLDOWN_SECONDS - (now - sent_at[-1])) + 1
            raise HTTPException(status_code=429, detail=f"Wait {wait}s before resending.")
        if len(sent_at) >= MAX_SENDS_PER_HOUR:
            raise HTTPException(status_code=429, detail="Too many codes. Try again later.")

        code = f"{secrets.randbelow(1_000_000):06d}"
        _store[phone] = {
            "hash": _hash(phone, code),
            "expires": now + CODE_TTL_SECONDS,
            "attempts": 0,
            "sent_at": sent_at + [now],
        }

    await _send_template(phone, code)
    return {"sent": True, "expiresIn": CODE_TTL_SECONDS, "resendIn": RESEND_COOLDOWN_SECONDS}


def _firebase_custom_token(phone: str) -> str:
    import firebase_admin
    from firebase_admin import auth as fb_auth, credentials

    if not firebase_admin._apps:
        if not settings.firebase_service_account_json:
            raise HTTPException(status_code=503, detail="Firebase admin is not configured.")
        cred = credentials.Certificate(json.loads(settings.firebase_service_account_json))
        firebase_admin.initialize_app(cred)

    e164 = f"+{phone}"
    try:
        user = fb_auth.get_user_by_phone_number(e164)
    except fb_auth.UserNotFoundError:
        user = fb_auth.create_user(phone_number=e164)
    token = fb_auth.create_custom_token(user.uid)
    return token.decode() if isinstance(token, bytes) else token


def verify_otp(raw_phone: str, code: str) -> dict:
    phone = normalize_phone(raw_phone)
    code = re.sub(r"\D", "", code or "")
    now = time.time()

    with _lock:
        entry = _store.get(phone)
        if not entry or "hash" not in entry or now > entry["expires"]:
            raise HTTPException(status_code=400, detail="Code expired. Request a new one.")
        if entry["attempts"] >= MAX_ATTEMPTS:
            raise HTTPException(status_code=429, detail="Too many attempts. Request a new code.")
        entry["attempts"] += 1
        if not hmac.compare_digest(entry["hash"], _hash(phone, code)):
            raise HTTPException(status_code=400, detail="That code is not right.")
        # One-time use; keep send history for rate limiting.
        _store[phone] = {"sent_at": entry["sent_at"]}

    return {"verified": True, "token": _firebase_custom_token(phone)}
