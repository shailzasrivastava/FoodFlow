"""
store.py — In-memory data store with seeded Foodflow catalog.
Replace with MongoDB Atlas calls in Week 5.
"""
from __future__ import annotations
from datetime import datetime, timezone
from threading import Lock
import uuid

_lock = Lock()

products: dict[str, dict] = {}
inventory: dict[str, dict] = {}
transactions: list[dict] = []
qc_records: list[dict] = []
production_runs: list[dict] = []
inquiries: list[dict] = []


def _now():
    return datetime.now(timezone.utc)


def _id():
    return str(uuid.uuid4())


def _seed():
    now = _now()
    _products = [
        {"name": "Pahadi Wild Honey", "weight": "500g", "price": 450.0, "category": "Honey",
         "description": "Raw, single-origin honey harvested from forest hives in the lower foothills of Uttarakhand. Cold-extracted and never heated, so every enzyme and nutrient stays intact. Deep amber in colour with a complex floral note that changes subtly with each season.",
         "ingredients": ["wild honey"], "sku": "HIM-HON-500", "image_url": None},
        {"name": "Hand-Pounded Turmeric", "weight": "250g", "price": 180.0, "category": "Spices",
         "description": "Sun-dried turmeric rhizomes, stone-ground in small batches to preserve full curcumin content, colour, and aroma. A vivid deep orange — very different from the pale powders in supermarket packets.",
         "ingredients": ["organic turmeric"], "sku": "HIM-TUR-250", "image_url": None},
        {"name": "Roasted Makhana", "weight": "200g", "price": 220.0, "category": "Snacks",
         "description": "Lightly roasted fox nuts with Himalayan rock salt. Sourced from Bihar's wetland farms and roasted the same day they arrive at the unit. High protein, low calorie — the snack HimShakti's own team reaches for first.",
         "ingredients": ["fox nuts", "himalayan rock salt"], "sku": "HIM-MAK-200", "image_url": None},
        {"name": "Litti Masala Mix", "weight": "150g", "price": 120.0, "category": "Spices",
         "description": "The family spice blend that makes a good litti. Sattu base with ajwain, dried mango powder, and the right amount of pickle masala. Ready to use straight from the pack — just knead it into the dough.",
         "ingredients": ["sattu", "ajwain", "amchur", "mustard oil", "pickle masala"],
         "sku": "HIM-LIT-150", "image_url": None},
        {"name": "Cold-Pressed Mustard Oil", "weight": "1L", "price": 320.0, "category": "Oils",
         "description": "Traditional kolhu (wooden press) mustard oil with a genuinely sharp, pungent flavour. Cold-pressed in small runs, so it never sits in storage long. The kind of mustard oil that actually smells like mustard.",
         "ingredients": ["mustard seeds"], "sku": "HIM-MUS-1L", "image_url": None},
        {"name": "Himalayan Rock Salt", "weight": "500g", "price": 90.0, "category": "Essentials",
         "description": "Hand-mined pink salt from Himalayan deposits, coarse-ground for everyday cooking. Mild, mineral-rich flavour without the harsh edge of processed table salt.",
         "ingredients": ["himalayan salt"], "sku": "HIM-SAL-500", "image_url": None},
    ]
    for p in _products:
        pid = _id()
        products[pid] = {**p, "id": pid, "created_at": now, "updated_at": now}

    _inventory = [
        {"sku": "HIM-HON-500", "item_type": "finished_good", "unit": "units",
         "current_quantity": 340, "low_stock_threshold": 50},
        {"sku": "HIM-TUR-250", "item_type": "finished_good", "unit": "units",
         "current_quantity": 820, "low_stock_threshold": 100},
        {"sku": "HIM-MAK-200", "item_type": "finished_good", "unit": "units",
         "current_quantity": 40, "low_stock_threshold": 60},
        {"sku": "HIM-LIT-150", "item_type": "finished_good", "unit": "units",
         "current_quantity": 610, "low_stock_threshold": 80},
        {"sku": "HIM-MUS-1L", "item_type": "finished_good", "unit": "units",
         "current_quantity": 195, "low_stock_threshold": 50},
        {"sku": "HIM-SAL-500", "item_type": "finished_good", "unit": "units",
         "current_quantity": 720, "low_stock_threshold": 100},
    ]
    for item in _inventory:
        iid = _id()
        inventory[iid] = {
            **item, "id": iid,
            "is_low_stock": item["current_quantity"] < item["low_stock_threshold"],
            "created_at": now, "updated_at": now,
        }


_seed()


def get_lock():
    return _lock
