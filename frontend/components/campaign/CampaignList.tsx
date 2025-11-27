import React from 'react';
import CampaignCard, { Campaign } from './CampaignCard';

interface CampaignListProps {
  campaigns: Campaign[];
  onJoinCampaign?: (campaignId: number) => void;
  isDisabled?: boolean;
}

export default function CampaignList({ campaigns, onJoinCampaign, isDisabled = false }: CampaignListProps) {
  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onJoin={onJoinCampaign}
          isDisabled={isDisabled}
        />
      ))}
    </div>
  );
}
