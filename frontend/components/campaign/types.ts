export type RuleType = 'FOLLOW_TWITTER' | 'RETWEET' | 'LIKE' | 'COMMENT' | 'MIN_FOLLOWERS';

export interface CampaignRule {
    id: string;
    ruleType: RuleType;
    ruleValue: string;
    description: string;
    isRequired: boolean;
    order?: number;
}
