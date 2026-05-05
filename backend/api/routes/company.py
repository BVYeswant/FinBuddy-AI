"""Company routes"""
from fastapi import APIRouter
from tools.finance_tools import get_company_profile

router = APIRouter()

@router.get("/{symbol}")
async def company(symbol: str):
    return await get_company_profile(symbol)
