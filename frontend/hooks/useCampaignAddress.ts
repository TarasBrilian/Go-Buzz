'use client';

import { useReadContract } from 'wagmi';
import { Address } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { goBuzzFactoryAbi } from '@/abis/goBuzzFactoryAbi';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

/**
 * Hook to get campaign address by campaign ID (array index)
 */
export function useCampaignAddress(campaignId?: number) {
    const { data: campaignAddress, isLoading, refetch } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: goBuzzFactoryAbi,
        functionName: 'campaigns',
        args: campaignId !== undefined ? [BigInt(campaignId)] : undefined,
        chainId: baseSepolia.id,
    });

    return {
        campaignAddress: campaignAddress as Address | undefined,
        isLoading,
        refetch,
    };
}
