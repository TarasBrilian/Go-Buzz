'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TwitterConnectButton from '@/components/auth/TwitterConnectButton';

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

  // User stats state - will be fetched from backend/blockchain
  const [userStats, setUserStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEarnings: '0.00',
    totalContributions: 0,
    verifiedContributions: 0,
    pendingRewards: '0.00',
  });

  const [twitterUser, setTwitterUser] = useState<{ name: string; username: string } | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: number;
    action: string;
    campaign: string;
    date: string;
    reward: string;
  }>>([]);

  const handleTwitterAuthChange = (authenticated: boolean, user: any) => {
    if (authenticated && user) {
      setTwitterUser({
        name: user.name,
        username: user.username,
      });
    } else {
      setTwitterUser(null);
    }
  };

  // TODO: Fetch user stats from backend/blockchain
  useEffect(() => {
    if (mounted && isConnected && address) {
      // Fetch user stats here
      // Example:
      // fetchUserStats(address).then(setUserStats);
      // fetchRecentActivity(address).then(setRecentActivity);
    }
  }, [mounted, isConnected, address]);

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

                  <h2 className="text-xl font-bold text-white mb-2">Social Contributor</h2>
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

              {/* Verified Contributions */}
              <div className="feature-card p-6">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#B8C2CC] text-sm mb-2">Verified Contributions</p>
                    <h3 className="text-3xl font-bold text-white">{userStats.verifiedContributions}/{userStats.totalContributions}</h3>
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
                    style={{ width: `${(userStats.verifiedContributions / userStats.totalContributions) * 100}%` }}
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
            <div className="grid grid-cols-1 gap-6">
              {/* Twitter / X Connection */}
              <div className="feature-card p-6 relative">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="relative z-10">
                  <TwitterConnectButton onAuthChange={handleTwitterAuthChange} />
                </div>

                <div className="card-pulse" />
              </div>

              {/* Coming Soon - Other Social Media */}
              <div className="feature-card p-6 opacity-50">
                <div className="card-corner card-corner-tl" />
                <div className="card-corner card-corner-tr" />
                <div className="card-corner card-corner-bl" />
                <div className="card-corner card-corner-br" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#B8C2CC]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#B8C2CC]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Instagram</h3>
                      <p className="text-[#B8C2CC] text-sm">Coming Soon</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#B8C2CC]/10 border border-[#B8C2CC]/30 rounded text-[#B8C2CC] text-xs font-medium">
                    Soon
                  </div>
                </div>

                <div className="card-pulse" />
              </div>
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
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 px-4 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-[#B8C2CC]/10 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-[#B8C2CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-medium mb-1">No Activity Yet</p>
                              <p className="text-[#B8C2CC] text-sm">Start participating in campaigns to see your activity here</p>
                            </div>
                            <Link href="/app" className="mt-2">
                              <button className="px-4 py-2 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded-lg text-[#3AE8FF] text-sm font-medium hover:bg-[#3AE8FF]/20 transition-colors">
                                Explore Campaigns
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
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
