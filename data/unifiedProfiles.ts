/**
 * Mock storage for unified profiles.
 *
 * This module provides in-memory storage for unified profiles during development.
 * The data structure mirrors the future database schema for easy migration.
 *
 * IMPORTANT: In production, this will be replaced with actual database operations.
 * The functions exported here maintain the same interface that the API routes will use.
 */

import { UnifiedProfile, UnifiedProfileFilters, UnifiedProfileSortOption } from '@/types/aggregator';

// Declare global type for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var unifiedProfilesStorage: UnifiedProfile[] | undefined;
}

/**
 * In-memory storage for unified profiles.
 * Uses globalThis to persist data across hot module reloads in development.
 * In production, this would be replaced with database queries.
 */

// Initialize with default data if not already set
const defaultProfiles: UnifiedProfile[] = [
  // Example pre-populated profile for testing
  {
    id: 'unified-1',
    displayName: 'Sarah Johnson',
    avatarUrl: 'https://via.placeholder.com/150/FF6B9D/FFFFFF?text=SJ',
    bio: 'Lifestyle & wellness content creator passionate about healthy living, fitness, and sustainable fashion. Sharing daily inspiration and practical tips for a balanced life.',
    location: 'Los Angeles, CA',
    flag: '🇺🇸',
    categories: ['Lifestyle', 'Fitness', 'Fashion', 'Wellness'],
    linkedAccounts: [
      {
        id: 'linked-1-ig',
        platform: 'instagram',
        username: 'sarahjohnson',
        displayName: 'Sarah Johnson',
        followerCount: 125000,
        profileUrl: 'https://instagram.com/sarahjohnson',
        avatarUrl: 'https://via.placeholder.com/150/FF6B9D/FFFFFF?text=SJ',
        bio: 'Lifestyle & wellness | LA based',
        verified: true,
        linkedAt: '2025-01-15T10:30:00Z',
        lastSyncedAt: '2025-01-19T08:00:00Z',
      },
      {
        id: 'linked-1-tt',
        platform: 'tiktok',
        username: 'sarahjohnson_',
        displayName: 'Sarah J',
        followerCount: 89000,
        profileUrl: 'https://tiktok.com/@sarahjohnson_',
        avatarUrl: 'https://via.placeholder.com/150/BD10E0/FFFFFF?text=SJ',
        bio: 'Wellness tips & daily motivation',
        verified: false,
        linkedAt: '2025-01-15T10:35:00Z',
        lastSyncedAt: '2025-01-19T08:00:00Z',
      },
      {
        id: 'linked-1-yt',
        platform: 'youtube',
        username: 'SarahJohnsonOfficial',
        displayName: 'Sarah Johnson Official',
        followerCount: 45000,
        profileUrl: 'https://youtube.com/c/SarahJohnsonOfficial',
        avatarUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=SJ',
        bio: 'Weekly wellness vlogs and fitness routines',
        verified: true,
        linkedAt: '2025-01-15T10:40:00Z',
        lastSyncedAt: '2025-01-19T08:00:00Z',
      },
    ],
    combinedMetrics: {
      totalFollowers: 259000,
      averageEngagementRate: 4.2,
      totalReach: 180000,
      totalEngagements: 10878,
      followersByPlatform: [
        { platform: 'instagram', count: 125000, percentage: 48.3 },
        { platform: 'tiktok', count: 89000, percentage: 34.4 },
        { platform: 'youtube', count: 45000, percentage: 17.3 },
      ],
    },
    influenceScore: 78,
    estimatedPrice: '$2,500 / Post',
    mainTopics: ['Wellness', 'Fitness', 'Healthy Eating', 'Fashion'],
    brandSafety: 'Safe',
    audienceAgeGroup: 'Millennials',
    audienceAuthenticity: 'Great',
    audienceLocation: ['United States', 'Canada', 'United Kingdom'],
    portfolio: ['Nike', 'Lululemon', 'Whole Foods'],
    sponsoredContentFrequency: 'Weekly',
    platformMetrics: [
      { network: 'Instagram', followers: '125K', engagements: 5250, engagementRate: '4.2%', reach: '87.5K', emv: '$15K' },
      { network: 'TikTok', followers: '89K', engagements: 4450, engagementRate: '5.0%', reach: '62.3K', emv: '$12K' },
      { network: 'YouTube', followers: '45K', engagements: 1178, engagementRate: '2.6%', reach: '31.5K', emv: '$8K' },
    ],
    contentPosts: [
      { id: 'up1-post1', thumbnail: 'https://via.placeholder.com/300x400/FF6B9D/FFFFFF?text=Morning+Routine', platform: 'instagram', likes: '8.2K', comments: '342', date: '01/18/25' },
      { id: 'up1-post2', thumbnail: 'https://via.placeholder.com/300x400/7ED321/FFFFFF?text=Workout', platform: 'tiktok', likes: '15.3K', comments: '589', date: '01/17/25' },
      { id: 'up1-post3', thumbnail: 'https://via.placeholder.com/300x400/4A90E2/FFFFFF?text=Recipe', platform: 'instagram', likes: '6.8K', comments: '256', date: '01/15/25' },
    ],
    demographics: {
      averageAge: 28,
      topGender: { gender: 'Women', percentage: '72%' },
      topCountries: [
        { country: 'United States', flag: '🇺🇸', percentage: '65%' },
        { country: 'Canada', flag: '🇨🇦', percentage: '12%' },
        { country: 'United Kingdom', flag: '🇬🇧', percentage: '8%' },
      ],
      audienceInterests: [
        { interest: 'Fitness', percentage: '45%' },
        { interest: 'Health & Wellness', percentage: '38%' },
        { interest: 'Fashion', percentage: '28%' },
      ],
      brandAffinity: [
        { brand: 'Nike', percentage: '12%' },
        { brand: 'Lululemon', percentage: '10%' },
        { brand: 'Apple', percentage: '8%' },
      ],
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-19T08:00:00Z',
    createdBy: 'user-1',
    status: 'active',
  },
];

// Use existing global storage or initialize with default profiles
// This ensures data persists across hot module reloads in development
let unifiedProfiles: UnifiedProfile[] =
  globalThis.unifiedProfilesStorage || [...defaultProfiles];

// Store in global for persistence across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.unifiedProfilesStorage = unifiedProfiles;
}

/**
 * Get all unified profiles with optional filtering and sorting.
 */
export function getAllUnifiedProfiles(
  filters?: UnifiedProfileFilters,
  sortBy: UnifiedProfileSortOption = 'updatedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): UnifiedProfile[] {
  let results = [...unifiedProfiles].filter(p => p.status !== 'deleted');

  // Apply filters
  if (filters) {
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }

    if (filters.platforms && filters.platforms.length > 0) {
      results = results.filter(p =>
        p.linkedAccounts.some(account =>
          filters.platforms!.includes(account.platform)
        )
      );
    }

    if (filters.minFollowers !== undefined) {
      results = results.filter(p =>
        p.combinedMetrics.totalFollowers >= filters.minFollowers!
      );
    }

    if (filters.maxFollowers !== undefined) {
      results = results.filter(p =>
        p.combinedMetrics.totalFollowers <= filters.maxFollowers!
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(p =>
        p.categories.some(cat =>
          filters.categories!.includes(cat)
        )
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(p =>
        p.displayName.toLowerCase().includes(searchLower) ||
        p.bio?.toLowerCase().includes(searchLower) ||
        p.linkedAccounts.some(a =>
          a.username.toLowerCase().includes(searchLower) ||
          a.displayName.toLowerCase().includes(searchLower)
        )
      );
    }
  }

  // Apply sorting
  results.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'displayName':
        comparison = a.displayName.localeCompare(b.displayName);
        break;
      case 'totalFollowers':
        comparison = a.combinedMetrics.totalFollowers - b.combinedMetrics.totalFollowers;
        break;
      case 'influenceScore':
        comparison = a.influenceScore - b.influenceScore;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return results;
}

/**
 * Get a unified profile by ID.
 */
export function getUnifiedProfileById(id: string): UnifiedProfile | null {
  return unifiedProfiles.find(p => p.id === id && p.status !== 'deleted') || null;
}

/**
 * Create a new unified profile.
 */
export function createUnifiedProfile(profile: UnifiedProfile): UnifiedProfile {
  unifiedProfiles.push(profile);
  return profile;
}

/**
 * Update an existing unified profile.
 */
export function updateUnifiedProfile(
  id: string,
  updates: Partial<UnifiedProfile>
): UnifiedProfile | null {
  const index = unifiedProfiles.findIndex(p => p.id === id);
  if (index === -1) return null;

  unifiedProfiles[index] = {
    ...unifiedProfiles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return unifiedProfiles[index];
}

/**
 * Delete a unified profile (soft delete).
 */
export function deleteUnifiedProfile(id: string): boolean {
  const profile = unifiedProfiles.find(p => p.id === id);
  if (!profile) return false;

  profile.status = 'deleted';
  profile.updatedAt = new Date().toISOString();
  return true;
}

/**
 * Check if a username on a platform is already linked to any profile.
 */
export function isAccountAlreadyLinked(
  platform: string,
  username: string
): { isLinked: boolean; profileId?: string } {
  for (const profile of unifiedProfiles) {
    if (profile.status === 'deleted') continue;

    const linkedAccount = profile.linkedAccounts.find(
      account =>
        account.platform === platform &&
        account.username.toLowerCase() === username.toLowerCase()
    );

    if (linkedAccount) {
      return { isLinked: true, profileId: profile.id };
    }
  }

  return { isLinked: false };
}

/**
 * Get the count of unified profiles.
 */
export function getUnifiedProfilesCount(): number {
  return unifiedProfiles.filter(p => p.status !== 'deleted').length;
}

/**
 * Export raw data for debugging/testing purposes.
 */
export function getUnifiedProfilesRaw(): UnifiedProfile[] {
  return unifiedProfiles;
}

/**
 * Reset to initial state (for testing).
 */
export function resetUnifiedProfiles(): void {
  unifiedProfiles = [...defaultProfiles];
  if (process.env.NODE_ENV !== 'production') {
    globalThis.unifiedProfilesStorage = unifiedProfiles;
  }
}
