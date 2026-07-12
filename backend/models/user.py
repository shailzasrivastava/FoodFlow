from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import datetime, timezone


class User(Document):
    email: str
    hashed_password: Optional[str] = None
    full_name: Optional[str] = None
    is_admin: bool = False
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "users"
        indexes = ["email"]