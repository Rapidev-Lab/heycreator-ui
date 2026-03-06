'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Loader2, HelpCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';

// New components for Apify enrichment data
import { ProfileHeader } from '@/components/influencer-profile/ProfileHeader';
import { ProfileSnapshot } from '@/components/influencer-profile/ProfileSnapshot';
import { InsightsCard } from '@/components/influencer-profile/InsightsCard';
import { MetricsTable } from '@/components/influencer-profile/MetricsTable';
import { ContentGrid } from '@/components/influencer-profile/ContentGrid';
import { DemographicsSection } from '@/components/influencer-profile/DemographicsSection';
import { SimilarCreators } from '@/components/influencer-profile/SimilarCreators';

// Types and services
import { ApifyEnrichmentData } from '@/types/apify';
import { TransformedProfile } from '@/types/profile';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';

interface PageProps {
  params: { id: string };
}

export default function InfluencerProfilePageNew({ params }: PageProps) {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();

  // State for transformed profile data
  const [profile, setProfile] = useState<TransformedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and transform profile data
  useEffect(() => {
    async function fetchData() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!firebaseUser) {
        // Not authenticated, redirect to login
        router.push('/auth/brand/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // For development: Load APIFY.json if profile ID is 'cristiano'
        if (params.id === 'cristiano' || params.id.includes('cristiano')) {
          console.log('Loading APIFY.json for Cristiano Ronaldo profile...');

          const response = await fetch('/APIFY.json');
          if (!response.ok) {
            throw new Error('Failed to load enrichment data');
          }

          const enrichmentData: ApifyEnrichmentData = await response.json();
          console.log('✓ Loaded enrichment data:', enrichmentData.username);

          // Transform the enrichment data to UI-ready format
          const transformedProfile = ProfileTransformer.transformEnrichmentData(enrichmentData);
          console.log('✓ Transformed profile data');

          setProfile(transformedProfile);
        } else {
          // For other profiles, try to fetch from API
          // TODO: Update API to include enrichment data
          setError('Enrichment data not available for this profile yet. Currently only works with Cristiano Ronaldo profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id, firebaseUser, authLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/brands/influencers"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Influencers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!profile) {
    notFound();
  }

  // Handler functions
  const handleBookmark = () => {
    console.log('Bookmark toggled');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.header.fullName,
        text: `Check out ${profile.header.fullName} on Hey Creator`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    alert('Downloading influencer report as PDF...');
  };

  const handleRefresh = () => {
    alert('Refreshing profile data...');
    window.location.reload();
  };

  const handleChat = () => {
    alert(`Opening chat with ${profile.header.fullName}...`);
  };

  const handleAddToCampaign = () => {
    alert(`Adding ${profile.header.fullName} to campaign...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Profile Search Banner */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/brands/discover"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Search</span>
          </Link>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          data={profile.header}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onDownload={handleDownload}
          onRefresh={handleRefresh}
          onChat={handleChat}
          onAddToCampaign={handleAddToCampaign}
        />

        {/* Profile Snapshot - 3 Metric Cards */}
        <ProfileSnapshot data={profile.snapshot} />

        {/* Two Column Layout: Insights + Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insights Card */}
          <div className="lg:col-span-1">
            <InsightsCard data={profile.insights} />
          </div>

          {/* Average Metrics Table */}
          <div className="lg:col-span-2">
            <MetricsTable metrics={profile.metrics} />
          </div>
        </div>

        {/* Top Performing Content */}
        <ContentGrid posts={profile.content} />

        {/* Audience Demographics */}
        <DemographicsSection data={profile.demographics} />

        {/* Similar Creators */}
        <SimilarCreators creators={profile.similar} />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-primary">Hey Creator</span>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-gray-900 transition-colors">
              Legal
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </main>
    </div>
  );
}
