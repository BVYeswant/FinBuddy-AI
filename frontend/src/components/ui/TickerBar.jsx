import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity } from 'lucide-react'
import { api } from '../../lib/api'

const MOCK_TICKERS = [
  { symbol: 'BTC', price: '67,240', change: '+2.3%', up: true },
  { symbol: 'ETH', price: '3,521', change: '+1.8%', up: true },
  { symbol: 'AAPL', price: '229.87', change: '-0.4%', up: false },
  { symbol: 'TSLA', price: '253.18', change: '+3.1%', up: true },
  { symbol: 'MSFT', price: '432.55', change: '+0.7%', up: true },
  { symbol: 'NVDA', price: '875.39', change: '+4.2%', up: true },
  { symbol: 'SOL', price: '182.40', change: '-1.2%', up: false },
  { symbol: 'AMZN', price: '197.12', change: '+0.9%', up: true },
  { symbol: 'EUR/USD', price: '1.0821', change: '-0.1%', up: false },
  { symbol: 'DOGE', price: '0.1423', change: '+5.8%', up: true },
]

export default function TickerBar() {
  const [tickers] = useState(MOCK_TICKERS)
  const doubled = [...tickers, ...tickers]

  return (
    <div className="h-9 bg-fin-surface/80 border-b border-fin-border flex items-center overflow-hidden relative">
      {/* Live badge */}
      <div className="flex items-center gap-1.5 px-3 flex-shrink-0 border-r border-fin-border h-full bg-fin-accentDim">
        <span className="w-1.5 h-1.5 rounded-full bg-fin-accent animate-pulse2" />
        <span className="text-fin-accent text-xs font-mono font-medium">LIVE</span>
      </div>

      {/* Scrolling tickers */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{ x: [0, -50 * tickers.length * 8] }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((t, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-mono font-medium text-fin-dim">{t.symbol}</span>
              <span className="text-xs font-mono text-fin-text">${t.price}</span>
              <span className={`text-xs font-mono ${t.up ? 'text-fin-up' : 'text-fin-down'}`}>
                {t.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5 px-3 flex-shrink-0 border-l border-fin-border text-fin-muted">
        <Activity size={12} />
        <span className="text-xs font-mono hidden sm:block">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}
