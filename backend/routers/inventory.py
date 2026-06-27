"""
routers/inventory.py

GET    /api/inventory                   — list all inventory items
GET    /api/inventory/low-stock         — items below their low_stock_threshold
GET    /api/inventory/{id}              — get one inventory item
POST   /api/inventory                   — create an inventory item     → 201
POST   /api/inventory/transactions      — log a stock in/out           → 201
GET    /api/inventory/transactions      — list all transactions
"""
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, HTTPException, status
from models import InventoryItem, InventoryItemCreate, Transaction, TransactionCreate
import store

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _find(item_id: str) -> dict:
    item = store.inventory.get(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Inventory item '{item_id}' not found.")
    return item


# ── GET /api/inventory ───────────────────────────────────────────────────────

@router.get("", response_model=list[InventoryItem], status_code=status.HTTP_200_OK,
            summary="List all inventory items")
def list_inventory():
    with store.get_lock():
        return sorted(store.inventory.values(), key=lambda i: i["sku"])


# ── GET /api/inventory/low-stock ─────────────────────────────────────────────

@router.get("/low-stock", response_model=list[InventoryItem], status_code=status.HTTP_200_OK,
            summary="List items below their low-stock threshold")
def low_stock_items():
    with store.get_lock():
        return [i for i in store.inventory.values() if i["is_low_stock"]]


# ── GET /api/inventory/transactions ──────────────────────────────────────────

@router.get("/transactions", response_model=list[Transaction], status_code=status.HTTP_200_OK,
            summary="List all stock transactions (newest first)")
def list_transactions():
    with store.get_lock():
        return sorted(store.transactions, key=lambda t: t["timestamp"], reverse=True)


# ── GET /api/inventory/{id} ──────────────────────────────────────────────────

@router.get("/{item_id}", response_model=InventoryItem, status_code=status.HTTP_200_OK,
            summary="Get a single inventory item by ID")
def get_inventory_item(item_id: str):
    with store.get_lock():
        return _find(item_id)


# ── POST /api/inventory ──────────────────────────────────────────────────────

@router.post("", response_model=InventoryItem, status_code=status.HTTP_201_CREATED,
             summary="Create a new inventory item")
def create_inventory_item(body: InventoryItemCreate):
    with store.get_lock():
        if any(i["sku"] == body.sku for i in store.inventory.values()):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"An inventory item with SKU '{body.sku}' already exists.")
        now = _now()
        iid = str(uuid.uuid4())
        item = {
            **body.model_dump(),
            "id": iid,
            "is_low_stock": body.current_quantity < body.low_stock_threshold,
            "created_at": now,
            "updated_at": now,
        }
        store.inventory[iid] = item
        return item


# ── POST /api/inventory/transactions ─────────────────────────────────────────

@router.post("/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED,
             summary="Log a stock-in or stock-out transaction")
def log_transaction(body: TransactionCreate):
    with store.get_lock():
        # Find the inventory item by SKU
        item = next((i for i in store.inventory.values() if i["sku"] == body.sku), None)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"No inventory item found with SKU '{body.sku}'.")

        # Apply the transaction
        if body.direction == "in":
            item["current_quantity"] += body.quantity
        else:
            if item["current_quantity"] < body.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot remove {body.quantity} {item['unit']} — only "
                           f"{item['current_quantity']} on hand.")
            item["current_quantity"] -= body.quantity

        item["is_low_stock"] = item["current_quantity"] < item["low_stock_threshold"]
        item["updated_at"] = _now()

        txn = {
            **body.model_dump(),
            "id": str(uuid.uuid4()),
            "timestamp": _now(),
            "resulting_quantity": item["current_quantity"],
        }
        store.transactions.append(txn)
        return txn
