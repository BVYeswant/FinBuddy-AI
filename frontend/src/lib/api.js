const BASE = import.meta.env.VITE_API_URL || 'https://finbuddy-backend-railway-production.up.railway.app'

export const api = {
  base: BASE,

  async getTopCryptos() {
    const r = await fetch(`${BASE}/crypto/top?limit=10`)
    return r.json()
  },

  async getStockQuote(symbol) {
    const r = await fetch(`${BASE}/stock/quote/${symbol}`)
    return r.json()
  },

  async getNews() {
    const r = await fetch(`${BASE}/news`)
    return r.json()
  },

  async getRates() {
    const r = await fetch(`${BASE}/currency/rates/USD`)
    return r.json()
  },
}
