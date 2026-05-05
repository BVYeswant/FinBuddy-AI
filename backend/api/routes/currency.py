"""Currency routes"""
from fastapi import APIRouter, Query
from tools.finance_tools import convert_currency, get_exchange_rates

router = APIRouter()

@router.get("/convert")
async def convert(
    amount: float = Query(default=1.0),
    from_cur: str = Query(default="USD"),
    to_cur: str = Query(default="EUR"),
):
    return await convert_currency(amount, from_cur, to_cur)

@router.get("/rates/{base}")
async def rates(base: str = "USD"):
    return await get_exchange_rates(base)
