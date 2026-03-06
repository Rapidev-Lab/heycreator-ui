'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import GoBackButton from '@/components/auth/GoBackButton';
import OTPInput from '@/components/auth/OTPInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { confirmPhoneVerificationCode } from '@/lib/firebase/auth-actions';
import { useAuth } from '@/lib/firebase/auth-context';
import { usePhoneAuth } from '@/lib/contexts/PhoneAuthContext';
import { UserRole } from '@/types/firebase';

function OTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, loading: authLoading, userProfile, redirectBasedOnRole } = useAuth();
  const { confirmationResult, setConfirmationResult } = usePhoneAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [role, setRole] = useState<UserRole>('influencer');

  useEffect(() => {
    // Get role from URL params or sessionStorage
    const roleParam = searchParams.get('role') as UserRole | null;
    const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('phoneAuthRole') as UserRole | null : null;
    const storedPhone = typeof window !== 'undefined' ? sessionStorage.getItem('phoneAuthNumber') : null;

    if (roleParam) {
      setRole(roleParam);
    } else if (storedRole) {
      setRole(storedRole);
    }

    if (storedPhone) {
      setPhoneNumber(storedPhone);
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    if (!confirmationResult) {
      setError('Could not find verification session. Please go back and try sending the code again.');
      return;
    }

    setLoading(true);
    try {
      // Use the role from state (passed from login page)
      const userCredential = await confirmPhoneVerificationCode(confirmationResult, otp, role);

      // Clear the confirmation result from context
      setConfirmationResult(null);

      // Clear session storage after successful verification
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('phoneAuthRole');
        sessionStorage.removeItem('phoneAuthNumber');
      }

      // Check if user needs to complete profile
      // Phone-only users will have auto-generated email and display name
      const user = userCredential.user;
      const needsProfileCompletion =
        !user.email ||
        user.email.includes('@phone.firebaseapp.com') ||
        !user.displayName ||
        user.displayName.startsWith('User-');

      if (needsProfileCompletion) {
        // Redirect to role-specific profile completion
        if (role === 'brand') {
          router.push('/auth/brand/complete-profile');
        } else {
          router.push('/auth/influencer/complete-profile');
        }
      } else {
        // Profile is complete, redirect to dashboard
        redirectBasedOnRole(role);
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-8" />

        <AuthCard>
          <GoBackButton
            href={role === 'brand' ? '/auth/brand/login' : '/auth/influencer/login'}
            className="mb-6"
          />

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter Verification Code
          </h2>
          <p className="text-gray-600 mb-6">
            {phoneNumber ? (
              <>Please enter the 6-digit code sent to <span className="font-semibold">{phoneNumber}</span></>
            ) : (
              'Please enter the 6-digit code sent to your phone number.'
            )}
          </p>

          {error && <ErrorMessage message={error} className="mb-4" />}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <OTPInput length={6} value={otp} onChange={setOtp} />
            </div>

            <PrimaryButton type="submit" loading={loading} disabled={otp.length !== 6}>
              Verify Code
            </PrimaryButton>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <Logo size="lg" className="justify-center mb-8" />
          <AuthCard>
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    }>
      <OTPContent />
    </Suspense>
  );
}