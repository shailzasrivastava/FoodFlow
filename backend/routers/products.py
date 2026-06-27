"""
routers/products.py

GET    /api/products            — list all (public)
GET    /api/products/search     — search (public)
GET    /api/products/{id}       — single product (public)
POST   /api/products            — create  [admin]  → 201
PUT    /api/products/{id}       — update  [admin]  → 200
DELETE /api/products/{id}       — delete  [admin]  → 204
"""
from datetime import datetime, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel, Field
import store
from routers.auth import get_admin

router = APIRouter(prefix="/api/products", tags=["Products"])


def _now():
    return datetime.now(timezone.utc)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    weight: str = Field(...)
    price: float = Field(..., gt=0)
    description: str = Field(..., max_length=2000)
    ingredients: list[str] = Field(default_factory=list)
    sku: str = Field(..., min_length=2, max_length=40)
    image_url: Optional[str] = Field(None, description="Base64 data URL or external URL")
    category: Optional[str] = Field(None, max_length=60)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    weight: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, max_length=2000)
    ingredients: Optional[list[str]] = None
    sku: Optional[str] = Field(None, min_length=2, max_length=40)
    image_url: Optional[str] = None
    category: Optional[str] = None


def _find(product_id: str):
    p = store.products.get(product_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return p


@router.get("", status_code=200)
def list_products():
    with store.get_lock():
        return sorted(store.products.values(), key=lambda p: p["name"])


@router.get("/search", status_code=200)
def search_products(q: Optional[str] = Query(None, min_length=1)):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")
    term = q.lower()
    with store.get_lock():
        return sorted(
            [p for p in store.products.values()
             if term in p["name"].lower()
             or term in p["description"].lower()
             or any(term in i.lower() for i in p.get("ingredients", []))],
            key=lambda p: p["name"]
        )


@router.get("/{product_id}", status_code=200)
def get_product(product_id: str):
    with store.get_lock():
        return _find(product_id)


@router.post("", status_code=201, dependencies=[Depends(get_admin)])
def create_product(body: ProductCreate):
    with store.get_lock():
        if any(p["sku"] == body.sku for p in store.products.values()):
            raise HTTPException(status_code=400,
                                detail=f"SKU '{body.sku}' already exists.")
        now = _now()
        pid = str(uuid.uuid4())
        product = {**body.model_dump(), "id": pid, "created_at": now, "updated_at": now}
        store.products[pid] = product
        return product


@router.put("/{product_id}", status_code=200, dependencies=[Depends(get_admin)])
def update_product(product_id: str, body: ProductUpdate):
    with store.get_lock():
        product = _find(product_id)
        updates = body.model_dump(exclude_none=True)
        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update.")
        if "sku" in updates and updates["sku"] != product["sku"]:
            if any(p["sku"] == updates["sku"]
                   for pid, p in store.products.items() if pid != product_id):
                raise HTTPException(status_code=400,
                                    detail=f"SKU '{updates['sku']}' already exists.")
        product.update({**updates, "updated_at": _now()})
        return product


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(get_admin)])
def delete_product(product_id: str):
    with store.get_lock():
        _find(product_id)
        del store.products[product_id]
