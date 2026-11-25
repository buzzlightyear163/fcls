import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMarket } from '../hooks/market'
import { useUi } from '../hooks/ui'
import { cn, fmtCompact, fmtUsd } from '../lib/format'
import { btn, FeeSplit, I, TokenAvatar } from '../components/primitives'
import { Scramble } from '../components/Scramble'
import { toast } from 'sonner'

const input =
  'w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-foreground placeholder:text-neutral-600 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30'

const MODES = [
  { id: 'fcls', name: 'FCLS', icon: 'ph--detective-fill', who: 'Holders', verb: 'earn', paid: 'wXMR', first: 'Holders' },
  { id: 'dev', name: 'Regular · Dev', icon: 'ph--user-circle-fill', who: 'Creator', verb: 'earns', paid: 'SOL', first: 'Creator' },
  { id: 'cashback', name: 'Regular · Cashback', icon: 'ph--arrows-clockwise-bold', who: 'Holders', verb: 'earn', paid: 'SOL', first: 'Holders' },
] as const

function Step({ n, title, optional, desc, children }: { n: number; title: string; optional?: boolean; desc?: string; children: ReactNode }) {
  return (
    <section className="surface p-5 md:p-6" aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-700 bg-neutral-950 font-term text-xs font-bold text-acid">
          {n}
        </span>
        <div>
          <h2 id={`step-${n}`} className="font-display text-[15px] font-bold leading-8 tracking-tight">
            {title} {optional && <span className="text-xs font-normal text-neutral-500">(optional)</span>}
          </h2>
          {desc && <p className="text-sm text-neutral-400">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function LinkField({ id, label, icon, placeholder, max = 200 }: { id: string; label: string; icon: string; placeholder: string; max?: number }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-300">
        {label}
      </label>
      <div className="relative">
        <I icon={icon} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input id={id} maxLength={max} placeholder={placeholder} className={cn(input, 'pl-9')} />
      </div>
    </div>
  )
}

export default function Launch() {
  const { solUsd } = useMarket()
  const { wallet, setWalletModal } = useUi()
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState<string>()
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('dev')
  const [pair, setPair] = useState<'sol' | 'hsol'>('sol')
  const [devBuy, setDevBuy] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const m = MODES.find((x) => x.id === mode)!

  // Grov kurvmodell för förhandsvisningen (TODO(backend): riktig DBC-quote)
  const tokens = devBuy * 1e7
  const pay = devBuy * 0.27
  const fee = pay * 0.0125
  const total = pay + fee

  const onFile = (f?: File) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return toast.error('Image is larger than 5 MB.')
    const r = new FileReader()
    r.onload = () => setImg(String(r.result))
    r.readAsDataURL(f)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (wallet.status !== 'connected') return setWalletModal(true)
    if (!name || !ticker) return toast.error('Add a name and a ticker first.')
    // TODO(backend): bygg och signera DBC create-transaktion
    toast.success(`Demo: $${ticker} would be launched now.`)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="relative mb-8 pt-2 md:mb-10 md:pt-6">
          <p className="eyebrow">Launch</p>
          <h1 className="mt-4 font-display text-[30px] uppercase leading-[1.05] md:text-[46px]">
            <Scramble text="No face." />
            <br />
            <Scramble text="Your launch." className="text-holo" delay={120} />
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-400">
            Create a coin on Solana Mainnet. Network fees use SOL. 1.25% flat after the 99% launch slot, before and after bonding.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <form className="flex flex-col gap-5" onSubmit={submit}>
            <Step n={1} title="Your coin">
              <div className="grid gap-5 md:grid-cols-[1fr_180px]">
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-300">
                      Name
                    </label>
                    <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={32} placeholder="e.g. Faceless Frog" className={input} />
                  </div>
                  <div>
                    <label htmlFor="ticker" className="mb-1.5 block text-sm font-medium text-neutral-300">
                      Ticker
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-neutral-500">$</span>
                      <input
                        id="ticker"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        maxLength={10}
                        placeholder="FACE"
                        className={cn(input, 'pl-7 font-mono uppercase')}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-neutral-300">
                      Description <span className="text-xs text-neutral-500">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      maxLength={500}
                      placeholder="The story behind your coin…"
                      className={cn(input, 'min-h-24 resize-y')}
                    />
                    <p className="mt-1.5 text-xs text-neutral-500">{desc.length}/500 · Tell traders what your coin is about.</p>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-neutral-300">Image</p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      onFile(e.dataTransfer.files[0])
                    }}
                    className="group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-950 text-center transition-colors hover:border-primary/50"
                  >
                    {img ? (
                      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <>
                        <I icon="ph--image-square-bold" className="h-8 w-8 text-neutral-500" />
                        <span className="mt-2 px-3 text-xs text-neutral-400">Drop or click</span>
                        <span className="text-2xs text-neutral-600">PNG, JPG, GIF, WebP · 5 MB</span>
                      </>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  <p className="mt-2 text-[11px] text-neutral-500">GIFs use the first frame.</p>
                </div>
              </div>
            </Step>

            <Step n={2} title="Links" optional desc="Written into your token metadata, so wallets, explorers and DEX screeners show them too.">
              <div className="grid gap-4 sm:grid-cols-2">
                <LinkField id="link-website" label="Website" icon="ph--globe-simple-bold" placeholder="facelessfrog.xyz" />
                <LinkField id="link-twitter" label="X" icon="ph--x-logo-bold" placeholder="@facelessfrog or https://x.com/…" max={2048} />
                <LinkField id="link-telegram" label="Telegram" icon="ph--telegram-logo-bold" placeholder="t.me/facelessfrog" />
                <LinkField id="link-discord" label="Discord" icon="ph--discord-logo-bold" placeholder="discord.gg/facelessfrog" />
              </div>
            </Step>

            <Step n={3} title="Mode" desc="1.25% flat, before and after bonding. The mode decides who gets the 0.60%.">
              <div className="space-y-4">
                <div role="radiogroup" aria-label="Reward mode" className="grid gap-2 sm:grid-cols-3">
                  {MODES.map((x) => {
                    const on = x.id === mode
                    return (
                      <button
                        key={x.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setMode(x.id)}
                        className={cn(
                          'group relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-[border-color,background-color] duration-150',
                          on ? 'border-foreground bg-neutral-900' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-600',
                        )}
                      >
                        <span className="flex w-full items-center gap-2">
                          <I icon={x.icon} className={cn('h-4 w-4', on ? 'text-acid' : 'text-neutral-500 group-hover:text-neutral-300')} />
                          <span className="text-[13px] font-semibold tracking-tight">{x.name}</span>
                          <span
                            className={cn(
                              'ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                              on ? 'border-foreground' : 'border-neutral-700',
                            )}
                          >
                            {on && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
                          </span>
                        </span>
                        <span className="mt-3 flex w-full items-baseline justify-between border-t border-neutral-850 pt-2.5">
                          <span className="font-term text-[10px] uppercase tracking-wider text-neutral-500">
                            {x.who} {x.verb}
                          </span>
                          <span className="font-mono text-sm font-semibold tabular text-foreground">0.60%</span>
                        </span>
                        <span className="mt-1 flex w-full items-baseline justify-between">
                          <span className="font-term text-[10px] uppercase tracking-wider text-neutral-500">Paid in</span>
                          <span className="font-mono text-[12px] text-neutral-300">{x.paid}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <fieldset>
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Pair with</legend>
                  <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
                    {(['sol', 'hsol'] as const).map((p) => (
                      <label
                        key={p}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                          pair === p ? 'border-foreground bg-neutral-900' : 'border-neutral-800',
                        )}
                      >
                        <input type="radio" name="quote-asset" value={p} checked={pair === p} onChange={() => setPair(p)} className="accent-primary" />
                        {p === 'sol' ? 'SOL' : 'hSOL'}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-4">
                <FeeSplit first={m.first} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                Creator payouts follow collected fees. The creator requests them by signing a message; no transaction is needed. Bonding is not guaranteed.
              </p>
            </Step>

            <Step n={4} title="Dev buy" optional desc="Buy up to 2% of supply in the launch transaction, at the 1.25% fee. You pay for it.">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={devBuy}
                  onChange={(e) => setDevBuy(Number(e.target.value))}
                  aria-label="Dev buy, percent of supply"
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-850 accent-primary"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={devBuy}
                    onChange={(e) => setDevBuy(Math.max(0, Math.min(2, Number(e.target.value) || 0)))}
                    aria-label="Dev buy percent"
                    className={cn(input, 'pr-7 text-right font-mono')}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">%</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-neutral-950 p-3 text-center">
                {[
                  ['Tokens', devBuy ? fmtCompact(tokens) : '0'],
                  ['You pay', `${pay ? pay.toFixed(3) : 0} SOL`],
                  ['Fee', fee ? `${fee.toFixed(4)} SOL` : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-2xs uppercase tracking-wider text-neutral-500">{k}</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                The app limits this optional first-buy target to 2% of supply. This preview does not enforce a total-wallet ownership limit or creator-sale penalty.
              </p>
            </Step>

            <a href="#private-launch-preview" className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline lg:hidden">
              Save a private preview
            </a>
            <div className="holo-border flex flex-col gap-4 rounded-2xl bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
              <dl className="text-sm">
                <div className="flex gap-2">
                  <dt className="text-neutral-400">Pool creation fee</dt>
                  <dd className="font-mono">0 SOL</dd>
                </div>
                <div className="mt-1 flex gap-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="font-mono">
                    ≈ {total.toFixed(4)} SOL
                    <span className="ml-2 text-sm font-normal text-neutral-400">{fmtUsd(total * solUsd)}</span>
                  </dd>
                </div>
                <p className="text-xs text-neutral-500">Plus network fees and account rent.</p>
              </dl>
              <button type="submit" className={cn(btn.holo, 'h-11 px-6 text-sm')}>
                {wallet.status === 'connected' ? 'Launch coin' : 'Connect wallet to launch'}
              </button>
            </div>
          </form>

          <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
            <div className="surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Preview on the board</p>
              <div className="mt-3 flex gap-3 rounded-xl border border-neutral-850 bg-neutral-950 p-3">
                <TokenAvatar symbol={ticker || 'P'} image={img} className="h-16 w-16 rounded-xl text-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{name || 'Your coin'}</p>
                  <p className="truncate font-mono text-xs text-neutral-500">${ticker || 'TICKER'}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose/15 px-2 py-0.5 font-mono text-2xs font-bold text-rose">
                      <I icon="ph--crosshair-fill" className="h-3 w-3" />
                      Launch slot 99%
                    </span>
                    <span className="border border-neutral-700 px-2 py-0.5 font-term text-2xs font-semibold uppercase tracking-wide text-neutral-300">{m.name}</span>
                  </div>
                  <div role="progressbar" aria-label="Bonding progress" className="mt-2 h-1.5 w-full overflow-hidden bg-white/[0.06]">
                    <div className="bond-fill h-full transition-[width] duration-700" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
            <section id="private-launch-preview" aria-label="Private launch preview" className="surface scroll-mt-24 space-y-3 p-5">
              <div>
                <h2 className="font-term text-sm font-bold uppercase text-primary">Private launch preview</h2>
                <p className="mt-1 text-sm text-neutral-400">Save one encrypted draft per wallet. Share a read-only invite before you launch.</p>
              </div>
              <button
                type="button"
                onClick={() => (wallet.status === 'connected' ? toast('Demo: draft saved locally.') : setWalletModal(true))}
                className={cn(btn.outline, 'h-9 px-4 text-sm')}
              >
                {wallet.status === 'connected' ? 'Save draft' : 'Connect wallet'}
              </button>
            </section>
            <div className="surface p-5">
              <p className="eyebrow">Trading fees</p>
              <ol className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                {[
                  ['99%', 'Launch slot', 'bg-rose/10 text-rose'],
                  ['1.25%', 'On the curve', 'bg-neutral-900 text-foreground'],
                  ['1.25%', 'After bonding', 'bg-neutral-900 text-foreground'],
                ].map(([v, k, c]) => (
                  <li key={k} className={cn('rounded-lg px-1 py-2', c)}>
                    <span className="block font-mono text-sm font-bold">{v}</span>
                    <span className="block text-2xs opacity-80">{k}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <FeeSplit first={m.first} small />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                The 99% guard lasts one slot, not a seconds countdown. The creator’s bundled first buy pays 1.25%; later trades by that wallet follow the normal
                schedule.{' '}
                <Link to="/rules" className="text-primary hover:underline">
                  Full rules
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
