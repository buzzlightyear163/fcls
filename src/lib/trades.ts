import type { Coin, TokenStats } from '../hooks/market'
import { fakeAddress, seeded } from './random'

export type Trade = {
  sig: string
  ts: number
  side: 'buy' | 'sell'
  wallet: string
  sol: number
  tokens: number
  priceSol: number
  mcSol: number
}

export type Holder = { owner: string; share: number; isCreator: boolean }

const SUPPLY = 1e9

/**
 * Deterministisk mock-historik per token.
 * TODO(backend): ersätt med /api/coins/:mint/trades och /holders från en riktig indexer.
 */
export function mockTrades(coin: Coin, stats: TokenStats | undefined, now: number): Trade[] {
  const rnd = seeded(coin.mint)
  const n = coin.isMigrated ? 64 : Math.max(4, stats?.trades ? stats.trades * 2 + 6 : Math.round(4 + rnd() * 10))
  const wallets = Array.from({ length: Math.max(4, Math.round(n / 2.2)) }, () => fakeAddress(rnd))
  const startMc = 25
  const endMc = coin.marketCapSol
  const t0 = coin.launchedAt
  const span = Math.max(120, now - t0 - 30)
  const out: Trade[] = []
  let mc = startMc
  // Tidsstämplar: kluster nära launch, resten utspritt
  const times = Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    return t0 + 4 + span * Math.pow(u, 1.8) + rnd() * 20
  }).sort((a, b) => a - b)
  for (let i = 0; i < n; i++) {
    const remaining = n - i
    const drift = (endMc - mc) / remaining
    const noise = (rnd() - 0.48) * mc * (coin.isMigrated ? 0.12 : 0.09)
    const next = Math.max(24.5, mc + drift + noise)
    const side: 'buy' | 'sell' = next >= mc ? 'buy' : 'sell'
    const sol = Math.max(0.005, Math.abs(next - mc) * (0.35 + rnd() * 0.5) + rnd() * 0.08)
    const priceSol = next / SUPPLY
    out.push({
      sig: fakeAddress(rnd, 88),
      ts: Math.min(now - 5, times[i]),
      side,
      wallet: wallets[Math.floor(rnd() * wallets.length)],
      sol,
      tokens: sol / priceSol,
      priceSol,
      mcSol: next,
    })
    mc = next
  }
  // Sista trade landar exakt på nuvarande market cap
  const last = out[out.length - 1]
  last.mcSol = endMc
  last.priceSol = endMc / SUPPLY
  return out.reverse() // nyast först
}

export function mockHolders(coin: Coin): Holder[] {
  const rnd = seeded(coin.mint + 'h')
  const count = coin.isMigrated ? 40 : 6 + Math.round(rnd() * 10)
  const list: Holder[] = [{ owner: coin.creator, share: 0.01, isCreator: true }]
  let left = coin.isMigrated ? 0.55 : 0.12 + coin.progress * 2
  for (let i = 0; i < count; i++) {
    const s = left * (0.15 + rnd() * 0.25)
    left -= s
    list.push({ owner: fakeAddress(rnd), share: s, isCreator: false })
  }
  return list.sort((a, b) => b.share - a.share)
}

export const INTERVALS = [
  ['1s', 1],
  ['5s', 5],
  ['15s', 15],
  ['1m', 60],
  ['5m', 300],
  ['15m', 900],
  ['1h', 3600],
  ['4h', 14400],
  ['1d', 86400],
] as const

export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number; up: boolean }

/** Bara intervall med swaps visas, precis som i referensen */
export function toCandles(trades: Trade[], sec: number, value: (t: Trade) => number): Candle[] {
  const asc = [...trades].sort((a, b) => a.ts - b.ts)
  const map = new Map<number, Candle>()
  let prevClose: number | null = null
  for (const t of asc) {
    const b = Math.floor(t.ts / sec) * sec
    const v = value(t)
    let c = map.get(b)
    if (!c) {
      const open: number = prevClose ?? v
      c = { time: b, open, high: Math.max(open, v), low: Math.min(open, v), close: v, volume: 0, up: true }
      map.set(b, c)
    }
    c.high = Math.max(c.high, v)
    c.low = Math.min(c.low, v)
    c.close = v
    c.volume += t.sol
    c.up = c.close >= c.open
    prevClose = v
  }
  return [...map.values()]
}
