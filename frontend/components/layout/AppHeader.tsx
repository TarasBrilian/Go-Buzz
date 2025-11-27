'use client';

import { useState } from 'react';
import Logo from './Logo';
import { ConnectWallet } from '../wallet';

interface AppHeaderProps {
  showHistory?: boolean;
  onConnectClick?: () => void;
}

export default function AppHeader({ showHistory = true, onConnectClick }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header-glow" />
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left Side - Logo & My History (Desktop) */}
          <div className="flex items-center gap-8">
            <Logo size="small" linkTo="/" />

            {showHistory && (
              <button className="hidden md:flex app-menu-item">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  My History
                </span>
              </button>
            )}
          </div>

          {/* Right Side - Connect Wallet (Desktop) */}
          <div className="hidden md:block">
            <ConnectWallet onConnect={onConnectClick} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden mobile-menu-button"
          >
            <div className={`hamburger-line ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`hamburger-line ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`hamburger-line ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu md:hidden ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="mobile-menu-content">
            {/* My History - Mobile */}
            {showHistory && (
              <button
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  My History
                </span>
              </button>
            )}

            {/* Divider */}
            <div className="border-t border-[#2A3441]" />

            {/* Connect Wallet - Mobile */}
            <div className="pt-2">
              <ConnectWallet onConnect={() => {
                setMobileMenuOpen(false);
                if (onConnectClick) onConnectClick();
              }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
