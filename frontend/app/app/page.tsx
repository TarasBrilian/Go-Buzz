'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  AppHeader,
  NavigationTabs,
  SpaceBackground,
  Panel,
  StatusIndicator,
  type Tab,
} from '@/components';
import BlockchainCampaignList from '@/components/campaign/BlockchainCampaignList';
import { CreateCampaignForm } from '@/components/campaign';

const TABS: Tab[] = [
  { id: 'explore', label: 'Explore Campaign' },
  { id: 'pass', label: 'Pass Campaign' },
  { id: 'create', label: 'Create Campaign' },
];

export default function AppPage() {
  const { isConnected } = useAccount();

  const [activeTab, setActiveTab] = useState('explore');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    console.log('Connect wallet');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
      {/* Background Elements */}
      <SpaceBackground variant="app" />

      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <AppHeader onConnectClick={handleConnect} />

        {/* Navigation Bar */}
        <NavigationTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
        />

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-12">
          <Panel>
            {activeTab === 'create' ? (
              /* Create Campaign Form */
              <CreateCampaignForm />
            ) : (
              /* Campaign List from Blockchain */
              <div className="space-y-4">
                {/* Campaign Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {activeTab === 'explore' ? 'Explore Campaigns' : 'Pass Campaigns'}
                    </h2>
                    <p className="text-[#B8C2CC] text-sm font-mono">
                      {activeTab === 'explore'
                        ? 'Browse active campaigns from Base Sepolia blockchain'
                        : 'View expired campaigns'}
                    </p>
                  </div>
                  <StatusIndicator
                    label={activeTab === 'explore' ? 'LIVE' : 'EXPIRED'}
                    variant={activeTab === 'explore' ? 'live' : 'expired'}
                  />
                </div>

                {/* Blockchain Campaign List */}
                <BlockchainCampaignList filterExpired={activeTab === 'pass'} />
              </div>
            )}
          </Panel>
        </main>
      </div>
    </div>
  );
}
