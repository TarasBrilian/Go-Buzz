import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { goBuzzAbi } from '@/abis/goBuzzAbi';

interface UseClaimRewardReturn {
  isClaimingReward: boolean;
  hasClaimedReward: boolean;
  claimError: string | null;
  handleClaimReward: () => void;
}

export const useClaimReward = (
  campaignAddress: string | undefined,
  userAddress: string | undefined,
  onSuccess: () => void,
): UseClaimRewardReturn => {
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const { writeContract, isPending: isWritePending, data: claimTxHash } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  // Handle claim transaction success
  useEffect(() => {
    if (isClaimSuccess && !isClaimConfirming) {
      setIsClaimingReward(false);
      setHasClaimedReward(true);
      setClaimError(null);
      onSuccess();
      console.log('[CLAIM] Reward claimed successfully');
    }
  }, [isClaimSuccess, isClaimConfirming, onSuccess]);

  // Handle claim transaction pending
  useEffect(() => {
    if (isWritePending) {
      setIsClaimingReward(true);
    }
  }, [isWritePending]);

  const handleClaimReward = () => {
    if (!userAddress || !campaignAddress) {
      setClaimError('Please connect your wallet first');
      return;
    }

    setIsClaimingReward(true);
    setClaimError(null);

    try {
      console.log('[CLAIM] Attempting to claim reward for:', {
        userAddress,
        campaignAddress,
      });

      writeContract({
        address: campaignAddress as `0x${string}`,
        abi: goBuzzAbi,
        functionName: 'claimReward',
      });
    } catch (error) {
      console.error('Error claiming reward:', error);
      setClaimError(error instanceof Error ? error.message : 'Failed to claim reward');
      setIsClaimingReward(false);
    }
  };

  return {
    isClaimingReward,
    hasClaimedReward,
    claimError,
    handleClaimReward,
  };
};
