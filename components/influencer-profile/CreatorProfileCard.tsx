'use client';

import { useState } from 'react';
import { MapPin, Pencil } from 'lucide-react';
import { proxyImage } from '@/lib/utils';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';

interface CreatorProfileCardProps {
  avatarUrl?: string;
  displayName: string;
  category?: string;
  location?: string;
  bio?: string;
  totalFollowers: number;
  engagementRate: number;
  campaignCount: number;
  onEditClick?: () => void;
}

export function CreatorProfileCard({
  avatarUrl,
  displayName,
  category,
  location,
  bio,
  totalFollowers,
  engagementRate,
  campaignCount,
  onEditClick,
}: CreatorProfileCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {avatarUrl && !imageError ? (
              <img
                src={proxyImage(avatarUrl) || avatarUrl}
                alt={displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-100"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{displayName}</h2>
              {onEditClick && (
                <button
                  onClick={onEditClick}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Profile"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {category && (
              <span className="inline-block px-2.5 py-0.5 bg-brand-navy-50 text-brand-navy text-xs font-medium rounded-full mb-1.5">
                {category}
              </span>
            )}

            {bio && (
              <p className="text-sm text-gray-600 mb-1.5 max-w-2xl line-clamp-2">{bio}</p>
            )}

            {location && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-3">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          <div className="text-center px-4">
            <div className="text-lg font-bold text-gray-900">
              {ProfileTransformer.formatNumber(totalFollowers)}
            </div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center px-4">
            <div className="text-lg font-bold text-gray-900">
              {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : '\u2014'}
            </div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
          <div className="text-center px-4">
            <div className="text-lg font-bold text-gray-900">{campaignCount}</div>
            <div className="text-xs text-gray-500">Campaigns</div>
          </div>
        </div>
      </div>
    </div>
  );
}
