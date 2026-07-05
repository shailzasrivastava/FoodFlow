from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone


class InventoryItem(Document):
    sku: str
    item_type: str
    unit: str
    current_quantity: float = 0.0
    low_stock_threshold: float = 50.0
    is_low_stock: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "inventory"
        indexes = ["sku"]


class Transaction(Document):
    sku: str
    direction: str
    quantity: float
    batch_id: Optional[str] = None
    note: Optional[str] = None
    resulting_quantity: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "transactions"