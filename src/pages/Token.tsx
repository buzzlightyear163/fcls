import { useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { coinUsd, useMarket, type Coin } from '../hooks/market'
import { useUi } from '../hooks/ui'
import { brand } from '../data/brand'
import { ago, cn, fmtCompact, fmtTinyUsd, fmtUsd, shortAddr } from '../lib/format'
import { mockHolders, mockTrades, type Trade } from '../lib/trades'
import { BondFill, BrandMark, btn, I, TokenAvatar } from '../components/primitives'
import { TokenChart } from '../components/TokenChart'

const THRESHOLD_SOL = 80

function Addr({ a }: { a: string }) {
  return (
    <a href={`${brand.explorer}/address/${a}`} target="_blank" rel="noreferrer" className="text-neutral-300 hover:text-primary">
      <span className="inline-flex min-w-0 max-w-full items-center gap-2" title={a}>
        <span className="min-w-0 truncate">
          <span className="font-mono" data-private>
            {shortAddr(a)}
          </span>
        </span>
      </span>
    </a>
  )
}

function Stat({ k, title, children }: { k: string; title?: string; children: ReactNode }) {
  return (
    <div className="shrink-0" title={title}>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{k}</dt>
      <dd className="mt-0.5 whitespace-nowrap font-mono text-[13px] font-medium tabular-nums text-neutral-200">{children}</dd>
    </div>
  )
}

function TradePanel({ coin }: { coin: Coin }) {
  const { wallet, setWalletModal } = useUi()
  const { solUsd } = useMarket()
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amt, setAmt] = useState('')
  const n = Number(amt) || 0
  const unit = side === 'buy' ? 'SOL' : coin.symbol
  const quick = side === 'buy' ? ['0.1', '0.5', '1', '2'] : ['25%', '50%', '75%', '100%']
  const priceSol = coin.marketCapSol / 1e9
  const solValue = side === 'buy' ? n : n * priceSol
  const fee = solValue * 0.0125
  const out = side === 'buy' ? (n - fee) / priceSol : solValue - fee
  const mode = coin.mint === brand.officialMint ? brand.ticker : 'Regular · Dev'

  const submit = () => {
    if (wallet.status !== 'connected') return setWalletModal(true)
    if (!n) return toast.error('Enter an amount first.')
    // TODO(backend): bygg DBC/DAMM v2 swap-transaktion och låt plånboken signera
    toast.success(`Demo: ${side} ${n} ${unit} of $${coin.symbol}`)
  }

  return (
    <>
      <section
        aria-label="Trading fee"
        title="Flat 1.25% before and after bonding (99% in the launch slot only). Check the live quote before signing."
        className="flex items-center justify-between gap-3 border-b border-neutral-850 px-4 py-2.5"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">99% launch slot · then</span>
        <span className="font-mono text-sm text-emerald">1.25% · {mode}</span>
      </section>
      <section aria-label="Trade" className="flex flex-col gap-3 p-4">
        <div role="tablist" className="grid h-10 grid-cols-2 gap-1 rounded-lg bg-neutral-900 p-1">
          {(['buy', 'sell'] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={side === s}
              onClick={() => {
                setSide(s)
                setAmt('')
              }}
              className={cn(
                'rounded-md text-sm font-semibold capitalize transition-colors',
                side === s ? (s === 'buy' ? 'bg-emerald text-ink shadow-sm' : 'bg-rose text-ink shadow-sm') : 'text-neutral-400 hover:text-neutral-100',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-925 px-3 pb-2 pt-2 transition-colors focus-within:border-primary/60">
          <div className="flex h-5 items-center justify-between text-[11px]">
            <label htmlFor={`amt-${coin.mint}`} className="font-medium text-neutral-500">
              You pay
            </label>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              id={`amt-${coin.mint}`}
              inputMode="decimal"
              placeholder="0.00"
              value={amt}
              onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ''))}
              className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-medium tabular-nums text-foreground outline-none placeholder:text-neutral-700"
            />
            <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-neutral-850 pl-1 pr-2.5 text-xs font-semibold">
              {side === 'buy' ? (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] text-[9px] font-bold text-white">◎</span>
              ) : (
                <TokenAvatar symbol={coin.symbol} image={coin.image} className="h-5 w-5 rounded-full text-[9px]" />
              )}
              <span className="max-w-20 truncate">{unit}</span>
            </span>
          </div>
          <p className="mt-0.5 h-4 font-mono text-[11px] text-neutral-500">{n ? `≈ ${fmtUsd(solValue * solUsd)}` : ''}</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmt(side === 'buy' ? q : String(Math.round((parseInt(q) / 100) * 1e6)))}
              className="h-8 rounded-md border border-neutral-850 font-mono text-[11px] text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-100"
            >
              {q}
              {side === 'buy' && ' SOL'}
            </button>
          ))}
        </div>
        <dl className="space-y-1.5 rounded-lg bg-neutral-925 px-3 py-2.5 text-xs">
          {n ? (
            <>
              <div className="flex justify-between">
                <dt className="text-neutral-500">You receive (est.)</dt>
                <dd className="font-mono text-neutral-200">{side === 'buy' ? `${fmtCompact(out)} ${coin.symbol}` : `${out.toFixed(4)} SOL`}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Trading fee 1.25%</dt>
                <dd className="font-mono text-neutral-200">{fee.toFixed(5)} SOL</dd>
              </div>
            </>
          ) : (
            <p className="py-0.5 text-neutral-500">Enter an amount to see the trading fee before you confirm.</p>
          )}
        </dl>
        <button type="button" onClick={submit} className={cn(btn.emerald, 'h-11 w-full text-sm', side === 'sell' && 'bg-rose hover:bg-rose/90')}>
          {wallet.status === 'connected' ? `${side === 'buy' ? 'Buy' : 'Sell'} $${coin.symbol}` : 'Connect wallet'}
        </button>
      </section>
    </>
  )
}

function Activity({ coin, trades }: { coin: Coin; trades: Trade[] }) {
  const { solUsd, now } = useMarket()
  const [tab, setTab] = useState<'trades' | 'holders' | 'traders'>('trades')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [paused, setPaused] = useState(false)
  const holders = useMemo(() => mockHolders(coin), [coin])
  const traders = useMemo(() => {
    const m = new Map<string, { w: string; buys: number; sells: number; vol: number }>()
    trades.forEach((t) => {
      const x = m.get(t.wallet) ?? { w: t.wallet, buys: 0, sells: 0, vol: 0 }
      if (t.side === 'buy') x.buys++
      else x.sells++
      x.vol += t.sol
      m.set(t.wallet, x)
    })
    return [...m.values()].sort((a, b) => b.vol - a.vol)
  }, [trades])
  const rows = trades.filter((t) => (filter === 'all' || t.side === filter) && (!q || t.wallet.toLowerCase().includes(q.toLowerCase())))
  const th = 'whitespace-nowrap px-2 py-2.5 text-[10px] font-medium text-neutral-500'
  const td = 'h-11 whitespace-nowrap px-2 font-mono text-xs tabular-nums'

  return (
    <section aria-label="Coin activity" className="order-3 min-w-0 border-b border-neutral-850 lg:border-b-0">
      <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-neutral-850 px-2 py-1.5 sm:py-0">
        <div role="tablist" aria-label="Token activity" className="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto">
          {(
            [
              ['trades', 'Trades', trades.length],
              ['holders', 'Holders', holders.length],
              ['traders', 'Traders', traders.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-xs transition-colors',
                tab === id ? 'bg-neutral-850 font-semibold text-foreground' : 'text-neutral-500 hover:text-neutral-100',
              )}
            >
              {label}
              <span className="ml-1.5 font-mono text-[10px] text-neutral-500">{count}</span>
            </button>
          ))}
        </div>
        <div className="flex w-full min-w-0 items-center gap-1.5 sm:ml-auto sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-48 sm:flex-none">
            <span className="sr-only">Find a wallet or username</span>
            <I icon="ph--magnifying-glass" className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Wallet or username"
              className="h-7 w-full min-w-24 rounded-md bg-neutral-900 pl-7 pr-2 text-[11px] outline-none ring-primary/40 placeholder:text-neutral-600 focus:ring-1"
            />
          </label>
          <select
            aria-label="Trade filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-7 rounded-md bg-neutral-900 px-2 text-[11px] text-neutral-300 outline-none ring-primary/40 focus:ring-1"
          >
            <option value="all">All trades</option>
            <option value="buy">Buys</option>
            <option value="sell">Sells</option>
          </select>
          <button
            type="button"
            aria-label={paused ? 'Resume' : 'Pause'}
            title={paused ? 'Resume the live tape' : 'Pause the live tape'}
            onClick={() => setPaused((p) => !p)}
            className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-md bg-neutral-900 transition-colors', paused ? 'text-primary' : 'text-neutral-400 hover:text-neutral-100')}
          >
            <I icon={paused ? 'ph--play-fill' : 'ph--pause-fill'} className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div role="tabpanel">
        <div className="max-h-[380px] overflow-auto overscroll-contain">
          {tab === 'trades' && (
            <table className="w-full min-w-[590px]">
              <thead className="sticky top-0 z-10 bg-neutral-950">
                <tr>
                  <th className={cn(th, 'text-left')}>Age</th>
                  <th className={cn(th, 'text-left')}>Side</th>
                  <th className={cn(th, 'text-right')}>Value</th>
                  <th className={cn(th, 'text-right')}>Tokens</th>
                  <th className={cn(th, 'text-right')}>Fee</th>
                  <th className={cn(th, 'text-left')}>Trader</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.sig} className="border-t border-neutral-850/70 transition-colors hover:bg-neutral-900/60">
                    <td className={cn(td, 'text-neutral-500')}>
                      <a href={`${brand.explorer}/tx/${t.sig}`} target="_blank" rel="noreferrer" className="hover:text-primary" title={new Date(t.ts * 1000).toISOString()}>
                        {ago(t.ts, now)}
                      </a>
                    </td>
                    <td className={cn(td, t.side === 'buy' ? 'text-emerald' : 'text-rose')}>
                      <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold', t.side === 'buy' ? 'bg-emerald/10' : 'bg-rose/10')}>
                        <I icon={t.side === 'buy' ? 'ph--arrow-up-right' : 'ph--arrow-down-right'} className="h-3 w-3" />
                        {t.side === 'buy' ? 'Buy' : 'Sell'}
                      </span>
                    </td>
                    <td className={cn(td, 'text-right text-neutral-200')} title={`${t.sol.toFixed(9)} SOL`}>
                      {fmtUsd(t.sol * solUsd)}
                    </td>
                    <td className={cn(td, 'text-right text-neutral-400')}>{fmtCompact(t.tokens)}</td>
                    <td className={cn(td, 'text-right text-neutral-500')} title="Executed trading fee">
                      1.25%
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-1">
                        <Addr a={t.wallet} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'holders' && (
            <table className="w-full min-w-[420px]">
              <thead className="sticky top-0 z-10 bg-neutral-950">
                <tr>
                  <th className={cn(th, 'text-left')}>#</th>
                  <th className={cn(th, 'text-left')}>Owner</th>
                  <th className={cn(th, 'text-right')}>Share of supply</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((h, i) => (
                  <tr key={h.owner} className="border-t border-neutral-850/70 hover:bg-neutral-900/60">
                    <td className={cn(td, 'text-neutral-500')}>{i + 1}</td>
                    <td className={td}>
                      <span className="inline-flex items-center gap-2">
                        <Addr a={h.owner} />
                        {h.isCreator && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">Creator</span>}
                      </span>
                    </td>
                    <td className={cn(td, 'text-right text-neutral-200')}>{(h.share * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'traders' && (
            <table className="w-full min-w-[420px]">
              <thead className="sticky top-0 z-10 bg-neutral-950">
                <tr>
                  <th className={cn(th, 'text-left')}>Trader</th>
                  <th className={cn(th, 'text-right')}>Buys</th>
                  <th className={cn(th, 'text-right')}>Sells</th>
                  <th className={cn(th, 'text-right')}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {traders.map((x) => (
                  <tr key={x.w} className="border-t border-neutral-850/70 hover:bg-neutral-900/60">
                    <td className={td}>
                      <Addr a={x.w} />
                    </td>
                    <td className={cn(td, 'text-right text-emerald')}>{x.buys}</td>
                    <td className={cn(td, 'text-right text-rose')}>{x.sells}</td>
                    <td className={cn(td, 'text-right text-neutral-200')}>{fmtUsd(x.vol * solUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-neutral-850 px-3 py-2 text-[10px] text-neutral-500">
        <span>Confirmed on-chain swaps (demo data)</span>
        <span className="font-mono">{rows.length} shown</span>
      </div>
    </section>
  )
}

function Callouts({ coin }: { coin: Coin }) {
  const { wallet, setWalletModal } = useUi()
  const [text, setText] = useState('')
  const [posts, setPosts] = useState<{ id: number; text: string; by: string; at: number }[]>([])
  return (
    <div className="order-4 border-t border-neutral-850 p-4">
      <section aria-label="Token callouts" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Community callouts</h3>
            <p className="mt-1 text-xs text-neutral-500">Ideas, updates and discussion from wallet owners. Not verified advice.</p>
          </div>
          <button type="button" className="text-xs text-primary" onClick={() => toast('Refreshed (demo)')}>
            Refresh
          </button>
        </div>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (wallet.status !== 'connected') return setWalletModal(true)
            if (!text.trim()) return
            // TODO(backend): signerat meddelande → /api/callouts
            setPosts((p) => [{ id: Date.now(), text: text.trim(), by: wallet.address!, at: Date.now() / 1000 }, ...p])
            setText('')
          }}
        >
          <label htmlFor={`callout-${coin.mint}`} className="sr-only">
            Your callout
          </label>
          <textarea
            id={`callout-${coin.mint}`}
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            placeholder="What should other holders know?"
            className="w-full resize-y rounded-xl border border-neutral-800 bg-background p-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">{text.length}/500 · Signed message, no transaction</span>
            <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-950 disabled:opacity-50">
              {wallet.status === 'connected' ? 'Post' : 'Connect to post'}
            </button>
          </div>
        </form>
        {posts.length === 0 && <p className="py-5 text-center text-sm text-neutral-500">Start the conversation.</p>}
        <div className="max-h-[32rem] space-y-4 overflow-y-auto">
          {posts.map((p) => (
            <article key={p.id} className="border-l-2 border-primary/50 pl-3">
              <p className="font-mono text-[10px] text-neutral-500">
                <span data-private>{shortAddr(p.by)}</span> · just now
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-200">{p.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function Token() {
  const { mint } = useParams()
  const { coins, stats, solUsd, status, now } = useMarket()
  const { starred, toggleStar, setWalletModal } = useUi()
  const coin = coins.find((c) => c.mint === mint)
  const st = coin ? stats[coin.mint] : undefined
  const trades = useMemo(() => (coin ? mockTrades(coin, st, now) : []), [coin, st]) // eslint-disable-line react-hooks/exhaustive-deps
  const holders = useMemo(() => (coin ? mockHolders(coin) : []), [coin])

  if (status === 'loading') return <main className="flex-1" />
  if (!coin) return <Navigate to="/" replace />

  const oldest = trades[trades.length - 1]
  const mcChange = oldest ? ((coin.marketCapSol - oldest.mcSol) / oldest.mcSol) * 100 : 0
  const vol24 = trades.filter((t) => now - t.ts < 86400).reduce((a, t) => a + t.sol, 0)
  const buys = trades.filter((t) => t.side === 'buy').length
  const sells = trades.length - buys
  const inCurve = coin.isMigrated ? THRESHOLD_SOL : coin.progress * THRESHOLD_SOL
  const isStar = starred.includes(coin.mint)
  const isOfficial = coin.mint === brand.officialMint
  const creatorShare = holders.find((h) => h.isCreator)?.share ?? 0
  const top10 = holders
    .filter((h) => !h.isCreator)
    .slice(0, 10)
    .reduce((a, h) => a + h.share, 0)
  const mood = coin.isMigrated
    ? 'Bonded. Trading on DAMM v2.'
    : coin.progress < 0.25
      ? 'Early days. Plenty of curve left.'
      : coin.progress < 0.75
        ? 'Climbing. Past the first quarter.'
        : 'Almost there. Bond is close.'

  const stats6 = (
    <>
      <Stat k="Market cap" title={`${coin.marketCapSol.toFixed(2)} SOL`}>
        <span className="text-[15px] font-semibold text-foreground">
          <span>{fmtUsd(coinUsd(coin, solUsd))}</span>
        </span>
        <span className={cn('ml-1.5 text-[11px]', mcChange < 0 ? 'text-rose' : 'text-emerald')}>
          {mcChange >= 0 ? '+' : '-'}
          {Math.abs(mcChange).toFixed(1)}%
        </span>
      </Stat>
      <Stat k="Price" title={`${coin.marketCapSol / 1e9} SOL`}>
        {fmtTinyUsd((coin.marketCapSol / 1e9) * solUsd)}
      </Stat>
      <Stat k="24h Vol">{fmtUsd(vol24 * solUsd)}</Stat>
      <Stat k="Txns">
        <span>{trades.length}</span>
        <span
          className="ml-2 inline-flex h-1 w-10 overflow-hidden rounded-full bg-rose/70 align-middle"
          title={`${buys} buys · ${sells} sells`}
          aria-label={`${buys} buys, ${sells} sells`}
        >
          <span className="bg-emerald" style={{ width: `${(buys / Math.max(1, trades.length)) * 100}%` }} />
        </span>
      </Stat>
      <Stat k="Holders">{holders.length}</Stat>
      <Stat k="Bonding">
        <span className="inline-flex items-center gap-2">
          <span className={coin.isMigrated ? 'text-cyan' : undefined}>{coin.isMigrated ? 'Bonded' : `${(coin.progress * 100).toFixed(2)}%`}</span>
          <span className="inline-block h-1.5 w-16 overflow-hidden rounded-full bg-neutral-850">
            <BondFill progress={coin.progress} />
          </span>
        </span>
      </Stat>
    </>
  )

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2 pb-28 md:overflow-hidden md:p-3">
      <div className="surface flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-neutral-950">
        <header className="border-b border-neutral-850">
          <div className="flex min-h-16 items-center gap-3 px-4 py-2.5">
            <TokenAvatar symbol={coin.symbol} image={coin.image} className="h-11 w-11 shrink-0 rounded-xl text-lg" />
            <div className="min-w-0 flex-1 lg:flex-none">
              <div className="flex items-center gap-2">
                <h2 className="min-w-0 truncate text-base font-semibold leading-tight">{coin.name}</h2>
                <span className="min-w-0 shrink-[3] truncate font-mono text-xs text-neutral-500">${coin.symbol}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500">
                <button
                  type="button"
                  aria-label="Copy mint address"
                  onClick={() => {
                    navigator.clipboard?.writeText(coin.mint).catch(() => {})
                    toast.success('Mint address copied')
                  }}
                  className="-ml-1 inline-flex h-6 items-center gap-1 rounded-md px-1 font-mono hover:bg-neutral-850 hover:text-neutral-200"
                >
                  {shortAddr(coin.mint)}
                  <I icon="ph--copy" className="h-3 w-3" />
                </button>
                <a
                  href={`${brand.explorer}/token/${coin.mint}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View on explorer"
                  title="View on explorer"
                  className="grid h-6 w-6 place-items-center rounded-md hover:bg-neutral-850 hover:text-neutral-200"
                >
                  <I icon="ph--cube" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <dl className="hidden flex-1 items-center justify-end gap-6 lg:flex">{stats6}</dl>
            <div className="flex shrink-0 items-center gap-0.5 lg:ml-2 lg:border-l lg:border-neutral-850 lg:pl-3">
              <button
                type="button"
                onClick={() => toast('Activity refreshed (demo)')}
                title="Live on-chain activity. Click to refresh."
                aria-label="Live on-chain activity. Refresh token activity"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-neutral-400 transition-colors hover:bg-neutral-850"
              >
                <span className="relative flex h-2 w-2" role="status">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                  <span className="sr-only">Live on-chain activity</span>
                </span>
                <span className="hidden sm:inline">Live</span>
              </button>
              <button
                type="button"
                aria-label="Share"
                title="Share"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {})
                  toast.success('Link copied')
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-100"
              >
                <I icon="ph--share-network" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={isStar ? 'Unstar token' : 'Star token'}
                title={isStar ? 'Unstar token' : 'Star token'}
                onClick={() => toggleStar(coin.mint)}
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-all hover:bg-neutral-850 active:scale-90',
                  isStar ? 'text-primary' : 'text-neutral-600 hover:text-neutral-300',
                )}
              >
                <I icon={isStar ? 'ph--star-fill' : 'ph--star'} className="h-4 w-4" />
              </button>
              <Link to="/" aria-label="Back to the board" className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-100">
                <I icon="ph--x" className="block h-5 w-5" />
              </Link>
            </div>
          </div>
          <dl className="no-scrollbar flex items-center gap-6 overflow-x-auto border-t border-neutral-850 px-4 py-2 lg:hidden">{stats6}</dl>
        </header>

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:border-r lg:border-neutral-850">
            <TokenChart symbol={coin.symbol} trades={trades} solUsd={solUsd} />
            <div className="order-1 border-b border-neutral-850 lg:hidden">
              <TradePanel coin={coin} />
            </div>
            <Activity coin={coin} trades={trades} />
            <Callouts coin={coin} />
          </div>
          <aside className="contents lg:flex lg:min-w-0 lg:flex-col lg:divide-y lg:divide-neutral-850">
            <div className="hidden lg:block">
              <TradePanel coin={coin} />
            </div>
            <section className="order-2 bg-neutral-950 px-4 py-4">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-925">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <I icon="ph--chats-circle" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">${coin.symbol} chat</h2>
                      <p className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <I icon="ph--lock-simple" className="h-3 w-3" />
                        Wallet access · Encrypted storage
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-6 text-center">
                  <p className="mb-3 text-xs text-neutral-400">Join with a wallet signature to read and post.</p>
                  {/* TODO(backend): wallet-gated chat */}
                  <button type="button" onClick={() => setWalletModal(true)} className={cn(btn.primary, 'h-8 px-3 text-xs')}>
                    Connect wallet
                  </button>
                </div>
              </div>
            </section>
            <div className="order-5 min-w-0 divide-y divide-neutral-850">
              <section aria-label="Bonding progress" className="px-4 pb-4">
                <div className="flex h-10 items-center justify-between gap-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Bond meter</h3>
                  <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{(coin.progress * 100).toFixed(2)}%</span>
                </div>
                <div className="relative pr-6">
                  <div role="progressbar" aria-label="Bonding progress" className="relative h-2.5 overflow-hidden rounded-full bg-neutral-850">
                    <BondFill progress={coin.progress} />
                    {[25, 50, 75].map((l) => (
                      <span key={l} className="absolute inset-y-0 w-px bg-background/70" style={{ left: `${l}%` }} />
                    ))}
                  </div>
                  <BrandMark
                    className={cn(
                      'absolute -right-1 top-1/2 h-6 w-5 -translate-y-1/2 transition-[filter,opacity]',
                      coin.isMigrated ? 'opacity-100' : 'opacity-50 grayscale-[0.6]',
                    )}
                  />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-neutral-900/60 px-2.5 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">In curve</p>
                    <p className="font-mono text-[13px] font-semibold tabular-nums" title={`${inCurve.toFixed(2)} SOL in the curve`}>
                      {fmtUsd(inCurve * solUsd)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-900/60 px-2.5 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">To bond</p>
                    <p className="font-mono text-[13px] font-semibold tabular-nums" title={`${THRESHOLD_SOL.toFixed(2)} SOL graduation target`}>
                      {coin.isMigrated ? 'Done' : `${(THRESHOLD_SOL - inCurve).toFixed(2)} SOL`}
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                  <span className="font-term">&gt;</span>
                  {mood}
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                  Mainnet token. Funded rewards appear in the rewards panel; completed buybacks appear in the burn feed.{' '}
                  <Link to="/rules" className="text-primary hover:underline">
                    Launch rules
                  </Link>
                </p>
              </section>
              <section aria-label="About this token" className="px-4 pb-4">
                <div className="flex h-10 items-center justify-between gap-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">About ${coin.symbol}</h3>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">{isOfficial ? 'Official' : 'Community'}</span>
                </div>
                <p className="line-clamp-4 whitespace-pre-wrap break-words text-xs leading-relaxed text-neutral-400">
                  {isOfficial ? brand.description : 'The creator has not added a description.'}
                </p>
                <dl className="mt-3 divide-y divide-neutral-850 border-t border-neutral-850 text-[11px]">
                  <div className="flex h-8 items-center justify-between gap-2">
                    <dt className="text-neutral-500">Created by</dt>
                    <dd className="min-w-0 truncate">
                      <Addr a={coin.creator} />
                    </dd>
                  </div>
                  <div className="flex h-8 items-center justify-between gap-2">
                    <dt className="text-neutral-500">Current supply</dt>
                    <dd className="min-w-0 truncate">
                      <span className="font-mono text-neutral-300">1.00B</span>
                    </dd>
                  </div>
                  <div className="flex h-8 items-center justify-between gap-2">
                    <dt className="text-neutral-500">Launched</dt>
                    <dd className="min-w-0 truncate">
                      <span className="font-mono text-neutral-300">{ago(coin.launchedAt, now)} ago</span>
                    </dd>
                  </div>
                </dl>
              </section>
              <section aria-label="Ownership" className="px-4 pb-4">
                <div className="flex h-10 items-center justify-between gap-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Ownership</h3>
                  <span
                    className="cursor-help text-[10px] text-neutral-500"
                    title="Largest token accounts are grouped by owner. Balances outside this list may change these percentages. Shares use total current supply."
                  >
                    Partial coverage <I icon="ph--info" className="h-3 w-3 align-[-2px]" />
                  </span>
                </div>
                <dl className="space-y-3">
                  {[
                    ['Creator in listed accounts', creatorShare],
                    ['Top 10 listed owners', top10],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <dt className="text-neutral-400">{k}</dt>
                        <dd className="font-mono tabular-nums text-neutral-100">{((v as number) * 100).toFixed(2)}%</dd>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-850">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(v as number) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </dl>
              </section>
              <section aria-label="Token rewards" className="px-4 pb-4">
                <p className="flex h-10 items-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {isOfficial ? 'Holder rewards' : 'Creator rewards'}
                </p>
                <p className="mt-2 text-xs text-neutral-500">Connect your wallet to view funded {isOfficial ? 'wXMR' : 'SOL'} rewards.</p>
                <button type="button" onClick={() => setWalletModal(true)} className={cn(btn.outline, 'mt-3 h-9 w-full px-4 text-sm')}>
                  Connect wallet
                </button>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
