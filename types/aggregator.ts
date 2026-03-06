/**
 * Profile Aggregator Type Definitions
 * These types support the unified profile system that combines
 * multiple social media accounts into a single influencer profile.
 */

import { Platform, SearchResultProfile } from './api';
import {
  SocialPlatform,
  PlatformMetrics,
  ContentPost,
  DemographicData,
  SimilarInfluencer
} from './influencer';
import { ApifyEnrichmentData } from './apify';

/**
 * Represents a single social media account linked to a unified profile.
 * This maps directly to the `linked_accounts` table in the future database.
 */
export interface LinkedPlatformAccount {
  /** Unique identifier for this linked account */
  id: string;

  /** Social media platform (instagram, tiktok, youtube, twitter, facebook) */
  platform: Platform;

  /** Username on the platform (e.g., @johndoe) */
  username: string;

  /** Display name on the platform */
  displayName: string;

  /** Number of followers on this platform */
  followerCount: number;

  /** Direct URL to the profile on the platform */
  profileUrl: string;

  /** Avatar/profile picture URL */
  avatarUrl?: string;

  /** Bio/description from the platform */
  bio?: string;

  /** Contact email if available */
  contactEmail?: string;

  /** Contact phone if available */
  contactPhone?: string;

  /** Contact website if available */
  contactWebsite?: string;

  /** Whether the account is verified on the platform */
  verified: boolean;

  /** Timestamp when this account was linked */
  linkedAt: string;

  /** Timestamp of last data sync from the platform */
  lastSyncedAt: string;
}

/**
 * Represents a unified influencer profile combining multiple platform accounts.
 * This maps directly to the `unified_profiles` table in the future database.
 */
export interface UnifiedProfile {
  /** Unique identifier for the unified profile (UUID format) */
  id: string;

  /** Primary display name chosen by the user */
  displayName: string;

  /** Primary avatar URL (selected from linked accounts or custom) */
  avatarUrl?: string;

  /** Combined/merged bio from all accounts or custom */
  bio?: string;

  /** Primary location */
  location?: string;

  /** Country flag emoji */
  flag?: string;

  /** Categories/niches the influencer operates in */
  categories: string[];

  /** All linked social media accounts */
  linkedAccounts: LinkedPlatformAccount[];

  /** Combined metrics across all platforms */
  combinedMetrics: CombinedMetrics;

  /** Calculated influence score (0-100) */
  influenceScore: number;

  /** Estimated price per post */
  estimatedPrice?: string;

  /** Main content topics */
  mainTopics?: string[];

  /** Brand safety rating */
  brandSafety?: 'Safe' | 'Moderate' | 'Risky';

  /** Target audience age group */
  audienceAgeGroup?: string;

  /** Audience authenticity rating */
  audienceAuthenticity?: 'Great' | 'Good' | 'Fair' | 'Poor';

  /** Top audience locations */
  audienceLocation?: string[];

  /** Previous brand collaborations */
  portfolio?: string[];

  /** How often they post sponsored content */
  sponsoredContentFrequency?: string;

  /** Detailed platform-specific metrics */
  platformMetrics?: PlatformMetrics[];

  /** Recent content posts */
  contentPosts?: ContentPost[];

  /** Audience demographic data */
  demographics?: DemographicData;

  /** Similar influencers */
  similarInfluencers?: SimilarInfluencer[];

  /** Raw enrichment data from Apify (for detailed analytics) */
  /** @deprecated Use enrichmentSummary instead - rawEnrichmentData is too large (5MB+) for Firestore */
  rawEnrichmentData?: ApifyEnrichmentData;

  /** Lightweight enrichment summary (stays under 1MB Firestore limit) */
  enrichmentSummary?: EnrichmentSummary;

  /** URL to full enrichment data JSON file in Firebase Storage */
  enrichmentDataUrl?: string;

  /** Timestamp when profile was created */
  createdAt: string;

  /** Timestamp of last update */
  updatedAt: string;

  /** User who created this profile (for future auth) */
  createdBy?: string;

  /** Profile status */
  status: 'active' | 'archived' | 'deleted';
}

/**
 * Combined metrics calculated from all linked platform accounts.
 */
export interface CombinedMetrics {
  /** Total followers across all platforms */
  totalFollowers: number;

  /** Average engagement rate across platforms */
  averageEngagementRate: number;

  /** Estimated total reach */
  totalReach: number;

  /** Total engagements (likes, comments, shares) */
  totalEngagements: number;

  /** Breakdown of followers by platform */
  followersByPlatform: {
    platform: Platform;
    count: number;
    percentage: number;
  }[];
}

/**
 * Represents the UI state during the aggregation selection process.
 * Used by the ProfileAggregator component.
 */
export interface AggregationSelection {
  /** Search query used to find these profiles */
  searchQuery: string;

  /** All search results grouped by platform */
  searchResults: SearchResultProfile[];

  /** IDs of selected profiles to be merged */
  selectedProfileIds: Set<string>;

  /** Custom display name for the unified profile */
  customDisplayName: string;

  /** Custom bio for the unified profile */
  customBio: string;

  /** Selected categories */
  selectedCategories: string[];

  /** Selected primary avatar URL */
  selectedAvatarUrl?: string;
}

/**
 * Request payload for creating a unified profile.
 */
export interface CreateUnifiedProfileRequest {
  /** Selected search result profiles to merge */
  selectedProfiles: SearchResultProfile[];

  /** Custom display name (optional, will use best match if not provided) */
  displayName?: string;

  /** Custom bio (optional, will merge from profiles if not provided) */
  bio?: string;

  /** Location (optional) */
  location?: string;

  /** Categories/niches */
  categories?: string[];

  /** Selected avatar URL from one of the profiles */
  avatarUrl?: string;
}

/**
 * Request payload for updating a unified profile.
 */
export interface UpdateUnifiedProfileRequest {
  /** Profile ID to update */
  id: string;

  /** Fields to update */
  updates: Partial<Omit<UnifiedProfile, 'id' | 'createdAt' | 'createdBy'>>;
}

/**
 * Request to add more linked accounts to an existing profile.
 */
export interface AddLinkedAccountsRequest {
  /** Unified profile ID */
  profileId: string;

  /** New accounts to add */
  accounts: SearchResultProfile[];
}

/**
 * Request to remove linked accounts from a profile.
 */
export interface RemoveLinkedAccountsRequest {
  /** Unified profile ID */
  profileId: string;

  /** IDs of linked accounts to remove */
  accountIds: string[];
}

/**
 * Response for profile operations.
 */
export interface ProfileOperationResponse {
  success: boolean;
  data?: UnifiedProfile;
  error?: string;
}

/**
 * Search results grouped by platform for the aggregator UI.
 */
export interface GroupedSearchResults {
  platform: Platform;
  results: SearchResultProfile[];
  count: number;
}

/**
 * Preview data shown before creating a unified profile.
 */
export interface UnifiedProfilePreview {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  platforms: Platform[];
  totalFollowers: number;
  averageEngagementRate: number;
  linkedAccountsCount: number;
  selectedProfiles: SearchResultProfile[];
}

/**
 * Sort options for unified profiles list.
 */
export type UnifiedProfileSortOption =
  | 'createdAt'
  | 'updatedAt'
  | 'displayName'
  | 'totalFollowers'
  | 'influenceScore';

/**
 * Filter options for unified profiles.
 */
export interface UnifiedProfileFilters {
  platforms?: Platform[];
  minFollowers?: number;
  maxFollowers?: number;
  categories?: string[];
  status?: 'active' | 'archived' | 'deleted';
  search?: string;
}

/**
 * Lightweight enrichment summary for Firestore storage
 * Contains essential data without the bulk (posts, comments, etc.)
 * Designed to stay well under Firestore's 1MB document limit
 */
export interface EnrichmentSummary {
  /** When this data was enriched */
  enrichedAt: string;

  /** Platform enriched (currently only instagram) */
  platform: Platform;

  /** Username on the platform */
  username: string;

  /** Profile details */
  profile: {
    userId: string;
    fullName: string;
    biography: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    verified: boolean;
    profilePicUrl: string;
    profilePicUrlHD?: string;
    isBusinessAccount: boolean;
    businessCategoryName?: string;
    externalUrl?: string;
    businessEmail?: string;
  };

  /** Engagement metrics */
  metrics: {
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    postingFrequency: 'daily' | 'weekly' | 'monthly';
  };

  /** Top hashtags (limited to 20) */
  topHashtags: string[];

  /** Top posts (limited to 10) */
  topPosts?: Array<{
    id: string;
    displayUrl: string;
    likesCount: number;
    commentsCount: number;
    timestamp: string;
    caption?: string;
  }>;

  /** Related profiles (limited to 10) */
  relatedProfiles?: Array<{
    id: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
    followersCount: number;
  }>;

  /** Data completeness score (0-100) */
  dataCompleteness: number;

  /** Sources used for enrichment */
  sourcesUsed: string[];
}
