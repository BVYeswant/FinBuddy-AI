"""
FinBuddy AI — FastAPI Backend
"""
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from api.routes import chat, stock, crypto, news, company, currency
from core.config import settings
from utils.rate_limit import RateLimitMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 FinBuddy AI starting up...")
    yield
    logger.info("🛑 FinBuddy AI shutting down...")


app = FastAPI(
    title="FinBuddy AI",
    description="AI-powered financial assistant with real-time data",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,     prefix="/chat",     tags=["Chat"])
app.include_router(stock.router,    prefix="/stock",    tags=["Stock"])
app.include_router(crypto.router,   prefix="/crypto",   tags=["Crypto"])
app.include_router(news.router,     prefix="/news",     tags=["News"])
app.include_router(company.router,  prefix="/company",  tags=["Company"])
app.include_router(currency.router, prefix="/currency", tags=["Currency"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "FinBuddy AI"}
