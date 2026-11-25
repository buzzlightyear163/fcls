import { useState, type ReactNode } from 'react'
import { brand } from '../data/brand'
import { cn } from '../lib/format'

/** Phosphor-ikon via Iconify CSS. Skriv alltid hela klassen, t.ex. icon="ph--plus-bold" */
export function I({ icon, className }: { icon: string; className?: string }) {
  return <span aria-hidden="true" className={cn('iconify', icon, className)} />
}

export function BrandMark({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <span className={cn('brand-mark relative inline-block shrink-0', className)} aria-hidden="true">
      <img
        src={brand.assets.mark}
        width={128}
        height={128}
        alt=""
        draggable={false}
        className={cn('mk-white h-full w-full select-none object-contain', imgClassName)}
      />
    </span>
  )
}

/** Textbaserad wordmark (ersätter referensens bild-wordmark). Storlek styrs med font-size. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('brand-wordmark inline-flex min-w-0 max-w-full items-end align-middle leading-none', className)}
      aria-label={brand.name}
    >
      <span className="select-none whitespace-nowrap font-sans font-black italic leading-[0.8] tracking-[-0.06em] text-white">
        {brand.wordmark.main}
        <span className="ml-[0.04em] text-[0.52em] font-extrabold tracking-[-0.03em]">{brand.wordmark.tld}</span>
      </span>
    </span>
  )
}

export function TokenAvatar({
  symbol,
  image,
  className,
}: {
  symbol: string
  image?: string
  className?: string
}) {
  const [ok, setOk] = useState(true)
  return (
    <div
      role="img"
      aria-label={`${symbol} token image`}
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-neutral-900 font-term font-semibold text-neutral-300 ring-1 ring-inset ring-neutral-800',
        className,
      )}
    >
      {(symbol[0] || '?').toUpperCase()}
      {image && ok && (
        <img
          src={image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setOk(false)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity opacity-100"
        />
      )}
    </div>
  )
}

export function BondFill({ progress, className }: { progress: number; className?: string }) {
  const w = Math.max(3, Math.min(100, progress * 100))
  return (
    <div
      className={cn('bond-fill h-full transition-[width] duration-700', className)}
      style={{ width: `${w}%`, ['--bond-size' as string]: `${(100 / w) * 100}%` }}
    />
  )
}

/** Prisbakgrund bakom varje rad på brädet (samma SVG-konstruktion som referensen) */
export function Sparkline({ points, id }: { points: number[]; id: string }) {
  if (!points || points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const pts = points.map((p, i) => {
    const x = 6 + (228 * i) / (points.length - 1)
    const y = 84 - ((p - min) / span) * 78
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = 'M' + pts.join(' L')
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 90"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -right-3 bottom-0 top-0 -z-10 h-full w-[64%] text-neutral-500 opacity-30 transition-opacity duration-300 group-hover:opacity-55"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-fade`}>
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="240" height="90" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <path d={`${line} L234,90 L6,90 Z`} fill={`url(#${id}-fill)`} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}

/** Enkel tooltip (ersätter Radix Tooltip i referensen) */
export function Tip({ label, children, side = 'right' }: { label: string; children: ReactNode; side?: 'right' | 'bottom' }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap border border-white/[0.09] bg-neutral-900 px-2 py-1 text-[11px] font-medium text-neutral-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100',
          side === 'right' ? 'left-full top-1/2 ml-3 -translate-y-1/2' : 'left-1/2 top-full mt-2 -translate-x-1/2',
        )}
      >
        {label}
      </span>
    </span>
  )
}

const btnBase =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-term uppercase tracking-wide transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

export const btn = {
  holo: cn(btnBase, 'btn-holo font-bold'),
  primary: cn(btnBase, 'font-semibold bg-primary text-primary-950 hover:bg-primary-300'),
  outline: cn(btnBase, 'font-semibold border border-neutral-750 bg-transparent text-neutral-200 hover:bg-neutral-900'),
  emerald: cn(btnBase, 'px-4 font-semibold bg-emerald text-ink hover:bg-emerald/90'),
}

/** Avgiftsfördelning 0.60 / 0.40 / 0.25 */
export function FeeSplit({ first = 'Creator', note, small }: { first?: string; note?: ReactNode; small?: boolean }) {
  return (
    <div>
      <div
        className="flex h-1.5 w-full gap-[2px]"
        role="img"
        aria-label={`Every 1.25% trade fee: 0.60% to ${first}, 0.40% to House, 0.25% to Meteora`}
      >
        <span className="h-full bg-signal" style={{ width: '48%' }} />
        <span className="h-full bg-foreground/70" style={{ width: '32%' }} />
        <span className="h-full bg-neutral-700" style={{ width: '20%' }} />
      </div>
      <dl className={cn('mt-2.5 grid gap-1', small ? 'text-[11px]' : 'text-xs')}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-signal" />
          <dt className="text-neutral-400">
            {first}
            {note}
          </dt>
          <dd className="ml-auto font-mono tabular font-semibold text-foreground">0.60%</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-foreground/70" />
          <dt className="text-neutral-400">House</dt>
          <dd className="ml-auto font-mono tabular text-neutral-400">0.40%</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 bg-neutral-600" />
          <dt className="text-neutral-400">Meteora</dt>
          <dd className="ml-auto font-mono tabular text-neutral-400">0.25%</dd>
        </div>
      </dl>
    </div>
  )
}

export function Ping({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex h-1.5 w-1.5 shrink-0', className)}>
      <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
      <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
    </span>
  )
}
