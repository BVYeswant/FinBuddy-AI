"""
FinBuddy AI — LangGraph Agent Workflow

Graph:
  classify_intent
       ↓
  route_to_tool  ──── (stock / crypto / company / news / currency / general)
       ↓
  call_finance_api
       ↓
  format_data
       ↓
  explain_with_llm
       ↓
  final_response
"""
import json
import logging
from typing import Annotated, Any, Optional
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage

from core.llm_router import llm_router
from tools.finance_tools import (
    get_stock_quote, get_stock_overview,
    get_crypto_price, get_top_cryptos,
    get_company_profile,
    get_financial_news,
    convert_currency, get_exchange_rates,
)

logger = logging.getLogger(__name__)

# ── State ─────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    user_input: str
    session_id: str
    history: list[dict]
    intent: str           # stock | crypto | company | news | currency | general
    entities: dict        # extracted tickers, coins, amounts, etc.
    raw_data: Any
    formatted_data: str
    llm_explanation: str
    error: Optional[str]
    provider_used: str

# ── Node: Classify Intent ─────────────────────────────────────────────────────

CLASSIFY_SYSTEM = """You are a financial query classifier. Given a user message, extract:
1. intent: one of [stock, crypto, company, news, currency, general]
2. entities: relevant symbols/coins/amounts/currencies

Respond ONLY with valid JSON like:
{"intent": "stock", "entities": {"symbol": "AAPL"}}
{"intent": "crypto", "entities": {"coin": "bitcoin"}}
{"intent": "currency", "entities": {"from": "USD", "to": "INR", "amount": 100}}
{"intent": "news", "entities": {"symbol": "TSLA"}}
{"intent": "company", "entities": {"symbol": "GOOGL"}}
{"intent": "general", "entities": {}}

Examples:
- "What is Apple's stock price?" → {"intent": "stock", "entities": {"symbol": "AAPL"}}
- "How much is Bitcoin worth?" → {"intent": "crypto", "entities": {"coin": "bitcoin"}}
- "Convert 500 USD to EUR" → {"intent": "currency", "entities": {"from": "USD", "to": "EUR", "amount": 500}}
- "Tell me about Tesla" → {"intent": "company", "entities": {"symbol": "TSLA"}}
- "Latest financial news" → {"intent": "news", "entities": {}}
- "What is inflation?" → {"intent": "general", "entities": {}}"""


async def classify_intent(state: AgentState) -> AgentState:
    user_input = state["user_input"]
    try:
        raw = await llm_router.ainvoke([
            SystemMessage(content=CLASSIFY_SYSTEM),
            HumanMessage(content=user_input),
        ])
        # Strip markdown fences if present
        cleaned = raw.strip().strip("```json").strip("```").strip()
        parsed = json.loads(cleaned)
        state["intent"] = parsed.get("intent", "general")
        state["entities"] = parsed.get("entities", {})
        state["provider_used"] = llm_router.active_provider
    except Exception as e:
        logger.warning(f"Intent classification error: {e}")
        state["intent"] = "general"
        state["entities"] = {}
    return state


# ── Node: Call Finance API ────────────────────────────────────────────────────

async def call_finance_api(state: AgentState) -> AgentState:
    intent = state["intent"]
    entities = state["entities"]
    try:
        if intent == "stock":
            symbol = entities.get("symbol", "AAPL")
            state["raw_data"] = await get_stock_quote(symbol)

        elif intent == "crypto":
            coin = entities.get("coin", "bitcoin")
            state["raw_data"] = await get_crypto_price(coin)

        elif intent == "company":
            symbol = entities.get("symbol", "AAPL")
            state["raw_data"] = await get_company_profile(symbol)

        elif intent == "news":
            symbol = entities.get("symbol")
            state["raw_data"] = await get_financial_news(symbol=symbol)

        elif intent == "currency":
            amount = float(entities.get("amount", 1))
            from_cur = entities.get("from", "USD")
            to_cur = entities.get("to", "EUR")
            state["raw_data"] = await convert_currency(amount, from_cur, to_cur)

        else:
            state["raw_data"] = None

    except Exception as e:
        logger.error(f"API call error [{intent}]: {e}")
        state["error"] = str(e)
        state["raw_data"] = None
    return state


# ── Node: Format Data ─────────────────────────────────────────────────────────

def format_data(state: AgentState) -> AgentState:
    intent = state["intent"]
    data = state["raw_data"]

    if data is None:
        state["formatted_data"] = ""
        return state

    if isinstance(data, dict) and "error" in data:
        state["formatted_data"] = f"API Error: {data['error']}"
        return state

    if intent == "stock":
        p, c, cp = data.get("price"), data.get("change"), data.get("change_percent", "")
        direction = "▲" if str(c or "").startswith("-") is False and c and not str(c).startswith("-") else "▼"
        state["formatted_data"] = (
            f"Stock: {data.get('symbol')}\n"
            f"Price: ${p}\n"
            f"Change: {direction} {c} ({cp})\n"
            f"Volume: {data.get('volume')}\n"
            f"High/Low: ${data.get('high')} / ${data.get('low')}\n"
            f"Prev Close: ${data.get('previous_close')}"
        )

    elif intent == "crypto":
        chg = data.get("change_24h_percent", 0) or 0
        direction = "▲" if float(chg) >= 0 else "▼"
        state["formatted_data"] = (
            f"Crypto: {data.get('coin', '').upper()}\n"
            f"Price: ${data.get('price_usd'):,.4f}\n"
            f"24h Change: {direction} {chg:.2f}%\n"
            f"Market Cap: ${data.get('market_cap_usd', 0):,.0f}\n"
            f"24h Volume: ${data.get('volume_24h', 0):,.0f}"
        )

    elif intent == "company":
        state["formatted_data"] = (
            f"Company: {data.get('name')} ({data.get('symbol')})\n"
            f"Sector: {data.get('sector')} | Industry: {data.get('industry')}\n"
            f"Market Cap: ${data.get('market_cap') or data.get('mktCap')}\n"
            f"PE Ratio: {data.get('pe_ratio') or data.get('beta')}\n"
            f"About: {data.get('description', 'N/A')}"
        )

    elif intent == "news":
        items = data if isinstance(data, list) else []
        lines = [f"• {n.get('headline', '')} [{n.get('source', '')}]" for n in items[:5]]
        state["formatted_data"] = "Latest News:\n" + "\n".join(lines)

    elif intent == "currency":
        state["formatted_data"] = (
            f"{data.get('amount')} {data.get('from')} = "
            f"{data.get('converted')} {data.get('to')}\n"
            f"Rate: 1 {data.get('from')} = {data.get('rate')} {data.get('to')}"
        )

    else:
        state["formatted_data"] = json.dumps(data, indent=2)[:500] if data else ""

    return state


# ── Node: LLM Explanation ─────────────────────────────────────────────────────

EXPLAIN_SYSTEM = """You are FinBuddy, a friendly and knowledgeable financial assistant.
Your job is to explain financial data in simple, clear language that anyone can understand.
Be concise but insightful. Use emojis sparingly but effectively.
If there's an error, help the user understand what went wrong and suggest alternatives.
Always mention key insights: is the stock up or down? Is that good or bad in context?
Keep responses under 250 words."""


async def explain_with_llm(state: AgentState) -> AgentState:
    user_input = state["user_input"]
    formatted = state["formatted_data"]
    error = state.get("error")
    history = state.get("history", [])

    # Build context from history
    history_text = ""
    if history:
        recent = history[-4:]  # last 2 turns
        history_text = "\n".join(
            f"{'User' if h['role'] == 'user' else 'Assistant'}: {h['content']}"
            for h in recent
        )
        history_text = f"Recent conversation:\n{history_text}\n\n"

    if error and not formatted:
        user_prompt = f"{history_text}User asked: {user_input}\n\nError occurred: {error}\nPlease explain this gracefully and suggest what the user might try instead."
    elif formatted:
        user_prompt = f"{history_text}User asked: {user_input}\n\nHere is the real-time financial data:\n{formatted}\n\nPlease explain this data clearly and helpfully."
    else:
        # General finance question
        user_prompt = f"{history_text}User asked: {user_input}\n\nPlease answer this finance question clearly and helpfully."

    try:
        explanation = await llm_router.ainvoke([
            SystemMessage(content=EXPLAIN_SYSTEM),
            HumanMessage(content=user_prompt),
        ])
        state["llm_explanation"] = explanation
        state["provider_used"] = llm_router.active_provider
    except Exception as e:
        state["llm_explanation"] = f"I encountered an issue: {e}. Please try again."

    return state


# ── Build Graph ───────────────────────────────────────────────────────────────

def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("classify_intent",  classify_intent)
    graph.add_node("call_finance_api", call_finance_api)
    graph.add_node("format_data",      format_data)
    graph.add_node("explain_with_llm", explain_with_llm)

    graph.set_entry_point("classify_intent")
    graph.add_edge("classify_intent",  "call_finance_api")
    graph.add_edge("call_finance_api", "format_data")
    graph.add_edge("format_data",      "explain_with_llm")
    graph.add_edge("explain_with_llm", END)

    return graph.compile()


# Singleton compiled graph
finbuddy_graph = build_graph()


async def run_agent(user_input: str, session_id: str, history: list[dict]) -> dict:
    """Entry point for the chat API."""
    initial_state: AgentState = {
        "user_input": user_input,
        "session_id": session_id,
        "history": history,
        "intent": "",
        "entities": {},
        "raw_data": None,
        "formatted_data": "",
        "llm_explanation": "",
        "error": None,
        "provider_used": "",
    }
    result = await finbuddy_graph.ainvoke(initial_state)
    return {
        "response": result["llm_explanation"],
        "intent": result["intent"],
        "raw_data": result["raw_data"],
        "provider": result["provider_used"],
    }
