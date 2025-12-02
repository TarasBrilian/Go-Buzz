import { useState, useCallback } from 'react';

const API_BASE = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_BASE_URL as string) || '' : '';

interface VerificationModalState {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  details: { tweetId: string; author: string };
}

export const useVerificationModal = () => {
  const [verificationModal, setVerificationModal] = useState<VerificationModalState>({
    isOpen: false,
    isSuccess: false,
    message: '',
    details: { tweetId: '', author: '' },
  });

  const showSuccess = useCallback((message: string) => {
    setVerificationModal({
      isOpen: true,
      isSuccess: true,
      message,
      details: { tweetId: '', author: '' },
    });
  }, []);

  const showError = useCallback((message: string) => {
    setVerificationModal({
      isOpen: true,
      isSuccess: false,
      message,
      details: { tweetId: '', author: '' },
    });
  }, []);

  const close = useCallback(() => {
    setVerificationModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    verificationModal,
    setVerificationModal,
    showSuccess,
    showError,
    close,
  };
};

interface VerifyCommentParams {
  campaignId: number;
  address: string | undefined;
  ruleId: string;
  tweetUrl: string;
  onSuccess: (ruleId: string) => void;
  onError: (message: string) => void;
}

export const useVerifyComment = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyComment = useCallback(async ({
    campaignId,
    address,
    ruleId,
    tweetUrl,
    onSuccess,
    onError,
  }: VerifyCommentParams) => {
    if (!address) {
      onError('Please connect your wallet');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE}/api/verify-comment-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          tweetUrl,
          campaignId,
          ruleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        onError(errorData.error || 'Verification failed');
        return;
      }

      const verifyJson = await response.json();

      if (!verifyJson.data?.verified) {
        onError(verifyJson.error || 'Failed to verify comment. Invalid URL format or server error.');
        return;
      }

      // Save to localStorage and database
      const storageKey = `completed-tasks-${campaignId}-${address}`;
      const stored = localStorage.getItem(storageKey);
      const completedTasksList = stored ? JSON.parse(stored) : [];
      
      if (!completedTasksList.includes(ruleId)) {
        completedTasksList.push(ruleId);
        localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
        
        // Also save to database
        await fetch(`${API_BASE}/api/task-completion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            userAddress: address,
            ruleId,
            proof: JSON.stringify({ tweetUrl, verified: true }),
          }),
        }).catch(err => console.error('Failed to save task completion:', err));
      }

      onSuccess(ruleId);
    } catch (error) {
      console.error('Error verifying comment:', error);
      onError('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, verifyComment };
};

interface VerifyFollowParams {
  campaignId: number;
  address: string | undefined;
  ruleId: string;
  twitterHandle: string;
  onSuccess: (ruleId: string) => void;
  onError: (message: string) => void;
}

export const useVerifyFollow = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFollow = useCallback(async ({
    campaignId,
    address,
    ruleId,
    twitterHandle,
    onSuccess,
    onError,
  }: VerifyFollowParams) => {
    if (!address) {
      onError('Please connect your wallet');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE}/api/verify-follow-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          twitterHandle,
          campaignId,
          ruleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        onError(errorData.error || 'Follow verification failed');
        return;
      }

      const verifyJson = await response.json();

      if (!verifyJson.data?.verified) {
        onError(verifyJson.error || 'You are not following this account');
        return;
      }

      // Save to localStorage and database
      const storageKey = `completed-tasks-${campaignId}-${address}`;
      const stored = localStorage.getItem(storageKey);
      const completedTasksList = stored ? JSON.parse(stored) : [];
      
      if (!completedTasksList.includes(ruleId)) {
        completedTasksList.push(ruleId);
        localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
        
        await fetch(`${API_BASE}/api/task-completion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            userAddress: address,
            ruleId,
            proof: JSON.stringify({ twitterHandle, verified: true }),
          }),
        }).catch(err => console.error('Failed to save task completion:', err));
      }

      onSuccess(ruleId);
    } catch (error) {
      console.error('Error verifying follow:', error);
      onError('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, verifyFollow };
};

interface VerifyFollowersParams {
  campaignId: number;
  address: string | undefined;
  ruleId: string;
  minFollowers: string;
  onSuccess: (ruleId: string, followerCount: number) => void;
  onError: (message: string) => void;
}

export const useVerifyFollowers = () => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyFollowers = useCallback(async ({
    campaignId,
    address,
    ruleId,
    minFollowers,
    onSuccess,
    onError,
  }: VerifyFollowersParams) => {
    if (!address) {
      onError('Please connect your wallet');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE}/api/verify-followers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          minFollowers: parseInt(minFollowers),
          campaignId,
          ruleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        onError(errorData.error || 'Follower verification failed');
        return;
      }

      const verifyJson = await response.json();

      if (!verifyJson.data?.verified) {
        onError(`You need at least ${minFollowers} followers. Current: ${verifyJson.data?.followerCount || 'unknown'}`);
        return;
      }

      // Save to localStorage and database
      const storageKey = `completed-tasks-${campaignId}-${address}`;
      const stored = localStorage.getItem(storageKey);
      const completedTasksList = stored ? JSON.parse(stored) : [];
      
      if (!completedTasksList.includes(ruleId)) {
        completedTasksList.push(ruleId);
        localStorage.setItem(storageKey, JSON.stringify(completedTasksList));
        
        await fetch(`${API_BASE}/api/task-completion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            userAddress: address,
            ruleId,
            proof: JSON.stringify({ followerCount: verifyJson.data?.followerCount, verified: true }),
          }),
        }).catch(err => console.error('Failed to save task completion:', err));
      }

      onSuccess(ruleId, verifyJson.data?.followerCount || 0);
    } catch (error) {
      console.error('Error verifying followers:', error);
      onError('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, verifyFollowers };
};
