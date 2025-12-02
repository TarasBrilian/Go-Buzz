export interface CampaignRule {
  id: string;
  ruleType: string;
  ruleValue: string;
  description: string;
  isRequired: boolean;
  order: number;
}

export interface CampaignData {
  id: string;
  campaignId: string;
  name: string;
  description: string | null;
  rules: CampaignRule[];
}
