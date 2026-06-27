"""
models.py — Pydantic schemas for request validation and response serialization.
All fields are documented inline so FastAPI auto-docs (/docs) is self-explanatory.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


# ─── Product ────────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, description="Product display name")
    weight: str = Field(..., description="Net weight / volume e.g. '500g' or '1L'")
    price: float = Field(..., gt=0, description="Price in INR (₹), must be > 0")
    description: str = Field(..., max_length=500, description="Short product description")
    ingredients: list[str] = Field(default_factory=list, description="Key ingredients list")
    sku: str = Field(..., min_length=2, max_length=40, description="Stock-keeping unit code")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    """All fields optional — supports partial updates (PATCH-style via PUT)."""
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    weight: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=500)
    ingredients: Optional[list[str]] = None
    sku: Optional[str] = Field(None, min_length=2, max_length=40)


class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Inventory ───────────────────────────────────────────────────────────────

class InventoryItemBase(BaseModel):
    sku: str = Field(..., description="Matches a Product.sku")
    item_type: str = Field(..., pattern="^(raw_material|finished_good)$",
                           description="'raw_material' or 'finished_good'")
    unit: str = Field(..., description="Unit of measurement e.g. 'kg', 'litres', 'units'")
    current_quantity: float = Field(0.0, ge=0)
    low_stock_threshold: float = Field(50.0, ge=0,
                                       description="Alert fires when quantity falls below this")


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItem(InventoryItemBase):
    id: str
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TransactionCreate(BaseModel):
    sku: str = Field(..., description="SKU of the inventory item to adjust")
    direction: str = Field(..., pattern="^(in|out)$", description="'in' to add, 'out' to subtract")
    quantity: float = Field(..., gt=0, description="Quantity to add or subtract (always positive)")
    batch_id: Optional[str] = Field(None, description="Optional batch reference")
    note: Optional[str] = Field(None, max_length=200)


class Transaction(TransactionCreate):
    id: str
    timestamp: datetime
    resulting_quantity: float

    model_config = {"from_attributes": True}


# ─── Quality Control ─────────────────────────────────────────────────────────

class QCCheckResult(BaseModel):
    check_name: str
    passed: bool
    note: Optional[str] = None


class QCRecordCreate(BaseModel):
    batch_id: str = Field(..., description="Batch being inspected")
    product_sku: str
    status: str = Field(..., pattern="^(pass|fail|hold)$")
    checks: list[QCCheckResult] = Field(default_factory=list)
    checked_by: str = Field(..., min_length=1)


class QCRecord(QCRecordCreate):
    id: str
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─── Production ──────────────────────────────────────────────────────────────

class ProductionRunCreate(BaseModel):
    batch_id: str = Field(..., description="Unique batch identifier e.g. HK-2026-001")
    product_sku: str
    quantity_produced: float = Field(..., gt=0, description="Output in the product's unit")
    start_time: datetime
    end_time: datetime
    downtime_notes: Optional[str] = Field(None, max_length=400)

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class ProductionRun(ProductionRunCreate):
    id: str
    duration_minutes: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── WhatsApp Inquiry ────────────────────────────────────────────────────────

class InquiryCreate(BaseModel):
    product_id: str
    message: str = Field(..., max_length=500)
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class Inquiry(InquiryCreate):
    id: str
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─── Generic responses ───────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
