# FACELESS ($FCLS)

*No face. Just launch.* Privacy-first launchpad på Solana/Meteora: ingen KYC, inga konton, bara plånboken.

Rebrand av klonen av **https://mskd.fun/** (originalklonen ligger orörd i `C:\Clonade hemsidor\mskd\`).
Samma layout som originalet, men eget namn, egen pixel-logga (huva utan ansikte), egna demo-coins och eget färgtema:
djup navy `#060B14`, paneler `#0D1626` och isblå accent `#9FD8FF` (i stället för originalets orange).

X-grafik ligger i `grafik/`: `pfp.png` (1000×1000), `banner.png` (1500×500) och `launch.png` (1600×900).
Byggd med Vite + React + TypeScript (strict) + Tailwind 3.4.

- Domän: **fcls.fun** (var ledig 2026-11-25)
- X: **@fclsfun** (ej kontrollerat)

## Starta

Dubbelklicka på **`start.bat`**. Första gången installeras paketen automatiskt, sedan öppnas sajten på
`http://localhost:5173`. Kräver Node.js (LTS) från nodejs.org.

## Routes

| Route | Sida |
| --- | --- |
| `/` | The board – hero, officiell token, tre kolumner (New / Bonding / Bonded) |
| `/launch` | Launch-formulär med live-förhandsvisning, mode-val, dev buy |
| `/otc` | Confidential OTC desk med flöde, desk, sekretess-tabell och FAQ |
| `/burns` | Verifierade burns (tom feed, som referensen) |
| `/rules` | How fees work – launch modes och regler |
| `/roadmap` | Roadmap (Shipped / In progress / Incoming) |
| `/token/:mint` | Tokensida med candlestick-chart, trade-panel, trades/holders/traders, chat, bond meter |
| `/privacy` | Fristående privacy-sida utan app-skal |
| övriga | Skickas till `/` (som referensen) |

## Struktur

```
src/
  components/   primitives (ikoner, avatar, bond-fill, sparkline, knappar), Scramble, GrainField (WebGL),
                Splash, SearchPalette (Ctrl+K), Wallet (demo-modal), TokenChart
  layouts/      AppShell – sidebar, header, marquee-strip, statistikfooter, mobilnav
  pages/        en fil per route
  routes/       lazy-laddade sidor
  hooks/        market (fixtures + live-tick), ui (sidebar, privacy, stjärnor, demo-plånbok)
  lib/          formatering, seedad slump, mock-trades/holders/candles
  data/brand.ts all branding på ett ställe
  styles/       Tailwind + sajtens egna CSS-klasser (btn-holo, holo-border, bond-fill, splash …)
public/
  api/          fixtures: coins.json, market-stats.json, sol-price.json
  assets/brand/ neutral placeholder-logga (mark.svg, token.svg)
```

## Dependencies

- `react`, `react-router-dom` – app och routing
- `tailwindcss` 3.4.19 (samma version som referensen) + `tailwindcss-animate`
- `@iconify/tailwind` + `@iconify-json/ph` – Phosphor-ikonerna, samma klassnamn som referensen (`iconify ph--…`)
- `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`, `@fontsource/silkscreen` – exakt de fonter referensen använder
- `lightweight-charts` – TradingView-chart på tokensidan
- `sonner` – toasts

## Responsivt

Samma brytpunkter som referensen: `xs 390`, `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
Under `md` försvinner sidebaren och ersätts av bottennav med flytande launch-knapp; footer-statistiken
ligger ovanför bottennav. Brädet visar en kolumn åt gången med flikar under `lg`.

## Data / mock

- Brädet läser `public/api/*.json` – 17 påhittade demo-coins (Faceless BTC, dogwifhood, Nobody …) med siffror från referensens ögonblicksbild.
  Tidsstämplar flyttas vid laddning så att allt ser färskt ut. Slot/TPS/RPC/SOL-pris tickar lätt för live-känsla.
- Trades, holders, traders och candles på tokensidan genereras deterministiskt per mint (`src/lib/trades.ts`).
- Demo-coins har inga bilder och visar bokstavsavatar. Officiella $FCLS använder `public/assets/brand/token.svg`.

## Auth / plånbok

Ingen riktig plånbok kopplas. **Connect** öppnar en demo-modal (Phantom/Solflare/Backpack/Demo) som går
igenom `connecting → connected` och sätter en fejkadress. Klick på adressen kopplar från.

## Web3 / TODO(backend)

Sök efter `TODO(backend)` i koden. Det som saknas:
- riktig wallet adapter (referensen använder Jupiters unified wallet adapter)
- indexer/API för coins, trades, holders, market-stats (referensen läser Meteora DBC-pooler)
- launch-transaktion (DBC create), swaps (DBC / DAMM v2), callouts, token-chat, OTC-erbjudanden och Privacy Rings-settlement, burn-kvitton

## Ersatt jämfört med referensen

- Namn MSKD/MASKED → FCLS/FACELESS, rubrik → "No face. / Just launch.", launch-mode MSKD → FCLS
- Logga → huva utan ansikte (`mark.svg`, vit) + textbaserad wordmark "FCLS.fun"
- Officiell token-bild → orange profilbild med svart huva (`token.svg`)
- Demo-coins omdöpta, tredjepartsbilder borttagna
- Helius-loggan på OTC → textbadge
- Radix-tooltips/dialoger → egna lätta komponenter med samma utseende

## Vid launch

Sätt riktig CA i `src/data/brand.ts` (`officialMint`) och `caLive: true`. Byt också mint-fältet för FCLS i `public/api/coins.json` till samma CA.

## Rebranda igen

1. Ändra `src/data/brand.ts` (namn, ticker, rubrik, beskrivning, X-länk, officiell mint).
2. Byt `public/assets/brand/mark.svg` och `token.svg`.
3. Färger: CSS-variablerna i `src/styles/index.css` (`--primary`, `--signal`, `--cta-bg`, `--background`, `--panel` …) och rökfärgen i `src/components/GrainField.tsx`.
4. Uppdatera texterna på sidorna och fixtures i `public/api/`.
Se även `BRANDING_TODO.md`.
