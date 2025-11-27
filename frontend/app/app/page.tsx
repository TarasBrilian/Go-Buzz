'use client';

import { useState } from 'react';
import {
  AppHeader,
  NavigationTabs,
  SpaceBackground,
  Panel,
  CampaignList,
  Pagination,
  StatusIndicator,
  type Tab,
} from '@/components';
import { EXPLORE_CAMPAIGNS, PASS_CAMPAIGNS } from '@/lib/campaignData';

const TABS: Tab[] = [
  { id: 'explore', label: 'Explore Campaign' },
  { id: 'pass', label: 'Pass Campaign' },
  { id: 'create', label: 'Create Campaign' },
];

export default function AppPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('explore');
  const itemsPerPage = 10;

  // Form state for Create Campaign
  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    platform: 'Instagram',
    participants: '',
    endDate: '',
    initialReward: '',
    maxClaim: '',
  });

  // Get campaigns based on active tab
  const activeCampaigns = activeTab === 'explore' ? EXPLORE_CAMPAIGNS : PASS_CAMPAIGNS;

  const totalPages = Math.ceil(activeCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = activeCampaigns.slice(startIndex, endIndex);

  const handleJoinCampaign = (campaignId: number) => {
    console.log('Joining campaign:', campaignId);
    // Implement join campaign logic here
  };

  const handleConnect = () => {
    console.log('Connect wallet');
    // Implement wallet connection logic here
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating campaign:', formData);
    // Implement create campaign logic here
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0A0E14' }}>
      {/* Background Elements */}
      <SpaceBackground variant="app" />

      {/* Main Container */}
      <div className="relative z-10">
        {/* Header */}
        <AppHeader onConnectClick={handleConnect} />

        {/* Navigation Bar */}
        <NavigationTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1); // Reset to first page when switching tabs
          }}
        />

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-12">
          <Panel>
            {activeTab === 'create' ? (
              /* Create Campaign Form */
              <div className="space-y-6">
                {/* Form Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Campaign</h2>
                  <p className="text-[#B8C2CC] text-sm font-mono">
                    Fill in the details below to launch your campaign
                  </p>
                </div>

                {/* Campaign Form */}
                <form onSubmit={handleCreateCampaign} className="space-y-6">
                  {/* Campaign Name */}
                  <div>
                    <label htmlFor="campaignName" className="block text-white font-medium mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      id="campaignName"
                      name="campaignName"
                      value={formData.campaignName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-white font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors resize-none"
                      placeholder="Describe your campaign objectives and requirements"
                      required
                    />
                  </div>

                  {/* Platform */}
                  <div>
                    <label htmlFor="platform" className="block text-white font-medium mb-2">
                      Platform
                    </label>
                    <select
                      id="platform"
                      name="platform"
                      value={formData.platform}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                      required
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Twitter">Twitter</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="YouTube">YouTube</option>
                    </select>
                  </div>

                  {/* Grid Layout for Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Max Participants */}
                    <div>
                      <label htmlFor="participants" className="block text-white font-medium mb-2">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        id="participants"
                        name="participants"
                        value={formData.participants}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="1000"
                        min="1"
                        required
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label htmlFor="endDate" className="block text-white font-medium mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white focus:outline-none focus:border-[#00D9FF] transition-colors"
                        required
                      />
                    </div>

                    {/* Initial Reward */}
                    <div>
                      <label htmlFor="initialReward" className="block text-white font-medium mb-2">
                        Initial Reward (Tokens)
                      </label>
                      <input
                        type="number"
                        id="initialReward"
                        name="initialReward"
                        value={formData.initialReward}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="150"
                        min="1"
                        required
                      />
                    </div>

                    {/* Max Claim */}
                    <div>
                      <label htmlFor="maxClaim" className="block text-white font-medium mb-2">
                        Max Claim Per User
                      </label>
                      <input
                        type="number"
                        id="maxClaim"
                        name="maxClaim"
                        value={formData.maxClaim}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg text-white placeholder-[#B8C2CC] focus:outline-none focus:border-[#00D9FF] transition-colors"
                        placeholder="5"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#00D9FF] to-[#7B61FF] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Create Campaign
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        campaignName: '',
                        description: '',
                        platform: 'Instagram',
                        participants: '',
                        endDate: '',
                        initialReward: '',
                        maxClaim: '',
                      })}
                      className="px-6 py-3 border border-[#2A3441] text-[#B8C2CC] rounded-lg hover:border-[#00D9FF] hover:text-white transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Campaign List */
              <div className="space-y-4">
                {/* Campaign Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {activeTab === 'explore' ? 'Explore Campaigns' : 'Pass Campaigns'}
                    </h2>
                    <p className="text-[#B8C2CC] text-sm font-mono">
                      Showing {startIndex + 1}-{Math.min(endIndex, activeCampaigns.length)} of {activeCampaigns.length} campaigns
                      {activeTab === 'pass' && (
                        <span className="ml-2 text-orange-400">• Expired Campaigns</span>
                      )}
                    </p>
                  </div>
                  <StatusIndicator
                    label={activeTab === 'explore' ? 'LIVE' : 'EXPIRED'}
                    variant={activeTab === 'explore' ? 'live' : 'expired'}
                  />
                </div>

                {/* Campaign Cards */}
                <CampaignList
                  campaigns={currentCampaigns}
                  onJoinCampaign={handleJoinCampaign}
                  isDisabled={activeTab === 'pass'}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Panel>
        </main>
      </div>
    </div>
  );
}
