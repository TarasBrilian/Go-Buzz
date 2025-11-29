import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface ValidationResult {
  isValid: boolean;
  isWalletConnected: boolean;
  isTwitterAuthorized: boolean;
  twitterUser: TwitterUser | null;
  walletAddress: string | undefined;
  errors: string[];
}

export function useUserValidation() {
  const { address, isConnected } = useAccount();
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null);
  const [isTwitterAuthorized, setIsTwitterAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTwitterAuth();
  }, []);

  const checkTwitterAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/twitter/user');
      const data = await response.json();

      setIsTwitterAuthorized(data.authenticated);
      setTwitterUser(data.user);
    } catch (error) {
      console.error('Error checking Twitter auth:', error);
      setIsTwitterAuthorized(false);
      setTwitterUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): ValidationResult => {
    const errors: string[] = [];

    if (!isConnected || !address) {
      errors.push('Please connect your wallet first');
    }

    if (!isTwitterAuthorized || !twitterUser) {
      errors.push('Please authorize your X (Twitter) account');
    }

    return {
      isValid: errors.length === 0,
      isWalletConnected: isConnected && !!address,
      isTwitterAuthorized,
      twitterUser,
      walletAddress: address,
      errors,
    };
  };

  const refreshTwitterAuth = () => {
    checkTwitterAuth();
  };

  return {
    validate,
    isLoading,
    isWalletConnected: isConnected && !!address,
    isTwitterAuthorized,
    twitterUser,
    walletAddress: address,
    refreshTwitterAuth,
  };
}
