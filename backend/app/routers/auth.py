"""Signup and login endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, SignupRequest, TokenResponse
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

# A real bcrypt hash of a random string, used to equalise login timing when
# the supplied email isn't registered.
_DUMMY_HASH = hash_password("dummy-password-for-constant-time-login")


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.lower().strip()

    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, email=user.email)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = payload.email.lower().strip()
    user = db.scalar(select(User).where(User.email == email))

    # Always run a bcrypt verify (against a dummy hash if the account doesn't
    # exist) so response timing doesn't reveal whether the email is registered.
    # One generic error covers both the missing-user and wrong-password cases.
    stored_hash = user.password_hash if user is not None else _DUMMY_HASH
    password_ok = verify_password(payload.password, stored_hash)
    if user is None or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, email=user.email)
