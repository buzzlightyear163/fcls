# FACELESS – kvar att göra

## Vid launch
- [ ] Riktig CA i `src/data/brand.ts` → `officialMint`, och sätt `caLive: true`
- [ ] Samma CA på FCLS-raden i `public/api/coins.json`
- [ ] Kontrollera att @fclsfun är ledigt på X och uppdatera `xHandle`/`xUrl` om du tar ett annat

## Klart
- [x] Namn FACELESS / FCLS.fun, ticker $FCLS
- [x] Rubrik "No face. / Just launch.", beskrivning, sidtitlar, meta-taggar
- [x] Logga: huva utan ansikte (`public/assets/brand/mark.svg`) + profilbild (`token.svg`)
- [x] Launch-mode MSKD → FCLS (Rules, Launch, Roadmap, tokensidan)
- [x] Demo-coins omdöpta, inga bilder från andra projekt
- [x] Färgtema navy + isblå (#060B14 / #0D1626 / #9FD8FF), även rök-bakgrunden och grafen
- [x] X-grafik i `grafik/`: pfp, banner och launch-bild

## Valfritt
- [ ] Riktig wordmark-bild i stället för text (`components/primitives.tsx → Wordmark`)

## Backend (TODO(backend) i koden)
- [ ] Wallet adapter, indexer/API, launch- och swap-transaktioner, chat, callouts, OTC, burns

## X
- [x] X-kit: `brand/x/x-copy.md` (bio, launch-inlägg, CA-svar, tre inlägg efter launch)
