"""Pydantic request/response schemas. These validate and bound all input."""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# --- Auth --------------------------------------------------------------------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: EmailStr


# --- Checks ------------------------------------------------------------------
class CheckRequest(BaseModel):
    url: str = Field(min_length=5, max_length=2048)


class Source(BaseModel):
    title: str
    url: str


class Claim(BaseModel):
    claim: str
    verdict: str
    explanation: str
    correction: str | None = None
    sources: list[Source] = []


class FactCheckResult(BaseModel):
    overall_verdict: str
    summary: str
    claims: list[Claim] = []


class CheckResponse(BaseModel):
    id: int
    source_url: str
    title: str | None
    transcript: str
    result: FactCheckResult
    overall_verdict: str | None
    created_at: datetime


class CheckSummary(BaseModel):
    """Lightweight row for the dashboard list."""

    id: int
    source_url: str
    title: str | None
    overall_verdict: str | None
    created_at: datetime
