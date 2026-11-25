import { useEffect } from 'react'
import { useUi } from '../hooks/ui'
import { cn, shortAddr } from '../lib/format'
import { BrandMark, I, Wordmark } from './primitives'

/** Demo-plånböcker. TODO(backend): ersätt med riktig wallet adapter. */
const WALLETS = [
  { name: 'Phantom', color: '#ab9ff2' },
  { name: 'Solflare', color: '#fc7227' },
  { name: 'Backpack', color: '#e33e3f' },
  { name: 'Demo wallet', color: '#9fd8ff' },
]

export function WalletModal() {
  const { walletModal, setWalletModal, connect, wallet } = useUi()

  useEffect(() => {
    if (!walletModal) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setWalletModal(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [walletModal, setWalletModal])

  if (!walletModal) return null
  const connecting = wallet.status === 'connecting'
  return (
    <div className="wallet-dialog animate-in fade-in-0" onClick={() => setWalletModal(false)}>
      <div className="wallet-card" role="dialog" aria-labelledby="wallet-title" onClick={(e) => e.stopPropagation()}>
        <div className="relative shrink-0 px-6 pb-5 pt-[88px] max-[380px]:px-5">
          <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2.5" aria-hidden="true">
            <BrandMark className="h-9 w-8 sm:h-11 sm:w-9" />
            <Wordmark className="text-[16px] sm:text-[19px]" />
          </div>
          <button
            type="button"
            aria-label="Close wallet connection"
            onClick={() => setWalletModal(false)}
            className="absolute right-6 top-6 grid h-9 w-9 place-items-center border border-neutral-750 bg-neutral-900 text-neutral-300 transition-colors hover:border-primary/55 hover:bg-primary/10"
          >
            <I icon="ph--x" className="h-4 w-4" />
          </button>
          <div>
            <div id="wallet-title" className="font-display text-2xl font-bold leading-tight tracking-[-0.035em]">
              Connect wallet
            </div>
            <div className="mt-2 text-[13px] leading-normal text-neutral-400">You need a Solana wallet to launch and trade.</div>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto border-t border-neutral-800 px-6 pb-6 pt-5 max-[380px]:px-5">
          <span className="text-[11px] uppercase tracking-[0.06em] text-neutral-400">Popular</span>
          <ul className="mt-3 grid gap-2">
            {WALLETS.map((w) => (
              <li key={w.name}>
                <button type="button" className="wallet-btn" disabled={connecting} onClick={() => connect(w.name)}>
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center font-term text-sm font-bold text-black"
                    style={{ background: w.color }}
                  >
                    {w.name[0]}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{w.name}</span>
                  <span className="text-[13px] text-neutral-400">
                    {connecting && wallet.name === w.name ? (
                      <I icon="ph--circle-notch-bold" className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      'Demo'
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="wallet-footer">
          <I icon="ph--shield-check" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Your keys stay in your wallet. No KYC, no account.
            <span className="block text-neutral-400">We never ask for your recovery phrase.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Header-knappen: Connect / adress */
export function ConnectButton({ className }: { className?: string }) {
  const { wallet, setWalletModal, disconnect } = useUi()
  if (wallet.status === 'connected' && wallet.address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        title="Disconnect (demo)"
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 font-mono text-[13px] text-neutral-200 transition-colors hover:border-primary/50',
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
        <span data-private>{shortAddr(wallet.address)}</span>
        <I icon="ph--sign-out" className="h-4 w-4 text-neutral-500" />
      </button>
    )
  }
  return (
    <button type="button" onClick={() => setWalletModal(true)} className={cn('btn-holo flex h-9 items-center gap-2 rounded-lg px-4 text-[13px]', className)}>
      <I icon="ph--wallet" className="h-4 w-4" />
      Connect
    </button>
  )
}
