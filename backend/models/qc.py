from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone


class QCCheckResult(Document):
    check_name: str
    passed: bool
    note: Optional[str] = None


class QCRecord(Document):
    batch_id: str
    product_sku: str
    status: str
    checks: list[dict] = []
    checked_by: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "qc_records"