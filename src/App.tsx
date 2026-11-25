import { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MarketProvider, useMarket } from './hooks/market'
import { UiProvider } from './hooks/ui'
import { AppShell } from './layouts/AppShell'
import { Splash } from './components/Splash'
import { SearchPalette } from './components/SearchPalette'
import { WalletModal } from './components/Wallet'
import { Board, Burns, Launch, Otc, Privacy, Roadmap, Rules, Token } from './routes'
import { brand } from './data/brand'

const TITLES: Record<string, string> = {
  '/launch': `Launch a coin | ${brand.name}`,
  '/otc': `Confidential OTC | ${brand.name}`,
  '/burns': `Burns | ${brand.name}`,
  '/rules': `How fees work | ${brand.name}`,
  '/roadmap': `Roadmap | ${brand.name}`,
  '/privacy': `Privacy | ${brand.name}`,
}

function TitleSync() {
  const { pathname } = useLocation()
  const { coins } = useMarket()
  useEffect(() => {
    if (pathname.startsWith('/token/')) {
      const c = coins.find((x) => x.mint === pathname.split('/')[2])
      document.title = c ? `$${c.symbol} · ${c.name} | ${brand.name}` : brand.name
    } else document.title = TITLES[pathname] ?? `${brand.longName} | ${brand.headline.top} ${brand.headline.bottom}`
  }, [pathname, coins])
  return null
}

export default function App() {
  return (
    <MarketProvider>
      <UiProvider>
        <TitleSync />
        <Splash />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/privacy" element={<Privacy />} />
            <Route element={<AppShell />}>
              <Route index element={<Board />} />
              <Route path="launch" element={<Launch />} />
              <Route path="otc" element={<Otc />} />
              <Route path="burns" element={<Burns />} />
              <Route path="rules" element={<Rules />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="token/:mint" element={<Token />} />
            </Route>
            {/* Referensen skickar okända routes till brädet */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <SearchPalette />
        <WalletModal />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgb(13 13 13)',
              border: '1px solid rgb(32 32 32)',
              borderRadius: 0,
              color: 'rgb(245 245 245)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </UiProvider>
    </MarketProvider>
  )
}
