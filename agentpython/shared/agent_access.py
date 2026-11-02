"""Session-bound access grants issued by Java; the signing secret never reaches the browser."""
import base64
import hashlib
import hmac
import json
import os
import time

from fastapi import HTTPException


def session_grant(token: str, session_id: str) -> dict:
    secret = os.getenv("AGENT_SHARED_SECRET", "")
    if not secret and os.getenv("AGENT_AUTH_REQUIRED", "false").lower() != "true":
        return {}
    if not secret:
        raise HTTPException(503, "Agent authorization is not configured")
    try:
        payload, signature = token.split(".", 1)
        expected = base64.urlsafe_b64encode(hmac.new(secret.encode(), payload.encode("ascii"), hashlib.sha256).digest()).decode().rstrip("=")
        if not hmac.compare_digest(signature, expected):
            raise ValueError("signature")
        claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        if claims["session_id"] != session_id or claims["exp"] <= time.time():
            raise ValueError("session or expiry")
        return claims
    except Exception:
        raise HTTPException(401, "Invalid or expired interview access") from None


def service_authorized(key: str) -> bool:
    secret = os.getenv("AGENT_SHARED_SECRET", "")
    return bool(secret and hmac.compare_digest(key, secret))
