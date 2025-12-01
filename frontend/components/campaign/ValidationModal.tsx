'use client';

import { useRouter } from 'next/navigation';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  isWalletConnected: boolean;
  // isTwitterAuthorized: boolean;
}

export default function ValidationModal({
  isOpen,
  onClose,
  errors,
  isWalletConnected,
  // isTwitterAuthorized,
}: ValidationModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToDashboard = () => {
    onClose();
    router.push('/app/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#0F1419] border border-[#2A3441] rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#B8C2CC] hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Action Required</h2>
          <p className="text-[#B8C2CC] text-sm">
            Please complete the following steps to join this campaign
          </p>
        </div>

        {/* Requirements List */}
        <div className="space-y-3 mb-6">
          {/* Wallet Connection */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isWalletConnected
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isWalletConnected ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isWalletConnected ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isWalletConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isWalletConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
              </p>
              {!isWalletConnected && (
                <p className="text-xs text-[#B8C2CC] mt-1">
                  Click "Connect" button on the header to connect your wallet
                </p>
              )}
            </div>
          </div>

          {/* Twitter Authorization */}
          {/* <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isTwitterAuthorized
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isTwitterAuthorized ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isTwitterAuthorized ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            {/* <div className="flex-1">
              <p className={`text-sm font-medium ${
                isTwitterAuthorized ? 'text-green-400' : 'text-red-400'
              }`}>
                {isTwitterAuthorized ? 'X Account Authorized' : 'Authorize X (Twitter) Account'}
              </p>
              {!isTwitterAuthorized && (
                <p className="text-xs text-[#B8C2CC] mt-1">
                  Go to Dashboard to authorize your X account
                </p>
              )}
            </div> */}
          {/* </div> */}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* {!isTwitterAuthorized && (
            <button
              onClick={handleGoToDashboard}
              className="w-full px-4 py-3 bg-[#3AE8FF] hover:bg-[#3AE8FF]/80 border border-[#3AE8FF] rounded-lg text-white font-medium transition-colors"
            >
              Go to Dashboard
            </button>
          )} */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#1A1F2E] hover:bg-[#1A1F2E]/80 border border-[#2A3441] rounded-lg text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-[#2A3441]">
          <p className="text-[#B8C2CC] text-xs text-center">
            You need to complete both steps to participate in campaigns
          </p>
        </div>
      </div>
    </div>
  );
}
