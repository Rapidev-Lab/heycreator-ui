/**
 * Unified Profile Types
 * Support for multi-platform influencer profiles with aggregated data
 */

import { Platform } from './api';

/**
 * Platform-specific profile data stored in a unified profile
 */
export interface PlatformProfileData {
  connected: boolean;
  profileId: string;
  username: string;
  fullName: string;
  followers: number;
  following: number;
  verified: boolean;
  avatar: string;
  bio?: string;
  website?: string;
  email?: string;
  phone?: string;

  // Platform-specific metrics
  posts?: number;
  engagementRate?: number;
  averageLikes?: number;
  averageComments?: number;

  // Last sync info
  lastSynced: Date;
  lastUpdated: Date;
}

/**
 * Unified profile combining data from all platforms
 */
export interface UnifiedProfile {
  // Universal identifiers
  _id: string;  // Firestore document ID
  userId: string;  // User who owns/saved this profile

  // Display information (aggregated)
  displayName: string;
  primaryUsername: string;
  bio?: string;
  location?: string;

  // Aggregated metrics
  totalFollowers: number;  // Sum across all platforms
  totalFollowing: number;
  totalPosts: number;
  averageEngagementRate: number;  // Weighted average

  // Platform presence
  platforms: {
    instagram?: PlatformProfileData;
    tiktok?: PlatformProfileData;
    youtube?: PlatformProfileData;
    twitter?: PlatformProfileData;
    facebook?: PlatformProfileData;
    snapchat?: PlatformProfileData;
  };

  // Connected platforms list (for quick filtering)
  connectedPlatforms: Platform[];

  // Primary platform (platform with most followers)
  primaryPlatform: Platform;

  // Best avatar (highest quality across platforms)
  bestAvatar: {
    url: string;
    source: Platform;
    quality: 'high' | 'medium' | 'low';
  };

  // Contact information (from any platform)
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
    businessEmail?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date;

  // Profile status
  status: 'active' | 'archived' | 'deleted';
}

/**
 * Search result interface for real-time search
 */
export interface SearchResult {
  // Unified profile info
  profileId: string;
  fullName: string;
  primaryUsername: string;

  // Aggregated metrics
  totalFollowers: number;
  totalFollowing: number;

  // Platform presence
  platforms: Array<{
    platform: Platform;
    username: string;
    followers: number;
    verified: boolean;
    avatar: string;
  }>;

  // Best avatar (highest quality)
  avatar: string;

  // Score for ranking (based on relevance + follower count)
  searchScore: number;
}

/**
 * Request body for real-time search API
 */
export interface RealtimeSearchRequest {
  query: string;
  platforms: Platform[];
  limit?: number;
  userId?: string;  // For personalized results
}

/**
 * Response from real-time search API
 */
export interface RealtimeSearchResponse {
  success: boolean;
  results: SearchResult[];
  source: 'local' | 'live' | 'mixed';  // Where results came from
  searchTime: number;  // Milliseconds
  error?: string;
}

/**
 * Platform-specific raw profile data (before normalization)
 */
export interface RawPlatformProfile {
  platform: Platform;

  // Instagram/TikTok/Twitter specific
  userId?: string;
  username?: string;
  fullName?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  verified?: boolean;
  profilePicUrl?: string;
  externalUrl?: string;
  contactPhoneNumber?: string;
  publicEmail?: string;

  // YouTube specific
  channelId?: string;
  title?: string;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  thumbnails?: { url: string }[];

  // Facebook specific
  pageId?: string;
  name?: string;
  about?: string;
  fanCount?: number;
  picture?: { url: string };

  // Snapchat specific
  snapchatId?: string;
  displayName?: string;
  bitmoji?: string;

  // Raw data (for debugging)
  raw?: any;
}

/**
 * Profile aggregation options
 */
export interface AggregationOptions {
  // Weight platforms differently in calculations
  platformWeights?: {
    instagram?: number;
    tiktok?: number;
    youtube?: number;
    twitter?: number;
    facebook?: number;
    snapchat?: number;
  };

  // Include archived profiles
  includeArchived?: boolean;

  // Force refresh from platforms
  forceRefresh?: boolean;
}

/**
 * Profile matching result
 */
export interface ProfileMatchResult {
  matched: boolean;
  confidence: number;  // 0-1 score
  matchedProfileId?: string;
  matchStrategy: 'username' | 'url' | 'fuzzy' | 'manual';
  suggestions?: Array<{
    profileId: string;
    confidence: number;
    reason: string;
  }>;
}
