'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { UserRole } from '@/types/firebase';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protected Route Component
 *
 * Protects pages based on authentication and role-based access control.
 *
 * Features:
 * - Requires authentication (optional)
 * - Role-based access control (influencer/brand)
 * - Automatic redirection for unauthorized users
 * - Customizable loading and redirect behavior
 *
 * Usage:
 * ```tsx
 * // Require authentication (any role)
 * <ProtectedRoute>
 *   <SettingsPage />
 * </ProtectedRoute>
 *
 * // Influencer-only page
 * <ProtectedRoute allowedRoles={['influencer']}>
 *   <InfluencerDashboard />
 * </ProtectedRoute>
 *
 * // Brand-only page
 * <ProtectedRoute allowedRoles={['brand']}>
 *   <BrandDashboard />
 * </ProtectedRoute>
 *
 * // Optional auth (logged in users see different content)
 * <ProtectedRoute requireAuth={false}>
 *   <HomePage />
 * </ProtectedRoute>
 * ```
 */
interface ProtectedRouteProps {
  children: React.ReactNode;

  /**
   * If true, requires user to be authenticated.
   * If false, allows both authenticated and unauthenticated users.
   * Default: true
   */
  requireAuth?: boolean;

  /**
   * Array of allowed roles. If specified, only users with these roles can access.
   * If not specified, any authenticated user can access.
   * Example: ['influencer'] or ['brand'] or ['influencer', 'brand']
   */
  allowedRoles?: UserRole[];

  /**
   * Where to redirect if user is not authenticated.
   * Default: '/' (role selection page)
   */
  redirectTo?: string;

  /**
   * Where to redirect if user doesn't have required role.
   * Default: '/unauthorized'
   */
  unauthorizedRedirect?: string;

  /**
   * Component to show while checking authentication.
   * Default: LoadingSpinner
   */
  fallback?: React.ReactNode;

  /**
   * If true, shows fallback while loading.
   * If false, renders children immediately (check happens in background).
   * Default: true
   */
  showLoading?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = '/',
  unauthorizedRedirect = '/unauthorized',
  fallback,
  showLoading = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { firebaseUser, userProfile, loading } = useAuth();

  useEffect(() => {
    // Wait for auth state to load
    if (loading) return;

    // Check authentication requirement
    if (requireAuth && !firebaseUser) {
      console.log('[ProtectedRoute] User not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
      return;
    }

    // Check role-based access control
    if (allowedRoles && allowedRoles.length > 0) {
      if (!userProfile) {
        // User authenticated but profile not loaded yet
        console.log('[ProtectedRoute] User profile not loaded, waiting...');
        return;
      }

      const userRole = userProfile.role;
      const hasAccess = allowedRoles.includes(userRole);

      if (!hasAccess) {
        console.log(
          `[ProtectedRoute] Access denied. User role: ${userRole}, Required: ${allowedRoles.join(', ')}`
        );
        router.push(unauthorizedRedirect);
        return;
      }
    }

    // User has access
    console.log('[ProtectedRoute] Access granted');
  }, [loading, firebaseUser, userProfile, requireAuth, allowedRoles, router, redirectTo, unauthorizedRedirect]);

  // Show loading state
  if (showLoading && loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Checking access..." />
      </div>
    );
  }

  // Check if user should be redirected (don't render children during redirect)
  if (requireAuth && !firebaseUser) {
    return showLoading ? (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Redirecting..." />
      </div>
    ) : null;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userProfile) {
      // Profile not loaded yet
      return showLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner message="Loading profile..." />
        </div>
      ) : null;
    }

    const hasAccess = allowedRoles.includes(userProfile.role);
    if (!hasAccess) {
      return showLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner message="Access denied..." />
        </div>
      ) : null;
    }
  }

  // User has access, render children
  return <>{children}</>;
}
