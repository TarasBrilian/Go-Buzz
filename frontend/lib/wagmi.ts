import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism, base, baseSepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia, mainnet, sepolia, polygon, arbitrum, optimism, base],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      metadata: {
        name: 'GO BUZZ',
        description: 'SocialFi Engagement Marketplace - Verified Contributions, Fair Rewards',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://gobuzz.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      showQrModal: true,
    }),
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
})
