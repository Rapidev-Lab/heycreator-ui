"use client";

import React, { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { auth } from '@/lib/firebase/config';
import { verifyPasswordResetCode } from 'firebase/auth';

function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function determineRoleAndRedirect() {
      if (!oobCode) {
        setError("Invalid password reset link. No code provided.");
        return;
      }

      try {
        // First, verify the code on the client to get the email
        const email = await verifyPasswordResetCode(auth, oobCode);

        // Now, get the role from our backend using the email
        const response = await fetch('/api/auth/get-user-role-by-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to determine user role.');
        }

        const { role } = await response.json();

        if (role === 'brand') {
          router.replace(`/auth/brand/reset-password?oobCode=${oobCode}`);
        } else if (role === 'influencer') {
          router.replace(`/auth/influencer/reset-password?oobCode=${oobCode}`);
        } else {
          throw new Error('Could not determine user role.');
        }
      } catch (err: any) {
        console.error('Error in password reset redirect:', err);
        setError(err.message || 'An unknown error occurred. The link may be invalid or expired.');
      }
    }

    determineRoleAndRedirect();
  }, [oobCode, router]);

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-8" />
        <AuthCard>
          {error ? (
            <ErrorMessage message={error} />
          ) : (
            <LoadingSpinner message="Verifying your link..." />
          )}
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

export default function UniversalResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <Logo size="lg" className="justify-center mb-8" />
          <AuthCard>
            <LoadingSpinner message="Loading..." />
          </AuthCard>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordRedirect />
    </Suspense>
  );
}
