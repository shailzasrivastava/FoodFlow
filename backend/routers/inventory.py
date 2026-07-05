"""
routers/inventory.py — MongoDB version
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

from models.inventory import InventoryItem, Transaction

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


def _now():
    return datetime.now(timezone.utc)


class InventoryItemCreate(BaseModel):
    sku: str
    item_type: str = Field(..., pattern="^(raw_material|finished_good)$")
    unit: str
    current_quantity: float = 0.0
    low_stock_threshold: float = 50.0


class TransactionCreate(BaseModel):
    sku: str
    direction: str = Field(..., pattern="^(in|out)$")
    quantity: float = Field(..., gt=0)
    batch_id: Optional[str] = None
    note: Optional[str] = None


def item_to_dict(i):
    d = i.model_dump()
    d["id"] = str(i.id)
    d.pop("revision_id", None)
    return d


@router.get("", status_code=200)
async def list_inventory():
    items = await InventoryItem.find_all().to_list()
    return sorted([item_to_dict(i) for i in items], key=lambda x: x["sku"])


@router.get("/low-stock", status_code=200)
async def low_stock_items():
    items = await InventoryItem.find(InventoryItem.is_low_stock == True).to_list()
    return [item_to_dict(i) for i in items]


@router.get("/transactions", status_code=200)
async def list_transactions():
    txns = await Transaction.find_all().to_list()
    return sorted([item_to_dict(t) for t in txns], key=lambda x: str(x["timestamp"]), reverse=True)


@router.get("/{item_id}", status_code=200)
async def get_inventory_item(item_id: str):
    try:
        item = await InventoryItem.get(item_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Inventory item '{item_id}' not found.")
    if not item:
        raise HTTPException(status_code=404, detail=f"Inventory item '{item_id}' not found.")
    return item_to_dict(item)


@router.post("", status_code=201)
async def create_inventory_item(body: InventoryItemCreate):
    existing = await InventoryItem.find_one(InventoryItem.sku == body.sku)
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{body.sku}' already exists.")
    item = InventoryItem(
        **body.model_dump(),
        is_low_stock=body.current_quantity < body.low_stock_threshold
    )
    await item.insert()
    return item_to_dict(item)


@router.post("/transactions", status_code=201)
async def log_transaction(body: TransactionCreate):
    item = await InventoryItem.find_one(InventoryItem.sku == body.sku)
    if not item:
        raise HTTPException(status_code=404, detail=f"No inventory item with SKU '{body.sku}'.")

    if body.direction == "in":
        item.current_quantity += body.quantity
    else:
        if item.current_quantity < body.quantity:
            raise HTTPException(status_code=400,
                detail=f"Cannot remove {body.quantity} {item.unit} — only {item.current_quantity} on hand.")
        item.current_quantity -= body.quantity

    item.is_low_stock = item.current_quantity < item.low_stock_threshold
    item.updated_at = _now()
    await item.save()

    txn = Transaction(
        sku=body.sku,
        direction=body.direction,
        quantity=body.quantity,
        batch_id=body.batch_id,
        note=body.note,
        resulting_quantity=item.current_quantity,
    )
    await txn.insert()
    return item_to_dict(txn)