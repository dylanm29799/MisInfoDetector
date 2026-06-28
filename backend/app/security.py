"""Security helpers: password hashing, JWT tokens, and URL validation."""
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import bcrypt
from jose import JWTError, jwt

from .config import get_settings

settings = get_settings()

# --- Passwords ---------------------------------------------------------------
# bcrypt has a hard 72-byte input limit; we truncate the encoded password so
# longer inputs don't raise. Hashing is one-way and salted per password.


def hash_password(password: str) -> str:
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8")[:72], password_hash.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False


# --- JWT ---------------------------------------------------------------------


def create_access_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        sub = payload.get("sub")
        return int(sub) if sub is not None else None
    except (JWTError, ValueError):
        return None


# --- URL validation ----------------------------------------------------------
# Only allow http/https links to public hosts. This prevents users from
# pointing the downloader at internal addresses (SSRF) or odd schemes.

_BLOCKED_HOSTS = {
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
    "169.254.169.254",  # cloud metadata endpoint
}


def validate_media_url(url: str) -> str:
    url = (url or "").strip()
    if len(url) > 2048:
        raise ValueError("URL is too long.")

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("URL must start with http:// or https://")
    if not parsed.netloc:
        raise ValueError("URL is missing a host.")

    host = (parsed.hostname or "").lower()
    if host in _BLOCKED_HOSTS or host.endswith(".local"):
        raise ValueError("That host is not allowed.")
    # Block private / link-local IP ranges.
    if (
        host.startswith("10.")
        or host.startswith("192.168.")
        or host.startswith("169.254.")
        or any(host.startswith(f"172.{i}.") for i in range(16, 32))
    ):
        raise ValueError("Private network addresses are not allowed.")

    return url
