'use client';

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConnectWalletProps {
  onConnect?: () => void;
}

export default function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet-specific content until mounted
  if (!mounted) {
    return (
      <button className="app-connect-button">
        <span className="relative z-10">Connect</span>
        <div className="connect-button-glow" />
      </button>
    );
  }

  const handleConnect = () => {
    setShowModal(true);
  };

  const handleDisconnect = () => {
    disconnect();
    if (onConnect) onConnect();
  };

  const handleConnectorClick = (connector: any) => {
    connect({ connector });
    setShowModal(false);
    if (onConnect) onConnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Filter out Coinbase Wallet to avoid authorization issues
  const filteredConnectors = connectors.filter(
    (connector) => !connector.name.toLowerCase().includes('coinbase')
  );

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg">
          <span className="text-white font-mono text-sm">
            {ensName || formatAddress(address)}
          </span>
        </div>
        <button onClick={handleDisconnect} className="app-connect-button">
          <span className="relative z-10">Disconnect</span>
          <div className="connect-button-glow" />
        </button>
      </div>
    );
  }

  const modalContent = showModal && mounted ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="relative bg-[#0F1419] border border-[#2A3441] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-[#B8C2CC] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-[#B8C2CC] text-sm">Choose your preferred wallet to connect</p>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3">
          {filteredConnectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => handleConnectorClick(connector)}
              disabled={isPending}
              className="w-full flex items-center justify-between p-4 bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg hover:border-[#00D9FF] hover:bg-[#1A1F2E] transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* Wallet Icon */}
                <div className="w-10 h-10 bg-[#00D9FF]/10 rounded-lg flex items-center justify-center group-hover:bg-[#00D9FF]/20 transition-colors">
                  <svg
                    className="w-6 h-6 text-[#00D9FF]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{connector.name}</p>
                  <p className="text-[#B8C2CC] text-xs">
                    {connector.type === 'injected' ? 'Browser Extension' : 'Mobile App'}
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-[#B8C2CC] group-hover:text-[#00D9FF] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-[#2A3441]">
          <p className="text-[#B8C2CC] text-xs text-center">
            By connecting a wallet, you agree to GO BUZZ's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button onClick={handleConnect} className="app-connect-button">
        <span className="relative z-10">Connect</span>
        <div className="connect-button-glow" />
      </button>

      {/* Render modal using portal to body */}
      {mounted && typeof window !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
