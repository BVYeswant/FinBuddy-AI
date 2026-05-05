"""News routes"""
from fastapi import APIRouter, Query
from typing import Optional
from tools.finance_tools import get_financial_news

router = APIRouter()

@router.get("")
async def news(symbol: Optional[str] = Query(default=None), category: str = "general"):
    return await get_financial_news(symbol=symbol, category=category)
