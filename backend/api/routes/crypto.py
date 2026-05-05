"""Crypto routes"""
from fastapi import APIRouter, Query
from tools.finance_tools import get_crypto_price, get_top_cryptos

router = APIRouter()

@router.get("/price/{coin}")
async def crypto_price(coin: str):
    return await get_crypto_price(coin)

@router.get("/top")
async def top_cryptos(limit: int = Query(default=10, le=50)):
    return await get_top_cryptos(limit)
