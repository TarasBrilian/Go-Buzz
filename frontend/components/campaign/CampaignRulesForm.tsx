import { useState } from 'react';
import { CampaignRule, RuleType } from './types';

interface CampaignRulesFormProps {
    rules: CampaignRule[];
    onAddRule: (rule: CampaignRule) => void;
    onRemoveRule: (id: string) => void;
}

export default function CampaignRulesForm({ rules, onAddRule, onRemoveRule }: CampaignRulesFormProps) {
    const [newRule, setNewRule] = useState({
        ruleType: 'FOLLOW_TWITTER' as RuleType,
        ruleValue: '',
        description: '',
        isRequired: true,
    });

    const handleAddRule = () => {
        if (!newRule.ruleValue || !newRule.description) {
            alert('Please fill in rule value and description');
            return;
        }

        const rule: CampaignRule = {
            id: Date.now().toString(),
            ...newRule,
        };

        onAddRule(rule);
        setNewRule({
            ruleType: 'FOLLOW_TWITTER',
            ruleValue: '',
            description: '',
            isRequired: true,
        });
    };

    const getRuleTypeLabel = (ruleType: RuleType) => {
        const labels: Record<RuleType, string> = {
            FOLLOW_TWITTER: 'Follow Twitter Account',
            RETWEET: 'Retweet',
            LIKE: 'Like Tweet',
            COMMENT: 'Comment on Tweet',
            MIN_FOLLOWERS: 'Minimum Followers',
        };
        return labels[ruleType];
    };

    return (
        <div className="border-t border-[#2A3441] pt-6">
            <h3 className="text-xl font-bold text-white mb-4">Campaign Rules</h3>
            <p className="text-sm text-[#B8C2CC] mb-6">
                Define validation rules that participants must follow to join and claim rewards
            </p>

            {/* Add New Rule Form */}
            <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-4 mb-4">
                <h4 className="text-white font-medium mb-3">Add New Rule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Rule Type */}
                    <div>
                        <label className="block text-[#B8C2CC] text-sm mb-2">Rule Type</label>
                        <select
                            value={newRule.ruleType}
                            onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value as RuleType })}
                            className="w-full px-3 py-2 bg-[#1A1F2E] border border-[#2A3441] rounded text-white text-sm focus:outline-none focus:border-[#00D9FF]"
                        >
                            <option value="FOLLOW_TWITTER">Follow Twitter Account</option>
                            <option value="RETWEET">Retweet</option>
                            <option value="LIKE">Like Tweet</option>
                            <option value="COMMENT">Comment on Tweet</option>
                            <option value="MIN_FOLLOWERS">Minimum Followers</option>
                        </select>
                    </div>

                    {/* Rule Value */}
                    <div>
                        <label className="block text-[#B8C2CC] text-sm mb-2">
                            Value {newRule.ruleType === 'FOLLOW_TWITTER' ? '(Twitter handle)' : newRule.ruleType === 'MIN_FOLLOWERS' ? '(number)' : '(Tweet URL)'}
                        </label>
                        <input
                            type={newRule.ruleType === 'MIN_FOLLOWERS' ? 'number' : 'text'}
                            value={newRule.ruleValue}
                            onChange={(e) => setNewRule({ ...newRule, ruleValue: e.target.value })}
                            placeholder={
                                newRule.ruleType === 'FOLLOW_TWITTER' ? '@username' :
                                    newRule.ruleType === 'MIN_FOLLOWERS' ? '1000' :
                                        'https://twitter.com/...'
                            }
                            className="w-full px-3 py-2 bg-[#1A1F2E] border border-[#2A3441] rounded text-white text-sm focus:outline-none focus:border-[#00D9FF]"
                        />
                    </div>
                </div>

                {/* Rule Description */}
                <div className="mb-4">
                    <label className="block text-[#B8C2CC] text-sm mb-2">Description</label>
                    <input
                        type="text"
                        value={newRule.description}
                        onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                        placeholder="e.g., Follow our official Twitter account @yourbrand"
                        className="w-full px-3 py-2 bg-[#1A1F2E] border border-[#2A3441] rounded text-white text-sm focus:outline-none focus:border-[#00D9FF]"
                    />
                </div>

                {/* Is Required Checkbox */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        id="isRequired"
                        checked={newRule.isRequired}
                        onChange={(e) => setNewRule({ ...newRule, isRequired: e.target.checked })}
                        className="w-4 h-4 text-[#3AE8FF] bg-[#1A1F2E] border-[#2A3441] rounded focus:ring-[#3AE8FF]"
                    />
                    <label htmlFor="isRequired" className="text-sm text-[#B8C2CC]">
                        Required (participants must complete this rule)
                    </label>
                </div>

                <button
                    type="button"
                    onClick={handleAddRule}
                    className="w-full px-4 py-2 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-sm font-medium hover:bg-[#3AE8FF]/20 transition-colors"
                >
                    + Add Rule
                </button>
            </div>

            {/* Rules List */}
            {rules.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-white font-medium mb-2">Campaign Rules ({rules.length})</h4>
                    {rules.map((rule, index) => (
                        <div key={rule.id} className="bg-[#1A1F2E]/30 border border-[#2A3441] rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[#3AE8FF] text-sm font-mono">#{index + 1}</span>
                                        <span className="px-2 py-1 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-xs font-medium">
                                            {getRuleTypeLabel(rule.ruleType)}
                                        </span>
                                        {rule.isRequired && (
                                            <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-xs font-medium">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white text-sm mb-1">{rule.description}</p>
                                    <p className="text-[#B8C2CC] text-xs font-mono">Value: {rule.ruleValue}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemoveRule(rule.id)}
                                    className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {rules.length === 0 && (
                <div className="text-center py-8 text-[#B8C2CC] text-sm">
                    No rules added yet. Add rules to validate participant actions.
                </div>
            )}
        </div>
    );
}
