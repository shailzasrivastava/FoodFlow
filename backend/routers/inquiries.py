"""
routers/inquiries.py — MongoDB version
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from models.inquiry import Inquiry

router = APIRouter(prefix="/api/inquiries", tags=["Inquiries"])


class InquiryCreate(BaseModel):
    product_id: str
    message: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


def to_dict(i):
    d = i.model_dump()
    d["id"] = str(i.id)
    d.pop("revision_id", None)
    return d


@router.get("", status_code=200)
async def list_inquiries():
    items = await Inquiry.find_all().to_list()
    return sorted([to_dict(i) for i in items], key=lambda x: str(x["timestamp"]), reverse=True)


@router.post("", status_code=201)
async def create_inquiry(body: InquiryCreate):
    inquiry = Inquiry(**body.model_dump())
    await inquiry.insert()
    return to_dict(inquiry)