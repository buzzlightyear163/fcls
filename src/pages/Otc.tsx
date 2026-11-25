import type { ReactNode } from 'react'
import { useUi } from '../hooks/ui'
import { btn, I, Ping } from '../components/primitives'
import { Scramble } from '../components/Scramble'
import { cn } from '../lib/format'

const FLOW = [
  ['01', 'Create', 'ph--note-pencil', 'Set both amounts, an expiry and, if you like, the one wallet allowed to see it.'],
  ['02', 'Share', 'ph--link', 'Send the private link however you already talk to your counterparty.'],
  ['03', 'Agree', 'ph--handshake', 'They sign the exact terms with their wallet. Off-chain. No funds move.'],
  ['04', 'Fund', 'ph--wallet', 'Each side deposits its asset into its own deal wallet, plus a small SOL fee reserve.'],
  ['05', 'Settle', 'ph--arrows-left-right', 'Both wallets verify and sign one transaction. Both sides swap together or not at all.'],
  ['06', 'Withdraw', 'ph--arrow-line-down', 'Move what you received to your wallet. If the deadline passes first, recover your deposit.'],
] as const

const STEPS: [string, string, string, ReactNode][] = [
  ['01', 'Create', 'ph--note-pencil', <>Pick the asset you send and the asset you receive, then type the exact amount for each side. That pair of numbers is the price, so nothing can move against you between agreeing and settling. Choose an expiry of 15 minutes, 1 hour or 24 hours. Add an invited wallet to make the offer visible to that wallet only.</>],
  ['02', 'Share', 'ph--link', <>Creating an offer gives you a private link. Send it through any channel you trust and treat it like a password: whoever holds it can review the terms unless you invited one wallet. Creating or sharing an offer never moves funds, and you can revoke it from <b>My offers</b> until a deal is opened.</>],
  ['03', 'Agree', 'ph--handshake', <>Your counterparty opens the link, checks what they send and receive, and signs the exact terms with their wallet. That signature is stored off-chain as the agreement. It is a message, not a transaction, so it costs nothing and moves nothing. The offer then shows as agreed on your desk.</>],
  ['04', 'Fund', 'ph--wallet', <>Each side signs an unlock message that opens a private deal wallet for this trade, then deposits its asset into it. Your wallet also sets aside 0.006 SOL for network fees and account rent. The deposit is a normal, public Solana transaction, and your wallet shows the total before you approve. New deposits pause in the final minute before the deadline.</>],
  ['05', 'Settle', 'ph--arrows-left-right', <>Once both deposits are finalized, each side prepares an encrypted transfer through Helius Privacy Rings. Either party then builds a single settlement transaction. Your deal wallet checks both amounts and recipients before you sign, and both signatures are required to submit it, so the two sides of the trade land together or not at all.</>],
  ['06', 'Withdraw', 'ph--arrow-line-down', <>After settlement finalizes, withdraw what you received to your connected wallet and reclaim any SOL left from the fee reserve. If the deadline passes before the swap settles, the same step returns your original deposit instead. Your deals stay on <b>My deals</b> so you can come back to finish at any time.</>],
]

const FAQ = [
  ['Why trade OTC instead of on the curve?', 'Large orders move a bonding curve or pool against you, and everyone sees them land. An OTC trade happens at a price both sides fixed in advance, with one counterparty you chose, so there is no slippage and no price impact on the chart.'],
  ['Does creating an offer cost anything or move funds?', 'Creating an offer and signing the agreement are off-chain. The first on-chain transaction is a wallet funding the deal.'],
  ['Who can see my offer?', 'Anyone holding the link can review the terms. If you set an invited wallet, only that wallet can view and agree after signing in. Offers never appear on the board or in search.'],
  ['How long does an offer last?', 'You choose 15 minutes, 1 hour or 24 hours. When the deadline passes, the offer can no longer be agreed or funded. You can revoke an open offer at any time before a deal is opened.'],
  ['Which assets can I trade?', 'SOL and USDC against each other, or a launchpad token paired with SOL or USDC. The desk checks that a token is eligible for Privacy Rings before you can offer it.'],
  ['What if my counterparty never funds?', 'Nothing settles until both deposits are finalized and both wallets sign. If the deadline passes first, open the deal and withdraw your original deposit back to your wallet.'],
  ['What is the deal wallet?', 'A wallet opened from a message you sign with your own wallet, used only to hold your side of this deal. Signing the unlock message moves no funds. Sign it only on this site and never share the signature.'],
  ['Why does funding need an extra 0.006 SOL?', 'It covers network fees and account rent for the private transfer and settlement. You can return unused SOL after withdrawing. The first depositor for a launchpad token may also pay one-time rent for its shared Rings accounts.'],
]

type Vis = 'off' | 'public' | 'enc'
function Badge({ v }: { v: Vis }) {
  const map = {
    off: ['ph--link', 'Off-chain', 'border-neutral-700 text-neutral-300'],
    public: ['ph--eye', 'Public', 'border-rose/30 text-rose'],
    enc: ['ph--lock-simple', 'Encrypted', 'border-primary/40 bg-primary/10 text-primary'],
  }[v]
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 border px-1.5 py-0.5 font-term text-[10px] uppercase tracking-[0.1em]', map[2])}>
      <I icon={map[0]} className="h-3 w-3 shrink-0" />
      {map[1]}
    </span>
  )
}

export default function Otc() {
  const { setWalletModal, wallet } = useUi()
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-16 md:pt-8">
        <header className="relative pb-8 pt-2 md:pb-10 md:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow flex items-center gap-2">
              <Ping />
              Confidential OTC desk
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6">
              {/* Ersätter Helius-loggan i referensen */}
              <a
                href="https://www.helius.dev/privacy"
                target="_blank"
                rel="noreferrer"
                aria-label="Helius Privacy Rings (opens in a new tab)"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm py-1 text-[15px] font-bold tracking-tight text-neutral-200"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] text-black">H</span>
                helius
              </a>
              <dl className="flex items-stretch border border-neutral-800 font-term text-[10px] uppercase tracking-[0.12em]">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                  <dt className="sr-only">Network</dt>
                  <I icon="ph--globe-simple" className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  <dd className="text-neutral-300">Mainnet</dd>
                </div>
                <div className="flex items-center gap-1.5 border-l border-neutral-800 px-2.5 py-1.5">
                  <dt className="sr-only">Status</dt>
                  <dd className="text-primary">Settlement live</dd>
                </div>
              </dl>
            </div>
          </div>
          <h1
            aria-label="Your terms. Your counterparty."
            className="mt-5 font-display text-[24px] uppercase leading-[1.08] min-[420px]:text-[28px] sm:text-[40px] md:text-[54px]"
          >
            <Scramble text="Your terms." />
            <br />
            <Scramble text="Your counterparty." className="text-holo" delay={120} />
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-400">
            Trade size directly with one wallet at a price you both fixed in advance. No order book, no slippage, no price impact on the chart. Both sides
            settle in a single transaction.
          </p>
          <p className="mt-5 font-term text-[10px] uppercase tracking-[0.14em] text-neutral-600">
            price <span className="text-neutral-400">fixed</span> · order book <span className="text-neutral-400">none</span> · terms{' '}
            <span className="whitespace-nowrap text-acid">off-chain</span> · settlement <span className="text-acid">encrypted</span>
          </p>
        </header>

        <section className="mb-6">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="otc-flow" className="eyebrow">
              How a trade moves
            </h2>
            <a href="#otc-explainer" className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-primary">
              Full walkthrough ↓
            </a>
          </div>
          <ol className="grid grid-cols-2 gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3 xl:grid-cols-6">
            {FLOW.map(([n, t, icon, d], i) => (
              <li key={n} className={cn('relative min-w-0 px-4 pb-4 pt-3.5 transition-colors', i === 0 ? 'bg-primary/[0.06]' : 'bg-panel')}>
                {i === 0 && <span className="absolute inset-x-0 top-0 h-px bg-primary" />}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('font-pixel text-[22px] leading-none', i === 0 ? 'text-primary' : 'text-neutral-600')}>{n}</span>
                  <I icon={icon} className={cn('h-4 w-4 shrink-0', i === 0 ? 'text-primary' : 'text-neutral-500')} />
                </div>
                <h3 className="mt-3 font-display text-[13px] uppercase">
                  {t}
                  {i === 0 && <span className="sr-only">(you are here)</span>}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <div id="otc-desk" className="scroll-mt-6">
          <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.5fr)]">
            <div className="min-w-0 space-y-4">
              <section className="holo-border min-w-0 overflow-hidden bg-panel">
                <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] md:items-center">
                  <div className="space-y-6">
                    <div className="min-w-0">
                      <p className="eyebrow mb-1.5">{wallet.status === 'connected' ? 'Desk open' : 'Desk locked'}</p>
                      <h2 className="font-display text-lg uppercase leading-tight sm:text-xl">
                        {wallet.status === 'connected' ? 'Create an offer' : 'Open your desk'}
                      </h2>
                      <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-neutral-400">
                        {wallet.status === 'connected'
                          ? 'Demo mode: offers are not stored. TODO(backend): offer API and Privacy Rings settlement.'
                          : 'Connect a wallet to create offers, track agreements and pick up deals you’ve already started.'}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <button type="button" onClick={() => setWalletModal(true)} className={cn(btn.holo, 'h-11 px-6 text-sm')}>
                        <I icon="ph--wallet" className="h-4 w-4 shrink-0" />
                        {wallet.status === 'connected' ? 'Switch wallet' : 'Connect wallet'}
                      </button>
                      <p className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500">No account · no email · no KYC</p>
                    </div>
                  </div>
                  <div className="relative select-none" aria-hidden="true">
                    <div className="border border-neutral-800 bg-neutral-950">
                      <div className="flex items-center justify-between border-b border-neutral-850 px-4 py-2.5">
                        <span className="font-term text-[10px] uppercase tracking-[0.14em] text-neutral-500">Private offer</span>
                        <span className="flex items-center gap-1.5 font-term text-[10px] uppercase tracking-[0.14em] text-primary">
                          <I icon="ph--lock-simple" className="h-3 w-3 shrink-0" />
                          Sealed
                        </span>
                      </div>
                      <div className="space-y-4 px-4 py-4">
                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] text-neutral-500">You send</p>
                            <span className="mt-1.5 block h-6 w-24 bg-neutral-300/80" />
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-[11px] text-primary-200">
                              <I icon="ph--stack-simple" className="h-[1em] w-[1em] shrink-0" />
                            </span>
                            SOL
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <span className="h-px flex-1 bg-neutral-850" />
                          <I icon="ph--arrows-down-up" className="h-4 w-4 shrink-0" />
                          <span className="h-px flex-1 bg-neutral-850" />
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] text-neutral-500">You receive</p>
                            <span className="mt-1.5 block h-6 w-32 bg-neutral-300/80" />
                          </div>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-850 text-[11px] text-neutral-100">
                              <I icon="ph--currency-dollar" className="h-[1em] w-[1em] shrink-0" />
                            </span>
                            USDC
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-t border-neutral-850 font-term text-[10px] uppercase tracking-[0.12em]">
                        <span className="px-4 py-2.5 text-neutral-500">
                          Expires <span className="text-neutral-300">1h</span>
                        </span>
                        <span className="border-l border-neutral-850 px-4 py-2.5 text-neutral-500">
                          Viewer <span className="text-neutral-300">invited</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
              <aside aria-label="Privacy at a glance" className="surface min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-neutral-850 px-5 py-4">
                  <h2 className="flex items-center gap-2 font-display text-[13px] uppercase">
                    <I icon="ph--shield-check" className="h-4 w-4 shrink-0 text-primary" />
                    What stays private
                  </h2>
                  <a href="#otc-privacy" className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-primary">
                    Details ↓
                  </a>
                </div>
                <dl className="divide-y divide-neutral-850 px-5">
                  {(
                    [
                      ['Offer and agreement', 'off', 'Only people with the link can review the terms, or just one wallet if you invite it.'],
                      ['Funding and withdrawal', 'public', 'The assets, amounts and wallet addresses are visible on Solana.'],
                      ['Swap settlement', 'enc', 'Helius Privacy Rings encrypts the assets and amounts in the swap. Wallet addresses stay visible.'],
                    ] as const
                  ).map(([t, v, d]) => (
                    <div key={t} className="py-4">
                      <dt className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-foreground">
                        {t}
                        <Badge v={v} />
                      </dt>
                      <dd className="text-xs leading-relaxed text-neutral-400">{d}</dd>
                    </div>
                  ))}
                </dl>
                <p className="flex gap-2 border-t border-neutral-850 bg-neutral-950/60 px-5 py-3 text-xs leading-relaxed text-neutral-400">
                  <I icon="ph--info" className="mt-px h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  Matching public deposits and withdrawals can still reveal a trade.
                </p>
              </aside>
              <aside aria-label="Desk terms" className="surface min-w-0 px-5 py-4">
                <h2 className="font-display text-[13px] uppercase">At a glance</h2>
                <dl className="mt-2 divide-y divide-neutral-850">
                  {[
                    ['Pairs', 'SOL · USDC · launchpad tokens'],
                    ['Price', 'Fixed by both amounts'],
                    ['Expiry', '15 minutes · 1 hour · 24 hours'],
                    ['Creating', 'Free · no transaction'],
                    ['Fee reserve', '0.006 SOL, unused returned'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500">{k}</dt>
                      <dd className="text-right text-xs text-neutral-200">{v}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          </div>
        </div>

        <section id="otc-explainer" className="mt-16 scroll-mt-6 border-t border-neutral-850 pt-10 md:mt-20">
          <p className="eyebrow">Walkthrough</p>
          <h2 className="mt-3 max-w-3xl font-display text-[26px] uppercase leading-[1.08] md:text-[40px]">
            A private desk for <span className="whitespace-nowrap text-holo">one-to-one</span> trades.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
            Confidential OTC is for trades too large or too sensitive for the curve: a sale to a friend, a treasury rebalance, a fixed-price buy from a
            holder. You agree on terms in private and settle both sides together on Solana.
          </p>
          <div className="mt-8 grid gap-px border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
            {[
              ['ph--target', 'Fixed price', 'Both amounts are set before anyone signs. No slippage, no front-running, no candle on the chart.'],
              ['ph--user-focus', 'One counterparty', 'A private link, optionally locked to a single wallet. Nothing is posted to the board.'],
              ['ph--intersect-three', 'Settles together', 'One transaction swaps both sides, so neither party can take the other’s asset and walk.'],
            ].map(([icon, t, d]) => (
              <article key={t} className="bg-panel p-6">
                <I icon={icon} className="h-6 w-6 shrink-0 text-primary" />
                <h3 className="mt-4 font-display text-[15px] uppercase">{t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-400">{d}</p>
              </article>
            ))}
          </div>

          <section className="mt-14">
            <h3 id="otc-steps" className="eyebrow">
              Step by step
            </h3>
            <ol className="mt-2">
              {STEPS.map(([n, t, icon, d]) => (
                <li
                  key={n}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-4 border-b border-neutral-850 py-6 md:grid-cols-[4.5rem_12rem_minmax(0,1fr)] md:gap-x-8"
                >
                  <span className="font-pixel text-[28px] leading-none text-neutral-600 md:text-[34px]">{n}</span>
                  <h4 className="flex items-center gap-2 font-display text-[15px] uppercase md:pt-1.5">
                    <I icon={icon} className="h-4 w-4 shrink-0 text-primary" />
                    {t}
                  </h4>
                  <p className="col-start-2 mt-2 max-w-2xl text-[14px] leading-relaxed text-neutral-400 md:col-start-3 md:mt-0 md:pt-1">{d}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="otc-privacy" className="mt-14 scroll-mt-6">
            <h3 className="eyebrow">What stays private, and what doesn’t</h3>
            <div className="surface mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="border-b border-neutral-850 font-term text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Part of the trade</th>
                    <th className="px-5 py-3 font-medium">Visibility</th>
                    <th className="px-5 py-3 font-medium">Who can see what</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {(
                    [
                      ['Offer terms and agreement', 'off', 'Stored by the desk, never on Solana. Visible to link holders, or only to the invited wallet.'],
                      ['Deposits into deal wallets', 'public', 'Asset, amount and both wallet addresses appear on Solana like any transfer.'],
                      ['The swap itself', 'enc', 'Helius Privacy Rings hides the assets and amounts exchanged. Wallet addresses stay visible.'],
                      ['Withdrawals', 'public', 'Asset, amount and destination wallet appear on Solana.'],
                    ] as const
                  ).map(([t, v, d]) => (
                    <tr key={t} className={v === 'enc' ? 'bg-primary/[0.04]' : undefined}>
                      <th className="px-5 py-4 align-top font-medium text-foreground">{t}</th>
                      <td className="px-5 py-4 align-top">
                        <Badge v={v} />
                      </td>
                      <td className="px-5 py-4 align-top text-[13px] leading-relaxed text-neutral-400">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-neutral-500">
              Encryption covers the swap, not the edges. Someone watching both wallets can still match a public deposit to a public withdrawal of the other
              asset, so this is confidential settlement, not anonymity. No account, email or KYC is involved at any step.
            </p>
          </section>

          <section className="mt-14">
            <h3 id="otc-faq" className="eyebrow">
              Questions
            </h3>
            <div className="mt-2 grid items-start md:grid-cols-2 md:gap-x-12">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group border-b border-neutral-850">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 font-display text-[13px] uppercase leading-snug transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                    {q}
                    <I icon="ph--plus" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-45 group-open:text-primary" />
                  </summary>
                  <p className="-mt-1 pb-5 pr-8 text-[14px] leading-relaxed text-neutral-400">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 border border-neutral-850 p-6 sm:flex-row sm:items-center md:p-8">
            <div>
              <p className="font-display text-[18px] uppercase">Name your price.</p>
              <p className="mt-1 text-[14px] text-neutral-500">Connect a wallet, set the terms, send one link.</p>
            </div>
            <a href="#otc-desk" className="btn-holo inline-flex h-11 shrink-0 items-center gap-2 px-5 text-sm">
              Create an offer
              <I icon="ph--arrow-up" className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
