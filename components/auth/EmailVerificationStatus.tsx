'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import PrimaryButton from './PrimaryButton';
import OutlineButton from './OutlineButton';

interface EmailVerificationStatusProps {
  email: string;
  userRole: 'influencer' | 'brand';
  onVerified: () => void;
  className?: string;
}

export default function EmailVerificationStatus({
  email,
  userRole,
  onVerified,
  className = '',
}: EmailVerificationStatusProps) {
  const { checkEmailVerified, resendVerification, emailVerified } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60); // Countdown for resend button
  const [canResend, setCanResend] = useState(true);

  // Poll for email verification every 5 seconds
  useEffect(() => {
    if (emailVerified) {
      onVerified();
      return;
    }

    const interval = setInterval(async () => {
      setIsChecking(true);
      const verified = await checkEmailVerified();
      setIsChecking(false);

      if (verified) {
        onVerified();
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [emailVerified, checkEmailVerified, onVerified]);

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

  const handleResendEmail = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await resendVerification();
      setResendSuccess(true);
      setCanResend(false);
      setCountdown(60);

      // Hide success message after 5 seconds
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Verification Status Card */}
      <div className="bg-[#EEEDED] rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-[#00A8CC] rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Verify Your Email
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-sm font-medium text-gray-900 mb-3">{email}</p>
            <p className="text-sm text-gray-600">
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>
        </div>

        {/* Checking Status */}
        {isChecking && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking verification status...</span>
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Verification email sent successfully! Please check your inbox.
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

        {/* Resend Button */}
        <OutlineButton
          onClick={handleResendEmail}
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
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Didn&apos;t receive the email?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Check your spam or junk folder</li>
          <li>Make sure the email address is correct: {email}</li>
          <li>Wait a few minutes and try resending</li>
          <li>Contact support if the issue persists</li>
        </ul>
      </div>

      {/* Auto-check indicator */}
      <p className="text-xs text-center text-gray-500">
        We&apos;re automatically checking for verification every 5 seconds.
        Once verified, you&apos;ll be redirected automatically.
      </p>
    </div>
  );
}
