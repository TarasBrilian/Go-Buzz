'use client';

import { useState, useEffect } from 'react';

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterConnectButtonProps {
  onAuthChange?: (authenticated: boolean, user: TwitterUser | null) => void;
}

export default function TwitterConnectButton({ onAuthChange }: TwitterConnectButtonProps) {
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
    const errorDetails = params.get('details');

    if (twitterConnected === 'true') {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('twitter_connected');
      window.history.replaceState({}, '', url.toString());

      // Refresh auth status
      checkAuthStatus();
    }

    if (twitterError) {
      const errorMessage = errorDetails
        ? `Authentication failed: ${twitterError} - ${errorDetails}`
        : `Authentication failed: ${twitterError}`;
      setError(errorMessage);

      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('details');
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
    console.log('Twitter login button clicked');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#B8C2CC]/10 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#B8C2CC] border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="text-white font-semibold">X (Twitter)</h3>
            <p className="text-[#B8C2CC] text-sm">Checking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3AE8FF]/10 rounded-lg flex items-center justify-center overflow-hidden">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-6 h-6 text-[#3AE8FF]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">X (Twitter)</h3>
            <p className="text-[#3AE8FF] text-sm">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="px-3 py-1 bg-[#3AE8FF]/10 border border-[#3AE8FF]/30 rounded text-[#3AE8FF] text-xs font-medium">
            Authorized
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#B8C2CC]/10 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-[#B8C2CC]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold">X (Twitter)</h3>
          <p className="text-[#B8C2CC] text-sm">Not connected</p>
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="relative z-10 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] border border-[#1DA1F2] rounded-lg text-white text-sm font-medium transition-colors cursor-pointer"
      >
        Authorize X
      </button>
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs z-20">
          {error}
        </div>
      )}
    </div>
  );
}
