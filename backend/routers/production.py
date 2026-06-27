"""
routers/production.py — Production run logging

POST   /api/production      — log a production run     → 201
GET    /api/production      — list all production runs
GET    /api/production/{id} — get a single run
"""
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException, status
from models import ProductionRun, ProductionRunCreate
import store

router = APIRouter(prefix="/api/production", tags=["Production"])

def _now(): return datetime.now(timezone.utc)


@router.get("", response_model=list[ProductionRun], status_code=200,
            summary="List all production runs (newest first)")
def list_runs():
    with store.get_lock():
        return sorted(store.production_runs, key=lambda r: r["start_time"], reverse=True)


@router.get("/{run_id}", response_model=ProductionRun, status_code=200,
            summary="Get a single production run")
def get_run(run_id: str):
    with store.get_lock():
        run = next((r for r in store.production_runs if r["id"] == run_id), None)
        if not run:
            raise HTTPException(status_code=404, detail=f"Production run '{run_id}' not found.")
        return run


@router.post("", response_model=ProductionRun, status_code=201,
             summary="Log a new production run")
def create_run(body: ProductionRunCreate):
    with store.get_lock():
        duration = (body.end_time - body.start_time).total_seconds() / 60
        run = {
            **body.model_dump(),
            "id": str(uuid.uuid4()),
            "duration_minutes": round(duration, 2),
            "created_at": _now(),
        }
        store.production_runs.append(run)
        return run
