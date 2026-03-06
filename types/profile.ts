/**
 * Type definitions for UI-ready transformed profile data
 * These interfaces represent data after transformation from Apify responses
 */

import { Platform } from './apify';

// ============================================================================
// Header Section
// ============================================================================

export interface ExternalLink {
  title: string;
  url: string;
  platform?: Platform;
}

export interface ProfileHeader {
  avatar: string;
  avatarHD: string;
  fullName: string;
  username: string;
  verified: boolean;
  bio: string;
  location: string;
  externalLinks: ExternalLink[];
  category?: string;
}

// ============================================================================
// Profile Snapshot (Metrics)
// ============================================================================

export interface ProfileSnapshot {
  followersCount: number;
  followersGrowth: number; // Percentage (e.g., 5.2 for 5.2%)
  avgEngagement: number;
  engagementRate: number; // Percentage (e.g., 6.2 for 6.2%)
  totalFollowing: number;
  postsCount: number;
}

// ============================================================================
// Insights
// ============================================================================

export interface ProfileInsights {
  locations: string[];
  languages: string[];
  topics: string[];
  socialPlatforms: PlatformInfo[];
}

export interface PlatformInfo {
  platform: Platform;
  url: string;
  icon?: string;
}

// ============================================================================
// Metrics Table
// ============================================================================

export interface PlatformMetric {
  network: string;
  platform: Platform;
  followers: number;
  engagements: number;
  engagementRate: number; // Percentage
  emv: number; // Estimated Media Value
  brand: number; // Brand value
}

// ============================================================================
// Content Posts
// ============================================================================

export interface ContentPost {
  id: string;
  platform: Platform;
  thumbnail: string;
  type: 'image' | 'video';
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  url: string;
  timestamp: string;
  caption?: string;
  hashtags?: string[];
}

// ============================================================================
// Demographics
// ============================================================================

export interface CountryData {
  country: string;
  flag: string;
  percentage: number;
}

export interface BrandData {
  brand: string;
  logo?: string;
  percentage: number;
}

export interface AgeRange {
  range: string;
  percentage: number;
}

export interface Demographics {
  averageAge: number;
  ageRanges: AgeRange[];
  genderSplit: {
    female: number;
    male: number;
    other: number;
  };
  topCountries: CountryData[];
  interests: string[];
  brandAffinity: BrandData[];
}

// ============================================================================
// Similar Creators
// ============================================================================

export interface SimilarCreator {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  verified: boolean;
  influenceScore: number;
  categories: string[];
  followers?: number;
  engagement?: number;
  campaigns?: number;
  platforms?: Platform[];
}

// ============================================================================
// Complete Transformed Profile
// ============================================================================

export interface TransformedProfile {
  header: ProfileHeader;
  snapshot: ProfileSnapshot;
  insights: ProfileInsights;
  metrics: PlatformMetric[];
  content: ContentPost[];
  demographics: Demographics;
  similar: SimilarCreator[];
}

// ============================================================================
// Profile Summary (Lightweight version for lists)
// ============================================================================

export interface ProfileSummary {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  verified: boolean;
  followersCount: number;
  engagementRate: number;
  platforms: Platform[];
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ProfileApiResponse {
  success: boolean;
  data?: TransformedProfile;
  error?: string;
  timestamp: string;
}
