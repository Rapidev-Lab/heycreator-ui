/**
 * Profile Coallation Service
 *
 * Merges multiple platform accounts into a single unified profile
 * with smart deduplication, metrics calculation, and categorization.
 *
 * Created: February 3, 2026
 */

import { SearchResultProfile, Platform } from '@/types/api';
import { UnifiedProfile } from '@/types/aggregator';

interface CoallationOptions {
  userId: string; // Will be stored in createdBy field
  forceNewProfile?: boolean; // Create new profile even if duplicate exists
}

export class ProfileCoallator {
  /**
   * Merge multiple platform accounts into single unified profile
   *
   * @param platformAccounts - Array of profiles from different platforms
   * @param options - Coallation options (userId, forceNewProfile)
   * @returns Unified profile ready for Firestore
   */
  async coallateProfiles(
    platformAccounts: SearchResultProfile[],
    options: CoallationOptions
  ): Promise<UnifiedProfile> {
    console.log(`[ProfileCoallator] Starting coallation for ${platformAccounts.length} platform account(s)`);

    // 1. Deduplicate by platform:username
    const unique = this.deduplicateByPlatform(platformAccounts);
    console.log(`[ProfileCoallator] After deduplication: ${unique.length} unique account(s)`);

    // 2. Select primary platform (highest followers)
    const primary = this.selectPrimaryPlatform(unique);
    console.log(`[ProfileCoallator] Primary platform: ${primary.platform} (@${primary.username})`);

    // 3. Build linked accounts array
    const linkedAccounts = unique.map(account => ({
      id: `${account.platform}_${account.username}_${Date.now()}`, // Temporary ID
      platform: account.platform,
      username: account.username,
      displayName: account.display_name,
      followerCount: account.follower_count || 0,
      profileUrl: account.profile_url || '',
      avatarUrl: account.avatar_url,
      bio: account.bio,
      verified: account.verified || false,
      linkedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    }));

    // 4. Calculate combined metrics
    const totalFollowers = linkedAccounts.reduce(
      (sum, acc) => sum + acc.followerCount,
      0
    );

    // 5. Calculate followers by platform breakdown
    const followersByPlatform = linkedAccounts.map(account => ({
      platform: account.platform,
      count: account.followerCount,
      percentage: totalFollowers > 0 ? (account.followerCount / totalFollowers) * 100 : 0,
    }));

    // 6. Infer categories from bio
    const categories = this.inferCategories(primary.bio || '');

    // 7. Calculate influence score
    const influenceScore = this.calculateInfluenceScore(totalFollowers);

    // 8. Build unified profile (matching UnifiedProfile type from aggregator.ts)
    const unifiedProfile: UnifiedProfile = {
      id: this.generateFirestoreId(), // Will be replaced by Firestore auto-ID
      displayName: primary.display_name,
      avatarUrl: primary.avatar_url,
      bio: primary.bio,
      location: undefined, // Can be extracted from enrichment data later
      categories,
      linkedAccounts,
      combinedMetrics: {
        totalFollowers,
        averageEngagementRate: 0, // Will be calculated during enrichment
        totalReach: Math.floor(totalFollowers * 0.3), // 30% estimated reach
        totalEngagements: 0, // Will be calculated during enrichment
        followersByPlatform,
      },
      influenceScore,
      estimatedPrice: this.estimatePrice(totalFollowers),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: options.userId,
      status: 'active',
    };

    console.log(`[ProfileCoallator] ✓ Unified profile created for @${primary.username}`);
    console.log(`[ProfileCoallator]   - Total followers: ${totalFollowers.toLocaleString()}`);
    console.log(`[ProfileCoallator]   - Influence score: ${influenceScore}`);
    console.log(`[ProfileCoallator]   - Categories: ${categories.join(', ') || 'None'}`);

    return unifiedProfile;
  }

  /**
   * Deduplicate accounts by platform:username
   * Keeps first occurrence of each platform:username pair
   */
  private deduplicateByPlatform(
    accounts: SearchResultProfile[]
  ): SearchResultProfile[] {
    const seen = new Set<string>();
    return accounts.filter(account => {
      const key = `${account.platform}:${account.username.toLowerCase()}`;
      if (seen.has(key)) {
        console.log(`[ProfileCoallator] Skipping duplicate: ${key}`);
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Select primary platform based on follower count
   * Highest follower count wins
   */
  private selectPrimaryPlatform(
    accounts: SearchResultProfile[]
  ): SearchResultProfile {
    return accounts.reduce((max, current) => {
      const maxFollowers = max.follower_count || 0;
      const currentFollowers = current.follower_count || 0;
      return currentFollowers > maxFollowers ? current : max;
    });
  }

  /**
   * Calculate influence score (0-100) based on total followers
   *
   * Scoring tiers:
   * - 95: Mega influencer (10M+)
   * - 85: Macro influencer (1M-10M)
   * - 75: Mid-tier influencer (100K-1M)
   * - 60: Micro influencer (10K-100K)
   * - 40: Nano influencer (< 10K)
   */
  private calculateInfluenceScore(totalFollowers: number): number {
    if (totalFollowers >= 10000000) return 95; // 10M+
    if (totalFollowers >= 1000000) return 85;  // 1M-10M
    if (totalFollowers >= 100000) return 75;   // 100K-1M
    if (totalFollowers >= 10000) return 60;    // 10K-100K
    return 40; // < 10K
  }

  /**
   * Estimate price per post based on follower count
   * Uses industry standard: $10 per 1,000 followers
   */
  private estimatePrice(totalFollowers: number): string {
    if (totalFollowers < 1000) return '$50-$100';
    if (totalFollowers < 10000) return '$100-$500';
    if (totalFollowers < 100000) return '$500-$2,000';
    if (totalFollowers < 500000) return '$2,000-$10,000';
    if (totalFollowers < 1000000) return '$10,000-$25,000';
    if (totalFollowers < 5000000) return '$25,000-$100,000';
    return '$100,000+';
  }

  /**
   * Infer categories from bio using keyword matching
   *
   * Supported categories:
   * - Fashion, Beauty, Fitness, Food, Travel, Tech, Gaming, Education, etc.
   */
  private inferCategories(bio: string): string[] {
    const keywords: Record<string, string[]> = {
      'Fashion': ['fashion', 'style', 'outfit', 'designer', 'clothing', 'ootd'],
      'Beauty': ['beauty', 'makeup', 'skincare', 'cosmetics', 'glam'],
      'Fitness': ['fitness', 'workout', 'gym', 'health', 'exercise', 'training'],
      'Food': ['food', 'chef', 'cooking', 'recipe', 'foodie', 'culinary'],
      'Travel': ['travel', 'adventure', 'explore', 'wanderlust', 'tourism'],
      'Tech': ['tech', 'developer', 'coding', 'software', 'programming', 'ai'],
      'Gaming': ['gamer', 'gaming', 'esports', 'streamer', 'twitch'],
      'Education': ['education', 'teacher', 'learning', 'tutorial', 'course'],
      'Business': ['entrepreneur', 'business', 'startup', 'ceo', 'founder'],
      'Lifestyle': ['lifestyle', 'daily', 'vlog', 'life', 'living'],
      'Entertainment': ['entertainment', 'comedy', 'funny', 'actor', 'musician'],
      'Sports': ['sports', 'athlete', 'basketball', 'football', 'soccer'],
    };

    const bioLower = bio.toLowerCase();
    const matchedCategories = Object.entries(keywords)
      .filter(([_, words]) => words.some(word => bioLower.includes(word)))
      .map(([category]) => category);

    return matchedCategories.length > 0 ? matchedCategories : [];
  }

  /**
   * Generate a temporary Firestore ID
   * Will be replaced by Firestore auto-ID on creation
   */
  private generateFirestoreId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if two profiles are likely the same person
   * Based on username similarity and display name matching
   */
  public areSimilarProfiles(
    profile1: SearchResultProfile,
    profile2: SearchResultProfile
  ): boolean {
    // Same platform and username = exact match
    if (
      profile1.platform === profile2.platform &&
      profile1.username.toLowerCase() === profile2.username.toLowerCase()
    ) {
      return true;
    }

    // Different platforms but very similar usernames
    const username1 = profile1.username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const username2 = profile2.username.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (username1 === username2) {
      return true;
    }

    // Very similar display names
    const name1 = profile1.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const name2 = profile2.display_name.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (name1 === name2 && name1.length > 3) {
      return true;
    }

    return false;
  }

  /**
   * Group profiles by likely owner
   * Returns array of profile groups (each group = one person)
   */
  public groupSimilarProfiles(
    profiles: SearchResultProfile[]
  ): SearchResultProfile[][] {
    const groups: SearchResultProfile[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < profiles.length; i++) {
      if (used.has(i)) continue;

      const group: SearchResultProfile[] = [profiles[i]];
      used.add(i);

      for (let j = i + 1; j < profiles.length; j++) {
        if (used.has(j)) continue;

        if (this.areSimilarProfiles(profiles[i], profiles[j])) {
          group.push(profiles[j]);
          used.add(j);
        }
      }

      groups.push(group);
    }

    console.log(`[ProfileCoallator] Grouped ${profiles.length} profiles into ${groups.length} unique person(s)`);
    return groups;
  }
}

export const profileCoallator = new ProfileCoallator();
