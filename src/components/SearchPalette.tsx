import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { coinUsd, useMarket } from '../hooks/market'
import { useUi } from '../hooks/ui'
import { cn, fmtUsd } from '../lib/format'
import { I, TokenAvatar } from './primitives'

type Item =
  | { kind: 'coin'; key: string; label: string; meta: string; symbol: string; image?: string; go: string }
  | { kind: 'page'; key: string; label: string; icon: string; go: string }
  | { kind: 'action'; key: string; label: string; icon: string; run: () => void }

const PAGES = [
  { label: 'Launch a coin', icon: 'ph--plus-bold', go: '/launch' },
  { label: 'Board', icon: 'ph--squares-four', go: '/' },
  { label: 'OTC', icon: 'ph--arrows-left-right', go: '/otc' },
  { label: 'Burns', icon: 'ph--fire', go: '/burns' },
  { label: 'Rules', icon: 'ph--book-open', go: '/rules' },
  { label: 'Roadmap', icon: 'ph--git-branch', go: '/roadmap' },
]

export function SearchPalette() {
  const { searchOpen, setSearchOpen, privacy, togglePrivacy } = useUi()
  const { coins, solUsd } = useMarket()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setQ('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [searchOpen])

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase()
    const byMc = [...coins].sort((a, b) => b.marketCapSol - a.marketCapSol)
    const coinItems: Item[] = byMc
      .filter((c) => !s || c.name.toLowerCase().includes(s) || c.symbol.toLowerCase().includes(s) || c.mint.toLowerCase().startsWith(s))
      .slice(0, s ? 12 : 5)
      .map((c) => ({
        kind: 'coin',
        key: c.mint,
        label: c.name,
        symbol: c.symbol,
        image: c.image,
        meta: `$${c.symbol} · ${fmtUsd(coinUsd(c, solUsd))}`,
        go: `/token/${c.mint}`,
      }))
    const pageItems: Item[] = PAGES.filter((p) => !s || p.label.toLowerCase().includes(s)).map((p) => ({ kind: 'page', key: p.go, ...p }))
    const actLabel = privacy ? 'Turn off privacy mode' : 'Turn on privacy mode (blur addresses)'
    const actions: Item[] = !s || actLabel.toLowerCase().includes(s) || 'privacy'.includes(s)
      ? [{ kind: 'action', key: 'privacy', label: actLabel, icon: 'ph--eye-slash', run: togglePrivacy }]
      : []
    return [
      { title: 'Coins', items: coinItems },
      { title: 'Go to', items: pageItems },
      { title: 'Actions', items: actions },
    ].filter((g) => g.items.length)
  }, [q, coins, solUsd, privacy, togglePrivacy])

  const flat = groups.flatMap((g) => g.items)

  const choose = (it: Item) => {
    setSearchOpen(false)
    if (it.kind === 'action') it.run()
    else nav(it.go)
  }

  if (!searchOpen) return null
  let idx = -1
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] animate-in fade-in-0"
        onClick={() => setSearchOpen(false)}
      />
      <div
        role="dialog"
        aria-label="Search"
        className="fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-24px)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-white/[0.09] bg-panel shadow-2xl outline-none animate-in fade-in-0 zoom-in-[0.98]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setSearchOpen(false)
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(flat.length - 1, a + 1))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(0, a - 1))
          }
          if (e.key === 'Enter' && flat[active]) choose(flat[active])
        }}
      >
        <div className="flex items-center gap-3 border-b border-neutral-850 px-4">
          <I icon="ph--magnifying-glass" className="h-5 w-5 text-neutral-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
            placeholder="Search coins, pages, actions…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-600"
          />
          <kbd className="rounded border border-neutral-800 px-1.5 font-mono text-[10px] text-neutral-500">Esc</kbd>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[56vh] overflow-y-auto p-2">
          {flat.length === 0 && <li className="px-3 py-8 text-center text-sm text-neutral-500">No results for “{q}”.</li>}
          {groups.map((g) =>
            g.items.map((it, j) => {
              idx++
              const i = idx
              const on = i === active
              return (
                <li key={it.key} role="presentation">
                  {j === 0 && <p className="eyebrow px-3 pb-1 pt-3 first:pt-1">{g.title}</p>}
                  <div
                    role="option"
                    aria-selected={on}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(it)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                      on ? 'bg-neutral-900 text-foreground' : 'text-neutral-300',
                    )}
                  >
                    {it.kind === 'coin' ? (
                      <TokenAvatar symbol={it.symbol} image={it.image} className="h-7 w-7 rounded-md text-xs" />
                    ) : (
                      <I icon={it.icon} className="h-4 w-4 text-neutral-500" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{it.label}</span>
                    {it.kind === 'coin' && <span className="font-mono text-xs text-neutral-500">{it.meta}</span>}
                    {on && <I icon="ph--arrow-elbow-down-left" className="h-4 w-4 text-neutral-500" />}
                  </div>
                </li>
              )
            }),
          )}
        </ul>
      </div>
    </>
  )
}
