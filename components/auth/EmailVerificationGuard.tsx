'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import LoadingSpinner from './LoadingSpinner';

/**
 * Email Verification Guard Component
 *
 * Wraps protected content and ensures user's email is verified before allowing access.
 * If email is not verified, redirects to the appropriate verification page based on role.
 *
 * Usage:
 * ```tsx
 * <EmailVerificationGuard>
 *   <YourProtectedContent />
 * </EmailVerificationGuard>
 * ```
 *
 * Features:
 * - Blocks access if email verification is required but not completed
 * - Allows social login users (auto-verified) to pass through
 * - Shows loading state while checking auth status
 * - Redirects to role-specific verification page
 */
interface EmailVerificationGuardProps {
  children: React.ReactNode;
  /**
   * If true, shows loading spinner while checking verification.
   * If false, renders children immediately (verification check happens in background).
   * Default: true
   */
  showLoading?: boolean;
}

export default function EmailVerificationGuard({
  children,
  showLoading = true,
}: EmailVerificationGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {
    firebaseUser,
    userProfile,
    loading,
    profileLoading,
    emailVerified,
    requiresVerification,
    isVerificationPending,
  } = useAuth();

  // Check if this is a shared link - bypass email verification redirect
  // Check both URL param and sessionStorage
  const sharedFromUrl = searchParams?.get('shared') === 'true';

  // Check all sources for shared link status
  const checkIsSharedLink = (currentPath: string): boolean => {
    if (sharedFromUrl) return true;
    if (typeof window === 'undefined') return false;

    // Check campaign-specific sessionStorage - ONLY for marketplace campaign pages
    const campaignIdMatch = currentPath.match(/\/marketplace\/([^/]+)/);
    if (campaignIdMatch) {
      const campaignId = campaignIdMatch[1];
      const sessionKey = `shared_campaign_${campaignId}`;
      if (sessionStorage.getItem(sessionKey) === 'true') {
        return true;
      }
    }
    return false;
  };

  const [isSharedLink, setIsSharedLink] = useState(() => checkIsSharedLink(pathname || ''));

  // Re-check on route changes (client-side navigation)
  useEffect(() => {
    const shared = checkIsSharedLink(pathname || '');
    setIsSharedLink(shared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sharedFromUrl]);

  useEffect(() => {
    // Skip email verification redirect for shared links
    if (isSharedLink) return;

    // Wait for auth and profile state to fully settle before making redirect decisions
    if (loading || profileLoading) return;

    // If no user and no profile, let ProfileCompletionGuard handle retries.
    // Only redirect if we're sure there's no Firebase user at all.
    if (!firebaseUser) {
      router.push('/');
      return;
    }

    // If profile hasn't loaded yet, don't redirect — ProfileCompletionGuard retries this
    if (!userProfile) return;

    // If verification is required and pending, redirect to role-specific login
    if (isVerificationPending) {
      const role = userProfile.role;

      if (role === 'influencer') {
        router.push('/auth/influencer/login');
      } else if (role === 'brand') {
        router.push('/auth/brand/login');
      } else {
        router.push('/');
      }
    }
  }, [loading, profileLoading, firebaseUser, userProfile, isVerificationPending, router, isSharedLink]);

  // Shared links bypass email verification requirement entirely
  if (isSharedLink) {
    return <>{children}</>;
  }

  // Show loading while auth or profile state is settling
  if (showLoading && (loading || profileLoading || !firebaseUser || !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          <LoadingSpinner message="Preparing profile..." />
        </div>
      </div>
    );
  }

  // Show loading if email verification is pending (redirect in flight)
  if (showLoading && isVerificationPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          <LoadingSpinner message="Checking email verification..." />
        </div>
      </div>
    );
  }

  // Verification complete or not required — render children
  if (!loading && !profileLoading && firebaseUser && userProfile && !isVerificationPending) {
    return <>{children}</>;
  }

  // Fallback while redirect fires
  return null;
}
