/**
 * Discovery API Mappers
 *
 * Utilities to map between UI state and API request/response formats
 */

import { DiscoverFilters } from '@/types/saved-search';
import { GlobalInfluencer } from '@/types/global-influencer';
import { Platform } from '@/types/api';

/**
 * Maps UI filter state to API DiscoverFilters format
 */
export interface UIFilterState {
  // PROFILE Section
  selectedPlatforms: string[];
  selectedFollowerRanges: string[];
  selectedEngagementRanges: string[];
  selectedTrueReachRanges: string[];

  // AUDIENCE Section
  selectedLocations: string[];
  selectedAgeRanges: string[];
  femaleSliderValue: number;
  maleSliderValue: number;
  selectedBrandAffinities: string[];

  // CONTENT Section
  // Add content filters when design is available
}

/**
 * Convert follower range string to min/max values
 */
function parseFollowerRange(range: string): { min?: number; max?: number } {
  switch (range) {
    case '0-499':
      return { min: 0, max: 499 };
    case '500-999':
      return { min: 500, max: 999 };
    case '1000-3999':
      return { min: 1000, max: 3999 };
    case '4000-8999':
      return { min: 4000, max: 8999 };
    case '9000+':
      return { min: 9000 };
    default:
      return {};
  }
}

/**
 * Convert engagement/reach percentage range to min/max values
 */
function parsePercentageRange(range: string): { min?: number; max?: number } {
  switch (range) {
    case '0-4%':
      return { min: 0, max: 4 };
    case '5%-9%':
      return { min: 5, max: 9 };
    case '10%-19%':
      return { min: 10, max: 19 };
    case '20%-50%':
      return { min: 20, max: 50 };
    case '51%+':
      return { min: 51 };
    default:
      return {};
  }
}

/**
 * Map age range UI string to API format
 */
function mapAgeRange(ageRanges: string[]): string | undefined {
  // If multiple ranges selected, use the first one (or implement OR logic)
  if (ageRanges.length === 0) return undefined;
  return ageRanges[0]; // e.g., "18-24", "25-39", etc.
}

/**
 * Map gender slider values to API format
 */
function mapAudienceGender(femaleValue: number, maleValue: number): 'male' | 'female' | 'balanced' | undefined {
  // If neither slider is set (both at 0), return undefined
  if (femaleValue === 0 && maleValue === 0) return undefined;

  // If both are set to similar values, return balanced
  if (Math.abs(femaleValue - maleValue) < 20) return 'balanced';

  // Otherwise return the dominant gender
  return femaleValue > maleValue ? 'female' : 'male';
}

/**
 * Maps UI filter state to API DiscoverFilters
 */
export function mapUIFiltersToAPI(uiFilters: Partial<UIFilterState>): DiscoverFilters {
  const apiFilters: DiscoverFilters = {};

  // Platform filters
  if (uiFilters.selectedPlatforms && uiFilters.selectedPlatforms.length > 0) {
    apiFilters.platforms = uiFilters.selectedPlatforms as Platform[];
  }

  // Follower range filters
  if (uiFilters.selectedFollowerRanges && uiFilters.selectedFollowerRanges.length > 0) {
    // If multiple ranges selected, use the min of all mins and max of all maxes
    const ranges = uiFilters.selectedFollowerRanges.map(parseFollowerRange);
    const mins = ranges.map(r => r.min).filter(v => v !== undefined) as number[];
    const maxes = ranges.map(r => r.max).filter(v => v !== undefined) as number[];

    if (mins.length > 0) apiFilters.minFollowers = Math.min(...mins);
    if (maxes.length > 0) apiFilters.maxFollowers = Math.max(...maxes);
  }

  // Engagement rate filters
  if (uiFilters.selectedEngagementRanges && uiFilters.selectedEngagementRanges.length > 0) {
    const ranges = uiFilters.selectedEngagementRanges.map(parsePercentageRange);
    const mins = ranges.map(r => r.min).filter(v => v !== undefined) as number[];
    const maxes = ranges.map(r => r.max).filter(v => v !== undefined) as number[];

    if (mins.length > 0) apiFilters.minEngagementRate = Math.min(...mins);
    if (maxes.length > 0) apiFilters.maxEngagementRate = Math.max(...maxes);
  }

  // Location filters (cities)
  if (uiFilters.selectedLocations && uiFilters.selectedLocations.length > 0) {
    apiFilters.cities = uiFilters.selectedLocations;
  }

  // Age range filters
  if (uiFilters.selectedAgeRanges && uiFilters.selectedAgeRanges.length > 0) {
    apiFilters.audienceAgeGroup = mapAgeRange(uiFilters.selectedAgeRanges);
  }

  // Gender filters
  if (uiFilters.femaleSliderValue !== undefined && uiFilters.maleSliderValue !== undefined) {
    const audienceGender = mapAudienceGender(uiFilters.femaleSliderValue, uiFilters.maleSliderValue);
    if (audienceGender) {
      apiFilters.audienceGender = audienceGender;
    }
  }

  return apiFilters;
}

/**
 * Maps GlobalInfluencer (API response) to RecommendedCreatorCard format
 */
export interface CreatorCardData {
  id: string;
  avatarUrl: string;
  name: string;
  handle: string;
  isVerified: boolean;
  isBookmarked: boolean;
  stats: {
    followers: string;
    engagement: string;
    reach: string;
  };
  socials: ('instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook')[];
  specialty: string;
  tags: string[];
}

/**
 * Format large numbers (e.g., 1234 → "1.2K", 1234567 → "1.2M")
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Maps GlobalInfluencer to CreatorCardData
 */
export function mapGlobalInfluencerToCard(influencer: GlobalInfluencer): CreatorCardData {
  return {
    id: influencer.id,
    avatarUrl: influencer.avatarUrl,
    name: influencer.displayName,
    handle: '@' + influencer.primaryUsername,
    isVerified: influencer.verified,
    isBookmarked: false, // TODO: Check if user has saved this influencer
    stats: {
      followers: formatNumber(influencer.totalFollowers),
      engagement: influencer.averageEngagementRate.toFixed(1) + '%',
      reach: formatNumber(influencer.totalReach || influencer.totalFollowers),
    },
    socials: influencer.platforms.map(p => p.platform) as ('instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook')[],
    specialty: influencer.bio,
    tags: influencer.categories || [],
  };
}

/**
 * Maps array of GlobalInfluencer to array of CreatorCardData
 */
export function mapGlobalInfluencersToCards(influencers: GlobalInfluencer[]): CreatorCardData[] {
  return influencers.map(mapGlobalInfluencerToCard);
}

/**
 * Bridges Raw Streaming API results to the UI format
 */
export function transformProfile(result: any): CreatorCardData {
  const followers = result.follower_count || result.totalFollowers || 0;

  return {
    id: result.id || result._id || `${result.platform || 'unknown'}_${result.username || Date.now()}`,
    avatarUrl: result.avatar_url || result.avatarUrl || "",
    name: result.display_name || result.displayName || result.name || "Unknown",
    handle: "@" + (result.username || result.handle || ""),
    isVerified: result.verified || false,
    isBookmarked: false,
    stats: {
      followers: formatNumber(followers),
      engagement: (result.engagement_rate || result.averageEngagementRate || 0).toFixed(1) + "%",
      reach: formatNumber(result.trueReach || result.totalReach || followers),
    },
    // Ensure socials is an array of valid platform strings
    socials: Array.isArray(result.platforms) ? result.platforms : [result.platform || 'instagram'],
    specialty: result.bio || "",
    tags: result.categories || result.topics || [],
  };
}