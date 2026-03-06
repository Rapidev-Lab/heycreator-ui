/**
 * API Type Definitions
 * Based on the structure from the Express server for consistency.
 */

/**
 * Enum for the supported social media platforms.
 */
export const PLATFORMS = {
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter'
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

/**
 * Defines the standardized structure for a profile search result.
 * This interface is used to normalize data from all third-party APIs.
 */
export interface SearchResultProfile {
  id: string | number;
  platform: Platform;
  username: string;
  display_name: string;
  follower_count: number;
  following_count?: number; // Number of accounts this profile follows
  profile_url: string;
  avatar_url?: string;
  bio?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_website?: string;
  verified: boolean;
  rawData?: any; // Full unfiltered response from API (for debugging and complete data access)
}
