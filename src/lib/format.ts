import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

const usd2 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/** $1,654.26 · $13.2K · $1.4M — samma regler som referensen */
export function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (a >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (a >= 1e4) return `$${(n / 1e3).toFixed(1)}K`
  return `$${usd2.format(n)}`
}

export const fmtInt = (n: number) => int.format(Math.round(n))

const SUB = '₀₁₂₃₄₅₆₇₈₉'
/** $0.0₅2662 — små priser med nollräknare i subscript */
export function fmtTinyUsd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '$0.00'
  if (n >= 0.01) return `$${n.toFixed(4)}`
  const s = n.toExponential(3) // 2.662e-6
  const [m, e] = s.split('e')
  const zeros = -Number(e) - 1
  const digits = m.replace('.', '').slice(0, 4)
  const sub = String(zeros).split('').map((d) => SUB[Number(d)]).join('')
  return `$0.0${sub}${digits}`
}

/** 1.05M · 1.00B · 950.2K */
export function fmtCompact(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}

export const shortAddr = (a: string) => (a.length > 10 ? `${a.slice(0, 4)}...${a.slice(-4)}` : a)

/** 12s · 3m · 15h · 2d */
export function ago(tsSec: number, nowSec = Date.now() / 1000): string {
  const d = Math.max(0, nowSec - tsSec)
  if (d < 60) return `${Math.floor(d)}s`
  if (d < 3600) return `${Math.floor(d / 60)}m`
  if (d < 86400) return `${Math.floor(d / 3600)}h`
  return `${Math.floor(d / 86400)}d`
}

export const pct1 = (n: number) => `${Math.abs(n).toFixed(1)}`
