from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone


class ProductionRun(Document):
    batch_id: str
    product_sku: str
    quantity_produced: float
    start_time: datetime
    end_time: datetime
    duration_minutes: float
    downtime_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "production_runs"