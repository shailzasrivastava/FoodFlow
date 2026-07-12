"""
routers/auth.py

POST  /api/auth/register        — register new user
POST  /api/auth/login           — login, returns JWT
POST  /api/auth/logout          — logout (client drops token)
GET   /api/auth/me              — get current user
GET   /api/auth/google          — redirect to Google OAuth
GET   /api/auth/google/callback — Google OAuth callback
"""
import os
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, field_validator
from passlib.context import CryptContext
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.user import User
from utils.jwt import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
limiter = Limiter(key_func=get_remote_address)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ── Request schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""

    @field_validator("email")
    @classmethod
    def email_valid(cls, v):
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("password")
    @classmethod
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters.")
        return v.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v):
        v = v.strip().lower()
        if "@" not in v:
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v):
        if not v:
            raise ValueError("Password is required.")
        return v


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, body: RegisterRequest):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )
    hashed = pwd_context.hash(body.password)
    user = User(
        email=body.email,
        hashed_password=hashed,
        full_name=body.full_name,
        is_admin=False,
    )
    await user.insert()
    token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    return {
        "token": token,
        "email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin,
        "message": "Account created successfully.",
    }


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", status_code=200)
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest):
    user = await User.find_one(User.email == body.email)

    # Also allow the hardcoded admin from .env
    admin_email = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "himshakti2026")

    if body.email == admin_email and body.password == admin_pass:
        token = create_access_token({"sub": admin_email, "is_admin": True})
        return {
            "token": token,
            "email": admin_email,
            "full_name": "Admin",
            "is_admin": True,
            "message": "Login successful.",
        }

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    return {
        "token": token,
        "email": user.email,
        "full_name": user.full_name or "",
        "is_admin": user.is_admin,
        "message": "Login successful.",
    }


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout", status_code=200)
async def logout():
    # JWT is stateless — client drops the token
    return {"message": "Logged out successfully."}


# ── Me ────────────────────────────────────────────────────────────────────────

@router.get("/me", status_code=200)
async def me(current_user=Depends(get_current_user)):
    return {
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_admin": current_user.is_admin,
        "oauth_provider": current_user.oauth_provider,
    }


# ── Google OAuth ──────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured.")
    scope = "openid email profile"
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
    )
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str = None, error: str = None):
    if error or not code:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_cancelled")

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )

    if token_response.status_code != 200:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if user_info_response.status_code != 200:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")

    user_info = user_info_response.json()
    email = user_info.get("email")
    full_name = user_info.get("name", "")
    google_id = user_info.get("id")

    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_email")

    # Find or create user
    user = await User.find_one(User.email == email)
    if not user:
        user = User(
            email=email,
            full_name=full_name,
            oauth_provider="google",
            oauth_id=google_id,
            is_admin=False,
        )
        await user.insert()
    elif not user.oauth_provider:
        user.oauth_provider = "google"
        user.oauth_id = google_id
        await user.save()

    jwt_token = create_access_token({"sub": user.email, "is_admin": user.is_admin})
    return RedirectResponse(
        f"{FRONTEND_URL}/auth/callback?token={jwt_token}"
        f"&email={email}&name={full_name}&is_admin={user.is_admin}"
    )