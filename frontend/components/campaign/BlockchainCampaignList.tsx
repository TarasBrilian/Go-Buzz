'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { useCampaignInfo } from '@/hooks/useCampaignInfo';
import { Address, formatUnits } from 'viem';

interface CampaignCardProps {
  address: Address;
}

function CampaignCard({ address }: CampaignCardProps) {
  const { campaignInfo, isLoading } = useCampaignInfo(address);

  if (isLoading || !campaignInfo) {
    return (
      <div className="bg-[#1A1F2E] border border-[#2A3441] rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-[#2A3441] rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-[#2A3441] rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-[#2A3441] rounded w-1/3"></div>
      </div>
    );
  }

  const progress = Number(campaignInfo.claimed * BigInt(100) / campaignInfo.totalPool);
  const endDate = new Date(Number(campaignInfo.end) * 1000);
  const isExpired = Date.now() > endDate.getTime();
  const status = campaignInfo.isActive && !isExpired ? 'Active' : 'Expired';

  return (
    <div className="bg-[#1A1F2E] border border-[#2A3441] rounded-lg p-6 hover:border-[#00D9FF] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{campaignInfo.name}</h3>
          <p className="text-sm text-[#B8C2CC] font-mono">
            Contract: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          status === 'Active'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          {status}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C2CC]">Total Pool:</span>
          <span className="text-white font-bold">{formatUnits(campaignInfo.totalPool, 18)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C2CC]">Claimed:</span>
          <span className="text-white font-bold">{formatUnits(campaignInfo.claimed, 18)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C2CC]">Remaining:</span>
          <span className="text-[#00D9FF] font-bold">{formatUnits(campaignInfo.remaining, 18)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C2CC]">Reward/Claim:</span>
          <span className="text-white font-bold">{formatUnits(campaignInfo.rewardAmount, 18)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#B8C2CC]">End Date:</span>
          <span className="text-white">{endDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#B8C2CC] mb-1">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-[#2A3441] rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] h-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <a
        href={`/app/campaign/${address}`}
        className="block w-full text-center bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
      >
        View Details
      </a>
    </div>
  );
}

export default function BlockchainCampaignList() {
  const { campaigns, campaignCount, isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-[#B8C2CC] py-8">
          Loading campaigns from blockchain...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1A1F2E] border border-[#2A3441] rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-[#2A3441] rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-[#2A3441] rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-[#2A3441] rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#B8C2CC] mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-xl font-medium">No campaigns found</p>
          <p className="text-sm mt-2">Be the first to create a campaign!</p>
        </div>
        <a
          href="/app/create-campaign"
          className="inline-block bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
        >
          Create Campaign
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[#B8C2CC] text-sm font-mono">
            Total Campaigns: <span className="text-[#00D9FF] font-bold">{campaignCount?.toString()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((address) => (
          <CampaignCard key={address} address={address} />
        ))}
      </div>
    </div>
  );
}
