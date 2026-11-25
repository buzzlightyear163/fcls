# Referensanalys – mskd.fun

Inspekterad 2026-11-25 i webbläsare (1280×800 och 390×844).

## Teknik i referensen
- Next.js (pages router), Tailwind CSS v3.4.19, Iconify/Phosphor via CSS-masker (`iconify ph--…`)
- next/font: **Geist** (sans), **Geist Mono** (`--font-code`), **Silkscreen** 400/700 (`--font-display`, `--font-term`, `--font-pixel`)
- Radix (tooltip/dialog/dropdown), sonner (toasts), lightweight-charts (TradingView), Jupiter wallet adapter
- Egen API: `/api/coins`, `/api/market-stats`, `/api/sol-price`, `/api/coins/:mint/{trades,holders}`, `/api/callouts`, `/api/token-image`

## Routes (från _buildManifest)
`/`, `/launch`, `/otc`, `/burns`, `/rules`, `/roadmap`, `/privacy`, `/token/[tokenId]`
(`/admin` och `/launch-preview` är privata – ej klonade). Okända routes → `/`.

## Layout
- App-skal: `h-dvh` flex. Sidebar 64 px (expanderbar till 212 px) · header 56 px · strip 40 px med marquee · main · footer 44 px med klusterstatistik.
- Mobil (< 768): sidebar döljs, fast bottennav 64 px med upphöjd orange launch-knapp, footer flyttas ovanför bottennav.
- Brädet: hero (3-kolumns grid på lg/xl) → officiell token-rad → "The board"-rubrik med density-växel → 3 kolumner.

## Designsystem
- Bakgrund `#090909`, panel `rgb(11 11 13)`, primär/signal `#FF6600`, emerald `rgb(52 211 120)`, rose `rgb(255 77 94)`
- Neutralskala 50–950 inkl. 750/850/925 via CSS-variabler (`rgb(var(--x) / alpha)`)
- **Alla radier = 0** utom `rounded-full` (tema-override)
- `holo-border` / `board-surface`: orange hörnmarkeringar (10 px) via 8 bakgrundsgradienter
- `btn-holo`: orange, pixel-font, versaler, inset-skugga, vit vid hover
- `bond-fill`: randig progress via repeating-linear-gradient mask
- `eyebrow`: pixel-font 11 px, versaler, 0.12em spärrning
- Brytpunkter: xs 390, sm 640, md 768, lg 1024, xl 1280, 2xl 1536 (+ `min-[420px]`)

## Animationer
- **Splash** (en gång per session, `sessionStorage mskd.splash.v2`): WebGL-dimma, logga, räknare 001→100 % med brustecken, "Enter"-knapp; lämnar efter ≥ 900 ms när data laddat, max 3 s.
- **Grain field**: WebGL fbm-rök i orange, halv upplösning, 30 fps, följer musen svagt, filmkorn per frame.
- **Scramble**: rubriker avkodas från `▓▒░█<>/\|_#$%&*+=?01` under 900 ms.
- Marquee (`--marquee-duration`, pausar vid hover), `animate-ping` på statusprickar, `mark-float`, hover på rader (orange vänsterkant + sparkline-opacitet).

## Funktioner
- Sökpalett (Ctrl+K): coins efter MC, Go to-sidor, privacy-action
- Privacy mode: suddar adresser (`[data-private]`)
- Stjärnmärkta coins (strip-flik), density compact/comfortable, kollapsbar hero, expanderbar sidebar
- Tokensida: intervall 1s–1d, MCap/Price, SOL/USD, candles/line, Vol/Log, zoom; trades/holders/traders-tabeller; buy/sell-panel; chat; callouts; bond meter; ownership

## Externa integrationer
Meteora DBC / DAMM v2, Jupiter wallet adapter, Helius Privacy Rings (OTC), Pinata IPFS (bilder), Solscan-länkar.
