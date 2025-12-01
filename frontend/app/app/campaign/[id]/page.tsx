'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppHeader, SpaceBackground, Panel } from '@/components';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useCampaignInfo } from '@/hooks/useCampaignInfo';
import { useCampaignAddress } from '@/hooks/useCampaignAddress';
import { useUserValidation } from '@/hooks/useUserValidation';
import ValidationModal from '@/components/campaign/ValidationModal';
import { Address, formatUnits } from 'viem';

interface CampaignRule {
  id: string;
  ruleType: string;
  ruleValue: string;
  description: string;
  isRequired: boolean;
  order: number;
}

interface CampaignData {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  rules: CampaignRule[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string);
  const { isConnected, address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [commentLink, setCommentLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch campaign address from factory contract using campaign ID
  const { campaignAddress, isLoading: isLoadingAddress } = useCampaignAddress(campaignId);

  // Fetch campaign data from database
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isFetchingRules, setIsFetchingRules] = useState(false);

  const { campaignInfo, isLoading: isLoadingInfo } = useCampaignInfo(campaignAddress);
  const { validate, isWalletConnected, isTwitterAuthorized } = useUserValidation();

  // Fetch campaign rules from database using campaignId (not address)
  const fetchCampaignData = async () => {
    if (isNaN(campaignId)) return;

    setIsFetchingRules(true);
    try {
      const url = new URL(`/api/campaign/${campaignId}`, window.location.origin);
      if (address) {
        url.searchParams.set('userAddress', address);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.campaign) {
          setCampaignData(data.campaign);
          if (data.hasJoined !== undefined) {
            setHasJoined(data.hasJoined);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    } finally {
      setIsFetchingRules(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId, address]);

  const handleJoinCampaign = async () => {
    // Check if wallet is connected
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/campaign/${campaignId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          contractAddress: campaignAddress, // Send address for fallback lookup
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHasJoined(true);
        alert('Successfully joined the campaign! You can now complete the tasks.');
        // Re-fetch campaign data to ensure we have the latest rules/description
        // This is important if the campaign was just auto-synced/fixed by the join API
        await fetchCampaignData();
      } else {
        alert(data.error || 'Failed to join campaign');
      }
    } catch (error) {
      console.error('Error joining campaign:', error);
      alert('An error occurred while joining the campaign');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSubmitComment = () => {
    if (!commentLink.trim()) {
      alert('Please enter your comment link');
      return;
    }

    if (!commentLink.includes('x.com') && !commentLink.includes('twitter.com')) {
      alert('Please enter a valid X (Twitter) comment link');
      return;
    }

    setIsSubmitting(true);
    // TODO: Implement actual submission logic with Reclaim Protocol
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Comment link submitted successfully! Verification in progress...');
      setCommentLink('');
    }, 2000);
  };

  // Helper function to get rule type label
  const getRuleTypeLabel = (ruleType: string) => {
    const labels: Record<string, string> = {
      FOLLOW_TWITTER: 'Follow Twitter Account',
      RETWEET: 'Retweet',
      LIKE: 'Like Tweet',
      COMMENT: 'Comment on Tweet',
      MIN_FOLLOWERS: 'Minimum Followers',
    };
    return labels[ruleType] || ruleType;
  };

  // Helper function to get button text based on rule type
  const getRuleButtonText = (ruleType: string) => {
    const buttons: Record<string, string> = {
      FOLLOW_TWITTER: 'Follow Account',
      RETWEET: 'View Tweet to Retweet',
      LIKE: 'View Tweet to Like',
      COMMENT: 'View Tweet to Comment',
      MIN_FOLLOWERS: 'Check Requirements',
    };
    return buttons[ruleType] || 'Complete Task';
  };

  // Helper function to get rule URL
  const getRuleUrl = (rule: CampaignRule) => {
    if (rule.ruleType === 'FOLLOW_TWITTER') {
      const handle = rule.ruleValue.startsWith('@') ? rule.ruleValue.slice(1) : rule.ruleValue;
      return `https://x.com/${handle}`;
    }
    return rule.ruleValue;
  };

  const isLoading = isLoadingAddress || isLoadingInfo;

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

  if (!campaignInfo || !campaignAddress) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
        <SpaceBackground variant="app" />
        <div className="relative z-10">
          <AppHeader onConnectClick={() => console.log('Connect wallet')} />
          <main className="container mx-auto px-6 py-12">
            <Panel>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h2>
                <p className="text-[#B8C2CC] mb-6">The campaign you're looking for doesn't exist or has an invalid ID.</p>
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
                    <h1 className="text-3xl font-bold text-white mb-3">{campaignInfo.name}</h1>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${status === 'Active'
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

              {/* Campaign Tasks Section */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Campaign Tasks</h2>
                {!hasJoined ? (
                  /* Not Joined State - Show Warning */
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8 text-center">
                    <div className="mb-4">
                      <svg className="w-16 h-16 text-yellow-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-yellow-200 mb-2">Join Campaign First</h3>
                    <p className="text-yellow-100 mb-6">
                      You need to join this campaign before you can view and complete the tasks.
                    </p>
                    <button
                      onClick={handleJoinCampaign}
                      disabled={isJoining || !campaignInfo.isActive || isExpired}
                      className={`px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold rounded-lg transition-opacity ${isJoining || !campaignInfo.isActive || isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                    >
                      {isJoining ? 'Joining...' : 'Join Campaign Now'}
                    </button>
                  </div>
                ) : (
                  /* Joined State - Show Tasks */
                  <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-6">
                    {isFetchingRules ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3AE8FF]"></div>
                        <p className="text-[#B8C2CC] mt-3 text-sm">Loading campaign tasks...</p>
                      </div>
                    ) : campaignData && campaignData.rules && campaignData.rules.length > 0 ? (
                      /* Dynamic Tasks from Database */
                      <div className="space-y-6">
                        {/* Campaign Description */}
                        {campaignData.description && (
                          <div className="pb-4 border-b border-[#2A3441]">
                            <h4 className="font-semibold text-white mb-2">About this Campaign</h4>
                            <p className="text-[#B8C2CC] text-sm">{campaignData.description}</p>
                          </div>
                        )}

                        {/* Dynamic Rules */}
                        {campaignData.rules.map((rule, index) => {
                          const colors = ['#3AE8FF', '#7CD2FF', '#00D9FF', '#5BBFFF'];
                          const color = colors[index % colors.length];

                          return (
                            <div key={rule.id} className={`flex items-start gap-4 ${index < campaignData.rules.length - 1 ? 'pb-4 border-b border-[#2A3441]' : ''}`}>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}1A`, border: `1px solid ${color}4D` }}>
                                <span className="font-bold" style={{ color }}>{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-white">{getRuleTypeLabel(rule.ruleType)}</h4>
                                  {rule.isRequired && (
                                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs font-medium">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <p className="text-[#B8C2CC] text-sm mb-3">{rule.description}</p>

                                {rule.ruleType !== 'MIN_FOLLOWERS' ? (
                                  <a
                                    href={getRuleUrl(rule)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                      backgroundColor: `${color}1A`,
                                      border: `1px solid ${color}4D`,
                                      color: color
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${color}33`}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${color}1A`}
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    {getRuleButtonText(rule.ruleType)}
                                  </a>
                                ) : (
                                  <div className="px-4 py-2 rounded-lg text-sm"
                                    style={{
                                      backgroundColor: `${color}1A`,
                                      border: `1px solid ${color}4D`,
                                      color: color
                                    }}>
                                    Minimum {rule.ruleValue} followers required
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Verification Note */}
                        <div className="mt-6 p-4 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded-lg">
                          <p className="text-[#3AE8FF] text-sm">
                            <strong>Note:</strong> After completing all tasks, your participation will be verified using zero-knowledge proof technology.
                            Make sure all tasks are completed genuinely and follow the campaign guidelines to claim your reward.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* No Rules Found - Fallback */
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <svg className="w-16 h-16 text-[#B8C2CC] mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Tasks Defined Yet</h3>
                        <p className="text-[#B8C2CC] text-sm">
                          The campaign creator hasn't defined specific tasks yet. Check back later for updates.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t border-[#2A3441]">
                <button
                  onClick={() => router.push('/app')}
                  className="px-6 py-3 border border-[#2A3441] text-[#B8C2CC] rounded-lg hover:border-[#00D9FF] hover:text-white transition-colors"
                >
                  Back to Campaigns
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
      // isTwitterAuthorized={isTwitterAuthorized}
      />
    </div>
  );
}
