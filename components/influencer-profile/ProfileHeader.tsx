'use client';

import { useState } from 'react';
import { ProfileHeader as ProfileHeaderType } from '@/types/profile';
import {
  Bookmark,
  RefreshCw,
  ArrowDownToLine,
  Share2,
  MessageSquare,
  Plus,
  MapPin,
} from 'lucide-react';
import { proxyImage } from '@/lib/utils';

interface ProfileHeaderProps {
  data: ProfileHeaderType;
  onBookmark?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onRefresh?: () => void;
  onChat?: () => void;
  onAddToCampaign?: () => void;
  isBookmarked?: boolean;
  isRefreshing?: boolean;
}

export function ProfileHeader({
  data,
  onBookmark,
  onRefresh,
  onChat,
  onAddToCampaign,
  isBookmarked = false,
  isRefreshing = false,
}: ProfileHeaderProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [imageError, setImageError] = useState(false);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {data.avatarHD && !imageError ? (
            <img
              src={proxyImage(data.avatarHD) || data.avatarHD}
              alt={data.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-100"
              onError={handleImageError}
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
              {data.fullName.charAt(0)}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Verified Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{data.fullName}</h1>
            {data.verified && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-status-error">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Bio */}
          {data.bio && (
            <p className="text-sm text-gray-600 mb-1.5 max-w-2xl line-clamp-1">{data.bio}</p>
          )}

          {/* Location */}
          {data.location && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{data.location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Bookmark - hidden for now */}
          {/* <button
            onClick={handleBookmark}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title="Bookmark"
          >
            <Bookmark
              className={`w-5 h-5 ${
                bookmarked ? 'fill-blue-600 text-blue-600' : 'text-gray-500'
              }`}
            />
          </button> */}

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Download — disabled */}
          <button
            disabled
            className="p-2 rounded-lg border border-gray-200 opacity-40 cursor-not-allowed"
            title="Download (coming soon)"
          >
            <ArrowDownToLine className="w-5 h-5 text-gray-400" />
          </button>

          {/* Share — disabled */}
          <button
            disabled
            className="p-2 rounded-lg border border-gray-200 opacity-40 cursor-not-allowed"
            title="Share (coming soon)"
          >
            <Share2 className="w-5 h-5 text-gray-400" />
          </button>

          {/* Chat — disabled */}
          <button
            disabled
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg opacity-40 cursor-not-allowed flex-1 sm:flex-none"
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-sm text-gray-400">Chat</span>
          </button>

          {/* Add to Campaign */}
          {onAddToCampaign && (
            <button
              onClick={onAddToCampaign}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-brand-navy rounded-lg transition-colors flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium text-sm">Add to Campaign</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
