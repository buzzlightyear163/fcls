import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { coinUsd, useMarket } from '../hooks/market'
import { useUi } from '../hooks/ui'
import { brand } from '../data/brand'
import { cn, fmtInt, fmtUsd } from '../lib/format'
import { BrandMark, I, Tip, TokenAvatar, Wordmark } from '../components/primitives'
import { ConnectButton } from '../components/Wallet'
import { GrainField } from '../components/GrainField'

const NAV = [
  { to: '/', label: 'Board', icon: 'ph--squares-four', iconActive: 'ph--squares-four-fill' },
  { to: '/otc', label: 'OTC', icon: 'ph--arrows-left-right', iconActive: 'ph--arrows-left-right-bold' },
  { to: '/burns', label: 'Burns', icon: 'ph--fire', iconActive: 'ph--fire-fill' },
  { to: '/rules', label: 'Rules', icon: 'ph--book-open', iconActive: 'ph--book-open-fill' },
  { to: '/roadmap', label: 'Roadmap', icon: 'ph--git-branch', iconActive: 'ph--git-branch-fill' },
]

function Sidebar() {
  const { sidebarOpen: open, setSidebarOpen, privacy, togglePrivacy } = useUi()
  const { pathname } = useLocation()
  const isActive = (to: string) => (to === '/' ? pathname === '/' || pathname.startsWith('/token/') : pathname.startsWith(to))
  const wrap = (label: string, el: JSX.Element) => (open ? el : <Tip label={label}>{el}</Tip>)

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-white/[0.08] bg-panel transition-[width] duration-200 ease-out md:flex',
        open ? 'w-[212px]' : 'w-[64px]',
      )}
    >
      <div className={cn('flex h-14 items-center', open ? 'justify-between px-3' : 'justify-center')}>
        <Link to="/" aria-label={`${brand.name} home`} className="group flex items-center gap-2 rounded-lg p-1">
          <BrandMark className="h-8 w-7 transition-transform duration-300 group-hover:scale-105" />
          {open && <Wordmark className="text-[16px]" />}
        </Link>
        {open && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-100"
          >
            <I icon="ph--caret-double-left" className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className={cn('pb-2', open ? 'px-3' : 'flex justify-center px-0')}>
        {wrap(
          'Launch a coin',
          <Link
            to="/launch"
            aria-label="Launch a coin"
            className={cn('btn-holo flex h-10 items-center justify-center gap-2 rounded-lg', open ? 'w-full text-sm' : 'w-10 text-[13px]')}
          >
            <I icon="ph--plus-bold" className="h-5 w-5" />
            {open && 'Launch'}
          </Link>,
        )}
      </div>
      <nav aria-label="Main" className={cn('mt-2 flex flex-col gap-0.5', open ? 'px-3' : 'items-center')}>
        {NAV.map((n) => {
          const active = isActive(n.to)
          return (
            <span key={n.to} className={open ? 'contents' : undefined}>
              {wrap(
                n.label,
                <NavLink
                  to={n.to}
                  aria-label={n.label}
                  className={cn(
                    'relative flex h-10 items-center gap-3 rounded-lg text-sm transition-colors',
                    open ? 'w-full px-3' : 'w-10 justify-center',
                    active ? 'bg-neutral-900 text-foreground' : 'text-neutral-500 hover:bg-neutral-900/60 hover:text-neutral-100',
                  )}
                >
                  {active && <span aria-hidden="true" className="bg-holo absolute -left-3 top-2.5 h-5 w-[2px] rounded-full" />}
                  <I icon={active ? n.iconActive : n.icon} className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
                  {open && <span className="flex-1 text-[13px] font-medium">{n.label}</span>}
                </NavLink>,
              )}
            </span>
          )
        })}
      </nav>
      <div className={cn('mt-auto flex flex-col gap-0.5 pb-3', open ? 'px-3' : 'items-center')}>
        {wrap(
          privacy ? 'Privacy mode on' : 'Privacy mode',
          <button
            type="button"
            aria-pressed={privacy}
            aria-label="Privacy mode: blur wallet addresses"
            onClick={togglePrivacy}
            className={cn(
              'flex h-10 items-center gap-3 rounded-lg text-sm transition-colors hover:bg-neutral-900/60',
              privacy ? 'text-primary' : 'text-neutral-500 hover:text-neutral-100',
              open ? 'w-full px-3' : 'w-10 justify-center',
            )}
          >
            <I icon={privacy ? 'ph--eye-slash-fill' : 'ph--eye-slash'} className="h-5 w-5 shrink-0" />
            {open && <span className="text-[13px] font-medium">Privacy mode</span>}
          </button>,
        )}
        {wrap(
          `${brand.name} on X`,
          <a
            href={brand.xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${brand.name} on X`}
            className={cn(
              'flex h-10 items-center gap-3 rounded-lg text-sm text-neutral-500 transition-colors hover:bg-neutral-900/60 hover:text-neutral-100',
              open ? 'w-full px-3' : 'w-10 justify-center',
            )}
          >
            <I icon="ph--x-logo" className="h-5 w-5" />
            {open && brand.xHandle}
          </a>,
        )}
        {!open && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-100"
          >
            <I icon="ph--caret-double-right" className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}

function Header() {
  const { setSearchOpen } = useUi()
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.08] bg-panel px-3 md:px-4">
      <Link to="/" aria-label={brand.name} className="mr-3 hidden shrink-0 lg:block">
        <Wordmark className="text-[19px]" />
      </Link>
      <Link to="/" aria-label={`${brand.name} home`} className="flex items-center gap-1.5 md:hidden">
        <BrandMark className="h-8 w-7" />
        <Wordmark className="hidden text-[16px] xs:inline-flex" />
      </Link>
      <button
        type="button"
        aria-label="Search coins"
        onClick={() => setSearchOpen(true)}
        className="group flex h-9 min-w-9 max-w-md flex-1 items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-sm text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300 sm:px-3"
      >
        <I icon="ph--magnifying-glass" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-[13px] sm:hidden">Search</span>
        <span className="hidden min-w-0 flex-1 truncate text-left text-[13px] sm:inline">Search coins, tickers, mints</span>
        <kbd className="hidden rounded border border-neutral-800 px-1.5 font-mono text-[10px] text-neutral-500 sm:inline">Ctrl K</kbd>
      </button>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span
          title="No KYC, no account, no email. Your wallet is your only login."
          className="hidden items-center gap-1.5 rounded-md px-2 py-1 font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500 lg:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          No KYC
        </span>
        <ConnectButton />
      </div>
    </header>
  )
}

const TABS = [
  { id: 'starred', label: 'Starred', icon: 'ph--star-fill' },
  { id: 'top', label: 'Top runners', icon: 'ph--trophy-fill' },
  { id: 'trending', label: 'Trending', icon: 'ph--flame-fill' },
  { id: 'new', label: 'Just launched', icon: 'ph--sparkle-fill' },
] as const

function Strip() {
  const { coins, stats, solUsd } = useMarket()
  const { starred } = useUi()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('starred')

  const { list, label } = useMemo(() => {
    const newest = [...coins].sort((a, b) => b.launchedAt - a.launchedAt)
    if (tab === 'starred') {
      const s = coins.filter((c) => starred.includes(c.mint))
      return s.length ? { list: s, label: 'Starred' } : { list: newest.slice(0, 12), label: 'Just launched' }
    }
    if (tab === 'top') return { list: [...coins].sort((a, b) => b.marketCapSol - a.marketCapSol).slice(0, 12), label: 'Top runners' }
    if (tab === 'trending')
      return {
        list: [...coins].sort((a, b) => (stats[b.mint]?.volumeSol ?? 0) - (stats[a.mint]?.volumeSol ?? 0)).slice(0, 12),
        label: 'Trending',
      }
    return { list: newest.slice(0, 12), label: 'Just launched' }
  }, [coins, stats, starred, tab])

  const loop = [...list, ...list]
  return (
    <div className="flex h-10 shrink-0 items-center border-b border-white/[0.08] bg-panel">
      <div role="tablist" aria-label="Strip" className="flex h-full shrink-0 items-center gap-0.5 border-r border-neutral-850 px-2">
        {TABS.map((t) => {
          const on = t.id === tab
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              aria-label={t.label}
              title={t.label}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex h-7 items-center justify-center gap-1.5 rounded-md transition-colors',
                on ? 'bg-neutral-900 px-2 text-primary' : 'w-7 text-neutral-600 hover:text-neutral-300',
              )}
            >
              <I icon={t.icon} className="h-4 w-4" />
              {on && (
                <span className="text-xs font-medium">
                  {t.id === 'starred' ? 'Starred ' : t.label}
                  {t.id === 'starred' && <span className="text-neutral-500">{starred.length}</span>}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <span
        title="Tap ☆ on any coin to follow it here"
        className="hidden h-full shrink-0 items-center gap-1.5 border-r border-neutral-850 px-3 text-[11px] text-neutral-500 sm:flex"
      >
        <I icon="ph--sparkle-fill" className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      <div className="marquee-host relative h-full min-w-0 flex-1 overflow-hidden">
        <div className="marquee flex h-full w-max items-center" style={{ ['--marquee-duration' as string]: `${Math.max(16, list.length * 4)}s` }}>
          {loop.map((c, i) => (
            <Link
              key={c.mint + i}
              to={`/token/${c.mint}`}
              className="flex h-full shrink-0 items-center gap-2 border-r border-neutral-900 px-3.5 transition-colors hover:bg-primary/5"
            >
              <TokenAvatar symbol={c.symbol} image={c.image} className="h-5 w-5 rounded text-[10px]" />
              <span className="text-[13px] font-medium">${c.symbol}</span>
              <span className="font-mono text-xs tabular text-neutral-500">{fmtUsd(coinUsd(c, solUsd))}</span>
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  )
}

function Footer() {
  const { solUsd, summary, network } = useMarket()
  const swapsTitle = `Recent decoded DBC swaps within 24h; up to 24 transactions per pool and 8 pools. ${summary.trackedPools} of ${summary.totalPools} pools tracked.`
  const items = [
    { k: 'Recent vol.', v: fmtUsd(summary.recentVolSol * solUsd), t: swapsTitle },
    { k: 'Tracked swaps', v: fmtInt(summary.trackedSwaps), t: swapsTitle },
    { k: 'In curves', v: fmtUsd(summary.inCurvesSol * solUsd), t: 'Quote reserves in unbonded curves on this board' },
    { k: 'TPS', v: fmtInt(network.tps), t: 'Mainnet transactions per second, including votes, from the latest RPC performance sample' },
    { k: 'RPC', v: `${network.rpcMs} ms`, t: 'Server-to-RPC getSlot round-trip time' },
    { k: 'Slot', v: fmtInt(network.slot), t: 'Latest confirmed slot on the configured cluster' },
  ]
  return (
    <footer
      aria-label="Market and Solana statistics"
      className="fixed inset-x-0 bottom-16 z-30 flex h-10 shrink-0 items-center gap-3 border-t border-white/[0.08] bg-panel px-3 text-[10px] md:static md:z-auto md:h-11 md:gap-4 md:px-4"
    >
      <div className="flex shrink-0 items-center gap-2 border-r border-neutral-800 pr-3" title="Cluster statistics (demo data)">
        <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_rgba(159,216,255,0.6)]" />
        <span className="font-term font-medium uppercase tracking-wider text-neutral-300">Solana</span>
        <span className="hidden font-term text-neutral-500 lg:inline">connected</span>
      </div>
      <dl className="scrollbar-none flex min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap">
        <div className="flex shrink-0 items-center gap-1.5" title="SOL/USD market price">
          <I icon="ph--currency-circle-dollar" className="h-3.5 w-3.5 text-primary" />
          <dt className="font-term uppercase tracking-wider text-neutral-500">SOL</dt>
          <dd className="font-mono font-medium tabular text-primary">{fmtUsd(solUsd)}</dd>
        </div>
        {items.map((x) => (
          <div key={x.k} className="flex shrink-0 items-center gap-1.5" title={x.t}>
            <dt className="font-term uppercase tracking-wider text-neutral-500">{x.k}</dt>
            <dd className="font-mono font-medium tabular text-neutral-200">{x.v}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        aria-label="More market stats"
        className="flex h-7 w-6 shrink-0 items-center justify-center rounded text-neutral-400 hover:text-primary md:hidden"
        onClick={(e) => {
          const dl = (e.currentTarget.previousElementSibling as HTMLElement) || null
          dl?.scrollBy({ left: 160, behavior: 'smooth' })
        }}
      >
        <I icon="ph--caret-right-bold" className="h-3.5 w-3.5" />
      </button>
      <nav aria-label="Footer links" className="hidden shrink-0 items-center gap-3 border-l border-neutral-800 pl-4 font-term uppercase tracking-wider text-neutral-500 xl:flex">
        <Link to="/rules" className="hover:text-primary">
          Rules
        </Link>
        <Link to="/burns" className="hover:text-primary">
          Burns
        </Link>
      </nav>
    </footer>
  )
}

function MobileNav() {
  const { pathname } = useLocation()
  const { setSearchOpen } = useUi()
  const item = (to: string, label: string, icon: string, iconActive: string) => {
    const on = to === '/' ? pathname === '/' : pathname.startsWith(to)
    return (
      <Link
        to={to}
        className={cn('flex min-w-0 flex-col items-center gap-0.5 py-1 text-[10px]', on ? 'text-foreground' : 'text-neutral-500')}
      >
        <I icon={on ? iconActive : icon} className={cn('h-5 w-5', on && 'text-primary')} />
        {label}
      </Link>
    )
  }
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] place-items-center border-t border-white/[0.08] bg-panel pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid w-full auto-cols-fr grid-flow-col">
        {item('/', 'Board', 'ph--squares-four', 'ph--squares-four-fill')}
        {item('/otc', 'OTC', 'ph--arrows-left-right', 'ph--arrows-left-right-bold')}
        <button type="button" onClick={() => setSearchOpen(true)} className="flex min-w-0 flex-col items-center gap-0.5 py-1 text-[10px] text-neutral-500">
          <I icon="ph--magnifying-glass" className="h-5 w-5" />
          Search
        </button>
      </div>
      <Link
        to="/launch"
        aria-label="Launch a coin"
        className="btn-holo -mt-6 flex h-14 w-14 items-center justify-center rounded-2xl ring-4 ring-background active:scale-95"
      >
        <I icon="ph--plus-bold" className="h-7 w-7" />
      </Link>
      <div className="grid w-full auto-cols-fr grid-flow-col">
        {item('/burns', 'Burns', 'ph--fire', 'ph--fire-fill')}
        {item('/rules', 'Rules', 'ph--book-open', 'ph--book-open-fill')}
        {item('/roadmap', 'Roadmap', 'ph--git-branch', 'ph--git-branch-fill')}
      </div>
    </nav>
  )
}

export function AppShell() {
  return (
    <>
      <GrainField />
      <div className="flex h-dvh overflow-hidden text-foreground">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header />
          <Strip />
          <Outlet />
          <Footer />
        </div>
      </div>
      <MobileNav />
    </>
  )
}
