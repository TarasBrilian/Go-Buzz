'use client';

import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { goBuzzFactoryAbi } from '@/abis/goBuzzFactoryAbi';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export function useCampaigns() {
  // Get all campaigns
  const { data: campaigns, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: goBuzzFactoryAbi,
    functionName: 'getCampaigns',
    chainId: baseSepolia.id,
  });

  // Get campaign count
  const { data: campaignCount } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: goBuzzFactoryAbi,
    functionName: 'getCampaignCount',
    chainId: baseSepolia.id,
  });

  return {
    campaigns: campaigns as Address[] | undefined,
    campaignCount: campaignCount as bigint | undefined,
    isLoading,
    refetch,
  };
}

export function useUserCampaigns(userAddress?: Address) {
  const { data: userCampaigns, isLoading, refetch } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: goBuzzFactoryAbi,
    functionName: 'getUserCampaigns',
    args: userAddress ? [userAddress] : undefined,
    chainId: baseSepolia.id,
  });

  return {
    campaigns: userCampaigns as Address[] | undefined,
    isLoading,
    refetch,
  };
}
