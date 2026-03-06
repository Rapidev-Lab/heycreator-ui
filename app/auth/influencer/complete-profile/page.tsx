'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { calculateProfileCompletion, getMissingFields, meetsMinimumCompletion } from '@/lib/utils/profile-completion';
import { doc, collection, setDoc, updateDoc, serverTimestamp, deleteField, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import ProgressDots from '@/components/auth/ProgressDots';
import InputField from '@/components/auth/InputField';
import PrimaryButton from '@/components/auth/PrimaryButton';
import OutlineButton from '@/components/auth/OutlineButton';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { User, MapPin, Link as LinkIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Influencer Profile Completion Page
 *
 * Shown to influencers (especially after social login) if their profile
 * is less than 50% complete. Allows them to fill in required information
 * or skip to dashboard with a warning.
 */
export default function InfluencerCompleteProfilePage() {
  const router = useRouter();
  const { firebaseUser, userProfile, roleProfile, loading, refreshUserProfile, redirectBasedOnRole } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [websiteError, setWebsiteError] = useState(''); // New state for website error
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Load existing data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }

    if (roleProfile && 'bio' in roleProfile) {
      setBio(roleProfile.bio || '');
      setLocation(roleProfile.location || '');
      setWebsite(roleProfile.website || '');
    }
  }, [userProfile, roleProfile]);

  // Calculate profile completion
  const completionPercentage = userProfile && roleProfile
    ? calculateProfileCompletion(userProfile, roleProfile)
    : 0;

  const missingFields = userProfile
    ? getMissingFields(userProfile, roleProfile)
    : [];

  const meetsMinimum = meetsMinimumCompletion(completionPercentage);

  // Website validation logic
  const validateWebsite = (value: string): string => {
    if (!value) return ''; // Not required, so empty is valid
    if (value.length < 2) {
      return 'Website must be at least 2 characters long.';
    }
    // Allow letters, numbers, dots, hyphens, slashes, colons
    const allowedCharsRegex = /^[a-zA-Z0-9.\-/:_]{2,}$/; 
    if (!allowedCharsRegex.test(value)) {
      return 'Website contains invalid characters. Use letters, numbers, dots, hyphens, slashes, or colons.';
    }
    return '';
  };

  // Show loading spinner while auth state is loading
  if (loading) {
    return (
      <AuthLayout>
        <div className="w-full max-w-sm">
          <Logo size="lg" className="text-center mb-8 flex-col" />
          <AuthCard>
            <LoadingSpinner />
          </AuthCard>
        </div>
      </AuthLayout>
    );
  }

  // Redirect if no user
  if (!firebaseUser || !userProfile) {
    router.push('/auth/influencer/login');
    return null;
  }

  // If already meets minimum, redirect to dashboard
  if (meetsMinimum) {
    redirectBasedOnRole();
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const effectiveDisplayName = displayName || userProfile.displayName;

      // Prepare user doc updates
      const userUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
        signupComplete: true,
      };

      if (displayName && displayName !== userProfile.displayName) {
        userUpdates.displayName = displayName;
      }

      if (roleProfile && userProfile.influencerProfileId) {
        // Existing influencer profile — update it
        await updateDoc(doc(db, 'influencer_profiles', userProfile.influencerProfileId), {
          displayName: effectiveDisplayName,
          bio: bio.trim() || deleteField(),
          location: location.trim() || deleteField(),
          website: website.trim() || deleteField(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // No influencer profile yet (email-first signup) — create one
        const newProfileId = doc(collection(db, 'influencer_profiles')).id;

        const profileData: Record<string, any> = {
          id: newProfileId,
          userId: firebaseUser.uid,
          displayName: effectiveDisplayName,
          linkedAccounts: [],
          totalFollowers: 0,
          isVerified: false,
          isPublic: true,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        if (bio.trim()) profileData.bio = bio.trim();
        if (location.trim()) profileData.location = location.trim();
        if (website.trim()) profileData.website = website.trim();

        await setDoc(doc(db, 'influencer_profiles', newProfileId), profileData);

        // Link the new profile to the user doc
        userUpdates.influencerProfileId = newProfileId;
      }

      // Update user document
      await updateDoc(doc(db, 'users', firebaseUser.uid), userUpdates);

      // Refresh user data so auth context picks up the new profile
      await refreshUserProfile();

      // Redirect to dashboard
      redirectBasedOnRole();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    // Show warning first time
    if (!showSkipWarning) {
      setShowSkipWarning(true);
      return;
    }

    // User confirmed skip, redirect to dashboard
    redirectBasedOnRole();
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="text-center mb-8 flex-col" />

        <ProgressDots total={3} current={3} className="mb-8" />

        <AuthCard>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#00A8CC]/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-[#00A8CC]" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Help brands discover you by completing your profile
            </p>
          </div>

          {/* Profile Completion Progress */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-[#00A8CC]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#00A8CC] h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            {!meetsMinimum && (
              <p className="text-xs text-gray-500 mt-2">
                Complete at least 50% to access all features
              </p>
            )}
          </div>

          {/* Missing Fields Alert */}
          {missingFields.length > 0 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Missing Required Information
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    {missingFields.map((field, index) => (
                      <li key={index}>• {field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && <ErrorMessage message={error} className="mb-4" />}

            <div className="space-y-4 mb-6">
              <InputField
                label="Display Name"
                icon={User}
                type="text"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 text-black" />
                  Bio
                </label>
                <textarea
                  placeholder="Tell brands about yourself and your content..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent resize-none"
                />
              </div>

              <InputField
                label="Location"
                icon={MapPin}
                type="text"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <InputField
                label="Website"
                icon={LinkIcon}
                type="text" // Changed from 'url' to 'text'
                placeholder="example.com or https://yourwebsite.com"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setWebsiteError(validateWebsite(e.target.value)); // Validate on change
                }}
                error={websiteError} // Pass error prop
              />
            </div>

            {/* Skip Warning */}
            {showSkipWarning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Are you sure?
                    </p>
                    <p className="text-xs text-red-700">
                      Brands are more likely to discover and work with influencers who have complete profiles. You can always complete your profile later in settings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <PrimaryButton type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    {/* <LoadingSpinner /> */}
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </PrimaryButton>

              <OutlineButton
                type="button"
                onClick={handleSkip}
                className="w-full"
              >
                {showSkipWarning ? 'Yes, Skip Anyway' : 'Skip for Now'}
              </OutlineButton>
            </div>
          </form>

          {/* Helper Text */}
          <p className="text-xs text-center text-gray-500 mt-4">
            You can always update your profile later in settings
          </p>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
