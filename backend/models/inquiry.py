from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime, timezone


class Inquiry(Document):
    product_id: str
    message: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "inquiries"