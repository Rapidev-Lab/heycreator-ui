/**
 * Global Influencer Database Schema
 *
 * This collection stores all discovered influencers that can be searched by any user.
 * It serves as the central database for the /brands/discover page.
 *
 * Key Features:
 * - Multi-platform support (Instagram, TikTok, YouTube, Twitter, Facebook, Snapchat)
 * - Fully indexed for fast filtering and sorting
 * - Stores both raw enrichment data and extracted metadata
 * - Supports geographic and demographic filtering
 */

import { Timestamp } from 'firebase-admin/firestore';
import { LinkedPlatformAccount, CombinedMetrics, EnrichmentSummary } from './aggregator';

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'snapchat';

export interface PlatformAccount {
  platform: Platform;
  username: string;
  followerCount: number;
  followingCount: number;
  verified: boolean;
  profileUrl: string;
  lastUpdated: Timestamp;
}

export interface Location {
  country: string;              // e.g., "United States"
  city: string;                 // e.g., "Los Angeles"
  coordinates?: {               // For geofence queries
    latitude: number;
    longitude: number;
  };
}

export interface InstagramEnrichment {
  hasEnrichment: boolean;
  enrichedAt: Timestamp;
  dataCompleteness: number;     // 0-100 percentage

  // Extracted metrics for filtering
  avgLikes: number;
  avgComments: number;
  engagementRate: number;       // Percentage
  postCount: number;
  reelCount: number;
  topHashtags: string[];        // Top 10 hashtags
  postingFrequency: 'daily' | 'weekly' | 'monthly';

  // Audience demographics
  audienceCountries?: string[];
  audienceAgeGroup?: string;    // e.g., "18-24", "25-34"
  audienceGenderSplit?: {
    male: number;               // Percentage
    female: number;             // Percentage
  };

  // Raw enrichment data (not indexed)
  rawData?: {
    method1_profileDetails?: any;
    method2_directPosts?: any[];
    method3_directReels?: any[];
    method4_directMentions?: any[];
    method5_userSearch?: any[];
    method6_hashtagSearch?: any[];
    method7_placeSearch?: any[];
    method8_relatedProfiles?: any[];
  };
}

export interface TikTokEnrichment {
  hasEnrichment: boolean;
  enrichedAt: Timestamp;
  dataCompleteness: number;

  // TikTok-specific metrics
  videosCount: number;
  totalLikes: number;
  avgViews: number;
  avgShares: number;
  engagementRate: number;
  topSounds: string[];
  topEffects: string[];
  duetsEnabled: boolean;
  stitchEnabled: boolean;

  // Raw data
  rawData?: any;
}

export interface YouTubeEnrichment {
  hasEnrichment: boolean;
  enrichedAt: Timestamp;
  dataCompleteness: number;

  // YouTube-specific metrics
  videosCount: number;
  totalViews: number;
  avgViews: number;
  avgLikes: number;
  subscriberCount: number;
  engagementRate: number;
  videoCategories: string[];
  avgVideoDuration: number;     // In seconds
  uploadFrequency: string;

  // Raw data
  rawData?: any;
}

export interface TwitterEnrichment {
  hasEnrichment: boolean;
  enrichedAt: Timestamp;
  dataCompleteness: number;

  // Twitter-specific metrics
  tweetsCount: number;
  avgRetweets: number;
  avgLikes: number;
  avgReplies: number;
  engagementRate: number;
  topMentions: string[];
  tweetFrequency: string;

  // Raw data
  rawData?: any;
}

/**
 * Global Influencer Document Structure
 * Collection: global_influencers
 */
export interface GlobalInfluencer {
  id: string;                   // Firestore document ID

  // Basic Profile Info (INDEXED)
  displayName: string;          // Primary display name
  primaryUsername: string;      // Username on primary platform
  bio: string;                  // Profile bio/description
  avatarUrl: string;            // Profile picture URL
  verified: boolean;            // Verified on any platform

  // Platform Accounts
  platforms: PlatformAccount[];

  // Aggregated Metrics (INDEXED)
  totalFollowers: number;       // Sum across all platforms
  averageEngagementRate: number; // Weighted average
  totalReach: number;           // Estimated reach
  primaryPlatform: Platform;    // Platform with most followers

  // Location (INDEXED)
  location: Location;

  // Categories & Topics (INDEXED with array-contains)
  categories: string[];         // e.g., ["Fashion", "Beauty", "Lifestyle"]
  topics: string[];             // e.g., ["makeup", "skincare", "fashion"]

  // Platform-Specific Enrichment Data
  instagramEnrichment?: InstagramEnrichment;
  tiktokEnrichment?: TikTokEnrichment;
  youtubeEnrichment?: YouTubeEnrichment;
  twitterEnrichment?: TwitterEnrichment;

  // Discovery Metadata (INDEXED)
  addedToCollectionCount: number; // How many users saved this
  viewCount: number;              // How many times viewed
  lastSearchedAt: Timestamp;      // Last time someone searched for this

  // Timestamps (INDEXED)
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Search Optimization (INDEXED with array-contains)
  searchKeywords: string[];     // Generated from name, bio, topics

  // ─── Fields consolidated from unified_profiles ───
  // These fields are written during profile creation and enrichment.
  // They coexist with the discovery-oriented fields above.

  influenceScore?: number;                 // 0-100 calculated score
  estimatedPrice?: string;                 // e.g., "$500-$2,000"
  linkedAccounts?: LinkedPlatformAccount[]; // Richer than platforms[] — has displayName, avatarUrl, bio, contactInfo
  combinedMetrics?: CombinedMetrics;        // Nested: totalFollowers, averageEngagementRate, totalReach, followersByPlatform
  enrichmentSummary?: EnrichmentSummary;    // Lightweight enrichment summary (for /api/enrich/instagram)
  enrichmentDataUrl?: string;               // URL to full enrichment JSON in Firebase Storage
  userId?: string;                          // Owner who created this profile
  primaryAccountKey?: string;               // Dedup key: "platform:username"
}

/**
 * Helper type for creating new global influencer entries
 */
export type CreateGlobalInfluencer = Omit<GlobalInfluencer, 'id' | 'createdAt' | 'updatedAt' | 'addedToCollectionCount' | 'viewCount' | 'lastSearchedAt'> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  addedToCollectionCount?: number;
  viewCount?: number;
  lastSearchedAt?: Timestamp;
};

/**
 * Helper type for updating global influencer entries
 */
export type UpdateGlobalInfluencer = Partial<Omit<GlobalInfluencer, 'id' | 'createdAt'>> & {
  updatedAt: Timestamp;
};
