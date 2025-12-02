import { useState } from 'react';
import { CampaignRule } from '@/types/campaign';

interface TaskRulesProps {
  rules: CampaignRule[];
  completedTasks: Set<string>;
  onVerifyComment: (ruleId: string, url: string) => void;
  onVerifyFollow: (ruleId: string, handle: string) => void;
  onVerifyFollowers: (ruleId: string, minFollowers: string) => void;
  isVerifyingComment: boolean;
  isVerifyingFollow: boolean;
  isVerifyingFollowers: boolean;
  activeRuleId: string | null;
  setActiveRuleId: (ruleId: string | null) => void;
}

export const TaskRules: React.FC<TaskRulesProps> = ({
  rules,
  completedTasks,
  onVerifyComment,
  onVerifyFollow,
  onVerifyFollowers,
  isVerifyingComment,
  isVerifyingFollow,
  isVerifyingFollowers,
  activeRuleId,
  setActiveRuleId,
}) => {
  const [validationLink, setValidationLink] = useState('');
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);

  const handleSubmitValidation = async (ruleId: string, ruleType: string) => {
    if (!validationLink.trim()) {
      alert('Please enter the verification link');
      return;
    }

    if ((ruleType === 'COMMENT' || ruleType === 'RETWEET' || ruleType === 'LIKE') &&
      (!validationLink.includes('x.com') && !validationLink.includes('twitter.com'))) {
      alert('Please enter a valid X (Twitter) link');
      return;
    }

    setIsSubmittingValidation(true);
    onVerifyComment(ruleId, validationLink);
    setValidationLink('');
    setActiveRuleId(null);
    setIsSubmittingValidation(false);
  };

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div key={rule.id} className="bg-[#0A0E14]/50 border border-[#2A3441] rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">{rule.description}</h4>
              <p className="text-sm text-[#B8C2CC]">Type: {rule.ruleType}</p>
              {rule.ruleValue && <p className="text-sm text-[#3AE8FF]">Value: {rule.ruleValue}</p>}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              rule.isRequired
                ? 'bg-red-500/20 border border-red-500 text-red-400'
                : 'bg-gray-500/20 border border-gray-500 text-gray-400'
            }`}>
              {rule.isRequired ? 'Required' : 'Optional'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* COMMENT, RETWEET, LIKE buttons - need URL input */}
            {['COMMENT', 'RETWEET', 'LIKE'].includes(rule.ruleType) && (
              <>
                <button
                  onClick={() => {
                    if (activeRuleId === rule.id) {
                      setActiveRuleId(null);
                      setValidationLink('');
                    } else {
                      setActiveRuleId(rule.id);
                      setValidationLink('');
                    }
                  }}
                  disabled={completedTasks.has(rule.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    completedTasks.has(rule.id)
                      ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                      : activeRuleId === rule.id
                      ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                      : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                  }`}
                >
                  {completedTasks.has(rule.id) ? '✓ Completed' : activeRuleId === rule.id ? 'Cancel Verification' : 'Verify Task'}
                </button>

                {activeRuleId === rule.id && (
                  <div className="w-full flex gap-2">
                    <input
                      type="text"
                      placeholder={`Enter ${rule.ruleType.toLowerCase()} link...`}
                      value={validationLink}
                      onChange={(e) => setValidationLink(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#8A94A6] text-sm focus:outline-none focus:border-[#3AE8FF]"
                    />
                    <button
                      onClick={() => handleSubmitValidation(rule.id, rule.ruleType)}
                      disabled={isSubmittingValidation || !validationLink}
                      className="px-4 py-2 bg-[#3AE8FF] text-[#0A0E14] text-sm font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </>
            )}

            {/* FOLLOW_TWITTER button */}
            {rule.ruleType === 'FOLLOW_TWITTER' && (
              <button
                onClick={() => {
                  const handle = rule.ruleValue.startsWith('@') ? rule.ruleValue.slice(1) : rule.ruleValue;
                  onVerifyFollow(rule.id, handle);
                }}
                disabled={completedTasks.has(rule.id) || isVerifyingFollow}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  completedTasks.has(rule.id)
                    ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                    : isVerifyingFollow
                    ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                    : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                }`}
              >
                {completedTasks.has(rule.id) 
                  ? '✓ Completed' 
                  : isVerifyingFollow
                  ? 'Verifying...'
                  : 'Verify Follow'
                }
              </button>
            )}

            {/* MIN_FOLLOWERS button */}
            {rule.ruleType === 'MIN_FOLLOWERS' && (
              <button
                onClick={() => onVerifyFollowers(rule.id, rule.ruleValue)}
                disabled={completedTasks.has(rule.id) || isVerifyingFollowers}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  completedTasks.has(rule.id)
                    ? 'bg-green-500/20 border-green-500 text-green-400 cursor-not-allowed'
                    : isVerifyingFollowers
                    ? 'bg-[#3AE8FF]/20 border-[#3AE8FF] text-[#3AE8FF]'
                    : 'bg-transparent border-[#2A3441] text-[#B8C2CC] hover:border-[#3AE8FF] hover:text-white'
                }`}
              >
                {completedTasks.has(rule.id) 
                  ? '✓ Completed' 
                  : isVerifyingFollowers
                  ? 'Checking...'
                  : 'Verify Followers'
                }
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Verification Note */}
      <div className="mt-6 p-4 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded-lg">
        <p className="text-[#3AE8FF] text-sm">
          <strong>Note:</strong> After completing all tasks, your participation will be verified using zero-knowledge proof technology.
          Make sure all tasks are completed genuinely and follow the campaign guidelines to claim your reward.
        </p>
      </div>
    </div>
  );
};
