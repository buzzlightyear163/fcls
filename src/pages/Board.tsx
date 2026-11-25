import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { coinUsd, useBoard, useMarket, type Coin } from '../hooks/market'
import { useUi } from '../hooks/ui'
import { brand } from '../data/brand'
import { ago, cn, fmtUsd, shortAddr } from '../lib/format'
import { BondFill, BrandMark, I, Ping, Sparkline, TokenAvatar } from '../components/primitives'
import { Scramble } from '../components/Scramble'

function AboutButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`About ${brand.longName}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-term text-[11px] uppercase tracking-[0.14em] text-neutral-500 transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        <Ping />
        Privacy-first launchpad
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 border border-white/[0.09] bg-neutral-950 p-4 text-[13px] leading-relaxed text-neutral-300 shadow-2xl animate-in fade-in-0 slide-in-from-top-1">
          <p className="eyebrow mb-2">About {brand.longName}</p>
          {brand.description}
        </div>
      )}
    </div>
  )
}

function Hero() {
  const { coins, summary, solUsd } = useMarket()
  const { bonded, bonding, nextToBond, bondRate } = useBoard()
  const { setBannerCollapsed } = useUi()
  const stats = [
    { k: 'Launched', v: String(coins.length) },
    { k: 'Bonding', v: String(bonding.length) },
    { k: 'Bonded', v: String(bonded.length), cls: 'text-acid' },
    { k: 'Recent vol.', v: fmtUsd(summary.recentVolSol * solUsd) },
    { k: 'Swaps', v: String(summary.trackedSwaps) },
    { k: 'In curves', v: fmtUsd(summary.inCurvesSol * solUsd) },
  ]
  return (
    <section aria-label={brand.longName} className="holo-border relative mb-3 shrink-0 overflow-hidden bg-panel">
      <button
        type="button"
        aria-label="Collapse banner"
        onClick={() => setBannerCollapsed(true)}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-900 hover:text-foreground"
      >
        <I icon="ph--caret-up" className="h-4 w-4" />
      </button>
      <div className="relative grid gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)_minmax(0,20rem)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,22rem)]">
        <div className="flex min-w-0 items-center">
          <div className="min-w-0">
            <AboutButton />
            <h1
              aria-label={`${brand.headline.top} ${brand.headline.bottom}`}
              className="mt-4 font-display text-[28px] uppercase leading-[1.05] sm:text-[36px] xl:text-[44px]"
            >
              <Scramble text={brand.headline.top} />
              <br />
              <Scramble text={brand.headline.bottom} className="text-holo" delay={120} />
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400">
              Connect any wallet and launch. Nothing to sign up for, nothing to verify. 1.25% flat, before and after bonding.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Link to="/launch" className="btn-holo inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-[13px]">
                Launch a coin
                <I icon="ph--arrow-right" className="h-4 w-4" />
              </Link>
              <Link
                to="/rules"
                className="inline-flex h-10 shrink-0 items-center rounded-lg px-3.5 text-[13px] font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-foreground"
              >
                How fees work
              </Link>
            </div>
            <p className="mt-5 font-term text-[10px] uppercase tracking-[0.14em] text-neutral-600">
              face <span className="text-neutral-400">none</span> · kyc <span className="text-neutral-400">none</span> · keys{' '}
              <span className="text-acid">yours</span>
            </p>
          </div>
        </div>
        <dl className="grid min-w-0 grid-cols-2 gap-px self-center border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.k} className="bg-panel px-3.5 py-3">
              <dt className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500">{s.k}</dt>
              <dd className={cn('mt-1.5 font-pixel text-[17px] leading-none tabular', s.cls)}>{s.v}</dd>
            </div>
          ))}
          <div className="col-span-2 flex items-baseline justify-between bg-panel px-3.5 py-3 sm:col-span-3">
            <dt className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500">SOL</dt>
            <dd className="font-pixel text-[17px] leading-none tabular">{fmtUsd(solUsd)}</dd>
          </div>
        </dl>
        <div className="flex min-w-0 flex-col justify-center gap-4 border-t border-neutral-850 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Bond rate</p>
              <p className="mt-2 font-pixel text-[36px] leading-none tabular">{bondRate.toFixed(1)}%</p>
            </div>
            <p className="text-right text-[11px] leading-snug text-neutral-500">
              of launches
              <br />
              made it to DAMM v2
            </p>
          </div>
          <div className="h-1.5 overflow-hidden bg-white/[0.06]">
            <div className="bond-fill h-full bg-signal transition-[width] duration-1000" style={{ width: `${bondRate}%` }} />
          </div>
          {nextToBond && (
            <Link
              to={`/token/${nextToBond.mint}`}
              aria-label={`Next to bond: $${nextToBond.symbol}`}
              className="group -mx-2 flex items-center gap-3 px-2 py-2 transition-colors hover:bg-white/[0.05]"
            >
              <TokenAvatar symbol={nextToBond.symbol} image={nextToBond.image} className="h-9 w-9 rounded-lg text-xs" />
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className="truncate text-[13px] font-semibold">${nextToBond.symbol}</span>
                  <span className="text-[11px] text-neutral-500">next to bond</span>
                </p>
                <div className="mt-1.5 h-1 overflow-hidden bg-white/[0.06]">
                  <BondFill progress={nextToBond.progress} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[13px] font-semibold tabular">{(nextToBond.progress * 100).toFixed(1)}%</p>
                <p className="font-mono text-[11px] text-neutral-500 tabular">{fmtUsd(coinUsd(nextToBond, solUsd))}</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

function CollapsedHero() {
  const { setBannerCollapsed } = useUi()
  const { bondRate } = useBoard()
  return (
    <div className="glass mb-3 flex h-12 shrink-0 items-center gap-3 rounded-2xl px-3">
      <BrandMark className="h-6 w-5" />
      <p className="hidden truncate text-[13px] font-semibold tracking-tight sm:block">
        {brand.headline.top} <span className="text-holo">{brand.headline.bottom}</span>
      </p>
      <span className="hidden h-4 w-px bg-neutral-800 sm:block" />
      <span className="text-xs text-neutral-500">
        Bond rate <b className="font-mono font-semibold text-foreground">{bondRate.toFixed(1)}%</b>
      </span>
      <button
        type="button"
        aria-label="Expand banner"
        onClick={() => setBannerCollapsed(false)}
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-900 hover:text-foreground"
      >
        <I icon="ph--caret-down" className="h-4 w-4" />
      </button>
    </div>
  )
}

function OfficialToken() {
  return (
    <Link
      to={`/token/${brand.officialMint}`}
      aria-label={`View the official $${brand.ticker} token`}
      className="holo-border group mb-3 flex shrink-0 items-center gap-3 rounded-2xl bg-panel p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:gap-4 sm:p-4"
    >
      <TokenAvatar symbol={brand.ticker} image={brand.assets.token} className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <I icon="ph--seal-check-fill" className="h-3.5 w-3.5" />
          Official token
        </div>
        <p className="font-display text-lg font-bold leading-tight text-foreground sm:text-xl">
          ${brand.ticker} <span className="font-sans text-xs font-normal text-neutral-400">{brand.name}</span>
        </p>
        {brand.caLive && <p className="mt-1 hidden truncate font-mono text-[10px] text-neutral-500 sm:block">{brand.officialMint}</p>}
      </div>
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-primary">
        <span className="hidden sm:inline">View token</span>
        <I icon="ph--arrow-right-bold" className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function CoinRow({ coin, idx }: { coin: Coin; idx: string }) {
  const { stats, solUsd, now } = useMarket()
  const { starred, toggleStar, density } = useUi()
  const st = stats[coin.mint]
  const compact = density === 'compact'
  const change = st?.changePercent
  const isStar = starred.includes(coin.mint)
  return (
    <div className="coin-row group relative isolate overflow-hidden border-b border-neutral-800/50 last:border-b-0">
      {st && <Sparkline points={st.points} id={idx} />}
      <Link
        to={`/token/${coin.mint}`}
        aria-label={`${coin.name} ($${coin.symbol})`}
        className={cn(
          'relative flex items-center gap-3 px-3.5 pr-10 transition-colors hover:bg-neutral-900/25 focus-visible:bg-neutral-900/40 focus-visible:outline-none',
          compact ? 'py-2.5' : 'py-4',
        )}
      >
        <TokenAvatar
          symbol={coin.symbol}
          image={coin.image}
          className={cn(
            'rounded-xl shadow-[0_6px_18px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/10',
            compact ? 'h-10 w-10 text-sm' : 'h-16 w-16 text-lg',
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold tracking-tight">{coin.symbol}</span>
            {coin.isMigrated && (
              <span className="bg-holo inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-ink">
                <img src={brand.assets.mark} alt="" className="h-3 w-3 brightness-0" />
                BONDED
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-neutral-300">{coin.name}</p>
          {!compact && (
            <p className="mt-1 truncate whitespace-nowrap font-mono text-[10px] text-neutral-500">
              {ago(coin.launchedAt, now)} · {st ? `Vol ${fmtUsd(st.volumeSol * solUsd)}` : <span data-private>{shortAddr(coin.creator)}</span>}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-mono text-[14px] font-semibold tabular transition-colors duration-700" title={`${coin.marketCapSol.toFixed(2)} SOL`}>
            {fmtUsd(coinUsd(coin, solUsd))}
          </span>
          <span
            title="Observed price change over recent trades"
            className={cn(
              'inline-flex items-center gap-0.5 font-mono text-[10px] font-medium tabular',
              change == null ? 'text-neutral-500' : change < 0 ? 'text-rose' : 'text-emerald',
            )}
          >
            {change == null ? (
              '—'
            ) : (
              <>
                <I icon={change < 0 ? 'ph--arrow-down-right-bold' : 'ph--arrow-up-right-bold'} className="h-2.5 w-2.5" />
                {Math.abs(change).toFixed(1)}%
              </>
            )}
            <span className="ml-1 text-[9px] font-normal text-neutral-500">recent</span>
          </span>
          {!compact && (
            <>
              <span className={cn('font-mono text-[10px] tabular', coin.isMigrated ? 'text-cyan' : 'text-neutral-400')}>
                {coin.isMigrated ? 'Bonded' : `${(coin.progress * 100).toFixed(1)}% to bond`}
              </span>
              <span className="block h-1 w-20 overflow-hidden rounded-full bg-neutral-850">
                <BondFill progress={coin.progress} />
              </span>
            </>
          )}
        </div>
      </Link>
      <button
        type="button"
        aria-label={isStar ? 'Unstar token' : 'Star token'}
        title={isStar ? 'Unstar token' : 'Star token'}
        onClick={() => toggleStar(coin.mint)}
        className={cn(
          'absolute right-2 top-1/2 inline-flex h-7 w-7 shrink-0 -translate-y-1/2 items-center justify-center rounded-md transition-all hover:bg-neutral-850 active:scale-90',
          isStar
            ? 'text-primary'
            : 'text-neutral-600 hover:text-neutral-300 has-hover:opacity-0 has-hover:focus-visible:opacity-100 has-hover:group-hover:opacity-100',
        )}
      >
        <I icon={isStar ? 'ph--star-fill' : 'ph--star'} className="h-4 w-4" />
      </button>
    </div>
  )
}

type PanelDef = {
  id: string
  num: string
  title: string
  sub: string
  icon: string
  sorts: [string, string]
  coins: Coin[]
  empty: string
}

function Panel({ p, hiddenOnMobile }: { p: PanelDef; hiddenOnMobile: boolean }) {
  const [sort, setSort] = useState(0)
  const list = useMemo(() => {
    if (sort === 1) return [...p.coins].sort((a, b) => b.marketCapSol - a.marketCapSol)
    if (p.sorts[0] === 'Progress') return [...p.coins].sort((a, b) => b.progress - a.progress)
    return p.coins
  }, [p.coins, p.sorts, sort])
  return (
    <section
      aria-labelledby={`panel-${p.id}`}
      className={cn(
        'board-surface relative flex min-h-0 flex-col overflow-hidden border border-white/[0.09] bg-panel max-lg:min-h-[60vh]',
        hiddenOnMobile && 'max-lg:hidden',
      )}
    >
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" aria-hidden="true" />
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] pl-3 pr-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.04] ring-1 ring-inset ring-white/10">
          <I icon={p.icon} className={cn('h-4 w-4', p.id === 'new' ? 'text-primary' : p.id === 'close' ? 'text-acid' : 'text-cyan')} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 id={`panel-${p.id}`} className="truncate whitespace-nowrap font-display text-[13px] uppercase">
              <span className="mr-1.5 text-neutral-600">[{p.num}]</span>
              {p.title}
            </h2>
            <span className="bg-white/[0.06] px-1.5 py-px font-pixel text-[10px] text-neutral-300">{p.coins.length}</span>
          </div>
          <p className="truncate text-[10px] text-neutral-500">{p.sub}</p>
        </div>
        <div className="ml-auto flex items-center">
          <div role="radiogroup" aria-label={`Sort ${p.title}`} className="flex gap-0.5 rounded-lg border border-neutral-800/60 bg-neutral-900/60 p-0.5">
            {p.sorts.map((s, i) => (
              <button
                key={s}
                role="radio"
                aria-checked={sort === i}
                onClick={() => setSort(i)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors',
                  sort === i ? 'bg-neutral-800 text-foreground shadow-sm' : 'text-neutral-500 hover:text-neutral-200',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {list.length ? (
          list.map((c, i) => <CoinRow key={c.mint} coin={c} idx={`${p.id}${i}`} />)
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <BrandMark className="h-14 w-14 opacity-60 grayscale-[0.4]" imgClassName="mark-float" />
            <p className="max-w-[16rem] text-xs leading-relaxed text-neutral-500">{p.empty}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Board() {
  const { coins } = useMarket()
  const { fresh, bonding, bonded } = useBoard()
  const { bannerCollapsed, density, setDensity } = useUi()
  const [mobileTab, setMobileTab] = useState(0)

  const panels: PanelDef[] = [
    { id: 'new', num: '01', title: 'New', sub: 'Just dropped', icon: 'ph--sparkle-fill', sorts: ['Newest', 'MC'], coins: fresh, empty: 'No launches yet. Be first.' },
    { id: 'close', num: '02', title: 'Bonding', sub: 'Past 25% and climbing', icon: 'ph--lightning-fill', sorts: ['Progress', 'MC'], coins: bonding, empty: 'Nothing past 25% yet. Keep pushing.' },
    { id: 'bonded', num: '03', title: 'Bonded', sub: 'Made it to DAMM v2', icon: 'ph--seal-check-fill', sorts: ['Newest', 'MC'], coins: bonded, empty: 'No coin has bonded yet.' },
  ]

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2 pb-28 md:overflow-hidden md:p-3">
      <div className="flex min-h-0 flex-1 flex-col">
        {bannerCollapsed ? <CollapsedHero /> : <Hero />}
        <OfficialToken />
        <div className="mb-2.5 flex shrink-0 items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-[14px] uppercase">The board</h2>
            <span className="rounded-md bg-neutral-900 px-1.5 py-0.5 font-mono text-[11px] text-neutral-400">{coins.length} coins</span>
            <span className="hidden text-[11px] text-neutral-500 sm:inline">Launched by anons. Owned by holders.</span>
          </div>
          <div role="group" aria-label="Card density" className="flex shrink-0 gap-0.5 border border-white/[0.09] bg-panel p-1">
            {(['compact', 'comfortable'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] transition-colors',
                  density === d ? 'bg-neutral-800 text-foreground shadow-sm' : 'text-neutral-500 hover:text-neutral-200',
                )}
              >
                <I icon={d === 'compact' ? 'ph--rows-bold' : 'ph--squares-four-bold'} className="h-3.5 w-3.5" />
                <span className="hidden capitalize sm:inline">{d}</span>
                <span className="sr-only sm:hidden">{d}</span>
              </button>
            ))}
          </div>
        </div>
        <div role="tablist" aria-label="Board" className="mb-2 flex gap-1 border border-white/[0.09] bg-panel p-1 lg:hidden">
          {panels.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={mobileTab === i}
              onClick={() => setMobileTab(i)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
                mobileTab === i ? 'bg-neutral-850 text-foreground shadow-[inset_0_-2px_0_rgb(var(--primary))]' : 'text-neutral-500 hover:text-neutral-200',
              )}
            >
              {p.title}
              <span className="ml-1 font-mono text-neutral-500">{p.coins.length}</span>
            </button>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 gap-2 md:gap-3 lg:grid-cols-3">
          {panels.map((p, i) => (
            <Panel key={p.id} p={p} hiddenOnMobile={i !== mobileTab} />
          ))}
        </div>
      </div>
    </main>
  )
}

