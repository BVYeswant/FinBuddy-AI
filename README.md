# 🤖 FinBuddy AI — Real-Time Finance Chatbot

> An AI-powered financial assistant with multi-LLM routing, LangGraph workflows, and a stunning dark-themed React UI.

![FinBuddy AI](https://img.shields.io/badge/FinBuddy-AI-00d4aa?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-ff6b6b?style=for-the-badge)

---

## ✨ Features

- 💬 **AI Chat Interface** — ChatGPT-style with typing animation and glassmorphism design
- 📈 **Real-time Stocks** — Alpha Vantage integration for live quotes and fundamentals
- ₿ **Crypto Tracking** — CoinGecko API for prices, market cap, 24h changes
- 🏢 **Company Profiles** — Financial Modeling Prep for deep fundamentals
- 📰 **Financial News** — Finnhub real-time market news
- 💱 **Currency Conversion** — ExchangeRate API with 160+ currencies
- 🧠 **Multi-LLM Router** — OpenRouter → Gemini → Grok → OpenAI fallback chain
- 🔄 **LangGraph Workflow** — Intent classification → API routing → LLM explanation
- 🗄️ **Session Memory** — Redis (with in-memory fallback) for multi-turn conversations
- 📊 **Live Dashboard** — Animated charts, crypto leaderboard, portfolio donut

---

## 🏗️ Architecture

```
User Message
     │
     ▼
FastAPI /chat endpoint
     │
     ▼
LangGraph Agent
  ┌──────────────────────────────────┐
  │  1. classify_intent  (LLM)       │
  │  2. call_finance_api (Router)    │
  │  3. format_data      (Pure)      │
  │  4. explain_with_llm (LLM)       │
  └──────────────────────────────────┘
     │
     ▼
LLM Router (Priority Chain)
  OpenRouter (free) → Gemini (free) → Grok → OpenAI (paid)
     │
     ▼
Finance API Router
  stock   → Alpha Vantage
  crypto  → CoinGecko
  company → FMP
  news    → Finnhub
  currency→ ExchangeRate API
     │
     ▼
Redis Session Memory
     │
     ▼
JSON Response → React UI
```

---

## 📁 Project Structure

```
finbuddy-ai/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── core/
│   │   ├── config.py              # Pydantic settings
│   │   └── llm_router.py          # Multi-LLM fallback router
│   ├── agents/
│   │   └── finbuddy_graph.py      # LangGraph workflow
│   ├── api/routes/
│   │   ├── chat.py                # /chat endpoint
│   │   ├── stock.py               # /stock endpoint
│   │   ├── crypto.py              # /crypto endpoint
│   │   ├── news.py                # /news endpoint
│   │   ├── company.py             # /company endpoint
│   │   └── currency.py            # /currency endpoint
│   ├── memory/
│   │   └── session_memory.py      # Redis + in-memory fallback
│   └── tools/
│       └── finance_tools.py       # All finance API integrations
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── store/chatStore.js      # Zustand state
        ├── lib/api.js              # API client
        ├── styles/globals.css
        ├── pages/
        │   ├── ChatPage.jsx        # Main chat interface
        │   └── DashboardPage.jsx   # Live market dashboard
        └── components/
            ├── chat/
            │   ├── ChatMessage.jsx  # Message + DataCard renderer
            │   ├── DataCard.jsx     # Rich financial data cards
            │   ├── ChatInput.jsx    # Input with suggestions
            │   └── TypingIndicator.jsx
            └── ui/
                ├── Sidebar.jsx
                └── TickerBar.jsx   # Live ticker strip
```

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <repo>
cd finbuddy-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill in your API keys
cp .env.example .env
nano .env
```

### 3. Start Redis (optional but recommended)

```bash
# macOS
brew install redis && redis-server

# Ubuntu/Debian
sudo apt install redis && redis-server

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Run Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

### 5. Frontend Setup

```bash
cd frontend
npm install

# Copy env
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

npm run dev
```

Open: http://localhost:5173

---

## 🔑 API Keys (All Free Tiers Available)

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| **OpenRouter** | 10 free models | https://openrouter.ai/ |
| **Google Gemini** | 1M tokens/day | https://aistudio.google.com/ |
| **Alpha Vantage** | 25 req/day | https://alphavantage.co/support/#api-key |
| **CoinGecko** | 30 req/min (no key!) | https://coingecko.com/api/ |
| **FMP** | 250 req/day | https://financialmodelingprep.com/ |
| **Finnhub** | 60 req/min | https://finnhub.io/ |
| **ExchangeRate** | 1500 req/month | https://exchangerate-api.com/ |

> **Minimum to run:** Set either `OPENROUTER_API_KEY` or `GEMINI_API_KEY` — that's all you need for the LLM. CoinGecko works without any key.

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Using Vercel CLI
npx vercel --prod

# Set environment variable in Vercel dashboard:
# VITE_API_URL = https://your-backend.railway.app
```

### Backend → Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

cd backend
railway login
railway new
railway up

# Add all .env variables in Railway dashboard
```

### Backend → Render

1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables

### Docker (optional)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t finbuddy-backend ./backend
docker run -p 8000:8000 --env-file backend/.env finbuddy-backend
```

---

## 💬 Example Queries

| Query | Intent | API Used |
|-------|--------|----------|
| "What's AAPL stock price?" | stock | Alpha Vantage |
| "How much is Bitcoin?" | crypto | CoinGecko |
| "Convert 500 USD to EUR" | currency | ExchangeRate |
| "Tell me about Tesla" | company | FMP / AV |
| "Latest market news" | news | Finnhub |
| "What is a PE ratio?" | general | LLM only |
| "Is now a good time to buy NVDA?" | stock+general | Alpha Vantage + LLM |

---

## 🔧 LangSmith Tracing

```bash
# Enable in .env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_PROJECT=finbuddy-ai
```

View traces at: https://smith.langchain.com/

---

## 📝 License

MIT License — Free to use, modify, and deploy.

---

Built with ❤️ using FastAPI, LangGraph, LangChain, React, and Tailwind CSS.
