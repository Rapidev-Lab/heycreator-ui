'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

/**
 * Higher-Order Component to protect routes
 * Redirects to login if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireRole?: 'influencer' | 'brand';
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { firebaseUser, userProfile, loading } = useAuth();

    useEffect(() => {
      if (!loading) {
        // Not authenticated - redirect to login
        if (!firebaseUser) {
          const redirectUrl = options?.redirectTo || '/';
          router.push(redirectUrl);
          return;
        }

        // Check role requirement
        if (options?.requireRole && userProfile?.role !== options.requireRole) {
          // Wrong role - redirect based on actual role
          if (userProfile?.role === 'influencer') {
            router.push('/influencers');
          } else if (userProfile?.role === 'brand') {
            router.push('/brands/dashboard');
          } else {
            router.push('/');
          }
        }
      }
    }, [firebaseUser, userProfile, loading, router]);

    // Show loading state while checking auth
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Not authenticated
    if (!firebaseUser) {
      return null;
    }

    // Wrong role
    if (options?.requireRole && userProfile?.role !== options.requireRole) {
      return null;
    }

    // Authenticated and correct role - render component
    return <Component {...props} />;
  };
}

/**
 * HOC to protect influencer-only routes
 */
export function withInfluencerAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, {
    requireRole: 'influencer',
    redirectTo: '/auth/influencer/login',
  });
}

/**
 * HOC to protect brand-only routes
 */
export function withBrandAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return withAuth(Component, {
    requireRole: 'brand',
    redirectTo: '/auth/brand/login',
  });
}
