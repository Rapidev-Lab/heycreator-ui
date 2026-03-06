'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { syncEmailVerification } from '@/lib/firebase/auth-actions';
import { useAuth } from '@/lib/firebase/auth-context';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import PrimaryButton from '@/components/auth/PrimaryButton';

/**
 * Firebase Email Action Handler
 *
 * This page handles Firebase email actions including:
 * - Email verification (mode=verifyEmail)
 * - Password reset (mode=resetPassword)
 * - Email change (mode=recoverEmail)
 *
 * URL format: /auth/action?mode=verifyEmail&oobCode=ABC123&apiKey=...
 */
function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('Redirecting...');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setMessage('Invalid verification link. Please try again.');
      return;
    }

    // Handle email verification
    if (mode === 'verifyEmail') {
      handleEmailVerification(oobCode);
    }
    // Handle password reset
    else if (mode === 'resetPassword') {
      router.push(`/auth/reset-password?oobCode=${oobCode}`);
    }
    // Handle email recovery
    else if (mode === 'recoverEmail') {
      handleEmailRecovery(oobCode);
    }
    else {
      setStatus('error');
      setMessage('Unknown action mode.');
    }
  }, [mode, oobCode]);

  const handleEmailVerification = async (code: string) => {
    try {
      // Apply the verification code
      await applyActionCode(auth, code);

      // Get the current user to check their role
      const currentUser = auth.currentUser;

      // Reload Firebase user so emailVerified flag is up-to-date
      if (currentUser) {
        await currentUser.reload();
        // Sync emailVerified = true to Firestore
        await syncEmailVerification(currentUser.uid, true);
        // Update auth context so guards see the new emailVerified state
        await refreshUserProfile();
      }

      setStatus('success');
      setMessage('Your email has been verified successfully!');

      // Store email in sessionStorage for the email-verified page
      if (currentUser && currentUser.email) {
        sessionStorage.setItem('signupEmail', currentUser.email);
      }

      // Determine redirect based on user's role
      let redirectUrl = '/'; // Default to home

      if (currentUser) {
        try {
          // Fetch user document from Firestore to get their role
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData?.role;

            // Redirect based on role — go to complete-profile, not login
            if (userRole === 'brand') {
              redirectUrl = '/auth/brand/complete-profile';
              setRedirectMessage('Redirecting to complete your profile...');
            } else if (userRole === 'influencer') {
              redirectUrl = '/auth/influencer/complete-profile';
              setRedirectMessage('Redirecting to complete your profile...');
            }
          }
        } catch (fetchError) {
          console.error('Error fetching user role:', fetchError);
          // If we can't get role, default to home page
        }
      }

      // Check for custom continueUrl parameter (takes precedence)
      const continueUrl = searchParams.get('continueUrl');
      if (continueUrl) {
        redirectUrl = continueUrl;
        setRedirectMessage('Redirecting...');
      }

      // Auto-redirect to appropriate login after 1.5 seconds
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    } catch (error: any) {
      console.error('Error verifying email:', error);

      if (error.code === 'auth/invalid-action-code') {
        setMessage('This verification link is invalid or has already been used.');
      } else if (error.code === 'auth/expired-action-code') {
        setMessage('This verification link has expired. Please request a new one.');
      } else {
        setMessage('Failed to verify email. Please try again.');
      }

      setStatus('error');
    }
  };

  const handleEmailRecovery = async (code: string) => {
    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage('Your email has been recovered successfully!');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to recover email. Please contact support.');
    }
  };

  const handleReturnToLogin = () => {
    router.push('/');
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="text-center mb-8 flex-col" />

        <AuthCard>
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-16 h-16 text-[#00A8CC] animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <p className="text-sm text-gray-500">
                  {redirectMessage}
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <PrimaryButton onClick={handleReturnToLogin} className="w-full">
                  Return to Login
                </PrimaryButton>
              </>
            )}
          </div>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

// Wrap in Suspense boundary (required for useSearchParams)
export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <Logo size="lg" className="text-center mb-8 flex-col" />
          <AuthCard>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-[#00A8CC] animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Loading...
              </h2>
              <p className="text-gray-600">
                Please wait while we process your request.
              </p>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    }>
      <AuthActionContent />
    </Suspense>
  );
}
