'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppHeader, SpaceBackground, Panel, VerificationModal } from '@/components';
import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { useCampaignInfo } from '@/hooks/useCampaignInfo';
import { useCampaignAddress } from '@/hooks/useCampaignAddress';
import { useUserValidation } from '@/hooks/useUserValidation';
import ValidationModal from '@/components/campaign/ValidationModal';
import { Address, formatUnits } from 'viem';
import { goBuzzAbi } from '@/abis/goBuzzAbi';

// Optional backend base URL. Set NEXT_PUBLIC_API_BASE_URL in .env.local if backend runs on a different port,
// e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
const API_BASE = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_BASE_URL as string) || '' : '';

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
  
  // Claim reward hooks
  const { writeContract, isPending: isWritePending, data: claimTxHash } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });
  
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation Form State
  const [activeValidationRuleId, setActiveValidationRuleId] = useState<string | null>(null);
  const [validationLink, setValidationLink] = useState('');
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

  // Verification Modal State
  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    isSuccess: false,
    message: '',
    details: { tweetId: '', author: '' },
  });

  // Track completed tasks by ruleId
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Claim reward state
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);

  // Follow verification state
  const [isVerifyingFollow, setIsVerifyingFollow] = useState(false);
  const [activeFollowRuleId, setActiveFollowRuleId] = useState<string | null>(null);

  // Min followers verification state
  const [isVerifyingFollowers, setIsVerifyingFollowers] = useState(false);
  const [activeFollowersRuleId, setActiveFollowersRuleId] = useState<string | null>(null);

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

  // Fetch completed tasks when campaign data loads - use localStorage as fallback
  useEffect(() => {
    if (!campaignData || !address) return;

    const checkCompletedTasks = async () => {
      const completed = new Set<string>();
      const storageKey = `completed-tasks-${campaignId}-${address}`;
      
      // First check localStorage for quick access
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const storedTasks = JSON.parse(stored);
          storedTasks.forEach((ruleId: string) => completed.add(ruleId));
          console.log('[COMPLETED-TASKS] Loaded from localStorage:', storedTasks);
        }
      } catch (err) {
        console.warn('Error loading from localStorage:', err);
      }
      
      // Then try to check database (optional, with error tolerance)
      for (const rule of campaignData.rules) {
        try {
          const res = await fetch(
            `/api/campaign/task-completion?campaignId=${campaignId}&userAddress=${encodeURIComponent(address)}&ruleId=${encodeURIComponent(rule.id)}`
          );
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data.isCompleted) {
              completed.add(rule.id);
            }
          }
        } catch (err) {
          console.warn(`Error checking task completion for rule ${rule.id}:`, err);
          // Silently fail - don't block UI
        }
      }
      
      setCompletedTasks(completed);
    };

    checkCompletedTasks();
  }, [campaignData, address, campaignId]);

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

  // Helper: Check if all required tasks are completed
  const areAllRequiredTasksCompleted = () => {
    if (!campaignData || !campaignData.rules) return false;
    
    const requiredRules = campaignData.rules.filter(rule => rule.isRequired);
    if (requiredRules.length === 0) return false;
    
    return requiredRules.every(rule => completedTasks.has(rule.id));
  };

  // Handle claim reward
  const handleClaimReward = async () => {
    if (!address || !campaignAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (!areAllRequiredTasksCompleted()) {
      alert('Please complete all required tasks before claiming');
      return;
    }

    setIsClaimingReward(true);
    setClaimError(null);

    try {
      // Execute the claim reward contract call
      console.log('[CLAIM] Attempting to claim reward for:', {
        userAddress: address,
        campaignAddress: campaignAddress,
        campaignId: campaignId,
      });

      // Call the claimReward function on the smart contract
      writeContract({
        address: campaignAddress as `0x${string}`,
        abi: goBuzzAbi,
        functionName: 'claimReward',
      });

    } catch (error) {
      console.error('Error claiming reward:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim reward');
      alert('Failed to claim reward. Please try again.');
    } finally {
      setIsClaimingReward(false);
    }
  };

  // Handle claim transaction success
  useEffect(() => {
    if (isClaimSuccess && !isClaimConfirming) {
      setIsClaimingReward(false);
      setHasClaimedReward(true);
      setVerificationModal({
        isOpen: true,
        isSuccess: true,
        message: '🎉 Reward claimed successfully!',
        details: { tweetId: '', author: '' },
      });
      
      console.log('[CLAIM] Reward claimed successfully');
    }
  }, [isClaimSuccess, isClaimConfirming]);

  // Handle claim transaction pending
  useEffect(() => {
    if (isWritePending) {
      setIsClaimingReward(true);
    }
  }, [isWritePending]);

  const handleOpenValidation = (ruleId: string) => {
    if (activeValidationRuleId === ruleId) {
      setActiveValidationRuleId(null);
      setValidationLink('');
    } else {
      setActiveValidationRuleId(ruleId);
      setValidationLink('');
    }
  };

  const handleSubmitValidation = async (ruleId: string, ruleType: string) => {
    if (!validationLink.trim()) {
      alert('Please enter the verification link');
      return;
    }

    if ((ruleType === 'COMMENT' || ruleType === 'RETWEET' || ruleType === 'LIKE') &&
      (!validationLink.includes('x.com') && !validationLink.includes('twitter.com'))) {
      alert('Please enter a valid X (Twitter) link');
      return;
    }

    setIsSubmittingValidation(true);

    try {
      // Direct verification - user submit link, backend verify automatically (no Reclaim popup)
      const verifyEndpoint = API_BASE ? `${API_BASE}/api/verify-comment-direct` : `/api/verify-comment-direct`;
      
      console.log('Submitting validation link to:', verifyEndpoint);

      const verifyResp = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: validationLink,
          userAddress: address || undefined
        })
      });

      // Parse JSON with error handling (don't read body twice)
      let verifyJson;
      try {
        verifyJson = await verifyResp.json();
      } catch (jsonErr) {
        console.error('Failed to parse verification response as JSON:', jsonErr);
        console.error('Response status:', verifyResp.status);
        alert('Failed to verify comment. Please ensure backend is running.');
        setIsSubmittingValidation(false);
        return;
      }

      setIsSubmittingValidation(false);

      if (!verifyResp.ok || !verifyJson.success) {
        console.error('Verification failed:', verifyJson);
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: verifyJson.error || 'Failed to verify comment. Invalid URL format or server error.',
          details: { tweetId: '', author: '' },
        });
        return;
      }

      const { verified, tweetId } = verifyJson.data;

      if (verified) {
        // Mark task as completed in localStorage immediately
        if (activeValidationRuleId) {
          const storageKey = `completed-tasks-${campaignId}-${address}`;
          const stored = localStorage.getItem(storageKey);
          const completedTasksList = stored ? JSON.parse(stored) : [];
          if (!completedTasksList.includes(activeValidationRuleId)) {
            completedTasksList.push(activeValidationRuleId);
            localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
            console.log('[COMPLETED-TASKS] Saved to localStorage:', completedTasksList);
          }
          
          // Update UI state immediately
          const newCompleted = new Set<string>(completedTasksList as string[]);
          setCompletedTasks(newCompleted);
        }

        // Also save task completion to database (optional, non-blocking)
        // Only save proof and validation data, no personal data like username
        try {
          const saveResp = await fetch('/api/campaign/task-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              userAddress: address,
              ruleId: activeValidationRuleId,
              ruleType: activeValidationRuleId 
                ? campaignData?.rules.find(r => r.id === activeValidationRuleId)?.ruleType 
                : 'UNKNOWN',
              verificationData: {
                tweetId: tweetId || '',
                verified: verified,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          const saveJson = await saveResp.json();
          if (!saveResp.ok) {
            console.warn('Failed to save task completion to database:', saveJson);
            // Still show success to user - localStorage backup is already saved
          } else {
            console.log('[TASK-COMPLETION] Saved to database successfully');
          }
        } catch (saveErr) {
          console.warn('Error saving task completion to database:', saveErr);
          // Continue anyway - verification was successful and localStorage is backup

        }

        setVerificationModal({
          isOpen: true,
          isSuccess: true,
          message: 'Your task has been verified successfully! Your task will be marked as completed shortly.',
          details: { tweetId: tweetId || '', author: '' },
        });
        setActiveValidationRuleId(null);
        setValidationLink('');
        // Refresh campaign data to show updated status
        await fetchCampaignData();
      } else {
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: 'Verification failed. Please check the link and try again.',
          details: { tweetId: tweetId || '', author: '' },
        });
      }

    } catch (error) {
      console.error('Error submitting validation link:', error);
      setVerificationModal({
        isOpen: true,
        isSuccess: false,
        message: 'An error occurred while verifying: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: { tweetId: '', author: '' },
      });
      setIsSubmittingValidation(false);
    }
  };

  // Handle verify follow using direct verification (no Reclaim popup)
  const handleVerifyFollow = async (ruleId: string, twitterHandle: string) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsVerifyingFollow(true);
    setActiveFollowRuleId(ruleId);

    try {
      // Direct verification - auto-verify follow without popup
      const verifyEndpoint = API_BASE ? `${API_BASE}/api/verify-follow-direct` : `/api/verify-follow-direct`;
      
      console.log('[FOLLOW-VERIFY] Verifying follow for:', twitterHandle);

      const verifyResp = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitterHandle: twitterHandle,
          userAddress: address || undefined
        })
      });

      // Parse JSON with error handling
      let verifyJson;
      try {
        verifyJson = await verifyResp.json();
      } catch (jsonErr) {
        console.error('Failed to parse follow verification response as JSON:', jsonErr);
        console.error('Response status:', verifyResp.status);
        alert('Failed to verify follow. Please ensure backend is running.');
        setIsVerifyingFollow(false);
        setActiveFollowRuleId(null);
        return;
      }

      setIsVerifyingFollow(false);

      if (!verifyResp.ok || !verifyJson.success) {
        console.error('Follow verification failed:', verifyJson);
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: verifyJson.error || 'Failed to verify follow. Please try again.',
          details: { tweetId: '', author: '' },
        });
        setActiveFollowRuleId(null);
        return;
      }

      const { verified, twitterHandle: verifiedHandle } = verifyJson.data;

      if (verified) {
        // Mark task as completed in localStorage immediately
        const storageKey = `completed-tasks-${campaignId}-${address}`;
        const stored = localStorage.getItem(storageKey);
        const completedTasksList = stored ? JSON.parse(stored) : [];
        if (!completedTasksList.includes(ruleId)) {
          completedTasksList.push(ruleId);
          localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
          console.log('[COMPLETED-TASKS] Follow task saved to localStorage:', completedTasksList);
        }

        // Update UI state immediately
        const newCompleted = new Set<string>(completedTasksList as string[]);
        setCompletedTasks(newCompleted);

        // Save to database (non-blocking)
        try {
          const saveResp = await fetch('/api/campaign/task-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              userAddress: address,
              ruleId: ruleId,
              ruleType: 'FOLLOW_TWITTER',
              verificationData: {
                twitterHandle: verifiedHandle,
                verified: verified,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          const saveJson = await saveResp.json();
          if (!saveResp.ok) {
            console.warn('Failed to save follow task to database:', saveJson);
          } else {
            console.log('[TASK-COMPLETION] Follow task saved to database');
          }
        } catch (saveErr) {
          console.warn('Error saving follow task to database:', saveErr);
        }

        setVerificationModal({
          isOpen: true,
          isSuccess: true,
          message: `Successfully verified follow of @${verifiedHandle}! Your task is now complete.`,
          details: { tweetId: verifiedHandle, author: '' },
        });
        setActiveFollowRuleId(null);
        await fetchCampaignData();
      } else {
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: 'Follow verification failed. Please ensure you followed the account.',
          details: { tweetId: '', author: '' },
        });
        setActiveFollowRuleId(null);
      }

    } catch (error) {
      console.error('Error verifying follow:', error);
      setVerificationModal({
        isOpen: true,
        isSuccess: false,
        message: 'An error occurred during follow verification: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: { tweetId: '', author: '' },
      });
      setIsVerifyingFollow(false);
      setActiveFollowRuleId(null);
    }
  };

  // Handle verify minimum followers
  const handleVerifyFollowers = async (ruleId: string, minFollowers: string) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsVerifyingFollowers(true);
    setActiveFollowersRuleId(ruleId);

    try {
      // Call backend to check followers count
      const verifyEndpoint = API_BASE ? `${API_BASE}/api/verify-followers` : `/api/verify-followers`;
      
      console.log('[FOLLOWERS-VERIFY] Verifying followers count. Required:', minFollowers);

      const verifyResp = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          minFollowers: parseInt(minFollowers, 10)
        })
      });

      // Parse JSON with error handling
      let verifyJson;
      try {
        verifyJson = await verifyResp.json();
      } catch (jsonErr) {
        console.error('Failed to parse followers verification response as JSON:', jsonErr);
        alert('Failed to verify followers. Please ensure backend is running.');
        setIsVerifyingFollowers(false);
        setActiveFollowersRuleId(null);
        return;
      }

      setIsVerifyingFollowers(false);

      if (!verifyResp.ok || !verifyJson.success) {
        console.error('Followers verification failed:', verifyJson);
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: verifyJson.error || 'Failed to verify followers. Please try again.',
          details: { tweetId: '', author: '' },
        });
        setActiveFollowersRuleId(null);
        return;
      }

      const { verified, followersCount, minFollowersRequired } = verifyJson.data;

      if (verified) {
        // Mark task as completed in localStorage immediately
        const storageKey = `completed-tasks-${campaignId}-${address}`;
        const stored = localStorage.getItem(storageKey);
        const completedTasksList = stored ? JSON.parse(stored) : [];
        if (!completedTasksList.includes(ruleId)) {
          completedTasksList.push(ruleId);
          localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
          console.log('[COMPLETED-TASKS] Followers task saved to localStorage:', completedTasksList);
        }

        // Update UI state immediately
        const newCompleted = new Set<string>(completedTasksList as string[]);
        setCompletedTasks(newCompleted);

        // Save to database (non-blocking)
        try {
          const saveResp = await fetch('/api/campaign/task-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId,
              userAddress: address,
              ruleId: ruleId,
              ruleType: 'MIN_FOLLOWERS',
              verificationData: {
                minFollowersRequired: minFollowersRequired,
                actualFollowers: followersCount,
                verified: true,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (saveResp.ok) {
            console.log('[TASK-COMPLETION] Followers task saved to database');
          }
        } catch (saveErr) {
          console.warn('Error saving followers task to database:', saveErr);
        }

        setVerificationModal({
          isOpen: true,
          isSuccess: true,
          message: `Great! You have ${followersCount} followers, which meets the minimum requirement of ${minFollowersRequired}. Your task is now complete.`,
          details: { tweetId: `${followersCount}`, author: '' },
        });
        setActiveFollowersRuleId(null);
        await fetchCampaignData();
      } else {
        setVerificationModal({
          isOpen: true,
          isSuccess: false,
          message: `You have ${followersCount} followers, but need at least ${minFollowersRequired} followers to complete this task.`,
          details: { tweetId: '', author: '' },
        });
        setActiveFollowersRuleId(null);
      }

    } catch (error) {
      console.error('Error verifying followers:', error);
      setVerificationModal({
        isOpen: true,
        isSuccess: false,
        message: 'An error occurred during followers verification: ' + (error instanceof Error ? error.message : 'Unknown error'),
        details: { tweetId: '', author: '' },
      });
      setIsVerifyingFollowers(false);
      setActiveFollowersRuleId(null);
    }
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
                          const isValidationActive = activeValidationRuleId === rule.id;

                          return (
                            <div key={rule.id} className={`flex flex-col gap-4 ${index < campaignData.rules.length - 1 ? 'pb-4 border-b border-[#2A3441]' : ''}`}>
                              <div className="flex items-start gap-4">
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

                                  <div className="flex flex-wrap gap-3">
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

                                    {/* Verify Button for specific rule types */}
                                    {(rule.ruleType === 'COMMENT' || rule.ruleType === 'RETWEET' || rule.ruleType === 'LIKE') && (
                                      <button
                                        onClick={() => handleOpenValidation(rule.id)}
                                        disabled={completedTasks.has(rule.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                          completedTasks.has(rule.id)
                                            ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                                            : isValidationActive
                                            ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                                            : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                                        }`}
                                      >
                                        {completedTasks.has(rule.id) ? '✓ Completed' : isValidationActive ? 'Cancel Verification' : 'Verify Task'}
                                      </button>
                                    )}

                                    {/* Verify Button for FOLLOW_TWITTER */}
                                    {rule.ruleType === 'FOLLOW_TWITTER' && (
                                      <button
                                        onClick={() => {
                                          const handle = rule.ruleValue.startsWith('@') ? rule.ruleValue.slice(1) : rule.ruleValue;
                                          handleVerifyFollow(rule.id, handle);
                                        }}
                                        disabled={completedTasks.has(rule.id) || isVerifyingFollow}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                          completedTasks.has(rule.id)
                                            ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                                            : isVerifyingFollow && activeFollowRuleId === rule.id
                                            ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                                            : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                                        }`}
                                      >
                                        {completedTasks.has(rule.id) 
                                          ? '✓ Completed' 
                                          : isVerifyingFollow && activeFollowRuleId === rule.id
                                          ? 'Verifying...'
                                          : 'Verify Follow'
                                        }
                                      </button>
                                    )}

                                    {/* Verify Button for MIN_FOLLOWERS */}
                                    {rule.ruleType === 'MIN_FOLLOWERS' && (
                                      <button
                                        onClick={() => handleVerifyFollowers(rule.id, rule.ruleValue)}
                                        disabled={completedTasks.has(rule.id) || isVerifyingFollowers}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                                          completedTasks.has(rule.id)
                                            ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                                            : isVerifyingFollowers && activeFollowersRuleId === rule.id
                                            ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                                            : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                                        }`}
                                      >
                                        {completedTasks.has(rule.id) 
                                          ? '✓ Completed' 
                                          : isVerifyingFollowers && activeFollowersRuleId === rule.id
                                          ? 'Checking...'
                                          : 'Verify Followers'
                                        }
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Validation Form */}
                              {isValidationActive && (
                                <div className="ml-12 mt-2 p-4 bg-[#1A1F2E] border border-[#2A3441] rounded-lg animate-fadeIn">
                                  <h5 className="text-white text-sm font-semibold mb-3">Submit Verification Link</h5>
                                  <div className="flex flex-col gap-3">
                                    <input
                                      type="text"
                                      value={validationLink}
                                      onChange={(e) => setValidationLink(e.target.value)}
                                      placeholder={`Paste your ${rule.ruleType.toLowerCase()} link here...`}
                                      className="w-full px-4 py-2 bg-[#0A0E14] border border-[#2A3441] rounded-lg text-white text-sm focus:outline-none focus:border-[#3AE8FF] transition-colors"
                                    />
                                    <div className="flex justify-end gap-3">
                                      <button
                                        onClick={() => handleOpenValidation(rule.id)}
                                        className="px-4 py-2 text-sm text-[#B8C2CC] hover:text-white transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSubmitValidation(rule.id, rule.ruleType)}
                                        disabled={isSubmittingValidation || !validationLink}
                                        className={`px-4 py-2 bg-[#3AE8FF] text-[#0A0E14] text-sm font-bold rounded-lg transition-opacity ${isSubmittingValidation || !validationLink ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                                          }`}
                                      >
                                        {isSubmittingValidation ? 'Verifying...' : 'Submit Link'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
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
              <div className="flex justify-between items-center pt-6 border-t border-[#2A3441]">
                <div>
                  {hasJoined && campaignData && campaignData.rules && campaignData.rules.length > 0 && (
                    <div className="text-sm text-[#B8C2CC]">
                      <span>Completed: </span>
                      <span className="font-bold text-[#3AE8FF]">
                        {completedTasks.size}
                      </span>
                      <span> / </span>
                      <span className="font-bold text-[#3AE8FF]">
                        {campaignData.rules.filter(r => r.isRequired).length}
                      </span>
                      <span> required tasks</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {hasJoined && campaignData && campaignData.rules && campaignData.rules.length > 0 && (
                    <button
                      onClick={handleClaimReward}
                      disabled={isClaimingReward || !areAllRequiredTasksCompleted() || hasClaimedReward}
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        hasClaimedReward
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                          : areAllRequiredTasksCompleted()
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg shadow-green-500/50'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {hasClaimedReward ? '✅ Already Claimed' : isClaimingReward ? 'Claiming...' : '💰 Claim Reward'}
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/app')}
                    className="px-6 py-3 border border-[#2A3441] text-[#B8C2CC] rounded-lg hover:border-[#00D9FF] hover:text-white transition-colors"
                  >
                    Back to Campaigns
                  </button>
                </div>
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

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        isSuccess={verificationModal.isSuccess}
        message={verificationModal.message}
        details={verificationModal.details}
        onClose={() => {
          setVerificationModal({ ...verificationModal, isOpen: false });
        }}
      />
    </div>
  );
}
