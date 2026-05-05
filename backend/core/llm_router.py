"""
FinBuddy AI — Multi-LLM Router
Priority: OpenRouter (free) → Gemini → OpenAI (paid fallback)
Reads settings fresh on every request — no stale env vars.
"""
import logging
import os
from typing import Optional
from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage
 
logger = logging.getLogger(__name__)
 
 
def _get_openrouter_llm() -> Optional[BaseChatModel]:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    model = os.environ.get("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")
    if not api_key or api_key.startswith("your_"):
        logger.warning("OpenRouter: no valid API key")
        return None
    try:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://finbuddy.ai",
                "X-Title": "FinBuddy AI",
            },
            temperature=0.3,
        )
    except Exception as e:
        logger.warning(f"OpenRouter init failed: {e}")
        return None
 
 
def _get_gemini_llm() -> Optional[BaseChatModel]:
    api_key = os.environ.get("GEMINI_API_KEY", "")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    if not api_key or api_key.startswith("your_"):
        logger.warning("Gemini: no valid API key")
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            temperature=0.3,
            convert_system_message_to_human=True,
        )
    except Exception as e:
        logger.warning(f"Gemini init failed: {e}")
        return None
 
 
def _get_openai_llm() -> Optional[BaseChatModel]:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key or api_key.startswith("your_"):
        logger.warning("OpenAI: no valid API key")
        return None
    try:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=model, api_key=api_key, temperature=0.3)
    except Exception as e:
        logger.warning(f"OpenAI init failed: {e}")
        return None
 
 
class LLMRouter:
    def __init__(self):
        self._active_name: str = "none"
 
    def _build_chain(self) -> list[tuple[str, BaseChatModel]]:
        factories = [
            ("OpenRouter", _get_openrouter_llm),
            ("Gemini",     _get_gemini_llm),
            ("OpenAI",     _get_openai_llm),
        ]
        chain = []
        for name, factory in factories:
            llm = factory()
            if llm is not None:
                chain.append((name, llm))
                logger.info(f"  checkmark {name} available")
            else:
                logger.info(f"  x {name} skipped (no key)")
        return chain
 
    async def ainvoke(self, messages: list[BaseMessage]) -> str:
        chain = self._build_chain()
        if not chain:
            return (
                "No LLM provider configured. "
                "Please add OPENROUTER_API_KEY or GEMINI_API_KEY "
                "to your Railway environment variables."
            )
        last_error = None
        for name, llm in chain:
            try:
                logger.info(f"Trying {name}...")
                resp = await llm.ainvoke(messages)
                self._active_name = name
                logger.info(f"Success: {name} responded")
                return resp.content
            except Exception as e:
                logger.warning(f"FAILED {name}: {e}")
                last_error = e
                continue
        return f"All LLM providers failed. Last error: {last_error}"
 
    @property
    def active_provider(self) -> str:
        return self._active_name
 
 
llm_router = LLMRouter()