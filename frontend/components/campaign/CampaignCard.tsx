import React from 'react';
import { useRouter } from 'next/navigation';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  platform: string;
  reward: number;
  participants: number;
  endDate: string;
  status: 'Active' | 'Ending Soon' | 'Completed';
}

interface CampaignCardProps {
  campaign: Campaign;
  onJoin?: (campaignId: number) => void;
  isDisabled?: boolean;
}

export default function CampaignCard({ campaign, onJoin, isDisabled = false }: CampaignCardProps) {
  const router = useRouter();

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDisabled && onJoin) {
      onJoin(campaign.id);
    }
  };

  const handleCardClick = () => {
    if (!isDisabled) {
      router.push(`/app/campaign/${campaign.id}`);
    }
  };

  return (
    <div
      className={`campaign-card group ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleCardClick}
    >
      <div className="campaign-card-border" />

      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Campaign Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-[#3AE8FF] transition-colors">
              {campaign.title}
            </h3>
            <Badge variant={campaign.status === 'Ending Soon' ? 'ending' : campaign.status === 'Active' ? 'active' : 'completed'}>
              {campaign.status}
            </Badge>
          </div>
          <p className="text-[#B8C2CC] text-sm mb-3 line-clamp-2">
            {campaign.description}
          </p>

          {/* Campaign Meta */}
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-[#B8C2CC] font-mono">{campaign.platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-[#B8C2CC] font-mono">{campaign.participants} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[#B8C2CC] font-mono">Ends {campaign.endDate}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Reward & Action */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-xs text-[#B8C2CC] font-mono mb-1">REWARD POOL</div>
            <div className="text-2xl font-bold text-[#3AE8FF]">${campaign.reward}</div>
          </div>
          <button
            onClick={handleJoin}
            className="campaign-join-button"
            disabled={isDisabled}
          >
            <span className="relative z-10">
              {isDisabled ? 'Unavailable' : 'View Details'}
            </span>
            <div className="campaign-join-glow" />
          </button>
        </div>
      </div>
    </div>
  );
}
