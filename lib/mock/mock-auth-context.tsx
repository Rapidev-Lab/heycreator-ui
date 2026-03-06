'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext, AuthContextType } from '@/lib/firebase/auth-context';
import { User } from '@/types/firebase';

type MockRole = 'brand' | 'influencer';

const MOCK_USERS: Record<MockRole, User> = {
  brand: {
    uid: 'mock-brand-user-1',
    email: 'brand@demo.heycreator.com',
    role: 'brand',
    displayName: 'Demo Brand',
    photoURL: undefined,
    phoneNumber: undefined,
    emailVerified: true,
    authProviders: ['email'],
    profileCompleted: 85,
    brandProfileId: 'mock-brand-profile-1',
    signupComplete: true,
    isActive: true,
    isSuspended: false,
    createdAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    lastLoginAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  },
  influencer: {
    uid: 'mock-influencer-user-1',
    email: 'creator@demo.heycreator.com',
    role: 'influencer',
    displayName: 'Demo Creator',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoCreator',
    phoneNumber: undefined,
    emailVerified: true,
    authProviders: ['email'],
    profileCompleted: 90,
    influencerProfileId: 'mock-influencer-profile-1',
    signupComplete: true,
    isActive: true,
    isSuspended: false,
    createdAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    lastLoginAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { toDate: () => new Date(), toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
  },
};

function getMockRole(): MockRole {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('mock_user_role') as MockRole) || 'brand';
  }
  return 'brand';
}

/**
 * Creates a minimal fake FirebaseUser object that satisfies the parts of the
 * Firebase User interface actually used by the app (getIdToken, uid, email, etc.)
 */
function createMockFirebaseUser(role: MockRole): any {
  const user = MOCK_USERS[role];
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: true,
    displayName: user.displayName,
    photoURL: user.photoURL || null,
    phoneNumber: null,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    providerId: 'firebase',
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => `mock-token-${user.uid}`,
    getIdTokenResult: async () => ({
      token: `mock-token-${user.uid}`,
      claims: { role: user.role },
      authTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      issuedAtTime: new Date().toISOString(),
      signInProvider: 'custom',
      signInSecondFactor: null,
    }),
    reload: async () => {},
    toJSON: () => ({}),
  };
}

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<MockRole>('brand');

  useEffect(() => {
    setRole(getMockRole());
    // Brief loading state so guards/loading states render
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for storage events (role switch from MockDevToolbar)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'mock_user_role' && e.newValue) {
        setRole(e.newValue as MockRole);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const userProfile = MOCK_USERS[role];
  const firebaseUser = useMemo(() => createMockFirebaseUser(role), [role]);

  const signOut = useCallback(async () => {
    router.push('/');
  }, [router]);

  const refreshUserProfile = useCallback(async () => {}, []);

  const checkEmailVerified = useCallback(async () => true, []);

  const resendVerification = useCallback(async () => {}, []);

  const redirectBasedOnRole = useCallback(
    (r?: 'influencer' | 'brand') => {
      const effectiveRole = r || role;
      if (effectiveRole === 'brand') {
        router.push('/brands/dashboard');
      } else {
        router.push('/influencers');
      }
    },
    [role, router]
  );

  const clearError = useCallback(() => {}, []);

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    user: userProfile,
    roleProfile: null,
    loading,
    profileLoading: false,
    emailVerified: true,
    requiresVerification: false,
    isVerificationPending: false,
    profileCompletionPercentage: 85,
    signOut,
    refreshUserProfile,
    refreshUser: refreshUserProfile,
    checkEmailVerified,
    resendVerification,
    redirectBasedOnRole,
    error: null,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
