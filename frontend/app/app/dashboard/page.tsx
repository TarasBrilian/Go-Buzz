'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/app');
    }
  }, [isConnected, mounted, router]);

  // Mock data - replace with real data from your backend
  const userStats = {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalEarnings: '2.45',
    totalComments: 47,
    verifiedComments: 42,
    pendingRewards: '0.35',
  };

  const connectedSocialMedia = [
    { name: 'Twitter', connected: true, username: '@user123' },
    { name: 'Instagram', connected: false, username: '' },
    { name: 'TikTok', connected: false, username: '' },
  ];

  const recentActivity = [
    { id: 1, action: 'Comment verified', campaign: 'Summer Campaign 2024', date: '2024-01-15', reward: '0.05' },
    { id: 2, action: 'Reward claimed', campaign: 'Product Launch Buzz', date: '2024-01-14', reward: '0.12' },
    { id: 3, action: 'Comment submitted', campaign: 'Brand Awareness', date: '2024-01-13', reward: '0.08' },
    { id: 4, action: 'Comment verified', campaign: 'Holiday Special', date: '2024-01-12', reward: '0.06' },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (!mounted || !isConnected) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{background: '#0A0E14'}}>
      {/* Animated Canvas Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="planet planet-2" />
        <div className="nebula nebula-1" />
        <div className="grid-overlay" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="holo-border inline-block mb-4">
              <div className="scan-line" />
              <h1 className="hologram-text text-4xl md:text-5xl font-bold px-6 py-3">
                User Dashboard
              </h1>
            </div>
            <p className="text-[#B8C2CC] text-lg">
              Track your activity and manage your profile
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3AE8FF] to-[#7CD2FF] p-1">
                      <div className="w-full h-full rounded-full bg-[#0F1419] flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3AE8FF]/20 to-[#7CD2FF]/20 flex items-center justify-center">
                          <svg className="w-12 h-12 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#3AE8FF] rounded-full border-4 border-[#0F1419] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">Buzzer User</h2>
                  <p className="text-[#B8C2CC] text-sm font-mono mb-4">Active Member</p>
                </div>

                {/* Wallet Address */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#3AE8FF] rounded-full" />
                    <span className="text-[#B8C2CC] text-xs uppercase tracking-wider">Wallet Address</span>
                  </div>
                  <div className="bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg p-3">
                    <p className="text-white font-mono text-sm break-all">
                      {address && formatAddress(address)}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button className="w-full glass-button-secondary text-sm py-2">
                    <span className="relative z-10">Edit Profile</span>
                  </button>
                  <Link href="/app" className="block">
                    <button className="w-full glass-button text-sm py-2">
                      <span className="relative z-10">View Campaigns</span>
                      <div className="button-glow" />
                    </button>
                  </Link>
                </div>

                <div className="card-pulse" />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Total Earnings */}
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#B8C2CC] text-sm mb-2">Total Earnings</p>
                    <h3 className="text-3xl font-bold text-white">{userStats.totalEarnings} ETH</h3>
                  </div>
                  <div className="w-12 h-12 bg-[#3AE8FF]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#3AE8FF] text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+15% from last month</span>
                </div>
                <div className="card-pulse" />
              </div>

              {/* Pending Rewards */}
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#B8C2CC] text-sm mb-2">Pending Rewards</p>
                    <h3 className="text-3xl font-bold text-white">{userStats.pendingRewards} ETH</h3>
                  </div>
                  <div className="w-12 h-12 bg-[#7CD2FF]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7CD2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-sm font-medium hover:bg-[#3AE8FF]/20 transition-colors">
                  Claim Rewards
                </button>
                <div className="card-pulse" />
              </div>

              {/* Active Campaigns */}
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#B8C2CC] text-sm mb-2">Active Campaigns</p>
                    <h3 className="text-3xl font-bold text-white">{userStats.activeCampaigns}</h3>
                  </div>
                  <div className="w-12 h-12 bg-[#3AE8FF]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#3AE8FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-[#B8C2CC] text-sm">
                  Out of {userStats.totalCampaigns} total participated
                </p>
                <div className="card-pulse" />
              </div>

              {/* Verified Comments */}
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#B8C2CC] text-sm mb-2">Verified Comments</p>
                    <h3 className="text-3xl font-bold text-white">{userStats.verifiedComments}/{userStats.totalComments}</h3>
                  </div>
                  <div className="w-12 h-12 bg-[#7CD2FF]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#7CD2FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="w-full bg-[#1A1F2E]/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#3AE8FF] to-[#7CD2FF] h-full rounded-full"
                    style={{ width: `${(userStats.verifiedComments / userStats.totalComments) * 100}%` }}
                  />
                </div>
                <div className="card-pulse" />
              </div>
            </div>
          </div>

          {/* Social Media Connections */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#3AE8FF] to-[#7CD2FF]" />
              Connected Social Media
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {connectedSocialMedia.map((social) => (
                <div key={social.name} className="feature-card p-6">
                  <div className="card-corner card-corner-tl" />
                  <div className="card-corner card-corner-tr" />
                  <div className="card-corner card-corner-bl" />
                  <div className="card-corner card-corner-br" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        social.connected ? 'bg-[#3AE8FF]/10' : 'bg-[#B8C2CC]/10'
                      }`}>
                        <svg className={`w-6 h-6 ${social.connected ? 'text-[#3AE8FF]' : 'text-[#B8C2CC]'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{social.name}</h3>
                        {social.connected && (
                          <p className="text-[#3AE8FF] text-sm">{social.username}</p>
                        )}
                      </div>
                    </div>
                    {social.connected ? (
                      <div className="px-3 py-1 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-xs font-medium">
                        Connected
                      </div>
                    ) : (
                      <button className="px-3 py-1 bg-[#B8C2CC]/10 border border-[#B8C2CC]/30 rounded text-[#B8C2CC] text-xs font-medium hover:bg-[#B8C2CC]/20 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                  <div className="card-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#3AE8FF] to-[#7CD2FF]" />
              Recent Activity
            </h2>
            <div className="holo-panel">
              <div className="hex-pattern" />
              <div className="relative z-10 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A3441]">
                      <th className="text-left py-4 px-4 text-[#B8C2CC] text-sm font-medium uppercase tracking-wider">Action</th>
                      <th className="text-left py-4 px-4 text-[#B8C2CC] text-sm font-medium uppercase tracking-wider">Campaign</th>
                      <th className="text-left py-4 px-4 text-[#B8C2CC] text-sm font-medium uppercase tracking-wider">Date</th>
                      <th className="text-right py-4 px-4 text-[#B8C2CC] text-sm font-medium uppercase tracking-wider">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} className="border-b border-[#2A3441]/50 hover:bg-[#1A1F2E]/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#3AE8FF] rounded-full" />
                            <span className="text-white font-medium">{activity.action}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#B8C2CC]">{activity.campaign}</td>
                        <td className="py-4 px-4 text-[#B8C2CC] font-mono text-sm">{activity.date}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-[#3AE8FF] font-semibold">{activity.reward} ETH</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
