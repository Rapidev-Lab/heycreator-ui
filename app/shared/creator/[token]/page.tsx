'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, MapPin, Instagram, Clock } from 'lucide-react';
import ViralityCTA from '@/components/sharing/ViralityCTA';
import ViewerBadge from '@/components/sharing/ViewerBadge';

// ===== MOCK DATA =====

const mockSharedCreator = {
  name: 'Thandi Moyo',
  handle: '@thandimoyo',
  platform: 'Instagram',
  avatarUrl: null as string | null,
  bio: 'Fashion & lifestyle content creator based in Johannesburg. Passionate about African fashion, wellness, and empowering women through style.',
  followers: 45200,
  engagementRate: 4.8,
  avgLikes: 2150,
  categories: ['Fashion', 'Lifestyle', 'Beauty', 'Wellness'],
  location: 'Johannesburg, South Africa',
};

const MOCK_VALID_TOKEN = 'share-creator-def456';
const MOCK_EXPIRY_DATE = '2026-05-01T00:00:00Z';
const MOCK_PAST_EXPIRY = '2026-01-01T00:00:00Z';

type TokenState = 'loading' | 'valid' | 'expired' | 'not_found';

// ===== HELPERS =====

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ===== SKELETON =====

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Creator card skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
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
          <p className="text-xs text-gray-400 mb-1 font-medium">Powered by</p>
          <p className="text-sm font-bold text-brand-navy">HeyCreator</p>
        </div>
      </div>
    </div>
  );
}

// ===== STAT CARD =====

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
      <span className="text-xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400 font-medium">{sub}</span>}
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

// ===== EXPIRED OVERLAY =====

function ExpiredOverlay() {
  return (
    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
      <div className="text-center px-6 py-10">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">This link has expired</h2>
        <p className="text-sm text-gray-500">
          Please contact the sender to receive a fresh shared link.
        </p>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function SharedCreatorPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [state, setState] = useState<TokenState>('loading');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('not_found');
      return;
    }

    const timer = setTimeout(() => {
      if (token === MOCK_VALID_TOKEN || token.startsWith('share-creator-')) {
        setExpiresAt(MOCK_EXPIRY_DATE);
        setState('valid');
      } else if (token.includes('expired')) {
        setExpiresAt(MOCK_PAST_EXPIRY);
        setState('expired');
      } else {
        setState('not_found');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [token]);

  if (state === 'loading') return <PageSkeleton />;
  if (state === 'not_found') return <NotFoundState />;

  const creator = mockSharedCreator;
  const expired = state === 'expired' || isExpired(expiresAt);
  const initial = creator.name.charAt(0).toUpperCase();

  // Deterministic gradient from name
  const gradientClass = 'from-brand-navy to-brand-cyan';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-bold text-brand-navy text-sm">HeyCreator</span>
            <span className="text-gray-300">/</span>
            <span className="text-xs">Shared by Demo Brand from Nike South Africa</span>
          </div>
          <div className="flex items-center gap-2">
            <ViewerBadge />
            {expiresAt && !expired && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                Expires {formatDate(expiresAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        {/* Creator Card — with optional expired overlay */}
        <div className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden ${expired ? '' : ''}`}>
          {expired && <ExpiredOverlay />}

          <div className={expired ? 'opacity-40 pointer-events-none select-none p-6' : 'p-6'}>
            {/* Header: Avatar + Name */}
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                />
              ) : (
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-sm`}
                >
                  {initial}
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{creator.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                    <Instagram className="w-3 h-3" />
                    {creator.platform}
                  </span>
                </div>
                <p className="text-sm text-brand-cyan font-medium">{creator.handle}</p>
                {creator.location && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {creator.location}
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-3">
                  {creator.bio}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <StatCard
                label="Followers"
                value={formatFollowers(creator.followers)}
              />
              <StatCard
                label="Engagement Rate"
                value={`${creator.engagementRate}%`}
              />
              <StatCard
                label="Avg Likes"
                value={formatFollowers(creator.avgLikes)}
              />
            </div>

            {/* Categories */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Content Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {creator.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Content Section (placeholder thumbnails) */}
        {!expired && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Top Content</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center group hover:border-gray-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 group-hover:bg-gray-300 transition-colors" />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              Content preview available in full access
            </p>
          </div>
        )}

        {/* Virality CTA */}
        <ViralityCTA />
      </div>
    </div>
  );
}
