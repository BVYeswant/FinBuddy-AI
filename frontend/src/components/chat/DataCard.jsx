import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Globe, Newspaper } from 'lucide-react'
import clsx from 'clsx'

function fmt(val, prefix = '') {
  if (val == null) return '—'
  const n = parseFloat(val)
  if (isNaN(n)) return val
  if (n >= 1e9) return `${prefix}${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${prefix}${(n / 1e6).toFixed(2)}M`
  if (n >= 1000) return `${prefix}${n.toLocaleString()}`
  return `${prefix}${n.toFixed(4)}`
}

function StatPill({ label, value, up }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-fin-muted font-mono">{label}</span>
      <span className={clsx('text-sm font-mono font-medium', up === true && 'text-fin-up', up === false && 'text-fin-down', up === null && 'text-fin-text')}>
        {value}
      </span>
    </div>
  )
}

export default function DataCard({ data, intent }) {
  if (!data || typeof data !== 'object') return null

  if (intent === 'stock') {
    const chg = parseFloat(data.change || 0)
    const up = chg >= 0
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx(
          'glass rounded-xl p-4 space-y-3 border',
          up ? 'border-fin-up/20 glow-up' : 'border-fin-down/20 glow-down'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', up ? 'bg-fin-up/15' : 'bg-fin-down/15')}>
              {up ? <TrendingUp size={14} className="text-fin-up" /> : <TrendingDown size={14} className="text-fin-down" />}
            </div>
            <span className="font-display font-bold text-fin-text">{data.symbol}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-fin-border text-fin-dim font-mono">STOCK</span>
          </div>
          <span className={clsx('text-xl font-display font-bold', up ? 'text-fin-up' : 'text-fin-down')}>
            ${parseFloat(data.price || 0).toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-fin-border">
          <StatPill label="Change" value={`${chg >= 0 ? '+' : ''}${chg.toFixed(2)}`} up={up} />
          <StatPill label="High" value={`$${parseFloat(data.high || 0).toFixed(2)}`} up={null} />
          <StatPill label="Low" value={`$${parseFloat(data.low || 0).toFixed(2)}`} up={null} />
        </div>
      </motion.div>
    )
  }

  if (intent === 'crypto') {
    const chg = parseFloat(data.change_24h_percent || 0)
    const up = chg >= 0
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={clsx('glass rounded-xl p-4 space-y-3 border', up ? 'border-fin-up/20' : 'border-fin-down/20')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fin-gold/15 flex items-center justify-center">
              <Bitcoin size={14} className="text-fin-gold" />
            </div>
            <span className="font-display font-bold text-fin-text uppercase">{data.coin}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-fin-border text-fin-dim font-mono">CRYPTO</span>
          </div>
          <span className="text-xl font-display font-bold text-fin-text">
            ${fmt(data.price_usd)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-fin-border">
          <StatPill label="24h Change" value={`${up ? '+' : ''}${chg.toFixed(2)}%`} up={up} />
          <StatPill label="Market Cap" value={fmt(data.market_cap_usd, '$')} up={null} />
          <StatPill label="24h Volume" value={fmt(data.volume_24h, '$')} up={null} />
        </div>
      </motion.div>
    )
  }

  if (intent === 'currency') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-4 border border-fin-accent/20 glow-accent"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-fin-accentDim flex items-center justify-center">
            <Globe size={14} className="text-fin-accent" />
          </div>
          <span className="font-display font-semibold text-fin-text">Currency Conversion</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-fin-text">{data.amount}</div>
            <div className="text-xs text-fin-muted font-mono">{data.from}</div>
          </div>
          <div className="text-fin-accent text-xl">→</div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-fin-accent">
              {typeof data.converted === 'number' ? data.converted.toLocaleString() : data.converted}
            </div>
            <div className="text-xs text-fin-muted font-mono">{data.to}</div>
          </div>
        </div>
        <div className="text-xs text-fin-muted mt-2 font-mono">
          Rate: 1 {data.from} = {data.rate} {data.to}
        </div>
      </motion.div>
    )
  }

  if (intent === 'news' && Array.isArray(data)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-4 border border-fin-border space-y-2"
      >
        <div className="flex items-center gap-2 mb-2">
          <Newspaper size={14} className="text-fin-accent" />
          <span className="text-xs font-mono text-fin-dim uppercase tracking-wider">Latest News</span>
        </div>
        {data.slice(0, 4).map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2.5 rounded-lg bg-fin-card/50 hover:bg-fin-accentDim border border-transparent hover:border-fin-accent/20 transition-all"
          >
            <p className="text-xs text-fin-text leading-snug">{item.headline}</p>
            <p className="text-xs text-fin-muted mt-0.5">{item.source}</p>
          </a>
        ))}
      </motion.div>
    )
  }

  return null
}
