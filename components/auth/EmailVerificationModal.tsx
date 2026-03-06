'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import OutlineButton from './OutlineButton';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onResendVerification: () => Promise<void>;
  className?: string;
}

export default function EmailVerificationModal({
  isOpen,
  email,
  onClose,
  onResendVerification,
  className = '',
}: EmailVerificationModalProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(true);

  // Countdown timer for resend button
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
      setCountdown(60);
    }
  }, [countdown, canResend]);

  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await onResendVerification();
      setResendSuccess(true);
      setCanResend(false);
      setCountdown(60);

      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative ${className}`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#00A8CC] rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Email Not Verified
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 mb-6">
            Please verify your email address before logging in. We sent a verification link to:
          </p>

          {/* Email Display */}
          <div className="bg-[#EEEDED] rounded-lg p-4 mb-6">
            <p className="text-center font-medium text-gray-900">{email}</p>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Verification email sent! Please check your inbox.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              How to verify:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return to this page and log in</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <OutlineButton
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              loading={resendLoading}
              className="w-full"
            >
              {canResend ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              ) : (
                <>Resend in {countdown}s</>
              )}
            </OutlineButton>

            <PrimaryButton onClick={onClose} className="w-full" variant="secondary">
              Got It
            </PrimaryButton>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Need help? Contact support if you&apos;re having trouble verifying your email.
          </p>
        </div>
      </div>
    </>
  );
}
