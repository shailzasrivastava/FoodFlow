"""
routers/qc.py — Quality control batch logging

POST   /api/qc          — log a QC record for a batch     → 201
GET    /api/qc          — list all QC records
GET    /api/qc/{id}     — get a single QC record
"""
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, status
from models import QCRecord, QCRecordCreate
import store

router = APIRouter(prefix="/api/qc", tags=["Quality Control"])

def _now(): return datetime.now(timezone.utc)


@router.get("", response_model=list[QCRecord], status_code=200,
            summary="List all QC records (newest first)")
def list_qc():
    with store.get_lock():
        return sorted(store.qc_records, key=lambda r: r["timestamp"], reverse=True)


@router.get("/{record_id}", response_model=QCRecord, status_code=200,
            summary="Get a single QC record")
def get_qc(record_id: str):
    with store.get_lock():
        rec = next((r for r in store.qc_records if r["id"] == record_id), None)
        if not rec:
            raise HTTPException(status_code=404, detail=f"QC record '{record_id}' not found.")
        return rec


@router.post("", response_model=QCRecord, status_code=201,
             summary="Log a QC check result for a batch")
def create_qc(body: QCRecordCreate):
    with store.get_lock():
        record = {**body.model_dump(), "id": str(uuid.uuid4()), "timestamp": _now()}
        store.qc_records.append(record)
        return record
