"""Stock routes"""
from fastapi import APIRouter, Query
from tools.finance_tools import get_stock_quote, get_stock_overview

router = APIRouter()

@router.get("/quote/{symbol}")
async def stock_quote(symbol: str):
    return await get_stock_quote(symbol)

@router.get("/overview/{symbol}")
async def stock_overview(symbol: str):
    return await get_stock_overview(symbol)
