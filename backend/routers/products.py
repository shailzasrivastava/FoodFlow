"""
routers/products.py — MongoDB version

GET    /api/products            — list all (public)
GET    /api/products/search     — search by name/description (public)
GET    /api/products/{id}       — single product (public)
POST   /api/products            — create  [admin] → 201
PUT    /api/products/{id}       — update  [admin] → 200
DELETE /api/products/{id}       — delete  [admin] → 204
"""
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel, Field

from models.product import Product
from utils.jwt import get_admin_user as get_admin

router = APIRouter(prefix="/api/products", tags=["Products"])


def _now():
    return datetime.now(timezone.utc)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    weight: str
    price: float = Field(..., gt=0)
    description: str = Field(..., max_length=2000)
    ingredients: list[str] = []
    sku: str = Field(..., min_length=2, max_length=40)
    image_url: Optional[str] = None
    category: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    ingredients: Optional[list[str]] = None
    sku: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None


def product_to_dict(p: Product) -> dict:
    d = p.model_dump()
    d["id"] = str(p.id)
    d.pop("revision_id", None)
    return d


@router.get("", status_code=200)
async def list_products():
    products = await Product.find_all().to_list()
    return sorted([product_to_dict(p) for p in products], key=lambda x: x["name"])


@router.get("/search", status_code=200)
async def search_products(q: Optional[str] = Query(None, min_length=1)):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required.")
    term = q.lower()
    products = await Product.find_all().to_list()
    results = [
        product_to_dict(p) for p in products
        if term in p.name.lower()
        or term in p.description.lower()
        or any(term in i.lower() for i in p.ingredients)
    ]
    return sorted(results, key=lambda x: x["name"])


@router.get("/{product_id}", status_code=200)
async def get_product(product_id: str):
    try:
        product = await Product.get(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return product_to_dict(product)


@router.post("", status_code=201, dependencies=[Depends(get_admin)])
async def create_product(body: ProductCreate):
    existing = await Product.find_one(Product.sku == body.sku)
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{body.sku}' already exists.")
    product = Product(**body.model_dump())
    await product.insert()
    return product_to_dict(product)


@router.put("/{product_id}", status_code=200, dependencies=[Depends(get_admin)])
async def update_product(product_id: str, body: ProductUpdate):
    try:
        product = await Product.get(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    if "sku" in updates and updates["sku"] != product.sku:
        existing = await Product.find_one(Product.sku == updates["sku"])
        if existing:
            raise HTTPException(status_code=400, detail=f"SKU '{updates['sku']}' already exists.")

    updates["updated_at"] = _now()
    await product.set(updates)
    return product_to_dict(product)


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(get_admin)])
async def delete_product(product_id: str):
    try:
        product = await Product.get(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    await product.delete()
