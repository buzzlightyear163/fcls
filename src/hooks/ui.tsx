import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { fakeAddress, seeded } from '../lib/random'

/** localStorage-state som tål att storage saknas eller kastar */
export function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* ignore */
    }
  }, [key, v])
  return [v, setV] as const
}

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

type UiState = {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  privacy: boolean
  togglePrivacy: () => void
  starred: string[]
  toggleStar: (mint: string) => void
  bannerCollapsed: boolean
  setBannerCollapsed: (v: boolean) => void
  density: 'compact' | 'comfortable'
  setDensity: (v: 'compact' | 'comfortable') => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  // Demo-plånbok
  walletModal: boolean
  setWalletModal: (v: boolean) => void
  wallet: { status: WalletStatus; address?: string; name?: string }
  connect: (name: string) => void
  disconnect: () => void
}

const Ctx = createContext<UiState | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useStored('fcls.sidebar', false)
  const [privacy, setPrivacy] = useStored('fcls.privacy', false)
  const [starred, setStarred] = useStored<string[]>('fcls.starred', [])
  const [bannerCollapsed, setBannerCollapsed] = useStored('fcls.banner', false)
  const [density, setDensity] = useStored<'compact' | 'comfortable'>('fcls.density', 'comfortable')
  const [searchOpen, setSearchOpen] = useState(false)
  const [walletModal, setWalletModal] = useState(false)
  const [wallet, setWallet] = useStored<UiState['wallet']>('fcls.demo-wallet', { status: 'disconnected' })

  useEffect(() => {
    document.documentElement.classList.toggle('privacy-on', privacy)
  }, [privacy])

  const toggleStar = useCallback(
    (mint: string) => setStarred((s) => (s.includes(mint) ? s.filter((x) => x !== mint) : [...s, mint])),
    [setStarred],
  )

  // TODO(backend): koppla riktig Solana wallet adapter (t.ex. @jup-ag/wallet-adapter som referensen använder)
  const connect = useCallback(
    (name: string) => {
      setWallet({ status: 'connecting', name })
      setTimeout(() => {
        const addr = fakeAddress(seeded(name + Date.now()))
        setWallet({ status: 'connected', name, address: addr })
        setWalletModal(false)
      }, 900)
    },
    [setWallet],
  )
  const disconnect = useCallback(() => setWallet({ status: 'disconnected' }), [setWallet])

  // Ctrl/Cmd + K öppnar sökningen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Ctx.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        privacy,
        togglePrivacy: () => setPrivacy((p) => !p),
        starred,
        toggleStar,
        bannerCollapsed,
        setBannerCollapsed,
        density,
        setDensity,
        searchOpen,
        setSearchOpen,
        walletModal,
        setWalletModal,
        wallet,
        connect,
        disconnect,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useUi() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useUi utanför UiProvider')
  return v
}
