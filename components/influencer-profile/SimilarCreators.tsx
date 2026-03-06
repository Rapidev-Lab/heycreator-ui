'use client';

import { useState } from 'react';
import { SimilarCreator } from '@/types/profile';
import { Star } from 'lucide-react';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';
import Link from 'next/link';

interface SimilarCreatorsProps {
  creators: SimilarCreator[];
  maxCreators?: number;
}

interface CreatorCardProps {
  creator: SimilarCreator;
}

// Navy circle platform icons matching Figma
function PlatformBadges({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {platforms.map((platform) => (
        <div
          key={platform}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-navy"
        >
          {platform === 'instagram' && (
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          )}
          {platform === 'tiktok' && (
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          )}
          {platform === 'youtube' && (
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
          {platform === 'twitter' && (
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          )}
          {platform === 'facebook' && (
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

function CreatorCard({ creator }: CreatorCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/brands/influencers/${creator.id}`}
      className="rounded-lg p-4 hover:shadow-md transition-all duration-300 border border-brand-navy"
      style={{ borderWidth: '1.5px' }}
    >
      {/* Top: Avatar + Name + Rating */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          {creator.avatar && !imageError ? (
            <img
              src={creator.avatar}
              alt={creator.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
              onError={() => setImageError(true)}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm">
              {creator.fullName.charAt(0) || '?'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {creator.fullName}
          </h3>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-gray-900">
              {creator.influenceScore.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              {creator.campaigns ?? 0} campaigns
            </span>
          </div>
        </div>
      </div>

      {/* Stats: Followers + Engagement */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-gray-500">Followers</div>
          <div className="text-sm font-bold text-gray-900">
            {creator.followers != null && creator.followers > 0
              ? ProfileTransformer.formatNumber(creator.followers)
              : '\u2014'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Engagement</div>
          <div className="text-sm font-bold text-gray-900">
            {creator.engagement != null && creator.engagement > 0
              ? `${creator.engagement.toFixed(1)}%`
              : '\u2014'}
          </div>
        </div>
      </div>

      {/* Social Platforms — navy circles */}
      {creator.platforms && creator.platforms.length > 0 && (
        <PlatformBadges platforms={creator.platforms} />
      )}
    </Link>
  );
}

export function SimilarCreators({ creators, maxCreators = 6 }: SimilarCreatorsProps) {
  const displayCreators = creators.slice(0, maxCreators);

  if (displayCreators.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Similar Creators</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {displayCreators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </div>
  );
}
