"""
routers/production.py — MongoDB version
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from models.production import ProductionRun

router = APIRouter(prefix="/api/production", tags=["Production"])


class ProductionRunCreate(BaseModel):
    batch_id: str
    product_sku: str
    quantity_produced: float = field_validator
    start_time: datetime
    end_time: datetime
    downtime_notes: Optional[str] = None


def to_dict(r):
    d = r.model_dump()
    d["id"] = str(r.id)
    d.pop("revision_id", None)
    return d


@router.get("", status_code=200)
async def list_runs():
    runs = await ProductionRun.find_all().to_list()
    return sorted([to_dict(r) for r in runs], key=lambda x: str(x["start_time"]), reverse=True)


@router.get("/{run_id}", status_code=200)
async def get_run(run_id: str):
    try:
        r = await ProductionRun.get(run_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Production run '{run_id}' not found.")
    if not r:
        raise HTTPException(status_code=404, detail=f"Production run '{run_id}' not found.")
    return to_dict(r)


@router.post("", status_code=201)
async def create_run(body: ProductionRunCreate):
    duration = (body.end_time - body.start_time).total_seconds() / 60
    run = ProductionRun(
        **body.model_dump(),
        duration_minutes=round(duration, 2)
    )
    await run.insert()
    return to_dict(run)