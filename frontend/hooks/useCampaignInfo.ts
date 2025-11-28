'use client';

import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { goBuzzAbi } from '@/abis/goBuzzAbi';

export interface CampaignInfo {
  name: string;
  start: bigint;
  end: bigint;
  totalPool: bigint;
  claimed: bigint;
  remaining: bigint;
  rewardAmount: bigint;
  isActive: boolean;
}

export function useCampaignInfo(campaignAddress?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: campaignAddress,
    abi: goBuzzAbi,
    functionName: 'getCampaignInfo',
    chainId: baseSepolia.id,
  });

  const campaignInfo = data
    ? {
        name: data[0],
        start: data[1],
        end: data[2],
        totalPool: data[3],
        claimed: data[4],
        remaining: data[5],
        rewardAmount: data[6],
        isActive: data[7],
      }
    : undefined;

  return {
    campaignInfo: campaignInfo as CampaignInfo | undefined,
    isLoading,
    refetch,
  };
}
