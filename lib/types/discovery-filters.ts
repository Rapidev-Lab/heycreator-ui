/**
 * Discovery Filter Types
 *
 * Comprehensive filter system for influencer discovery and search.
 * Supports advanced filtering, sorting, and relevance ranking.
 *
 * Created: February 3, 2026
 */

import { Platform } from '@/types/api';
import { NumberSchema } from 'firebase/ai';
import { FcNumericalSorting21 } from 'react-icons/fc';

/**
 * Follower count ranges for filtering
 */
export type FollowerRange =
  | '0-499'
  | '500-999'
  | '1000-3999'
  | '4000-8999'
  | '9000+';

/**
 * Engagement rate ranges (percentage)
 */
export type EngagementRateRange =
  | '0-4%'
  | '5-9%'
  | '10-19%'
  | '20-50%'
  | '51%+';

/**
 * True Reach ranges (percentage)
 */
export type TrueReachRange =
  | '0-4%'
  | '5-9%'
  | '10-19%'
  | '20-50%'
  | '51%+';

/**
 * Sort options for search results
 */
export type SortOption =
  | 'relevance'       // Relevance score (default)
  | 'engagement'      // Engagement rate (high to low)
  | 'followers-desc'  // Followers (high to low)
  | 'followers-asc'   // Followers (low to high)
  | 'cost-asc'        // Cost (low to high)
  | 'cost-desc'       // Cost (high to low)
  | 'last-active';    // Last active date (recent first)

/**
 * Discovery filter parameters
 * Used for /api/discover/search
 */
export interface DiscoveryFilters {
  // Search terms
  query?: string;              // Keywords, phrases, usernames, full names
  hashtags?: string[];         // Hashtag search
  topics?: string[];           // Topic/category search

  // Platform filters
  platforms?: Platform[];      // Multi-select: instagram, tiktok, youtube, twitter, facebook

  // Metric filters
  followerRange?: FollowerRange[];      // Multiple ranges can be selected
  engagementRateRange?: EngagementRateRange[];
  trueReachRange?: TrueReachRange[];

  // Location filters
  location?: string;           // Country, city, region
  language?: string;           // Primary language

  // Category filters
  categories?: string[];       // Fashion, Beauty, Tech, etc.

  // Verification
  verifiedOnly?: boolean;      // Only show verified accounts

  // Sorting
  sortBy?: SortOption;

  // Pagination
  page?: number;
  limit?: number;

  // Search mode
  liveSearch?: boolean;        // Force live API search (skip database)
}

/**
 * Influencer search filters
 * Used for /api/search (simpler, username-focused)
 */
export interface InfluencerSearchFilters {
  query: string;               // Username, keyword, or full name
  platforms?: Platform[];      // Platform filter
  exact?: boolean;             // Exact match only
  limit?: number;
  liveSearch?: boolean;
}

/**
 * Filter result metadata
 */
export interface FilterMetadata {
  totalResults: number;
  filteredResults: number;
  appliedFilters: string[];
  availableFilters: {
    platforms: { platform: Platform; count: number }[];
    followerRanges: { range: FollowerRange; count: number }[];
    engagementRanges: { range: EngagementRateRange; count: number }[];
    categories: { category: string; count: number }[];
  };
}

/**
 * Parse follower range to min/max values
 */
export function parseFollowerRange(range: FollowerRange): { min: number; max: number } {
  const ranges: Record<FollowerRange, { min: number; max: number }> = {
    '0-499': { min: 0, max: 499 },
    '500-999': { min: 500, max: 999 },
    '1000-3999': { min: 1000, max: 3999 },
    '4000-8999': { min: 4000, max: 8999 },
    '9000+': { min: 9000, max: Infinity }
  };
  return ranges[range];
}

/**
 * Parse engagement rate range to min/max percentages
 */
export function parseEngagementRateRange(range: EngagementRateRange): { min: number; max: number } {
  const ranges: Record<EngagementRateRange, { min: number; max: number }> = {
    '0-4%': { min: 0, max: 4 },
    '5-9%': { min: 5, max: 9 },
    '10-19%': { min: 10, max: 19 },
    '20-50%': { min: 20, max: 50 },
    '51%+': { min: 51, max: 100 }
  };
  return ranges[range];
}

/**
 * Parse true reach range to min/max percentages
 */
export function parseTrueReachRange(range: TrueReachRange): { min: number; max: number } {
  const ranges: Record<TrueReachRange, { min: number; max: number }> = {
    '0-4%': { min: 0, max: 4 },
    '5-9%': { min: 5, max: 9 },
    '10-19%': { min: 10, max: 19 },
    '20-50%': { min: 20, max: 50 },
    '51%+': { min: 51, max: 100 }
  };
  return ranges[range];
}

/**
 * Get follower range for a count
 */
export function getFollowerRange(followers: number): FollowerRange {
  if (followers < 500) return '0-499';
  if (followers < 1000) return '500-999';
  if (followers < 4000) return '1000-3999';
  if (followers < 9000) return '4000-8999';
  return '9000+';
}

/**
 * Get engagement rate range for a percentage
 */
export function getEngagementRateRange(rate: number): EngagementRateRange {
  if (rate < 5) return '0-4%';
  if (rate < 10) return '5-9%';
  if (rate < 20) return '10-19%';
  if (rate < 51) return '20-50%';
  return '51%+';
}

/**
 * Format follower count (K, M, B notation)
 */
export function formatFollowerCount(count: number, platform?: string): string {
  const num = Math.abs(count);

  const format = (value: number, suffix: string) => {
    const formatted = (num / value).toFixed(1);

    return formatted.endsWith('.0')
      ? formatted.slice(0, -2) + suffix
      : formatted + suffix;
  };

  if (num >= 1_000_000_000) return format(1_000_000_000, 'B');
  if (num >= 1_000_000) return format(1_000_000, 'M');
  if (num >= 1_000) return format(1_000, 'K');

  return num.toString();
}

/**
 * Format percentage with symbol
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Validate filter parameters
 */
export function validateDiscoveryFilters(filters: DiscoveryFilters): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Allow requests with no search criteria (for recommended/browse use cases)
  // These will return all profiles from the database, sorted by the specified criteria

  // Validate pagination
  if (filters.page !== undefined && filters.page < 1) {
    errors.push('Page must be >= 1');
  }

  if (filters.limit !== undefined && (filters.limit < 1 || filters.limit > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  // Validate platforms
  const validPlatforms: Platform[] = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];
  if (filters.platforms?.some(p => !validPlatforms.includes(p))) {
    errors.push('Invalid platform specified');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
