import { Link } from 'react-router-dom'
import { btn, I } from '../components/primitives'
import { cn } from '../lib/format'

/** TODO(backend): hämta verifierade buyback/burn-kvitton. Referensen visar tom feed just nu. */
export default function Burns() {
  const cards = [
    ['ph--fire-fill', 'text-acid', 'Tokens with burns', '0'],
    ['ph--arrows-clockwise-bold', 'text-primary', 'Buybacks', '0'],
    ['ph--coins-fill', 'text-primary', 'SOL spent', '0'],
  ]
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="border-b border-neutral-850 pb-8">
          <p className="eyebrow">Verified burns · Mainnet</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Every buyback, <span className="text-holo">on the record</span>
          </h1>
          <p className="mt-4 max-w-2xl text-neutral-400">
            Snipe-tax buybacks purchase the launched token and burn the received tokens in the same transaction. Only completed, finalized receipts appear
            here.
          </p>
        </header>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {cards.map(([icon, color, k, v]) => (
            <div key={k} className="surface p-5">
              <I icon={icon} className={cn('h-6 w-6', color)} />
              <p className="mt-3 text-xs uppercase tracking-wider text-neutral-500">{k}</p>
              <p className="mt-1 font-mono text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <section aria-label="Burn feed" className="surface mt-6 overflow-hidden">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <I icon="ph--fire-bold" className="h-12 w-12 text-neutral-700" />
            <h2 className="mt-4 text-lg font-bold">No verified burns yet</h2>
            <p className="mt-1 max-w-md text-sm text-neutral-400">Pending jobs and estimated budgets never count as completed burns.</p>
            <Link to="/" className={cn(btn.primary, 'mt-6 h-9 px-4 text-sm')}>
              Explore launches
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
