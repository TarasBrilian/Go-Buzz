interface ClaimRewardButtonProps {
  isClaimingReward: boolean;
  hasClaimedReward: boolean;
  areTasksCompleted: boolean;
  onClaim: () => void;
}

export const ClaimRewardButton: React.FC<ClaimRewardButtonProps> = ({
  isClaimingReward,
  hasClaimedReward,
  areTasksCompleted,
  onClaim,
}) => {
  return (
    <button
      onClick={onClaim}
      disabled={isClaimingReward || !areTasksCompleted || hasClaimedReward}
      className={`px-6 py-3 rounded-lg font-bold transition-all ${
        hasClaimedReward
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
          : areTasksCompleted
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-lg shadow-green-500/50'
          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
      }`}
    >
      {hasClaimedReward ? '✅ Already Claimed' : isClaimingReward ? 'Claiming...' : '💰 Claim Reward'}
    </button>
  );
};
