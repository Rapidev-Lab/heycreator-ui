'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { calculateProfileCompletion, getMissingFields, meetsMinimumCompletion } from '@/lib/utils/profile-completion';
import { doc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import LinearProgressBar from '@/components/auth/LinearProgressBar';
import InputField from '@/components/auth/InputField';
import SelectField from '@/components/auth/SelectField';
import PrimaryButton from '@/components/auth/PrimaryButton';
import OutlineButton from '@/components/auth/OutlineButton';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { User, Building2, Link as LinkIcon, Briefcase, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { IndustryType, CompanySize } from '@/types/firebase';

const INDUSTRY_OPTIONS: IndustryType[] = [
  'Fashion',
  'Beauty',
  'Food & Beverage',
  'Technology',
  'Travel',
  'Fitness',
  'Gaming',
  'Education',
  'E-commerce',
  'Other',
];

const COMPANY_SIZE_OPTIONS: CompanySize[] = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+',
];

/**
 * Brand Profile Completion Page
 *
 * Shown to brands (especially after social login) if their profile
 * is less than 50% complete. Allows them to fill in required information
 * or skip to dashboard with a warning.
 */
export default function BrandCompleteProfilePage() {
  const router = useRouter();
  const { firebaseUser, userProfile, roleProfile, loading, refreshUserProfile, redirectBasedOnRole } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('Other');
  const [companySize, setCompanySize] = useState<CompanySize>('1-10');
  const [userRole, setUserRole] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Load existing data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }

    if (roleProfile && 'companyName' in roleProfile) {
      setCompanyName(roleProfile.companyName || '');
      setIndustry(roleProfile.industry || 'Other');
      setCompanySize(roleProfile.companySize || '1-10');
      setUserRole(roleProfile.userRole || '');
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

  // Redirect if no user or profile already meets minimum
  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || !userProfile) {
      router.push('/auth/brand/login');
    } else if (meetsMinimum) {
      redirectBasedOnRole();
    }
  }, [loading, firebaseUser, userProfile, meetsMinimum, router, redirectBasedOnRole]);

  // Show loading spinner while auth state is loading or redirecting
  if (loading || !firebaseUser || !userProfile || meetsMinimum) {
    return (
      <AuthLayout>
        <div className="w-full max-w-sm">
          <Logo size="lg" className="justify-center mb-8" />
          <AuthCard>
            <LoadingSpinner />
          </AuthCard>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Update user document if display name changed
      if (displayName && displayName !== userProfile.displayName) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          displayName,
          updatedAt: serverTimestamp(),
        });
      }

      // Update brand profile if exists
      if (roleProfile && userProfile.brandProfileId) {
        await updateDoc(doc(db, 'brand_profiles', userProfile.brandProfileId), {
          displayName: displayName || userProfile.displayName,
          companyName: companyName.trim(),
          industry,
          companySize,
          userRole: userRole.trim(),
          website: website.trim() || deleteField(),
          updatedAt: serverTimestamp(),
        });
      }

      // Refresh user data
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
        <Logo size="lg" className="justify-center mb-8" />

        <LinearProgressBar current={3} total={3} label="Complete Profile" className="mb-8" />

        <AuthCard>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-brand-navy" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Help influencers understand your brand better
            </p>
          </div>

          {/* Profile Completion Progress */}
          <div className="mb-6 p-4 bg-[#EEEDED] rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-[#00A8CC]">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#00A8CC] to-brand-navy h-2 rounded-full transition-all duration-300"
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
                label="Your Full Name"
                icon={User}
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <InputField
                label="Company Name"
                icon={Building2}
                type="text"
                placeholder="Your Company Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />

              <SelectField
                label="Industry"
                icon={TrendingUp}
                value={industry}
                onChange={(value) => setIndustry(value as IndustryType)}
                options={INDUSTRY_OPTIONS.map(opt => ({ value: opt, label: opt }))}
                required
              />

              <SelectField
                label="Company Size"
                icon={Building2}
                value={companySize}
                onChange={(value) => setCompanySize(value as CompanySize)}
                options={COMPANY_SIZE_OPTIONS.map(opt => ({ value: opt, label: `${opt} employees` }))}
                required
              />

              <InputField
                label="Your Role"
                icon={Briefcase}
                type="text"
                placeholder="Marketing Manager, CEO, etc."
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                required
              />

              <InputField
                label="Company Website"
                icon={LinkIcon}
                type="text"
                placeholder="www.company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
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
                      Influencers are more likely to work with brands that have complete profiles. You can always complete your profile later in settings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <PrimaryButton type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>Saving...</>
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
