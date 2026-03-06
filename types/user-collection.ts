/**
 * User Collection Schema
 *
 * This collection stores references to influencers that a user has saved to their personal collection.
 * It links to the global_influencers collection and adds user-specific metadata.
 *
 * Key Features:
 * - References global influencer data (avoids duplication)
 * - User-specific customizations (tags, notes, custom names)
 * - Collaboration status tracking
 * - Enrichment status and triggers
 * - List/folder organization
 */

import { Timestamp } from 'firebase-admin/firestore';

export type CollaborationStatus =
  | 'none'          // No contact made
  | 'contacted'     // Reached out
  | 'negotiating'   // In discussions
  | 'active'        // Currently working together
  | 'completed';    // Collaboration finished

export type EnrichmentStatus =
  | 'none'          // No enrichment
  | 'pending'       // Queued for enrichment
  | 'enriching'     // Currently enriching
  | 'complete'      // Enrichment complete
  | 'failed';       // Enrichment failed

export interface ContractDetails {
  rate?: number;                // Agreed rate in USD
  currency?: string;            // Currency code (default: USD)
  deliverables: string[];       // List of agreed deliverables
  startDate?: Timestamp;
  endDate?: Timestamp;
  notes?: string;
}

/**
 * User Collection Document Structure
 * Collection: user_collections
 */
export interface UserCollection {
  id: string;                   // Firestore document ID
  userId: string;               // Firebase Auth UID (INDEXED - partition key)

  // Reference to Global Profile (INDEXED)
  globalInfluencerId: string;   // FK to global_influencers collection

  // User-Specific Customizations
  customDisplayName?: string;   // User can override display name
  customCategories: string[];   // User's custom tags/categories
  notes: string;                // Private notes about this influencer

  // Collection Organization (INDEXED)
  lists: string[];              // e.g., ["Fashion Week 2025", "Summer Campaign"]
  starred: boolean;             // Favorite/starred status

  // Collaboration Tracking
  collaborationStatus: CollaborationStatus;
  lastContactedAt?: Timestamp;
  contractDetails?: ContractDetails;

  // Profile Status (consolidated from unified_profiles)
  profileStatus: 'active' | 'archived' | 'deleted';

  // Enrichment Management
  enrichmentStatus: EnrichmentStatus;
  lastEnrichedAt?: Timestamp;
  enrichmentError?: string;     // Error message if enrichment failed

  // Timestamps (INDEXED)
  addedAt: Timestamp;           // When user saved this profile
  lastViewedAt: Timestamp;      // Last time user viewed full profile
  updatedAt: Timestamp;
}

/**
 * Helper type for creating new user collection entries
 */
export type CreateUserCollection = Omit<UserCollection, 'id' | 'addedAt' | 'lastViewedAt' | 'updatedAt'> & {
  addedAt?: Timestamp;
  lastViewedAt?: Timestamp;
  updatedAt?: Timestamp;
};

/**
 * Helper type for updating user collection entries
 */
export type UpdateUserCollection = Partial<Omit<UserCollection, 'id' | 'userId' | 'globalInfluencerId' | 'addedAt'>> & {
  updatedAt: Timestamp;
};

/**
 * Extended type with global influencer data joined
 * This is what the API returns when fetching user collections
 */
export interface UserCollectionWithProfile extends UserCollection {
  globalProfile: {
    displayName: string;
    primaryUsername: string;
    bio: string;
    avatarUrl: string;
    verified: boolean;
    platforms: Array<{
      platform: string;
      username: string;
      followerCount: number;
      verified: boolean;
    }>;
    totalFollowers: number;
    averageEngagementRate: number;
    location: {
      country: string;
      city: string;
    };
    categories: string[];
    topics: string[];
    hasInstagramEnrichment?: boolean;
    hasTikTokEnrichment?: boolean;
  };
}
