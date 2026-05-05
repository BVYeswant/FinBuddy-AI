"""
FinBuddy AI — Finance API Tools
Each tool fetches from the appropriate free API.
"""
import logging
import httpx
from typing import Any, Optional
from core.config import settings

logger = logging.getLogger(__name__)

_HTTP_TIMEOUT = 10.0


async def _get(url: str, params: dict) -> dict:
    """Generic async GET with error handling."""
    async with httpx.AsyncClient(timeout=_HTTP_TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


# ── Stock ─────────────────────────────────────────────────────────────────────

async def get_stock_quote(symbol: str) -> dict:
    """Alpha Vantage GLOBAL_QUOTE."""
    symbol = symbol.upper().strip()
    data = await _get(
        "https://www.alphavantage.co/query",
        {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": settings.ALPHA_VANTAGE_API_KEY or "demo",
        },
    )
    quote = data.get("Global Quote", {})
    if not quote:
        return {"error": f"No data for {symbol}. Check the ticker or API limits."}
    return {
        "symbol": quote.get("01. symbol"),
        "price": quote.get("05. price"),
        "change": quote.get("09. change"),
        "change_percent": quote.get("10. change percent"),
        "volume": quote.get("06. volume"),
        "high": quote.get("03. high"),
        "low": quote.get("04. low"),
        "previous_close": quote.get("08. previous close"),
        "latest_trading_day": quote.get("07. latest trading day"),
    }


async def get_stock_overview(symbol: str) -> dict:
    """Alpha Vantage OVERVIEW for fundamentals."""
    symbol = symbol.upper().strip()
    data = await _get(
        "https://www.alphavantage.co/query",
        {
            "function": "OVERVIEW",
            "symbol": symbol,
            "apikey": settings.ALPHA_VANTAGE_API_KEY or "demo",
        },
    )
    if "Symbol" not in data:
        return {"error": "No overview data available."}
    return {
        "symbol": data.get("Symbol"),
        "name": data.get("Name"),
        "sector": data.get("Sector"),
        "industry": data.get("Industry"),
        "market_cap": data.get("MarketCapitalization"),
        "pe_ratio": data.get("PERatio"),
        "eps": data.get("EPS"),
        "dividend_yield": data.get("DividendYield"),
        "52_week_high": data.get("52WeekHigh"),
        "52_week_low": data.get("52WeekLow"),
        "description": data.get("Description", "")[:300],
    }


# ── Crypto ────────────────────────────────────────────────────────────────────

CRYPTO_ID_MAP = {
    "btc": "bitcoin", "bitcoin": "bitcoin",
    "eth": "ethereum", "ethereum": "ethereum",
    "sol": "solana", "solana": "solana",
    "bnb": "binancecoin",
    "xrp": "ripple",
    "ada": "cardano",
    "doge": "dogecoin",
    "dot": "polkadot",
    "avax": "avalanche-2",
    "matic": "matic-network",
    "link": "chainlink",
}


def _resolve_coin_id(coin: str) -> str:
    return CRYPTO_ID_MAP.get(coin.lower(), coin.lower())


async def get_crypto_price(coin: str) -> dict:
    """CoinGecko simple/price — no API key needed for basic tier."""
    coin_id = _resolve_coin_id(coin)
    data = await _get(
        "https://api.coingecko.com/api/v3/simple/price",
        {
            "ids": coin_id,
            "vs_currencies": "usd,btc",
            "include_24hr_change": "true",
            "include_market_cap": "true",
            "include_24hr_vol": "true",
        },
    )
    if coin_id not in data:
        return {"error": f"Coin '{coin}' not found. Try the full name (e.g., 'bitcoin')."}
    c = data[coin_id]
    return {
        "coin": coin_id,
        "price_usd": c.get("usd"),
        "price_btc": c.get("btc"),
        "market_cap_usd": c.get("usd_market_cap"),
        "volume_24h": c.get("usd_24h_vol"),
        "change_24h_percent": c.get("usd_24h_change"),
    }


async def get_top_cryptos(limit: int = 10) -> list:
    """CoinGecko markets endpoint."""
    data = await _get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": limit,
            "page": 1,
            "sparkline": "false",
            "price_change_percentage": "24h",
        },
    )
    return [
        {
            "rank": c["market_cap_rank"],
            "name": c["name"],
            "symbol": c["symbol"].upper(),
            "price": c["current_price"],
            "change_24h": c["price_change_percentage_24h"],
            "market_cap": c["market_cap"],
        }
        for c in data
    ]


# ── Company Fundamentals ──────────────────────────────────────────────────────

async def get_company_profile(symbol: str) -> dict:
    """Financial Modeling Prep — company profile."""
    symbol = symbol.upper().strip()
    if not settings.FMP_API_KEY:
        # Fallback to Alpha Vantage overview
        return await get_stock_overview(symbol)
    data = await _get(
        f"https://financialmodelingprep.com/api/v3/profile/{symbol}",
        {"apikey": settings.FMP_API_KEY},
    )
    if not data:
        return {"error": "Company not found."}
    p = data[0]
    return {
        "symbol": p.get("symbol"),
        "name": p.get("companyName"),
        "exchange": p.get("exchangeShortName"),
        "sector": p.get("sector"),
        "industry": p.get("industry"),
        "ceo": p.get("ceo"),
        "employees": p.get("fullTimeEmployees"),
        "website": p.get("website"),
        "price": p.get("price"),
        "mktCap": p.get("mktCap"),
        "beta": p.get("beta"),
        "description": p.get("description", "")[:400],
    }


# ── News ──────────────────────────────────────────────────────────────────────

async def get_financial_news(symbol: Optional[str] = None, category: str = "general") -> list:
    """Finnhub market news."""
    if not settings.FINNHUB_API_KEY:
        return [{"headline": "Finnhub API key not configured.", "url": ""}]

    if symbol:
        data = await _get(
            "https://finnhub.io/api/v1/company-news",
            {
                "symbol": symbol.upper(),
                "from": _days_ago(7),
                "to": _today(),
                "token": settings.FINNHUB_API_KEY,
            },
        )
    else:
        data = await _get(
            "https://finnhub.io/api/v1/news",
            {"category": category, "token": settings.FINNHUB_API_KEY},
        )

    results = []
    for item in data[:8]:
        results.append({
            "headline": item.get("headline"),
            "summary": item.get("summary", "")[:200],
            "source": item.get("source"),
            "url": item.get("url"),
            "datetime": item.get("datetime"),
            "category": item.get("category"),
        })
    return results


def _today() -> str:
    from datetime import date
    return date.today().isoformat()


def _days_ago(n: int) -> str:
    from datetime import date, timedelta
    return (date.today() - timedelta(days=n)).isoformat()


# ── Currency ──────────────────────────────────────────────────────────────────

async def convert_currency(amount: float, from_cur: str, to_cur: str) -> dict:
    """ExchangeRate-API free tier."""
    from_cur = from_cur.upper()
    to_cur = to_cur.upper()
    if settings.EXCHANGERATE_API_KEY:
        data = await _get(
            f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGERATE_API_KEY}/pair/{from_cur}/{to_cur}/{amount}",
            {},
        )
        if data.get("result") == "success":
            return {
                "from": from_cur,
                "to": to_cur,
                "amount": amount,
                "converted": data["conversion_result"],
                "rate": data["conversion_rate"],
            }
    # Fallback: open.er-api.com (no key needed)
    data = await _get(f"https://open.er-api.com/v6/latest/{from_cur}", {})
    rate = data.get("rates", {}).get(to_cur)
    if rate is None:
        return {"error": f"Cannot find rate for {from_cur} → {to_cur}"}
    return {
        "from": from_cur,
        "to": to_cur,
        "amount": amount,
        "converted": round(amount * rate, 6),
        "rate": rate,
    }


async def get_exchange_rates(base: str = "USD") -> dict:
    data = await _get(f"https://open.er-api.com/v6/latest/{base.upper()}", {})
    popular = ["EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF", "CNY", "SGD", "BRL"]
    rates = data.get("rates", {})
    return {
        "base": base.upper(),
        "rates": {k: rates[k] for k in popular if k in rates},
        "updated": data.get("time_last_update_utc"),
    }
