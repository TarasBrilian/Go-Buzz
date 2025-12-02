'use client';

import React from 'react';
import { Button } from './ui';

interface VerificationModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  details?: {
    tweetId?: string;
    author?: string;
  };
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  isSuccess,
  message,
  details,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-center text-2xl font-bold mb-4 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
          {isSuccess ? 'Verification Successful!' : 'Verification Failed'}
        </h2>

        {/* Message */}
        <p className="text-center text-slate-300 mb-4">{message}</p>

        {/* Details */}
        {isSuccess && details && (
          <div className="bg-slate-700 rounded-lg p-4 mb-6 space-y-2">
            {details.tweetId && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Tweet ID:</span>
                <span className="text-sm font-mono text-slate-200">{details.tweetId}</span>
              </div>
            )}
            {details.author && (
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Author:</span>
                <span className="text-sm font-semibold text-slate-200">@{details.author}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isSuccess ? (
            <Button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              Continue
            </Button>
          ) : (
            <>
              <Button
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Close
              </Button>
            </>
          )}
        </div>

        {/* Footer Note */}
        {isSuccess && (
          <p className="text-center text-xs text-slate-500 mt-4">
            Your task will be marked as completed shortly.
          </p>
        )}
      </div>
    </div>
  );
};
