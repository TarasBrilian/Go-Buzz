'use client';

import { useMemo } from 'react';

interface CampaignEstimatorProps {
  initialReward: string;
  rewardPerClaim: string;
  duration: string;
}

export function CampaignEstimator({ initialReward, rewardPerClaim, duration }: CampaignEstimatorProps) {
  const estimate = useMemo(() => {
    if (!initialReward || !rewardPerClaim || parseFloat(rewardPerClaim) === 0) {
      return null;
    }

    const total = parseFloat(initialReward);
    const perClaim = parseFloat(rewardPerClaim);
    const durationSeconds = parseInt(duration);

    const maxClaims = Math.floor(total / perClaim);

    // Konversi durasi ke format yang lebih mudah dibaca
    const getDurationString = (seconds: number) => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);

      if (days > 0) {
        return `${days} hari${hours > 0 ? ` ${hours} jam` : ''}`;
      } else if (hours > 0) {
        return `${hours} jam`;
      } else {
        return `${Math.floor(seconds / 60)} menit`;
      }
    };

    return {
      maxClaims,
      totalReward: total,
      rewardPerClaim: perClaim,
      durationString: getDurationString(durationSeconds),
    };
  }, [initialReward, rewardPerClaim, duration]);

  if (!estimate) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold mb-4 text-purple-900">Campaign Estimate</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Reward Pool</p>
          <p className="text-2xl font-bold text-gray-900">
            {estimate.totalReward.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">tokens</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Reward Per Claim</p>
          <p className="text-2xl font-bold text-gray-900">
            {estimate.rewardPerClaim.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">tokens</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Max Claims</p>
          <p className="text-2xl font-bold text-green-600">
            {estimate.maxClaims.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">claims tersedia</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Duration</p>
          <p className="text-2xl font-bold text-blue-600">
            {estimate.durationString}
          </p>
          <p className="text-xs text-gray-500">campaign duration</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Info:</span> Campaign ini akan mengalokasikan{' '}
          <span className="font-semibold text-purple-600">
            {estimate.totalReward.toLocaleString()} tokens
          </span>{' '}
          untuk maksimal{' '}
          <span className="font-semibold text-green-600">
            {estimate.maxClaims.toLocaleString()} claims
          </span>
          , dengan setiap user mendapatkan{' '}
          <span className="font-semibold text-blue-600">
            {estimate.rewardPerClaim.toLocaleString()} tokens
          </span>{' '}
          per claim.
        </p>
      </div>
    </div>
  );
}
