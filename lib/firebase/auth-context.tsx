'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { auth, db } from './config';
import { User, RoleProfile, InfluencerProfile, BrandProfile } from '@/types/firebase';
import { requiresEmailVerification, syncEmailVerification, getFriendlyErrorMessage } from './auth-actions';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';

// ===== AUTH CONTEXT TYPE =====

export interface AuthContextType {
  // Current Firebase auth user
  firebaseUser: FirebaseUser | null;

  // User profile from Firestore (includes role)
  userProfile: User | null;
  // Alias for compatibility
  user: User | null;

  // Role-specific profile (influencer or brand)
  roleProfile: RoleProfile | null;

  // Loading states
  loading: boolean;
  profileLoading: boolean;

  // Email verification status
  emailVerified: boolean;
  requiresVerification: boolean;
  isVerificationPending: boolean;

  // Profile completion
  profileCompletionPercentage: number;

  // Auth actions
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  // Alias for compatibility
  refreshUser: () => Promise<void>;

  // Email verification actions
  checkEmailVerified: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  redirectBasedOnRole: (role?: 'influencer' | 'brand') => void;

  // Error handling
  error: string | null;
  clearError: () => void;
}

// ===== CREATE CONTEXT =====

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== AUTH PROVIDER COMPONENT =====

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [roleProfile, setRoleProfile] = useState<RoleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Fetch role-specific profile (influencer or brand)
  const fetchRoleProfile = async (user: User): Promise<RoleProfile | null> => {
    try {
      if (user.role === 'influencer' && user.influencerProfileId) {
        const profileDoc = await getDoc(doc(db, 'influencer_profiles', user.influencerProfileId));

        if (profileDoc.exists()) {
          return profileDoc.data() as InfluencerProfile;
        }
      } else if (user.role === 'brand' && user.brandProfileId) {
        const profileDoc = await getDoc(doc(db, 'brand_profiles', user.brandProfileId));

        if (profileDoc.exists()) {
          return profileDoc.data() as BrandProfile;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching role profile:', error);
      return null;
    }
  };

  // Generation counter to prevent stale loadUserData responses from overwriting newer data.
  // When signInWithGoogle triggers onAuthStateChanged BEFORE Firestore docs are created,
  // the stale fetch (returning null) can arrive after refreshUserProfile's good fetch,
  // overwriting userProfile back to null and causing an infinite loading spinner.
  const loadGenRef = useRef(0);

  // Load complete user data (user profile + role profile)
  const loadUserData = async (firebaseUser: FirebaseUser) => {
    const currentGen = ++loadGenRef.current;
    setProfileLoading(true);

    try {
      // Fetch user profile first
      const profile = await fetchUserProfile(firebaseUser.uid);

      // If a newer loadUserData call was started, discard this stale result
      if (currentGen !== loadGenRef.current) return;

      setUserProfile(profile);

      // Fetch role profile before marking loading as done
      if (profile) {
        const roleProf = await fetchRoleProfile(profile);
        if (currentGen !== loadGenRef.current) return;
        setRoleProfile(roleProf);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      // Only clear loading if this is still the latest request
      if (currentGen === loadGenRef.current) {
        setProfileLoading(false);
      }
    }
  };

  // Refresh user profile (useful after updates)
  // Uses auth.currentUser as fallback because callers (e.g. handleSocialAuth)
  // may hold a stale closure where firebaseUser is still null — this happens
  // when signInWithPopup resolves and the login page calls refreshUserProfile
  // before React re-renders with the new firebaseUser from onAuthStateChanged.
  const refreshUserProfile = async () => {
    const currentUser = firebaseUser || auth.currentUser;
    if (currentUser) {
      // Reload Firebase user to get latest emailVerified status
      await currentUser.reload();
      setEmailVerified(currentUser.emailVerified);
      // Ensure React state is also up-to-date
      if (!firebaseUser) {
        setFirebaseUser(currentUser);
      }
      await loadUserData(currentUser);
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setRoleProfile(null);
      setEmailVerified(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Check if email is verified
  const checkEmailVerified = async (): Promise<boolean> => {
    if (!firebaseUser) return false;

    try {
      // Call API to check verification status via Admin SDK
      const response = await fetch('/api/auth/check-email-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: firebaseUser.uid }),
      });

      const data = await response.json();

      if (data.success && data.emailVerified) {
        // Sync to Firestore
        await syncEmailVerification(firebaseUser.uid, true);

        // Refresh user data
        await refreshUserProfile();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    if (!firebaseUser) {
      setError('No user logged in');
      throw new Error('No user logged in');
    }

    try {
      // Use client-side sendEmailVerification to actually send the email
      await sendEmailVerification(firebaseUser);

      // Success - no error to set
      console.log('Verification email sent successfully to:', firebaseUser.email);
    } catch (error: any) {
      console.error('Error resending verification:', error);
      const errorMessage = getFriendlyErrorMessage(error);
      setError(errorMessage);
      throw error; // Re-throw so the UI component can handle it
    }
  };

  // Redirect based on user role
  const redirectBasedOnRole = (role?: 'influencer' | 'brand') => {
    // Check for stored redirect URL first (from shared campaign links)
    const storedRedirect = sessionStorage.getItem("authRedirect");
    if (storedRedirect) {
      sessionStorage.removeItem("authRedirect");
      router.push(storedRedirect);
      return;
    }

    // Defensive check: if both parameter and DB role exist and conflict, use DB role
    if (role && userProfile?.role && role !== userProfile.role) {
      console.warn(
        `redirectBasedOnRole: requested role "${role}" does not match DB role "${userProfile.role}". Using DB role.`
      );
      const actualRole = userProfile.role;
      router.push(actualRole === 'brand' ? '/brands/dashboard' : '/influencers');
      return;
    }

    const userRole = role || userProfile?.role;

    if (userRole === 'influencer') {
      router.push('/influencers');
    } else if (userRole === 'brand') {
      router.push('/brands/dashboard');
    } else {
      router.push('/');
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // User is signed in, load their profile data
        setEmailVerified(user.emailVerified);
        await loadUserData(user);
      } else {
        // User is signed out, clear profile data
        setUserProfile(null);
        setRoleProfile(null);
        setEmailVerified(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Computed values
  const requiresVerification = firebaseUser ? requiresEmailVerification(firebaseUser) : false;
  const isVerificationPending = firebaseUser !== null && requiresVerification && !emailVerified;

  // Calculate profile completion synchronously during render (not in useEffect)
  // so guards always see the current value, not the initial 0
  const profileCompletionPercentage = useMemo(() => {
    if (userProfile && !profileLoading) {
      return calculateProfileCompletion(userProfile, roleProfile);
    }
    return 0;
  }, [userProfile, roleProfile, profileLoading]);

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    user: userProfile, // Alias
    roleProfile,
    loading,
    profileLoading,
    emailVerified,
    requiresVerification,
    isVerificationPending,
    profileCompletionPercentage,
    signOut,
    refreshUserProfile,
    refreshUser: refreshUserProfile, // Alias
    checkEmailVerified,
    resendVerification,
    redirectBasedOnRole,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===== CUSTOM HOOK =====

/**
 * Custom hook to access auth context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ===== CONVENIENCE HOOKS =====

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { firebaseUser } = useAuth();
  return firebaseUser !== null;
}

/**
 * Hook to get user role
 */
export function useUserRole(): 'influencer' | 'brand' | null {
  const { userProfile } = useAuth();
  return userProfile?.role || null;
}

/**
 * Hook to check if user is an influencer
 */
export function useIsInfluencer(): boolean {
  const role = useUserRole();
  return role === 'influencer';
}

/**
 * Hook to check if user is a brand
 */
export function useIsBrand(): boolean {
  const role = useUserRole();
  return role === 'brand';
}
