"""Shared firebase-admin init from FIREBASE_SERVICE_ACCOUNT_JSON (OTP tokens, CMS config)."""

import json

from .config import settings


def get_app():
    """Return the default firebase_admin app, or None when no service account is set."""
    if not settings.firebase_service_account_json:
        return None
    import firebase_admin
    from firebase_admin import credentials

    if not firebase_admin._apps:
        cred = credentials.Certificate(json.loads(settings.firebase_service_account_json))
        firebase_admin.initialize_app(cred)
    return firebase_admin.get_app()
