/**
 * Saved Search Schema
 *
 * This collection stores user's favorite filter combinations for quick access.
 * Users can save complex filter sets and reuse them later.
 *
 * Key Features:
 * - Save filter presets with custom names
 * - Support both discovery and collection contexts
 * - Track usage frequency
 * - Set default searches
 */

import { Timestamp } from "firebase-admin/firestore";
import { Platform } from "./global-influencer";

export type SearchContext = "discover" | "collection";

export type SortBy =
  | "followers"
  | "engagement"
  | "recent"
  | "relevance"
  | "popularity";
export type SortOrder = "asc" | "desc";

export interface DiscoverFilters {
  collaborationStatus?: string,
  // Text Search
  starred?: boolean;
  keywords?: string;

  // Platform Filters
  platforms?: Platform[];
  primaryPlatform?: Platform;

  // Follower Range
  minFollowers?: number;
  maxFollowers?: number;

  // Engagement Metrics (requires enrichment)
  minEngagementRate?: number;
  maxEngagementRate?: number;
  minAvgLikes?: number;
  minAvgComments?: number;

  // Location Filters
  countries?: string[];
  cities?: string[];
  radius?: {
    centerLat: number;
    centerLng: number;
    distanceKm: number;
  };

  // Category & Topic Filters
  categories?: string[];
  topics?: string[];
  hashtags?: string[];

  // Status Filters
  verified?: boolean;
  hasEnrichment?: boolean;

  // Content Filters (requires enrichment)
  postingFrequency?: "daily" | "weekly" | "monthly";
  minPostCount?: number;
  contentTypes?: Array<"post" | "reel" | "video">;

  // Audience Filters (requires enrichment)
  audienceCountries?: string[];
  audienceAgeGroup?: string;
  audienceGender?: "male" | "female" | "balanced";

  // Sorting
  sortBy?: SortBy;
  sortOrder?: SortOrder;

  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Saved Search Document Structure
 * Collection: saved_searches
 */
export interface SavedSearch {
  id: string; // Firestore document ID
  userId: string; // Firebase Auth UID (INDEXED)

  // Search Metadata
  name: string; // User-provided name (e.g., "LA Fashion Micro-Influencers")
  description?: string; // Optional description

  // Filter Configuration
  filters: DiscoverFilters;

  // Context (INDEXED)
  context: SearchContext; // Which page this search is for

  // Settings
  isDefault: boolean; // Load this search automatically

  // Usage Statistics
  useCount: number; // How many times used
  lastUsedAt: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Helper type for creating new saved searches
 */
export type CreateSavedSearch = Omit<
  SavedSearch,
  "id" | "createdAt" | "updatedAt" | "useCount"
> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  useCount?: number;
};

/**
 * Helper type for updating saved searches
 */
export type UpdateSavedSearch = Partial<
  Omit<SavedSearch, "id" | "userId" | "createdAt">
> & {
  updatedAt: Timestamp;
};

/**
 * Type for filter preset (commonly used filter combinations)
 */
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: DiscoverFilters;
}

/**
 * Built-in filter presets
 */
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "micro-influencers",
    name: "Micro-Influencers",
    description: "10K-100K followers with high engagement",
    icon: "users",
    filters: {
      minFollowers: 10000,
      maxFollowers: 100000,
      minEngagementRate: 3,
      sortBy: "engagement",
      sortOrder: "desc",
    },
  },
  {
    id: "mega-influencers",
    name: "Mega Influencers",
    description: "1M+ followers",
    icon: "star",
    filters: {
      minFollowers: 1000000,
      sortBy: "followers",
      sortOrder: "desc",
    },
  },
  {
    id: "verified-only",
    name: "Verified Only",
    description: "Verified accounts across all platforms",
    icon: "badge-check",
    filters: {
      verified: true,
      sortBy: "followers",
      sortOrder: "desc",
    },
  },
  {
    id: "fashion-beauty",
    name: "Fashion & Beauty",
    description: "Fashion and beauty influencers",
    icon: "sparkles",
    filters: {
      categories: ["Fashion", "Beauty"],
      sortBy: "engagement",
      sortOrder: "desc",
    },
  },
  {
    id: "tech-gaming",
    name: "Tech & Gaming",
    description: "Tech and gaming content creators",
    icon: "gamepad-2",
    filters: {
      categories: ["Technology", "Gaming"],
      sortBy: "followers",
      sortOrder: "desc",
    },
  },
];
