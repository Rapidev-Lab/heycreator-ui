/**
 * Complete Profile Types
 * Comprehensive data structures for all 50+ influencer fields
 */

import { Platform } from './api';

// =============================================================================
// TIER 1: Essential Profile Data (8 fields)
// =============================================================================

export interface BasicProfileData {
  userId: string;
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  verified: boolean;
}

// =============================================================================
// TIER 2: Business Intelligence (12 fields)
// =============================================================================

export interface BusinessIntelligence {
  isBusinessAccount: boolean;
  businessCategory?: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
  businessAddress?: string;
  externalUrl?: string;
  publicEmail?: string;
  contactPhoneNumber?: string;
  isJoinedRecently: boolean;
  categoryName?: string;
  transparency?: {
    isPaidPartnership: boolean;
  };
}

// =============================================================================
// TIER 3: Content & Engagement Analysis (15 fields)
// =============================================================================

export interface ContentEngagementData {
  profilePicUrl: string;
  profilePicUrlHd?: string;
  hasHighlightReels: boolean;
  highlightReelCount: number;
  hasGuides: boolean;
  igtvVideoCount: number;
  hasChannel: boolean;
  hasArEffects: boolean;
  postsPerMonth: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  lastPostDate?: Date;
  isPrivate: boolean;
  hasAnonymousProfilePicture: boolean;
}

// =============================================================================
// TIER 4: Network & Collaboration (8 fields)
// =============================================================================

export interface NetworkCollaborationData {
  mutualFollowedBy: string[];
  followedByViewer: boolean;
  followsViewer: boolean;
  requestedByViewer: boolean;
  blockedByViewer: boolean;
  hasBlockedViewer: boolean;
  relatedProfiles: RelatedProfile[];
}

export interface RelatedProfile {
  id: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  followersCount?: number;
}

// =============================================================================
// TIER 5: Extended Media & Content (7+ fields)
// =============================================================================

export interface ExtendedMediaContent {
  latestPosts: Post[];
  topPosts: Post[];
  contentTypes: ContentTypeBreakdown;
  postingPattern: PostingPattern;
}

export interface Post {
  id: string;
  shortcode: string;
  displayUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: Date;
  isVideo: boolean;
  videoViews?: number;
  videoPlayCount?: number;
  type: 'photo' | 'video' | 'carousel' | 'reel' | 'igtv';
  url?: string;
  location?: {
    name: string;
    city?: string;
    country?: string;
  };
  hashtags: string[];
  mentions: string[];
}

export interface ContentTypeBreakdown {
  photos: number;
  videos: number;
  reels: number;
  igtv: number;
  carousel: number;
}

export interface PostingPattern {
  daily: number;
  weekly: number;
  monthly: number;
  bestDays: string[];  // ['Monday', 'Friday']
  bestTimes: string[]; // ['18:00-20:00', '12:00-14:00']
}

// =============================================================================
// Audience Analytics (Calculated/Estimated)
// =============================================================================

export interface AudienceAnalytics {
  demographics: {
    ageGroups: AgeGroupBreakdown;
    gender: GenderBreakdown;
    topCountries: CountryData[];
    topCities: CityData[];
  };
  authenticity: {
    realFollowers: number;
    suspiciousFollowers: number;
    influencers: number;
    massFollowers: number;
    authenticityScore: number;  // 0-100
  };
  engagementQuality: {
    genuineEngagement: number;
    likelyBots: number;
    averageEngagementTime: number;  // minutes
    peakEngagementHours: number[];  // [18, 19, 20]
  };
  interests: {
    topInterests: string[];
    brandAffinity: BrandAffinity[];
  };
}

export interface AgeGroupBreakdown {
  '13-17': number;
  '18-24': number;
  '25-34': number;
  '35-44': number;
  '45-54': number;
  '55-64': number;
  '65+': number;
}

export interface GenderBreakdown {
  male: number;
  female: number;
  other: number;
}

export interface CountryData {
  country: string;
  countryCode: string;  // 'US', 'UK', etc.
  percentage: number;
}

export interface CityData {
  city: string;
  country: string;
  percentage: number;
}

export interface BrandAffinity {
  brand: string;
  category: string;
  score: number;  // 0-100
}

// =============================================================================
// Content Analysis (Calculated)
// =============================================================================

export interface ContentAnalysis {
  topHashtags: HashtagPerformance[];
  topMentions: MentionData[];
  themes: string[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  languageDistribution: {
    [language: string]: number;
  };
}

export interface HashtagPerformance {
  hashtag: string;
  count: number;
  avgEngagement: number;
  trend: 'rising' | 'stable' | 'declining';
}

export interface MentionData {
  username: string;
  count: number;
  type: 'brand' | 'influencer' | 'user';
}

// =============================================================================
// Complete Instagram Profile (All Tiers Combined)
// =============================================================================

export interface InstagramProfileComplete {
  // Tier 1: Essential
  userId: string;
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  verified: boolean;

  // Tier 2: Business Intelligence
  isBusinessAccount: boolean;
  businessCategory?: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
  businessAddress?: string;
  externalUrl?: string;
  publicEmail?: string;
  contactPhoneNumber?: string;
  isJoinedRecently: boolean;
  categoryName?: string;
  transparency?: {
    isPaidPartnership: boolean;
  };

  // Tier 3: Content & Engagement
  profilePicUrl: string;
  profilePicUrlHd?: string;
  hasHighlightReels: boolean;
  highlightReelCount: number;
  hasGuides: boolean;
  igtvVideoCount: number;
  hasChannel: boolean;
  hasArEffects: boolean;
  postsPerMonth: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  lastPostDate?: Date;
  isPrivate: boolean;
  hasAnonymousProfilePicture: boolean;

  // Tier 4: Network & Collaboration
  mutualFollowedBy: string[];
  followedByViewer: boolean;
  followsViewer: boolean;
  requestedByViewer: boolean;
  blockedByViewer: boolean;
  hasBlockedViewer: boolean;
  relatedProfiles: RelatedProfile[];

  // Tier 5: Extended Media
  latestPosts: Post[];
  topPosts: Post[];
  contentTypes: ContentTypeBreakdown;
  postingPattern: PostingPattern;

  // Raw data (for debugging and future use)
  rawData?: any;
}

// =============================================================================
// Complete Profile (Multi-Platform Support)
// =============================================================================

export interface CompleteInfluencerProfile {
  // Document ID
  _id: string;

  // Identifiers
  platform: Platform;
  username: string;
  platformUserId: string;

  // Platform-specific profile data
  basicProfile: InstagramProfileComplete;  // Will be union type for other platforms

  // Calculated analytics
  audienceAnalytics?: AudienceAnalytics;
  contentAnalysis?: ContentAnalysis;

  // Multi-platform linking
  unifiedProfileId?: string;
  linkedPlatforms: LinkedPlatformInfo[];

  // Metadata
  dataCompleteness: number;  // 0-100%
  lastFetched: Date;
  fetchCount: number;
  needsRefresh: boolean;
  refreshAfter: Date;

  // Searchability
  searchKeywords: string[];
  categories: string[];
  location?: string;
  language?: string;

  // Classification
  isVerified: boolean;
  followerTier: FollowerTier;
  engagementTier: EngagementTier;
  brandSafetyScore: number;  // 0-100

  // Performance metrics
  influenceScore: number;  // 0-100
  reachEstimate: number;
  estimatedCPM: number;
  estimatedPostPrice: number;
}

export interface LinkedPlatformInfo {
  platform: Platform;
  username: string;
  profileId: string;
  verified: boolean;
  followers: number;
}

export type FollowerTier =
  | 'nano'      // <10K
  | 'micro'     // 10K-100K
  | 'mid'       // 100K-500K
  | 'macro'     // 500K-1M
  | 'mega';     // >1M

export type EngagementTier =
  | 'low'          // <1%
  | 'medium'       // 1-3%
  | 'high'         // 3-6%
  | 'very-high';   // >6%

// =============================================================================
// Profile Enrichment Request/Response
// =============================================================================

export interface ProfileEnrichmentRequest {
  platform: Platform;
  username: string;
  userId?: string;
  forceRefresh?: boolean;
}

export interface ProfileEnrichmentResponse {
  success: boolean;
  profile?: CompleteInfluencerProfile;
  cached: boolean;
  fetchTime: number;  // milliseconds
  error?: string;
}

// =============================================================================
// Search Filter Types
// =============================================================================

export interface AdvancedSearchFilters {
  // Basic filters
  platforms?: Platform[];
  verified?: boolean;

  // Follower filters
  followers?: {
    min?: number;
    max?: number;
  };

  // Engagement filters
  engagementRate?: {
    min?: number;
    max?: number;
  };

  // Location filters
  location?: string;
  countries?: string[];
  cities?: string[];

  // Category filters
  categories?: string[];

  // Demographics filters
  audienceAge?: {
    group: keyof AgeGroupBreakdown;
    min: number;
  };
  audienceGender?: {
    gender: keyof GenderBreakdown;
    min: number;
  };

  // Content filters
  postingFrequency?: {
    min?: number;  // posts per month
    max?: number;
  };
  contentTypes?: {
    type: keyof ContentTypeBreakdown;
    min: number;  // percentage
  };

  // Business filters
  isBusinessAccount?: boolean;
  hasEmail?: boolean;
  hasPhoneNumber?: boolean;

  // Quality filters
  authenticityScore?: {
    min?: number;
  };
  brandSafetyScore?: {
    min?: number;
  };

  // Tier filters
  followerTier?: FollowerTier[];
  engagementTier?: EngagementTier[];
}

export interface SearchSortOptions {
  field: 'followersCount' | 'engagementRate' | 'influenceScore' | 'lastPostDate';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface AdvancedSearchRequest {
  query?: string;
  filters: AdvancedSearchFilters;
  sort?: SearchSortOptions;
  pagination?: PaginationOptions;
}

export interface AdvancedSearchResponse {
  success: boolean;
  results: CompleteInfluencerProfile[];
  total: number;
  page: number;
  hasMore: boolean;
  searchTime: number;
}
