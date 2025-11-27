'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppHeader, SpaceBackground, Panel } from '@/components';
import { getCampaignById } from '@/lib/campaignData';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params.id);
  const { isConnected, address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);

  const campaign = getCampaignById(campaignId);

  const handleJoinCampaign = () => {
    if (!isConnected) {
      alert('Please connect your wallet first to join this campaign');
      return;
    }

    setIsJoining(true);
    // Simulate joining campaign
    setTimeout(() => {
      setIsJoining(false);
      alert(`Successfully joined ${campaign?.title}! Check your wallet for confirmation.`);
    }, 2000);
  };

  if (!campaign) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
        <SpaceBackground variant="app" />
        <div className="relative z-10">
          <AppHeader onConnectClick={() => console.log('Connect wallet')} />
          <main className="container mx-auto px-6 py-12">
            <Panel>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h2>
                <p className="text-[#B8C2CC] mb-6">The campaign you're looking for doesn't exist.</p>
                <button
                  onClick={() => router.push('/app')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Back to Campaigns
                </button>
              </div>
            </Panel>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
      <SpaceBackground variant="app" />

      <div className="relative z-10">
        <AppHeader onConnectClick={() => console.log('Connect wallet')} />

        <main className="container mx-auto px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.push('/app')}
            className="mb-6 flex items-center gap-2 text-[#B8C2CC] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </button>

          <Panel>
            <div className="space-y-8">
              {/* Campaign Header */}
              <div className="border-b border-[#2A3441] pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-3">{campaign.title}</h1>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                          campaign.status === 'Active'
                            ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {campaign.status}
                      </span>
                      <span className="text-[#B8C2CC] text-sm font-mono">{campaign.platform}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#B8C2CC] font-mono mb-1">REWARD POOL</div>
                    <div className="text-4xl font-bold text-[#00D9FF]">${campaign.reward}</div>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                <p className="text-[#B8C2CC] leading-relaxed">{campaign.description}</p>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">Participants</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{campaign.participants}</p>
                </div>

                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">End Date</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{campaign.endDate}</p>
                </div>

                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">Platform</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{campaign.platform}</p>
                </div>
              </div>

              {/* How to Participate */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">How to Participate</h2>
                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <ol className="space-y-4">
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-full flex items-center justify-center text-[#00D9FF] font-bold">
                        1
                      </span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Connect Your Wallet</h4>
                        <p className="text-[#B8C2CC] text-sm">
                          Click the "Connect" button to link your wallet to participate in this campaign.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-full flex items-center justify-center text-[#00D9FF] font-bold">
                        2
                      </span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Complete Campaign Tasks</h4>
                        <p className="text-[#B8C2CC] text-sm">
                          Follow the campaign requirements and engage with the content on {campaign.platform}.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-full flex items-center justify-center text-[#00D9FF] font-bold">
                        3
                      </span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Claim Your Rewards</h4>
                        <p className="text-[#B8C2CC] text-sm">
                          Once verified, claim your ${campaign.reward} reward directly to your wallet.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#2A3441]">
                <button
                  onClick={handleJoinCampaign}
                  disabled={isJoining}
                  className={`flex-1 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold py-4 px-6 rounded-lg transition-opacity ${
                    isJoining ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                >
                  {isJoining ? 'Joining...' : isConnected ? 'Join Campaign' : 'Connect Wallet to Join'}
                </button>
                <button
                  onClick={() => router.push('/app')}
                  className="px-6 py-4 border border-[#2A3441] text-[#B8C2CC] rounded-lg hover:border-[#00D9FF] hover:text-white transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}
