interface CampaignProgressProps {
  completedCount: number;
  requiredCount: number;
}

export const CampaignProgress: React.FC<CampaignProgressProps> = ({
  completedCount,
  requiredCount,
}) => {
  return (
    <div className="text-sm text-[#B8C2CC]">
      <span>Completed: </span>
      <span className="font-bold text-[#3AE8FF]">{completedCount}</span>
      <span> / </span>
      <span className="font-bold text-[#3AE8FF]">{requiredCount}</span>
      <span> required tasks</span>
    </div>
  );
};
