"""
database.py — MongoDB connection via Beanie ODM
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

from models.product import Product
from models.inventory import InventoryItem, Transaction
from models.qc import QCRecord
from models.production import ProductionRun
from models.inquiry import Inquiry

load_dotenv()


async def init_db():
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "foodflow")

    if not mongo_uri:
        raise ValueError("MONGO_URI not set in .env file")

    client = AsyncIOMotorClient(mongo_uri)

    await init_beanie(
        database=client[db_name],
        document_models=[
            Product,
            InventoryItem,
            Transaction,
            QCRecord,
            ProductionRun,
            Inquiry,
        ]
    )

    print(f"Connected to MongoDB Atlas — database: {db_name}")
    await seed_if_empty()


async def seed_if_empty():
    """Seed the database with sample products only if it's empty."""
    count = await Product.count()
    if count > 0:
        return

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    products = [
        Product(name="Pahadi Wild Honey", weight="500g", price=450.0, category="Honey",
                description="Raw, single-origin honey harvested from forest hives in the lower foothills of Uttarakhand.",
                ingredients=["wild honey"], sku="HIM-HON-500"),
        Product(name="Hand-Pounded Turmeric", weight="250g", price=180.0, category="Spices",
                description="Sun-dried turmeric, stone-ground in small batches for full colour and aroma.",
                ingredients=["organic turmeric"], sku="HIM-TUR-250"),
        Product(name="Roasted Makhana", weight="200g", price=220.0, category="Snacks",
                description="Lightly roasted fox nuts with rock salt, sourced from Bihar's wetland farms.",
                ingredients=["fox nuts", "himalayan rock salt"], sku="HIM-MAK-200"),
        Product(name="Litti Masala Mix", weight="150g", price=120.0, category="Spices",
                description="A family spice blend for litti, ready to use straight from the pack.",
                ingredients=["sattu", "ajwain", "amchur", "mustard oil"], sku="HIM-LIT-150"),
        Product(name="Cold-Pressed Mustard Oil", weight="1L", price=320.0, category="Oils",
                description="Traditional kolhu-pressed mustard oil with a sharp, authentic pungency.",
                ingredients=["mustard seeds"], sku="HIM-MUS-1L"),
        Product(name="Himalayan Rock Salt", weight="500g", price=90.0, category="Essentials",
                description="Hand-mined pink salt, coarse-ground and ready for everyday cooking.",
                ingredients=["himalayan salt"], sku="HIM-SAL-500"),
    ]
    await Product.insert_many(products)

    inventory = [
        InventoryItem(sku="HIM-HON-500", item_type="finished_good", unit="units",
                      current_quantity=340, low_stock_threshold=50, is_low_stock=False),
        InventoryItem(sku="HIM-TUR-250", item_type="finished_good", unit="units",
                      current_quantity=820, low_stock_threshold=100, is_low_stock=False),
        InventoryItem(sku="HIM-MAK-200", item_type="finished_good", unit="units",
                      current_quantity=40, low_stock_threshold=60, is_low_stock=True),
        InventoryItem(sku="HIM-LIT-150", item_type="finished_good", unit="units",
                      current_quantity=610, low_stock_threshold=80, is_low_stock=False),
        InventoryItem(sku="HIM-MUS-1L", item_type="finished_good", unit="units",
                      current_quantity=195, low_stock_threshold=50, is_low_stock=False),
        InventoryItem(sku="HIM-SAL-500", item_type="finished_good", unit="units",
                      current_quantity=720, low_stock_threshold=100, is_low_stock=False),
    ]
    await InventoryItem.insert_many(inventory)
    print("Database seeded with sample products and inventory.")