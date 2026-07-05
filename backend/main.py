"""
main.py — Foodflow FastAPI backend with MongoDB Atlas
Run: uvicorn main:app --reload
"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from database import init_db
from routers import products, inventory, qc, production, inquiries, auth

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Foodflow API",
    description="HimShakti Food Processing Unit — D2C storefront + operations platform.",
    version="0.3.0",
    lifespan=lifespan,
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=400, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500,
                        content={"detail": "Unexpected error. Please try again."})


app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(qc.router)
app.include_router(production.router)
app.include_router(inquiries.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "Foodflow API", "version": "0.3.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}