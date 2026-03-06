'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthCard from '@/components/auth/AuthCard';
import Logo from '@/components/auth/Logo';
import InputField from '@/components/auth/InputField';
import PrimaryButton from '@/components/auth/PrimaryButton';
import OutlineButton from '@/components/auth/OutlineButton';
import ErrorMessage from '@/components/auth/ErrorMessage';
import { useAuth } from '@/lib/firebase/auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase/config';
import { User, Mail } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { firebaseUser, userProfile, refreshUserProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!firebaseUser) {
      router.push('/auth/influencer/login');
      return;
    }

    // Pre-fill if user already has data
    if (userProfile) {
      setFullName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
    }
  }, [firebaseUser, userProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: fullName,
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        displayName: fullName,
        email: email,
        updatedAt: new Date(),
      });

      // Update profile based on role
      if (userProfile?.role === 'influencer' && userProfile?.influencerProfileId) {
        const profileRef = doc(db, 'influencer_profiles', userProfile.influencerProfileId);
        await updateDoc(profileRef, {
          displayName: fullName,
          email: email,
          updatedAt: new Date(),
        });
      } else if (userProfile?.role === 'brand' && userProfile?.brandProfileId) {
        const profileRef = doc(db, 'brand_profiles', userProfile.brandProfileId);
        await updateDoc(profileRef, {
          displayName: fullName,
          email: email,
          updatedAt: new Date(),
        });
      }

      // Refresh user profile
      await refreshUserProfile();

      // Redirect to dashboard
      router.push('/influencers');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip for now
    router.push('/influencers');
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-8" />

        <AuthCard>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Please provide your name and email to complete your profile.
          </p>

          {error && <ErrorMessage message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              id="fullName"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={User}
              required
            />

            <InputField
              id="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <div className="flex flex-col gap-3 mt-6">
              <PrimaryButton type="submit" loading={loading}>
                Complete Profile
              </PrimaryButton>

              <OutlineButton type="button" onClick={handleSkip}>
                Skip for Now
              </OutlineButton>
            </div>
          </form>
        </AuthCard>

        <p className="text-center text-sm text-gray-600 mt-4">
          You can update this information later in your settings.
        </p>
      </div>
    </AuthLayout>
  );
}
