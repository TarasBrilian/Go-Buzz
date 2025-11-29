'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppHeader, SpaceBackground, Panel } from '@/components';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useCampaignInfo } from '@/hooks/useCampaignInfo';
import { useUserValidation } from '@/hooks/useUserValidation';
import ValidationModal from '@/components/campaign/ValidationModal';
import { Address, formatUnits } from 'viem';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignAddress = params.id as Address;
  const { isConnected, address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { campaignInfo, isLoading } = useCampaignInfo(campaignAddress);
  const { validate, isWalletConnected, isTwitterAuthorized } = useUserValidation();

  const handleJoinCampaign = () => {
    // Validate user requirements
    const validation = validate();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowValidationModal(true);
      return;
    }

    // All validations passed, proceed with joining campaign
    setIsJoining(true);
    // TODO: Implement actual join campaign logic with smart contract
    setTimeout(() => {
      setIsJoining(false);
      alert(`Successfully joined ${campaignInfo?.name}! Check your wallet for confirmation.`);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
        <SpaceBackground variant="app" />
        <div className="relative z-10">
          <AppHeader onConnectClick={() => console.log('Connect wallet')} />
          <main className="container mx-auto px-6 py-12">
            <Panel>
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3AE8FF]"></div>
                <p className="text-[#B8C2CC] mt-4">Loading campaign...</p>
              </div>
            </Panel>
          </main>
        </div>
      </div>
    );
  }

  if (!campaignInfo) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
        <SpaceBackground variant="app" />
        <div className="relative z-10">
          <AppHeader onConnectClick={() => console.log('Connect wallet')} />
          <main className="container mx-auto px-6 py-12">
            <Panel>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h2>
                <p className="text-[#B8C2CC] mb-6">The campaign you're looking for doesn't exist or invalid address.</p>
                <button
                  onClick={() => router.push('/app/explore')}
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

  const endDate = new Date(Number(campaignInfo.end) * 1000);
  const isExpired = Date.now() > endDate.getTime();
  const status = campaignInfo.isActive && !isExpired ? 'Active' : 'Expired';
  const progress = Number(campaignInfo.claimed * BigInt(100) / campaignInfo.totalPool);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
      <SpaceBackground variant="app" />

      <div className="relative z-10">
        <AppHeader onConnectClick={() => console.log('Connect wallet')} />

        <main className="container mx-auto px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.push('/app/explore')}
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
                    <h1 className="text-3xl font-bold text-white mb-3">{campaignInfo.name}</h1>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                          status === 'Active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {status}
                      </span>
                      <span className="text-[#B8C2CC] text-sm font-mono">
                        Contract: {campaignAddress.slice(0, 6)}...{campaignAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#B8C2CC] font-mono mb-1">TOTAL POOL</div>
                    <div className="text-4xl font-bold text-[#00D9FF]">
                      {formatUnits(campaignInfo.totalPool, 18)} USDC
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">Reward/Claim</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatUnits(campaignInfo.rewardAmount, 18)}</p>
                  <p className="text-xs text-[#B8C2CC] mt-1">USDC per claim</p>
                </div>

                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">Claimed</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatUnits(campaignInfo.claimed, 18)}</p>
                  <p className="text-xs text-[#B8C2CC] mt-1">USDC claimed</p>
                </div>

                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">Remaining</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#3AE8FF]">{formatUnits(campaignInfo.remaining, 18)}</p>
                  <p className="text-xs text-[#B8C2CC] mt-1">USDC remaining</p>
                </div>

                <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-[#00D9FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-medium text-[#B8C2CC] uppercase">End Date</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{endDate.toLocaleDateString()}</p>
                  <p className="text-xs text-[#B8C2CC] mt-1">{endDate.toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-[#B8C2CC] mb-2">
                  <span>Campaign Progress</span>
                  <span>{progress.toFixed(1)}% claimed</span>
                </div>
                <div className="w-full bg-[#2A3441] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] h-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Campaign Information</h2>
                  <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6 space-y-4">
                    <div>
                      <p className="text-sm text-[#B8C2CC] mb-1">Campaign Name</p>
                      <p className="text-white font-medium">{campaignInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B8C2CC] mb-1">Contract Address</p>
                      <p className="text-white font-mono text-xs break-all">{campaignAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B8C2CC] mb-1">Status</p>
                      <p className={`font-medium ${status === 'Active' ? 'text-green-400' : 'text-orange-400'}`}>
                        {status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B8C2CC] mb-1">Start Date</p>
                      <p className="text-white">{new Date(Number(campaignInfo.start) * 1000).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#B8C2CC] mb-1">End Date</p>
                      <p className="text-white">{endDate.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

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
                            Connect your wallet to interact with this campaign on Base Sepolia.
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
                            Follow the campaign requirements and complete the verification process.
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
                            Claim your {formatUnits(campaignInfo.rewardAmount, 18)} USDC reward directly to your wallet.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#2A3441]">
                <button
                  onClick={handleJoinCampaign}
                  disabled={isJoining || !campaignInfo.isActive || isExpired}
                  className={`flex-1 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold py-4 px-6 rounded-lg transition-opacity ${
                    isJoining || !campaignInfo.isActive || isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                >
                  {isJoining ? 'Joining...' : !campaignInfo.isActive || isExpired ? 'Campaign Ended' : isConnected ? 'Join Campaign' : 'Connect Wallet to Join'}
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

      {/* Validation Modal */}
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={validationErrors}
        isWalletConnected={isWalletConnected}
        isTwitterAuthorized={isTwitterAuthorized}
      />
    </div>
  );
}
