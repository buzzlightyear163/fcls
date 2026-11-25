/**
 * All branding på ett ställe. Byt värden här för att rebranda klonen.
 * Se BRANDING_TODO.md.
 */
export const brand = {
  name: 'FCLS.fun',
  longName: 'FACELESS',
  wordmark: { main: 'FCLS', tld: '.fun' },
  ticker: 'FCLS',
  headline: { top: 'No face.', bottom: 'Just launch.' },
  description:
    'FACELESS is a Solana launchpad with wallet-signed trades and SOL creator rewards. No KYC, no accounts, no face. The standard trading fee is 1.25% before and after bonding. Powered by Meteora.',
  xHandle: '@fclsfun',
  xUrl: 'https://x.com/fclsfun',
  // Byt till riktig CA vid launch och sätt caLive: true (då visas CA:n på brädet)
  officialMint: 'FCLS1111111111111111111111111111111111111111',
  caLive: false,
  assets: {
    mark: '/assets/brand/mark.svg',
    token: '/assets/brand/token.svg',
  },
  explorer: 'https://solscan.io',
}
