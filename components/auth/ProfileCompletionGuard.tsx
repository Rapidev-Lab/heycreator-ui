'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { meetsMinimumCompletion } from '@/lib/utils/profile-completion';
import LoadingSpinner from './LoadingSpinner';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  showLoading?: boolean;
  strictMode?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export default function ProfileCompletionGuard({
  children,
  showLoading = true,
  strictMode = false,
}: ProfileCompletionGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {
    firebaseUser,
    userProfile,
    loading,
    profileLoading,
    profileCompletionPercentage,
    refreshUserProfile,
  } = useAuth();

  const [retryCount, setRetryCount] = useState(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if this is a shared link - bypass profile completion requirement
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

  // Retry logic: if auth finished loading but userProfile is still null
  // (race condition where onAuthStateChanged fetched before Firestore docs existed),
  // retry refreshUserProfile a few times to recover.
  useEffect(() => {
    if (loading || profileLoading) return;

    // Profile loaded successfully — reset retries
    if (firebaseUser && userProfile) {
      setRetryCount(0);
      return;
    }

    // Firebase user exists but Firestore profile is missing — retry
    if (firebaseUser && !userProfile && retryCount < MAX_RETRIES) {
      retryTimerRef.current = setTimeout(async () => {
        await refreshUserProfile();
        setRetryCount((prev) => prev + 1);
      }, RETRY_DELAY_MS);

      return () => {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      };
    }

    // Exhausted retries with no profile — redirect to login
    if (firebaseUser && !userProfile && retryCount >= MAX_RETRIES) {
      router.push('/');
    }
  }, [loading, profileLoading, firebaseUser, userProfile, retryCount, refreshUserProfile, router]);

  // Profile completion redirect (bypassed for shared links)
  useEffect(() => {
    // Skip profile completion check for shared links
    if (isSharedLink) return;

    if (loading || profileLoading) return;
    if (!firebaseUser || !userProfile) return;

    const meetsMinimum = meetsMinimumCompletion(profileCompletionPercentage);
    if (meetsMinimum) return;

    const hasSeenCompletionPage = typeof window !== 'undefined'
      ? sessionStorage.getItem('has_seen_profile_completion') === 'true'
      : false;

    const shouldRedirect = strictMode || !hasSeenCompletionPage;

    if (shouldRedirect) {
      if (!strictMode && typeof window !== 'undefined') {
        sessionStorage.setItem('has_seen_profile_completion', 'true');
      }

      const role = userProfile.role;
      if (role === 'influencer') {
        router.push('/auth/influencer/complete-profile');
      } else if (role === 'brand') {
        router.push('/auth/brand/complete-profile');
      }
    }
  }, [loading, profileLoading, firebaseUser, userProfile, profileCompletionPercentage, strictMode, router, isSharedLink]);

  // Show "Preparing profile" while auth is loading or retrying for missing profile
  if (showLoading && (loading || profileLoading || !firebaseUser || !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          <LoadingSpinner message="Preparing profile..." />
        </div>
      </div>
    );
  }

  // Check completion for current render
  const meetsMinimum = meetsMinimumCompletion(profileCompletionPercentage);
  const hasSeenCompletionPage = typeof window !== 'undefined'
    ? sessionStorage.getItem('has_seen_profile_completion') === 'true'
    : false;

  // Shared links bypass profile completion requirement entirely
  if (isSharedLink) {
    return <>{children}</>;
  }

  // Show preparing while redirect is in flight
  if (showLoading && !meetsMinimum && (strictMode || !hasSeenCompletionPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">
          <LoadingSpinner message="Preparing profile..." />
        </div>
      </div>
    );
  }

  // Profile is complete OR user has already seen completion page — render children
  if (!loading && !profileLoading && firebaseUser && userProfile) {
    if (meetsMinimum || (!strictMode && hasSeenCompletionPage)) {
      return <>{children}</>;
    }
  }

  // Fallback while redirect fires
  return null;
}
