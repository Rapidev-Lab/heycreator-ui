/**
 * Profile Aggregator Service
 *
 * Handles the business logic for creating, merging, and managing unified profiles
 * that combine multiple social media accounts into a single influencer profile.
 */

import { SearchResultProfile, Platform } from '@/types/api';

/**
 * Generate a UUID v4 compatible string without external dependencies.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import {
  UnifiedProfile,
  LinkedPlatformAccount,
  CombinedMetrics,
  CreateUnifiedProfileRequest,
  UnifiedProfilePreview,
  GroupedSearchResults,
} from '@/types/aggregator';
import {
  createUnifiedProfile,
  updateUnifiedProfile,
  getUnifiedProfileById,
  getAllUnifiedProfiles,
  deleteUnifiedProfile,
  isAccountAlreadyLinked,
} from '@/data/unifiedProfiles';

class ProfileAggregatorService {
  /**
   * Generate a unique ID for unified profiles.
   * Uses UUID v4 for globally unique identifiers.
   */
  generateUniqueId(): string {
    return `unified-${generateUUID()}`;
  }

  /**
   * Generate a unique ID for linked accounts.
   */
  generateLinkedAccountId(platform: Platform, username: string): string {
    return `linked-${platform}-${username}-${Date.now()}`;
  }

  /**
   * Group search results by platform for the aggregator UI.
   */
  groupSearchResultsByPlatform(results: SearchResultProfile[]): GroupedSearchResults[] {
    const grouped = new Map<Platform, SearchResultProfile[]>();

    for (const result of results) {
      const existing = grouped.get(result.platform) || [];
      existing.push(result);
      grouped.set(result.platform, existing);
    }

    return Array.from(grouped.entries()).map(([platform, platformResults]) => ({
      platform,
      results: platformResults,
      count: platformResults.length,
    }));
  }

  /**
   * Convert a SearchResultProfile to a LinkedPlatformAccount.
   */
  convertToLinkedAccount(
    searchResult: SearchResultProfile
  ): LinkedPlatformAccount {
    const now = new Date().toISOString();

    return {
      id: this.generateLinkedAccountId(searchResult.platform, searchResult.username),
      platform: searchResult.platform,
      username: searchResult.username,
      displayName: searchResult.display_name,
      followerCount: searchResult.follower_count,
      profileUrl: searchResult.profile_url,
      avatarUrl: searchResult.avatar_url,
      bio: searchResult.bio,
      contactEmail: searchResult.contact_email,
      contactPhone: searchResult.contact_phone,
      contactWebsite: searchResult.contact_website,
      verified: searchResult.verified || false,
      linkedAt: now,
      lastSyncedAt: now,
    };
  }

  /**
   * Calculate combined metrics from linked accounts.
   */
  calculateCombinedMetrics(linkedAccounts: LinkedPlatformAccount[]): CombinedMetrics {
    const totalFollowers = linkedAccounts.reduce(
      (sum, account) => sum + account.followerCount,
      0
    );

    // Calculate follower distribution by platform
    const followersByPlatform = linkedAccounts.map(account => ({
      platform: account.platform,
      count: account.followerCount,
      percentage: totalFollowers > 0
        ? Math.round((account.followerCount / totalFollowers) * 1000) / 10
        : 0,
    }));

    // Estimate engagement rate based on follower count tiers
    // This is a simplified calculation - in production, you'd use actual engagement data
    const avgEngagementRate = this.estimateEngagementRate(totalFollowers);

    // Estimate reach as ~70% of total followers (industry standard estimate)
    const totalReach = Math.round(totalFollowers * 0.7);

    // Estimate engagements based on engagement rate
    const totalEngagements = Math.round(totalFollowers * (avgEngagementRate / 100));

    return {
      totalFollowers,
      averageEngagementRate: avgEngagementRate,
      totalReach,
      totalEngagements,
      followersByPlatform,
    };
  }

  /**
   * Estimate engagement rate based on follower count.
   * Smaller accounts typically have higher engagement rates.
   */
  private estimateEngagementRate(followerCount: number): number {
    if (followerCount < 1000) return 8.0;
    if (followerCount < 5000) return 6.5;
    if (followerCount < 10000) return 5.5;
    if (followerCount < 50000) return 4.5;
    if (followerCount < 100000) return 3.5;
    if (followerCount < 500000) return 2.5;
    return 1.8;
  }

  /**
   * Calculate influence score based on various factors.
   */
  calculateInfluenceScore(
    combinedMetrics: CombinedMetrics,
    linkedAccountsCount: number
  ): number {
    // Base score from followers (max 40 points)
    let score = Math.min(40, Math.log10(combinedMetrics.totalFollowers + 1) * 10);

    // Engagement rate bonus (max 30 points)
    score += Math.min(30, combinedMetrics.averageEngagementRate * 6);

    // Multi-platform bonus (max 20 points)
    score += Math.min(20, linkedAccountsCount * 5);

    // Platform diversity bonus (max 10 points)
    const platformsArray = combinedMetrics.followersByPlatform.map(p => p.platform);
    const uniquePlatforms = Array.from(new Set(platformsArray)).length;
    score += Math.min(10, uniquePlatforms * 2);

    return Math.round(Math.min(100, score));
  }

  /**
   * Merge bios from multiple accounts into a coherent summary.
   */
  mergeBios(linkedAccounts: LinkedPlatformAccount[]): string {
    const bios = linkedAccounts
      .filter(account => account.bio && account.bio.trim().length > 0)
      .map(account => account.bio!.trim());

    if (bios.length === 0) {
      return '';
    }

    if (bios.length === 1) {
      return bios[0];
    }

    // Find the longest bio as the primary
    const sortedBios = [...bios].sort((a, b) => b.length - a.length);
    return sortedBios[0];
  }

  /**
   * Select the best display name from linked accounts.
   */
  selectBestDisplayName(linkedAccounts: LinkedPlatformAccount[]): string {
    // Prioritize verified accounts
    const verifiedAccount = linkedAccounts.find(account => account.verified);
    if (verifiedAccount) {
      return verifiedAccount.displayName;
    }

    // Then prioritize by follower count
    const sortedByFollowers = [...linkedAccounts].sort(
      (a, b) => b.followerCount - a.followerCount
    );

    return sortedByFollowers[0]?.displayName || 'Unknown';
  }

  /**
   * Select the best avatar from linked accounts.
   */
  selectBestAvatar(linkedAccounts: LinkedPlatformAccount[]): string | undefined {
    // Prioritize verified accounts with avatars
    const verifiedWithAvatar = linkedAccounts.find(
      account => account.verified && account.avatarUrl
    );
    if (verifiedWithAvatar) {
      return verifiedWithAvatar.avatarUrl;
    }

    // Then prioritize by follower count
    const withAvatar = linkedAccounts
      .filter(account => account.avatarUrl)
      .sort((a, b) => b.followerCount - a.followerCount);

    return withAvatar[0]?.avatarUrl;
  }

  /**
   * Extract categories from bios and usernames using keyword matching.
   */
  extractCategories(linkedAccounts: LinkedPlatformAccount[]): string[] {
    const categoryKeywords: Record<string, string[]> = {
      'Fashion': ['fashion', 'style', 'outfit', 'clothing', 'wear'],
      'Beauty': ['beauty', 'makeup', 'skincare', 'cosmetic'],
      'Fitness': ['fitness', 'workout', 'gym', 'exercise', 'training'],
      'Lifestyle': ['lifestyle', 'life', 'daily', 'living'],
      'Food': ['food', 'recipe', 'cooking', 'chef', 'eat', 'meal'],
      'Travel': ['travel', 'adventure', 'explore', 'destination'],
      'Tech': ['tech', 'technology', 'gadget', 'digital'],
      'Gaming': ['gaming', 'gamer', 'game', 'esports'],
      'Music': ['music', 'musician', 'singer', 'artist', 'band'],
      'Photography': ['photography', 'photo', 'photographer'],
      'Health': ['health', 'wellness', 'healthy', 'nutrition'],
      'Entertainment': ['entertainment', 'comedy', 'funny', 'humor'],
    };

    const foundCategories = new Set<string>();

    for (const account of linkedAccounts) {
      const textToSearch = [
        account.bio || '',
        account.displayName,
        account.username,
      ]
        .join(' ')
        .toLowerCase();

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => textToSearch.includes(keyword))) {
          foundCategories.add(category);
        }
      }
    }

    return Array.from(foundCategories).slice(0, 5); // Max 5 categories
  }

  /**
   * Estimate price per post based on metrics.
   */
  estimatePrice(combinedMetrics: CombinedMetrics): string {
    const { totalFollowers, averageEngagementRate } = combinedMetrics;

    // Base price calculation (simplified CPM model)
    let basePrice = totalFollowers * 0.01; // $10 per 1000 followers

    // Engagement multiplier
    const engagementMultiplier = 1 + (averageEngagementRate / 10);
    basePrice *= engagementMultiplier;

    // Round to nice numbers
    if (basePrice < 100) {
      basePrice = Math.round(basePrice / 10) * 10;
    } else if (basePrice < 1000) {
      basePrice = Math.round(basePrice / 50) * 50;
    } else {
      basePrice = Math.round(basePrice / 100) * 100;
    }

    // Format price
    if (basePrice >= 1000) {
      return `$${(basePrice / 1000).toFixed(1)}K / Post`;
    }
    return `$${basePrice} / Post`;
  }

  /**
   * Generate a preview of what the unified profile would look like.
   */
  generatePreview(selectedProfiles: SearchResultProfile[]): UnifiedProfilePreview {
    const linkedAccounts = selectedProfiles.map(profile =>
      this.convertToLinkedAccount(profile)
    );

    const combinedMetrics = this.calculateCombinedMetrics(linkedAccounts);

    return {
      displayName: this.selectBestDisplayName(linkedAccounts),
      avatarUrl: this.selectBestAvatar(linkedAccounts),
      bio: this.mergeBios(linkedAccounts),
      platforms: Array.from(new Set(selectedProfiles.map(p => p.platform))),
      totalFollowers: combinedMetrics.totalFollowers,
      averageEngagementRate: combinedMetrics.averageEngagementRate,
      linkedAccountsCount: selectedProfiles.length,
      selectedProfiles,
    };
  }

  /**
   * Create a new unified profile from selected accounts.
   */
  createProfile(request: CreateUnifiedProfileRequest): UnifiedProfile {
    // Check for already linked accounts
    for (const profile of request.selectedProfiles) {
      const { isLinked, profileId } = isAccountAlreadyLinked(
        profile.platform,
        profile.username
      );
      if (isLinked) {
        throw new Error(
          `Account ${profile.username} on ${profile.platform} is already linked to profile ${profileId}`
        );
      }
    }

    // Convert search results to linked accounts
    const linkedAccounts = request.selectedProfiles.map(profile =>
      this.convertToLinkedAccount(profile)
    );

    // Calculate combined metrics
    const combinedMetrics = this.calculateCombinedMetrics(linkedAccounts);

    // Calculate influence score
    const influenceScore = this.calculateInfluenceScore(
      combinedMetrics,
      linkedAccounts.length
    );

    // Extract or use provided values
    const displayName =
      request.displayName || this.selectBestDisplayName(linkedAccounts);
    const bio = request.bio || this.mergeBios(linkedAccounts);
    const avatarUrl =
      request.avatarUrl || this.selectBestAvatar(linkedAccounts);
    const categories =
      request.categories && request.categories.length > 0
        ? request.categories
        : this.extractCategories(linkedAccounts);

    const now = new Date().toISOString();

    // Create the unified profile
    const unifiedProfile: UnifiedProfile = {
      id: this.generateUniqueId(),
      displayName,
      avatarUrl,
      bio,
      location: request.location,
      categories,
      linkedAccounts,
      combinedMetrics,
      influenceScore,
      estimatedPrice: this.estimatePrice(combinedMetrics),
      mainTopics: categories,
      brandSafety: 'Safe', // Default, would be calculated in production
      audienceAgeGroup: 'Millennials', // Default, would be calculated from actual data
      audienceAuthenticity: 'Good', // Default, would be calculated in production
      createdAt: now,
      updatedAt: now,
      status: 'active',
    };

    // Save to storage
    return createUnifiedProfile(unifiedProfile);
  }

  /**
   * Get a unified profile by ID.
   */
  getProfile(id: string): UnifiedProfile | null {
    return getUnifiedProfileById(id);
  }

  /**
   * Get all unified profiles.
   */
  getAllProfiles(): UnifiedProfile[] {
    return getAllUnifiedProfiles();
  }

  /**
   * Add more linked accounts to an existing profile.
   */
  addLinkedAccounts(
    profileId: string,
    newAccounts: SearchResultProfile[]
  ): UnifiedProfile | null {
    const existingProfile = getUnifiedProfileById(profileId);
    if (!existingProfile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // Check for duplicates and already linked accounts
    for (const account of newAccounts) {
      // Check if already in this profile
      const isDuplicate = existingProfile.linkedAccounts.some(
        linked =>
          linked.platform === account.platform &&
          linked.username.toLowerCase() === account.username.toLowerCase()
      );
      if (isDuplicate) {
        throw new Error(
          `Account ${account.username} on ${account.platform} is already in this profile`
        );
      }

      // Check if linked to another profile
      const { isLinked, profileId: otherProfileId } = isAccountAlreadyLinked(
        account.platform,
        account.username
      );
      if (isLinked && otherProfileId !== profileId) {
        throw new Error(
          `Account ${account.username} on ${account.platform} is already linked to profile ${otherProfileId}`
        );
      }
    }

    // Convert and add new accounts
    const newLinkedAccounts = newAccounts.map(account =>
      this.convertToLinkedAccount(account)
    );

    const updatedLinkedAccounts = [
      ...existingProfile.linkedAccounts,
      ...newLinkedAccounts,
    ];

    // Recalculate metrics
    const combinedMetrics = this.calculateCombinedMetrics(updatedLinkedAccounts);
    const influenceScore = this.calculateInfluenceScore(
      combinedMetrics,
      updatedLinkedAccounts.length
    );

    return updateUnifiedProfile(profileId, {
      linkedAccounts: updatedLinkedAccounts,
      combinedMetrics,
      influenceScore,
      estimatedPrice: this.estimatePrice(combinedMetrics),
    });
  }

  /**
   * Remove linked accounts from a profile.
   */
  removeLinkedAccounts(
    profileId: string,
    accountIds: string[]
  ): UnifiedProfile | null {
    const existingProfile = getUnifiedProfileById(profileId);
    if (!existingProfile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // Ensure at least one account remains
    const remainingAccounts = existingProfile.linkedAccounts.filter(
      account => !accountIds.includes(account.id)
    );

    if (remainingAccounts.length === 0) {
      throw new Error('Cannot remove all linked accounts. Delete the profile instead.');
    }

    // Recalculate metrics
    const combinedMetrics = this.calculateCombinedMetrics(remainingAccounts);
    const influenceScore = this.calculateInfluenceScore(
      combinedMetrics,
      remainingAccounts.length
    );

    return updateUnifiedProfile(profileId, {
      linkedAccounts: remainingAccounts,
      combinedMetrics,
      influenceScore,
      estimatedPrice: this.estimatePrice(combinedMetrics),
    });
  }

  /**
   * Update profile details (not linked accounts).
   */
  updateProfile(
    profileId: string,
    updates: {
      displayName?: string;
      bio?: string;
      location?: string;
      categories?: string[];
      avatarUrl?: string;
    }
  ): UnifiedProfile | null {
    const existingProfile = getUnifiedProfileById(profileId);
    if (!existingProfile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    return updateUnifiedProfile(profileId, updates);
  }

  /**
   * Delete a unified profile.
   */
  deleteProfile(profileId: string): boolean {
    return deleteUnifiedProfile(profileId);
  }

  /**
   * Check if an account is available to be linked (not already linked elsewhere).
   */
  checkAccountAvailability(
    platform: Platform,
    username: string
  ): { available: boolean; message?: string; existingProfileId?: string } {
    const { isLinked, profileId } = isAccountAlreadyLinked(platform, username);

    if (isLinked) {
      return {
        available: false,
        message: `This account is already linked to another profile`,
        existingProfileId: profileId,
      };
    }

    return { available: true };
  }
}

// Create a singleton instance using globalThis to ensure data persistence across API calls
// This is critical for development mode where modules may be re-imported due to HMR
// Using globalThis ensures the same instance is used even when the module is re-evaluated

declare global {
  // eslint-disable-next-line no-var
  var profileAggregatorService: ProfileAggregatorService | undefined;
}

// Use existing global instance or create new one
const profileAggregatorServiceInstance =
  globalThis.profileAggregatorService || new ProfileAggregatorService();

// Store in global for persistence across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.profileAggregatorService = profileAggregatorServiceInstance;
}

export default ProfileAggregatorService;
export { profileAggregatorServiceInstance };
