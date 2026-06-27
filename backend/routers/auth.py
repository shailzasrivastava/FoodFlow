"""
routers/auth.py

POST  /api/auth/login   — validate admin credentials → return token
POST  /api/auth/logout  — invalidate token
GET   /api/auth/me      — return current user info (requires token)
"""
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# In-memory token store: { token: { username, created_at } }
_active_tokens: dict[str, dict] = {}

security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str
    message: str


def get_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """FastAPI dependency — protects admin-only endpoints."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    session = _active_tokens.get(token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return session


@router.post("/login", response_model=LoginResponse, status_code=200)
def login(body: LoginRequest):
    expected_user = os.getenv("ADMIN_USERNAME", "admin")
    expected_pass = os.getenv("ADMIN_PASSWORD", "himshakti2026")

    if body.username != expected_user or body.password != expected_pass:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
        )

    token = str(uuid.uuid4())
    _active_tokens[token] = {
        "username": body.username,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return LoginResponse(token=token, username=body.username, message="Login successful.")


@router.post("/logout", status_code=200)
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials and credentials.credentials in _active_tokens:
        del _active_tokens[credentials.credentials]
    return {"message": "Logged out successfully."}


@router.get("/me", status_code=200)
def me(session=Depends(get_admin)):
    return {"username": session["username"], "created_at": session["created_at"]}
