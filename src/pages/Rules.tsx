import { Link } from 'react-router-dom'
import { FeeSplit, I } from '../components/primitives'
import { Scramble } from '../components/Scramble'

const MODES = [
  {
    name: 'FCLS',
    lead: 'Holders earn wXMR from collected trade fees.',
    to: 'holders',
    extra: ', paid in wXMR',
    first: 'Holders',
    note: ' · pro rata, in wXMR',
  },
  { name: 'Regular · Dev', lead: 'The creator earns a share of collected trade fees.', to: 'the creator', extra: '', first: 'Creator', note: '' },
  {
    name: 'Regular · Cashback',
    lead: 'Holders earn a share of collected trade fees in the paired asset.',
    to: 'holders',
    extra: '',
    first: 'Holders',
    note: ' · pro rata, in SOL',
  },
]

const RULES = [
  ['One-slot launch guard', "The slot a coin is created in charges 99% on buys and sells to discourage sniping. From the next slot the fee is 1.25%. The creator's first buy, bundled with creation, pays 1.25%. Dynamic fees are off."],
  ['1.25% flat', 'The trading fee is 1.25% on the bonding curve and stays 1.25% on the Meteora DAMM v2 pool after bonding. It never steps down and never steps up.'],
  ['Bonding', 'At the configured reserve target the curve migrates to Meteora DAMM v2. Migration needs confirmed on-chain transactions; reaching the target alone does not complete it. Launch liquidity stays permanently locked.'],
  ['Payouts', 'Fees are claimed by the house wallet and paid out in batches as they accrue. Creators request their share by signing a message. Holder payouts are pro rata to balances; pools, burn and house wallets are excluded. Extra liquidity providers keep their own fees.'],
  ['No accounts, no KYC', 'You never sign up, verify an identity or share an email. A wallet signature is the only login, and we never ask for a recovery phrase.'],
]

export default function Rules() {
  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="relative pb-10 pt-4 md:pb-14 md:pt-8">
          <p className="eyebrow">How fees work</p>
          <h1 className="mt-4 max-w-3xl font-display text-[32px] uppercase leading-[1.05] md:text-[54px]">
            <Scramble text="1.25% flat." />
            <br />
            <span className="text-neutral-500">Before and after bonding.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-400">
            All launch modes have the same standard fee. Meteora keeps 0.25%, the house keeps 0.40%, and the mode you launch in decides who gets the other
            0.60%.
          </p>
        </header>
        <section className="border-t border-neutral-850 pt-8">
          <h2 id="modes" className="eyebrow">
            Launch modes
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {MODES.map((m) => (
              <article key={m.name} className="surface flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[15px] uppercase">{m.name}</h3>
                  <span className="rounded-md border border-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-400">SOL · hSOL</span>
                </div>
                <p className="mt-1.5 text-[13px] text-neutral-400">{m.lead}</p>
                <p className="mt-6 font-pixel text-[32px] leading-none">0.60%</p>
                <p className="mt-1.5 text-[13px] text-neutral-500">
                  of every trade to {m.to}
                  {m.extra}
                </p>
                <div className="mt-6">
                  <FeeSplit small first={m.first} note={m.note ? <span className="text-neutral-600">{m.note}</span> : undefined} />
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-[12px] leading-relaxed text-neutral-500">
            FCLS pays the holder share in wXMR, a Solana token issued by a bridge that holds Monero. The issuer controls minting and handles redemptions.
            In-app redemption is planned. Trades on Solana are public in every mode.
          </p>
        </section>
        <section className="mt-14 border-t border-neutral-850 pt-8">
          <h2 id="rules" className="eyebrow">
            The rules
          </h2>
          <dl className="mt-2 grid md:grid-cols-2 md:gap-x-12">
            {RULES.map(([t, d]) => (
              <div key={t} className="border-b border-neutral-850 py-6">
                <dt className="font-display text-[13px] uppercase">{t}</dt>
                <dd className="mt-2 text-[14px] leading-relaxed text-neutral-400">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-neutral-850 p-6 sm:flex-row sm:items-center md:p-8">
          <div>
            <p className="font-display text-[18px] uppercase">Ready when you are.</p>
            <p className="mt-1 text-[14px] text-neutral-500">Connect a wallet. Nothing else.</p>
          </div>
          <Link to="/launch" className="btn-holo inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 text-sm">
            Launch a coin
            <I icon="ph--arrow-right" className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-8 max-w-3xl text-[12px] leading-relaxed text-neutral-500">
          Coins launched before these modes keep the fee policy they launched with; check each coin’s live quote. Network fees and account rent are separate
          and shown before signing. Bonding is a goal, not a promise.
        </p>
      </div>
    </main>
  )
}
