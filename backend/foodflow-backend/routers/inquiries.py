"""
routers/inquiries.py — WhatsApp order inquiry logging

POST   /api/inquiries       — log an inquiry           → 201
GET    /api/inquiries       — list all inquiries
"""
from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, status
from models import Inquiry, InquiryCreate
import store

router = APIRouter(prefix="/api/inquiries", tags=["Inquiries"])

def _now(): return datetime.now(timezone.utc)


@router.get("", response_model=list[Inquiry], status_code=200,
            summary="List all WhatsApp inquiries (newest first)")
def list_inquiries():
    with store.get_lock():
        return sorted(store.inquiries, key=lambda i: i["timestamp"], reverse=True)


@router.post("", response_model=Inquiry, status_code=201,
             summary="Log a new WhatsApp order inquiry")
def create_inquiry(body: InquiryCreate):
    with store.get_lock():
        inquiry = {**body.model_dump(), "id": str(uuid.uuid4()), "timestamp": _now()}
        store.inquiries.append(inquiry)
        return inquiry
