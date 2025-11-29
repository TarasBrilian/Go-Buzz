'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterAuthProps {
  onAuthChange?: (authenticated: boolean, user: TwitterUser | null) => void;
}

export default function TwitterAuth({ onAuthChange }: TwitterAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check for OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const twitterConnected = params.get('twitter_connected');
    const twitterError = params.get('error');

    if (twitterConnected === 'true') {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('twitter_connected');
      url.searchParams.delete('twitter_user');
      url.searchParams.delete('twitter_name');
      window.history.replaceState({}, '', url.toString());

      // Refresh auth status
      checkAuthStatus();
    }

    if (twitterError) {
      setError(`Authentication failed: ${twitterError}`);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/twitter/user');
      const data = await response.json();

      setIsAuthenticated(data.authenticated);
      setUser(data.user);

      if (onAuthChange) {
        onAuthChange(data.authenticated, data.user);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setError(null);
    window.location.href = '/api/auth/twitter/login';
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/twitter/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        if (onAuthChange) {
          onAuthChange(false, null);
        }
      }
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg">
        <div className="w-5 h-5 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#B8C2CC] text-sm">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#1A1F2E]/50 border border-[#2A3441] rounded-lg">
          {user.profile_image_url && (
            <img
              src={user.profile_image_url}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">{user.name}</span>
            <span className="text-[#B8C2CC] text-xs">@{user.username}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          Disconnect X
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {/* <button
        onClick={handleLogin}
        className="flex items-center gap-3 px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] border border-[#1DA1F2] rounded-lg text-white font-medium transition-all group"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Connect with X</span>
      </button> */}
      <p className="text-[#B8C2CC] text-xs text-center">
        Connect your X (Twitter) account to participate in campaigns
      </p>
    </div>
  );
}
