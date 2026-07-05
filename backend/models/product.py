from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone


class Product(Document):
    name: str
    weight: str
    price: float
    description: str
    ingredients: list[str] = []
    sku: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "products"
        indexes = ["sku"]