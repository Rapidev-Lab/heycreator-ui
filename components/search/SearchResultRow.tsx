'use client';

/**
 * Search Result Row Component
 * Displays individual search result with avatar, metrics, and platform badges
 */

import React from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { SearchResult } from '@/types/unified-profile';
import { Platform } from '@/types/api';

interface SearchResultRowProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
}

export function SearchResultRow({ result, query, onClick }: SearchResultRowProps) {
  // Get primary platform (most followers)
  const primaryPlatform = result.platforms.reduce((prev, current) =>
    current.followers > prev.followers ? current : prev
  );

  // Check if any platform is verified
  const isVerified = result.platforms.some(p => p.verified);

  return (
    <div className="search-result-row" onClick={onClick}>
      {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-container">
          <img
            src={result.avatar || '/default-avatar.png'}
            alt={result.fullName}
            className="avatar"
          />
          {isVerified && (
            <div className="verified-badge">
              <CheckCircle size={16} fill="currentColor" />
            </div>
          )}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="profile-info">
        {/* Name and Username */}
        <div className="name-username">
          <span className="full-name">
            {highlightMatch(result.fullName, query)}
          </span>
          <span className="username">
            @{highlightMatch(result.primaryUsername, query)}
          </span>
        </div>

        {/* Metrics */}
        <div className="metrics">
          <span className="followers">
            {formatNumber(result.totalFollowers)} followers
          </span>
          {result.totalFollowing > 0 && (
            <>
              <span className="separator">•</span>
              <span className="following">
                {formatNumber(result.totalFollowing)} following
              </span>
            </>
          )}
        </div>

        {/* Platform Badges */}
        <div className="platform-badges">
          {result.platforms.map((platform) => (
            <PlatformBadge
              key={platform.platform}
              platform={platform.platform}
              verified={platform.verified}
              followers={platform.followers}
            />
          ))}
        </div>
      </div>

      {/* Action Icon */}
      <div className="action-icon">
        <ChevronRight size={20} />
      </div>
    </div>
  );
}

/**
 * Platform Badge Component
 */
interface PlatformBadgeProps {
  platform: Platform;
  verified: boolean;
  followers: number;
}

function PlatformBadge({ platform, verified, followers }: PlatformBadgeProps) {
  const platformIcons: Record<Platform, string> = {
    instagram: '📷',
    tiktok: '🎵',
    youtube: '▶️',
    twitter: '🐦',
    facebook: '👥',
  };

  const platformColors: Record<Platform, string> = {
    instagram: '#E1306C',
    tiktok: '#000000',
    youtube: '#FF0000',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
  };

  return (
    <div
      className="platform-badge"
      style={{ borderColor: platformColors[platform] }}
      title={`${platform}: ${formatNumber(followers)} followers${verified ? ' (verified)' : ''}`}
    >
      <span className="platform-badge-icon">{platformIcons[platform]}</span>
      <span className="platform-badge-name">
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </span>
      {verified && (
        <CheckCircle size={12} fill={platformColors[platform]} />
      )}
    </div>
  );
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  try {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="highlight">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  } catch (error) {
    // If regex fails, return original text
    return text;
  }
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Format numbers with K/M/B suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}
