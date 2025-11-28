'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlockchainCampaignList from '@/components/campaign/BlockchainCampaignList';

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0A0E14' }}>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="planet planet-2" />
        <div className="nebula nebula-1" />
        <div className="grid-overlay" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="holo-border inline-block mb-4">
              <div className="scan-line" />
              <h1 className="hologram-text text-4xl md:text-5xl font-bold px-6 py-3">
                Explore Campaigns
              </h1>
            </div>
            <p className="text-[#B8C2CC] text-lg">
              Browse and join active campaigns from the blockchain
            </p>
          </div>

          {/* Info Panel */}
          <div className="mb-8 bg-gradient-to-r from-[#3AE8FF]/10 to-[#7CD2FF]/10 border border-[#3AE8FF]/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Live from Base Sepolia</h3>
                <p className="text-[#B8C2CC] text-sm leading-relaxed">
                  All campaigns are fetched directly from the blockchain (Base Sepolia testnet). Data is updated in real-time.
                  Create a new campaign and it will appear here automatically!
                </p>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="feature-card p-8">
            <div className="card-corner card-corner-tl" />
            <div className="card-corner card-corner-tr" />
            <div className="card-corner card-corner-bl" />
            <div className="card-corner card-corner-br" />

            <BlockchainCampaignList />

            <div className="card-pulse" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
