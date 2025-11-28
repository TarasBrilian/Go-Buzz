import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure serverExternalPackages for both Turbopack and Webpack
  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'thread-stream',
    'lokijs',
    'encoding',
  ],

  // Add empty turbopack config to silence warning
  turbopack: {},

  webpack: (config) => {
    // Add externals for optional wallet connectors that we don't use
    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      '@base-org/account',
      '@gemini-wallet/core',
      '@phantom/wallet-sdk',
      '@rabby-wallet/rabby-sdk',
      '@metamask/sdk',
      'porto',
      '@ledgerhq/wallet-connect',
      '@exodus/wallet-sdk',
      '@okxconnect/core'
    );

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
