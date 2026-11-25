import { I } from '../components/primitives'
import { cn } from '../lib/format'

type Item = { t: string; d: string; tag?: string }
const SECTIONS: { id: string; title: string; icon: string; badge: string; items: Item[] }[] = [
  {
    id: 'shipped',
    title: 'Shipped',
    icon: 'ph--check-bold',
    badge: 'border-neutral-700 text-foreground',
    items: [
      { t: 'Confidential OTC', d: 'Trade SOL against USDC, or pair FCLS or another eligible launchpad token with SOL or USDC. Share a fixed-price offer through an expiring link, then follow funding, settlement with Helius Privacy Rings, and withdrawal.' },
      { t: 'Wallet access and screen privacy', d: 'Connect a Solana wallet and sign actions without creating an account. Screen privacy mode blurs wallet addresses and profiles in the interface.' },
      { t: 'Token creation and metadata', d: 'Set a name, ticker, description, artwork up to 5 MB and social links. Preview the token and bundle an optional first buy of up to 2% of supply.' },
      { t: 'Private launch previews', d: 'Save a draft and share it before launch with an expiring invite. You can restrict an invite to one wallet or revoke it early.' },
      { t: 'Regular Dev rewards', d: 'Regular Dev pairs with SOL and routes 0.60% of the trade to the creator under the standard fee schedule. Creators can request their full available balance and track reserved and paid rewards separately.' },
      { t: 'Cashback and wXMR holder rewards', d: 'Regular Cashback pays eligible holders in SOL. FCLS mode converts the holder share to wXMR on Solana. Both modes use finalized hourly balance snapshots to determine rewards.' },
      { t: 'One-slot fee guard and bonding', d: 'Trades in the creation slot pay 99%, with the creator’s bundled first buy paying 1.25%. The fee is 1.25% from the next slot. At 80 SOL in reserves, the pool is eligible to migrate to Meteora DAMM v2, where trades pay 1.25%.' },
      { t: 'Trading and transaction receipts', d: 'Buy and sell on the bonding curve or the migrated pool. The transaction keeps the minimum output shown before signing. Saved receipts let you check pending token creation, swaps and migrations after a refresh.' },
      { t: 'Token discovery and market data', d: 'Browse new, bonding and bonded tokens. Search by name, ticker or mint from the mobile bottom bar, and star tokens for your watchlist. Token pages show price charts, recent trades, holder balances and ownership concentration.' },
      { t: 'Official FCLS mint', d: 'The board pins the verified Faceless mint so you can find the official token by its address.' },
      { t: 'Profiles, token chat and sharing', d: 'Set a wallet-linked profile, post signed callouts and join wallet-gated token chat with encrypted message storage. Share token links with preview cards.' },
      { t: 'Buyback and burn records', d: 'Browse finalized buybacks for tokens with burn-enabled fee policies, including the SOL spent, tokens burned and on-chain receipt.' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In progress',
    icon: 'ph--git-commit-bold',
    badge: 'border-primary/50 text-primary',
    items: [
      { t: 'Health monitoring and recovery', d: 'The payout worker gives user claims priority ahead of routine treasury transfers and logs alerts for delayed claims, signer errors and low SOL reserves. Service alert delivery and backup recovery are in progress.' },
    ],
  },
  {
    id: 'incoming',
    title: 'Incoming',
    icon: 'ph--circle-dashed-bold',
    badge: 'border-neutral-800 text-neutral-400',
    items: [
      { t: 'Customizable launch settings', tag: 'Idea', d: 'Offer presets and settings for token supply, curve shape, bonding target and fee split within supported ranges. Show how the choices change pricing and liquidity before signing.' },
      { t: 'More launch pool pairing options', tag: 'Idea', d: 'Add USDC and other liquid quote assets alongside SOL, with bonding targets and trading quotes shown in the selected asset.' },
      { t: 'Native Monero cash-out', tag: 'Planned', d: 'Redeem wXMR rewards for native XMR through the bridge, with redemption fees and minimums shown before confirming.' },
      { t: 'Creator and holder dashboards', tag: 'Idea', d: 'See token performance and reward balances across multiple tokens, with claim history and exportable receipts.' },
      { t: 'Transparent token vesting', tag: 'Idea', d: 'Support on-chain vesting for creator and team allocations. Show locked balances and unlock dates on the token page.' },
      { t: 'Watchlist alerts', tag: 'Idea', d: 'Let users opt in to price, bonding and reward alerts for tokens they follow.' },
    ],
  },
]

const PILL = {
  shipped: 'border-neutral-700 text-foreground',
  'in-progress': 'border-primary/50 text-primary',
  incoming: 'border-neutral-800 text-neutral-400',
} as Record<string, string>

export default function Roadmap() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="pb-8 pt-4 md:pb-10 md:pt-8">
          <h1 className="font-display text-4xl uppercase leading-none md:text-6xl">Roadmap</h1>
          <p className="mt-4 text-sm text-neutral-400">
            Development began the week of <time>16 November 2026</time>.
          </p>
          <nav aria-label="Roadmap sections" className="mt-5 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn('rounded-full border px-3 py-1.5 font-mono text-xs transition-colors hover:border-primary hover:text-primary', PILL[s.id])}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </header>
        <div className="space-y-5">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="surface scroll-mt-4 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <span className={cn('grid h-8 w-8 place-items-center rounded-lg border', s.badge)}>
                  <I icon={s.icon} className="h-4 w-4" />
                </span>
                <h2 id={`${s.id}-heading`} className="font-display text-sm uppercase tracking-wide">
                  {s.title}
                </h2>
              </div>
              <ol className="ml-[15px] border-l border-neutral-800 pt-3">
                {s.items.map((it) => (
                  <li key={it.t} className="relative ml-5 border-b border-neutral-850 pb-4 pt-3 last:border-0 last:pb-0 sm:ml-7">
                    <span className="absolute -left-5 top-[22px] w-3 border-t border-neutral-800 sm:-left-7 sm:w-5" />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-sm font-semibold text-foreground sm:text-base">{it.t}</h3>
                      {it.tag && <span className="font-mono text-xs text-neutral-400">{it.tag}</span>}
                    </div>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-400">{it.d}</p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
