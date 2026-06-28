"""Endpoints to run a misinformation check and list a user's history."""
import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Check, User
from ..pipeline.runner import PipelineError, run_pipeline
from ..rate_limit import limiter
from ..schemas import (
    CheckRequest,
    CheckResponse,
    CheckSummary,
    FactCheckResult,
)
from ..security import validate_media_url

router = APIRouter(prefix="/api/checks", tags=["checks"])


def _to_response(check: Check) -> CheckResponse:
    return CheckResponse(
        id=check.id,
        source_url=check.source_url,
        title=check.title,
        transcript=check.transcript,
        result=FactCheckResult(**json.loads(check.result_json)),
        overall_verdict=check.overall_verdict,
        created_at=check.created_at,
    )


@router.post("", response_model=CheckResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour")
def create_check(
    request: Request,  # required by slowapi
    payload: CheckRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckResponse:
    # Validate / sanitise the URL (scheme, host, SSRF guards).
    try:
        url = validate_media_url(payload.url)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Run the full download -> transcribe -> fact-check pipeline.
    try:
        result = run_pipeline(url)
    except PipelineError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )

    check = Check(
        user_id=user.id,
        source_url=url,
        title=result.title,
        transcript=result.transcript,
        result_json=json.dumps(result.result),
        overall_verdict=result.result.get("overall_verdict"),
    )
    db.add(check)
    db.commit()
    db.refresh(check)
    return _to_response(check)


@router.get("", response_model=list[CheckSummary])
def list_checks(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50,
) -> list[CheckSummary]:
    limit = max(1, min(limit, 100))
    rows = db.scalars(
        select(Check)
        .where(Check.user_id == user.id)
        .order_by(Check.created_at.desc())
        .limit(limit)
    ).all()
    return [
        CheckSummary(
            id=c.id,
            source_url=c.source_url,
            title=c.title,
            overall_verdict=c.overall_verdict,
            created_at=c.created_at,
        )
        for c in rows
    ]


@router.get("/{check_id}", response_model=CheckResponse)
def get_check(
    check_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CheckResponse:
    check = db.get(Check, check_id)
    # Scope to the owner so users can never read another user's checks.
    if check is None or check.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return _to_response(check)
