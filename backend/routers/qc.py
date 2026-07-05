"""
routers/qc.py — MongoDB version
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from models.qc import QCRecord

router = APIRouter(prefix="/api/qc", tags=["Quality Control"])


class QCCheckResult(BaseModel):
    check_name: str
    passed: bool
    note: Optional[str] = None


class QCRecordCreate(BaseModel):
    batch_id: str
    product_sku: str
    status: str
    checks: list[QCCheckResult] = []
    checked_by: str


def to_dict(r):
    d = r.model_dump()
    d["id"] = str(r.id)
    d.pop("revision_id", None)
    return d


@router.get("", status_code=200)
async def list_qc():
    records = await QCRecord.find_all().to_list()
    return sorted([to_dict(r) for r in records], key=lambda x: str(x["timestamp"]), reverse=True)


@router.get("/{record_id}", status_code=200)
async def get_qc(record_id: str):
    try:
        r = await QCRecord.get(record_id)
    except Exception:
        raise HTTPException(status_code=404, detail=f"QC record '{record_id}' not found.")
    if not r:
        raise HTTPException(status_code=404, detail=f"QC record '{record_id}' not found.")
    return to_dict(r)


@router.post("", status_code=201)
async def create_qc(body: QCRecordCreate):
    record = QCRecord(**body.model_dump())
    await record.insert()
    return to_dict(record)
