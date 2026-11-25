import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Coin = {
  mint: string
  creator: string
  name: string
  symbol: string
  image?: string
  launchedAt: number
  progress: number
  isMigrated: boolean
  marketCapSol: number
  socials?: { website?: string; twitter?: string; telegram?: string; discord?: string }
}

export type TokenStats = {
  points: number[]
  changePercent: number
  volumeSol: number
  trades: number
  buys: number
  sells: number
}

type Network = { slot: number; rpcMs: number; tps: number }
type Summary = { recentVolSol: number; trackedSwaps: number; inCurvesSol: number; trackedPools: number; totalPools: number }

type MarketState = {
  status: 'loading' | 'success' | 'error'
  coins: Coin[]
  stats: Record<string, TokenStats>
  network: Network
  summary: Summary
  solUsd: number
  now: number
  refreshedAt: number
}

const empty: MarketState = {
  status: 'loading',
  coins: [],
  stats: {},
  network: { slot: 0, rpcMs: 0, tps: 0 },
  summary: { recentVolSol: 0, trackedSwaps: 0, inCurvesSol: 0, trackedPools: 0, totalPools: 0 },
  solUsd: 0,
  now: Date.now() / 1000,
  refreshedAt: Date.now() / 1000,
}

const Ctx = createContext<MarketState>(empty)

/**
 * Laddar fixtures från public/api/.
 * TODO(backend): ersätt med riktiga endpoints (/api/coins, /api/market-stats, /api/sol-price)
 * när en egen backend/indexer finns. Referensen läser Meteora DBC-pooler via egen server.
 */
export function MarketProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MarketState>(empty)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch('/api/coins.json').then((r) => r.json()),
      fetch('/api/market-stats.json').then((r) => r.json()),
      fetch('/api/sol-price.json').then((r) => r.json()),
    ])
      .then(([c, m, p]) => {
        if (!alive) return
        // Flytta tidsstämplar så att mockdatan alltid ser "färsk" ut
        const now = Date.now() / 1000
        const shift = now - c.updatedAt
        const coins: Coin[] = c.coins.map((x: Coin) => ({ ...x, launchedAt: x.launchedAt + shift }))
        setState({
          status: 'success',
          coins,
          stats: m.tokens,
          network: m.network,
          summary: {
            recentVolSol: m.recentVolSol,
            trackedSwaps: m.trackedSwaps,
            inCurvesSol: m.inCurvesSol,
            trackedPools: m.trackedPools,
            totalPools: m.totalPools,
          },
          solUsd: p.usd,
          now,
          refreshedAt: now,
        })
      })
      .catch(() => alive && setState((s) => ({ ...s, status: 'error' })))
    return () => {
      alive = false
    }
  }, [])

  // "Live"-känsla: slot tickar, TPS/RPC/SOL-pris rör sig lite
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.status !== 'success') return s
        const now = Date.now() / 1000
        return {
          ...s,
          now,
          network: {
            slot: s.network.slot + Math.round(8 + Math.random() * 4),
            rpcMs: Math.max(6, Math.round(s.network.rpcMs + (Math.random() - 0.5) * 6)),
            tps: Math.max(1500, s.network.tps + (Math.random() - 0.5) * 120),
          },
          solUsd: s.solUsd * (1 + (Math.random() - 0.5) * 0.0016),
        }
      })
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>
}

export const useMarket = () => useContext(Ctx)

/** Härledda värden som flera vyer behöver */
export function useBoard() {
  const m = useMarket()
  return useMemo(() => {
    const newest = [...m.coins].sort((a, b) => b.launchedAt - a.launchedAt)
    const bonded = newest.filter((c) => c.isMigrated)
    const bonding = newest.filter((c) => !c.isMigrated && c.progress >= 0.25)
    const fresh = newest.filter((c) => !c.isMigrated && c.progress < 0.25)
    const nextToBond = [...m.coins].filter((c) => !c.isMigrated).sort((a, b) => b.progress - a.progress)[0]
    const bondRate = m.coins.length ? (bonded.length / m.coins.length) * 100 : 0
    return { newest, bonded, bonding, fresh, nextToBond, bondRate }
  }, [m.coins])
}

export const coinUsd = (c: Coin, solUsd: number) => c.marketCapSol * solUsd
export const bondWidth = (p: number) => Math.max(3, Math.min(100, p * 100))
