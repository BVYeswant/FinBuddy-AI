import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, RefreshCw, Clock, Newspaper } from 'lucide-react'
import clsx from 'clsx'
import { api } from '../lib/api'

const MOCK_CHART = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  btc: 65000 + Math.sin(i * 0.5) * 3000 + Math.random() * 1000,
  eth: 3400 + Math.sin(i * 0.7) * 300 + Math.random() * 100,
}))

const PORTFOLIO_PIE = [
  { name: 'BTC', value: 40, color: '#f59e0b' },
  { name: 'ETH', value: 25, color: '#6366f1' },
  { name: 'Stocks', value: 20, color: '#00d4aa' },
  { name: 'Other', value: 15, color: '#6b7280' },
]

function StatCard({ label, value, change, up, loading, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-xl p-4 border border-fin-border hover:border-fin-accent/30 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-fin-muted font-mono uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={14} className="text-fin-muted" />}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-6 rounded shimmer w-3/4" />
          <div className="h-4 rounded shimmer w-1/2" />
        </div>
      ) : (
        <>
          <div className="text-xl font-display font-bold text-fin-text">{value}</div>
          {change && (
            <div className={clsx('flex items-center gap-1 mt-1 text-xs font-mono', up ? 'text-fin-up' : 'text-fin-down')}>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {change}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

function CryptoRow({ coin, loading }) {
  if (loading) {
    return <div className="flex items-center justify-between py-3 border-b border-fin-border/50">
      <div className="h-4 shimmer rounded w-24" />
      <div className="h-4 shimmer rounded w-16" />
    </div>
  }
  const up = (coin.change_24h || 0) >= 0
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between py-3 border-b border-fin-border/50 last:border-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-fin-muted font-mono w-5">#{coin.rank}</span>
        <div>
          <div className="text-sm font-medium text-fin-text">{coin.name}</div>
          <div className="text-xs text-fin-muted font-mono">{coin.symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-fin-text">
          ${coin.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className={clsx('text-xs font-mono', up ? 'text-fin-up' : 'text-fin-down')}>
          {up ? '+' : ''}{coin.change_24h?.toFixed(2)}%
        </div>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-fin-border text-xs font-mono">
      <p className="text-fin-dim mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey.toUpperCase()}: ${p.value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getTopCryptos()
      if (Array.isArray(data)) setCryptos(data)
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const topCoins = cryptos.slice(0, 5)
  const totalMktCap = cryptos.reduce((s, c) => s + (c.market_cap || 0), 0)

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-fin-text">Market Dashboard</h2>
            <p className="text-fin-muted text-sm">Real-time market overview</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-fin-muted font-mono">
                <Clock size={11} />
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all',
                autoRefresh
                  ? 'bg-fin-accentDim border-fin-accent/40 text-fin-accent'
                  : 'bg-fin-card border-fin-border text-fin-muted hover:border-fin-accent/30'
              )}
            >
              <RefreshCw size={11} className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-fin-card border border-fin-border text-fin-dim hover:text-fin-accent hover:border-fin-accent/30 transition-all"
            >
              <RefreshCw size={11} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Market Cap"
            value={totalMktCap >= 1e12 ? `$${(totalMktCap / 1e12).toFixed(2)}T` : `$${(totalMktCap / 1e9).toFixed(0)}B`}
            change="Top 10 crypto"
            up={true}
            loading={loading}
            icon={TrendingUp}
          />
          <StatCard
            label="Bitcoin"
            value={cryptos[0] ? `$${cryptos[0].price?.toLocaleString()}` : '—'}
            change={cryptos[0] ? `${cryptos[0].change_24h?.toFixed(2)}% 24h` : null}
            up={(cryptos[0]?.change_24h || 0) >= 0}
            loading={loading}
          />
          <StatCard
            label="Ethereum"
            value={cryptos[1] ? `$${cryptos[1].price?.toLocaleString()}` : '—'}
            change={cryptos[1] ? `${cryptos[1].change_24h?.toFixed(2)}% 24h` : null}
            up={(cryptos[1]?.change_24h || 0) >= 0}
            loading={loading}
          />
          <StatCard
            label="Top Gainer"
            value={(() => {
              if (!cryptos.length) return '—'
              const top = [...cryptos].sort((a, b) => (b.change_24h || 0) - (a.change_24h || 0))[0]
              return top?.symbol || '—'
            })()}
            change={(() => {
              if (!cryptos.length) return null
              const top = [...cryptos].sort((a, b) => (b.change_24h || 0) - (a.change_24h || 0))[0]
              return top ? `+${top.change_24h?.toFixed(2)}%` : null
            })()}
            up={true}
            loading={loading}
          />
        </div>

        {/* Chart + Crypto List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <div className="lg:col-span-2 glass rounded-xl p-5 border border-fin-border">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-fin-text">BTC/ETH — 24h Simulation</span>
              <span className="text-xs text-fin-muted font-mono px-2 py-0.5 rounded bg-fin-card">demo data</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_CHART}>
                <defs>
                  <linearGradient id="btcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ethGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(30,45,64,0.5)" strokeDasharray="4" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="btc" stroke="#f59e0b" strokeWidth={2} fill="url(#btcGrad)" />
                <Area type="monotone" dataKey="eth" stroke="#00d4aa" strokeWidth={2} fill="url(#ethGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crypto List */}
          <div className="glass rounded-xl p-5 border border-fin-border">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-fin-text">Top Cryptocurrencies</span>
              <span className="w-2 h-2 rounded-full bg-fin-accent animate-pulse2" />
            </div>
            <div>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <CryptoRow key={i} loading />)
                : topCoins.map((c) => <CryptoRow key={c.symbol} coin={c} />)
              }
            </div>
          </div>
        </div>

        {/* Portfolio Donut + Quick Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut chart */}
          <div className="glass rounded-xl p-5 border border-fin-border">
            <span className="font-display font-semibold text-fin-text block mb-4">Sample Portfolio</span>
            <div className="flex items-center gap-6">
              <PieChart width={160} height={160}>
                <Pie data={PORTFOLIO_PIE} cx={75} cy={75} innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                  {PORTFOLIO_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="space-y-2">
                {PORTFOLIO_PIE.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-sm text-fin-dim">{p.name}</span>
                    <span className="text-sm font-mono text-fin-text ml-auto">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="glass rounded-xl p-5 border border-fin-border space-y-3">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-fin-accent" />
              <span className="font-display font-semibold text-fin-text">Quick Tips</span>
            </div>
            {[
              { icon: '💬', tip: 'Ask "What is Apple\'s PE ratio?" for fundamentals' },
              { icon: '🔔', tip: 'Try "Latest news on Tesla" for company-specific news' },
              { icon: '💱', tip: '"Convert 10000 JPY to USD" for any currency pair' },
              { icon: '📊', tip: '"Tell me about NVDA" for a full company overview' },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-fin-dim">
                <span className="flex-shrink-0">{t.icon}</span>
                <span>{t.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
