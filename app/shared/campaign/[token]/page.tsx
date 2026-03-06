'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import SharedCampaignView from '@/components/sharing/SharedCampaignView';

// ===== MOCK DATA =====

const mockSharedCampaign = {
  name: 'Summer Vibes 2026',
  brand: 'Nike South Africa',
  description:
    'Looking for vibrant, energetic creators to showcase our new summer collection across Instagram and TikTok. We want authentic, lifestyle-focused content that resonates with young South African audiences.',
  status: 'Active',
  platforms: ['Instagram', 'TikTok'],
  budget: 'R15,000 - R25,000',
  startDate: '2026-03-15',
  endDate: '2026-04-30',
  deliverables: [
    {
      type: 'Instagram Reel',
      quantity: 3,
      description: 'Lifestyle content featuring summer products',
    },
    {
      type: 'TikTok Video',
      quantity: 2,
      description: 'Trending sound/challenge with product integration',
    },
    {
      type: 'Instagram Story',
      quantity: 5,
      description: 'Behind-the-scenes and try-on content',
    },
  ],
  targetAudience: {
    ageRange: '18-34',
    gender: 'All',
    locations: ['Johannesburg', 'Cape Town', 'Durban'],
    interests: ['Fashion', 'Fitness', 'Lifestyle', 'Sports'],
  },
  requirements: [
    'Minimum 10K followers on primary platform',
    'Must be based in South Africa',
    'Previous brand collaboration experience preferred',
    'Content must be original and authentic',
  ],
};

// Known mock tokens — in a real app this would be a DB/API lookup
const MOCK_VALID_TOKEN = 'share-campaign-abc123';
const MOCK_EXPIRED_TOKEN = 'share-campaign-expired';
const MOCK_EXPIRY_DATE = '2026-04-15T00:00:00Z'; // future — active
const MOCK_PAST_EXPIRY = '2026-01-01T00:00:00Z'; // past — expired

type TokenState = 'loading' | 'valid' | 'expired' | 'not_found';

// ===== SKELETON =====

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner skeleton */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Campaign header skeleton */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-4/6" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 h-48 animate-pulse" />
            <div className="bg-white rounded-xl border border-gray-200 p-5 h-56 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== NOT FOUND STATE =====

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Not Found</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          This link is invalid or has been revoked. Please contact the person who shared it
          with you to request a new link.
        </p>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3 font-medium">Powered by</p>
          <p className="text-sm font-bold text-brand-navy">HeyCreator</p>
          <p className="text-xs text-gray-400 mt-1">Influencer Marketing Platform</p>
        </div>
      </div>
    </div>
  );
}

// ===== PAGE =====

export default function SharedCampaignPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [state, setState] = useState<TokenState>('loading');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('not_found');
      return;
    }

    // Simulate async token validation
    const timer = setTimeout(() => {
      if (token === MOCK_EXPIRED_TOKEN) {
        setExpiresAt(MOCK_PAST_EXPIRY);
        setState('expired');
      } else if (token === MOCK_VALID_TOKEN || token.startsWith('share-campaign-')) {
        // Accept any token that starts with share-campaign- for demo purposes
        setExpiresAt(MOCK_EXPIRY_DATE);
        setState('valid');
      } else {
        setState('not_found');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [token]);

  if (state === 'loading') return <PageSkeleton />;
  if (state === 'not_found') return <NotFoundState />;

  // Both 'valid' and 'expired' render the view — the component handles the overlay
  return (
    <SharedCampaignView
      campaign={mockSharedCampaign}
      sharedBy="Demo Brand from Nike South Africa"
      expiresAt={state === 'expired' ? MOCK_PAST_EXPIRY : expiresAt}
    />
  );
}
