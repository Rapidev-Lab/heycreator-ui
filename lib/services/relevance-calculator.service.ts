/**
 * Relevance Calculator Service
 *
 * Calculates relevance scores for search results based on multiple factors.
 * Used for sorting by "relevance" in discovery search.
 *
 * Scoring factors:
 * - Query match quality (username, name, bio)
 * - Engagement rate
 * - Follower count (with diminishing returns)
 * - Profile completeness
 * - Verification status
 * - Recency/activity
 * - Platform relevance
 *
 * Created: February 3, 2026
 */

import { Platform, SearchResultProfile } from '@/types/api';

export interface RelevanceScore {
  totalScore: number;      // 0-100
  breakdown: {
    queryMatch: number;    // 0-40 points
    engagement: number;    // 0-25 points
    popularity: number;    // 0-15 points
    completeness: number;  // 0-10 points
    verification: number;  // 0-5 points
    recency: number;       // 0-5 points
  };
  reasons: string[];
}

export interface ProfileWithRelevance extends SearchResultProfile {
  relevanceScore?: RelevanceScore;
  trueReach?: number;  // Calculated as engagement_rate * reach_factor
}

export class RelevanceCalculatorService {
  /**
   * Calculate relevance score for a profile against search query
   */
  calculateRelevance(
    profile: SearchResultProfile,
    query: string,
    options?: {
      engagementRate?: number;
      lastActiveDate?: Date;
      hashtags?: string[];
    }
  ): RelevanceScore {
    const reasons: string[] = [];

    // 1. Query match (0-40 points) - MOST IMPORTANT
    const queryMatch = this.scoreQueryMatch(profile, query, options?.hashtags);
    reasons.push(...queryMatch.reasons);

    // 2. Engagement (0-25 points)
    const engagement = this.scoreEngagement(
      options?.engagementRate || 0,
      profile.platform,
      profile.follower_count
    );
    if (engagement > 15) {
      reasons.push(`High engagement rate (+${engagement} pts)`);
    }

    // 3. Popularity (0-15 points)
    const popularity = this.scorePopularity(profile.follower_count);
    if (popularity > 10) {
      reasons.push(`Large following (+${popularity} pts)`);
    }

    // 4. Profile completeness (0-10 points)
    const completeness = this.scoreCompleteness(profile);
    if (completeness >= 8) {
      reasons.push(`Complete profile (+${completeness} pts)`);
    }

    // 5. Verification (0-5 points)
    const verification = profile.verified ? 5 : 0;
    if (verification > 0) {
      reasons.push('Verified account (+5 pts)');
    }

    // 6. Recency (0-5 points)
    const recency = this.scoreRecency(options?.lastActiveDate);
    if (recency > 3) {
      reasons.push('Recently active (+' + recency + ' pts)');
    }

    const totalScore = Math.min(
      100,
      queryMatch.score + engagement + popularity + completeness + verification + recency
    );

    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        queryMatch: queryMatch.score,
        engagement,
        popularity,
        completeness,
        verification,
        recency
      },
      reasons
    };
  }

  /**
   * Score query match quality
   * Checks username, display name, bio, and hashtags
   */
  private scoreQueryMatch(
    profile: SearchResultProfile,
    query: string,
    hashtags?: string[]
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const queryLower = query.toLowerCase().trim();

    // Normalize fields — scraper data cast from `any` can have undefined/non-string values
    const usernameLower = (profile.username || '').toLowerCase();
    const displayNameLower = (profile.display_name || '').toLowerCase();
    const bioLower = typeof profile.bio === 'string' ? profile.bio.toLowerCase() : '';

    // Exact username match = HIGHEST score (40 points)
    if (usernameLower === queryLower) {
      score = 40;
      reasons.push('Exact username match');
    }

    // Username starts with query (30 points)
    if (score < 30 && usernameLower.startsWith(queryLower)) {
      score = Math.max(score, 30);
      reasons.push('Username starts with query');
    }

    // Username contains query (20 points)
    if (score < 20 && usernameLower.includes(queryLower)) {
      score = Math.max(score, 20);
      reasons.push('Username contains query');
    }

    // Display name exact match (35 points)
    if (displayNameLower === queryLower) {
      score = Math.max(score, 35);
      reasons.push('Exact name match');
    }

    // Display name contains query (15 points)
    if (displayNameLower.includes(queryLower)) {
      score = Math.max(score, 15);
      reasons.push('Name contains query');
    }

    // Bio contains query (10 points)
    if (bioLower && bioLower.includes(queryLower)) {
      score = Math.max(score, 10);
      reasons.push('Bio mentions query');
    }

    // Hashtag match (25 points)
    if (hashtags && hashtags.length > 0) {
      const matchedHashtags = hashtags.filter(tag =>
        bioLower.includes(tag.toLowerCase())
      );

      if (matchedHashtags.length > 0) {
        const hashtagScore = Math.min(25, matchedHashtags.length * 10);
        score = Math.max(score, hashtagScore);
        reasons.push(`Matches ${matchedHashtags.length} hashtag(s)`);
      }
    }

    // Keyword matching in bio (5-15 points based on matches)
    if (bioLower && queryLower.length > 3) {
      const keywords = queryLower.split(/\s+/);
      const matchedKeywords = keywords.filter(kw => bioLower.includes(kw));

      if (matchedKeywords.length > 0 && score < 15) {
        const keywordScore = Math.min(15, matchedKeywords.length * 5);
        score = Math.max(score, keywordScore);
        reasons.push(`Bio matches ${matchedKeywords.length} keyword(s)`);
      }
    }

    return { score: Math.min(40, score), reasons };
  }

  /**
   * Score engagement rate
   * Higher engagement = more relevant
   */
  private scoreEngagement(engagementRate: number, platform: Platform, followerCount: number = 0): number {
    // Platform-specific base benchmarks
    const baseBenchmarks: Record<Platform, { good: number; excellent: number }> = {
      instagram: { good: 3, excellent: 6 },
      tiktok: { good: 9, excellent: 15 },
      youtube: { good: 4, excellent: 8 },
      twitter: { good: 1.5, excellent: 3 },
      facebook: { good: 1, excellent: 2 }
    };

    // Tier multiplier: larger accounts have naturally lower engagement rates
    let tierMultiplier = 1.0;
    if (followerCount > 1000000) tierMultiplier = 0.5;
    else if (followerCount > 100000) tierMultiplier = 0.75;

    const base = baseBenchmarks[platform];
    const benchmark = {
      good: base.good * tierMultiplier,
      excellent: base.excellent * tierMultiplier
    };

    if (engagementRate >= benchmark.excellent) {
      return 25; // Excellent engagement
    } else if (engagementRate >= benchmark.good) {
      return 18; // Good engagement
    } else if (engagementRate >= benchmark.good * 0.5) {
      return 10; // Average engagement
    } else if (engagementRate > 0) {
      return 5; // Low engagement
    }
    return 0; // No engagement data
  }

  /**
   * Score popularity (follower count)
   * Diminishing returns for very large accounts
   */
  private scorePopularity(followers: number): number {
    if (followers >= 10000000) return 15; // 10M+
    if (followers >= 1000000) return 14;  // 1M-10M
    if (followers >= 500000) return 12;   // 500K-1M
    if (followers >= 100000) return 10;   // 100K-500K
    if (followers >= 50000) return 8;     // 50K-100K
    if (followers >= 10000) return 6;     // 10K-50K
    if (followers >= 5000) return 4;      // 5K-10K
    if (followers >= 1000) return 2;      // 1K-5K
    return 1; // < 1K
  }

  /**
   * Score profile completeness
   */
  private scoreCompleteness(profile: SearchResultProfile): number {
    let score = 0;

    if (profile.username) score += 2;
    if (profile.display_name) score += 2;
    if (profile.avatar_url) score += 2;
    if (profile.bio && profile.bio.length > 20) score += 2;
    if (profile.follower_count > 0) score += 1;
    if (profile.profile_url) score += 1;

    return Math.min(10, score);
  }

  /**
   * Score recency (last active date)
   */
  private scoreRecency(lastActiveDate?: Date): number {
    if (!lastActiveDate) return 2; // Unknown = neutral score

    const now = new Date();
    const daysSinceActive = Math.floor(
      (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive <= 1) return 5;   // Active today/yesterday
    if (daysSinceActive <= 7) return 4;   // Active this week
    if (daysSinceActive <= 30) return 3;  // Active this month
    if (daysSinceActive <= 90) return 2;  // Active in last 3 months
    return 1; // Inactive for 3+ months
  }

  /**
   * Calculate true reach
   * Formula: (Followers × Reach Rate × Engagement Rate) / 100
   *
   * Reach Rate = % of followers who see content (typically 30-50%)
   * Engagement Rate = % of reach who engage
   */
  calculateTrueReach(
    followers: number,
    engagementRate: number,
    platform: Platform
  ): number {
    // Platform-specific organic reach rates (2026 estimates)
    const reachRates: Record<Platform, number> = {
      instagram: 35,  // 35% average reach
      tiktok: 45,     // 45% average reach (higher due to FYP)
      youtube: 40,    // 40% for subscribers
      twitter: 30,    // 30% due to algorithm
      facebook: 25    // 25% (lowest organic reach)
    };

    const reachRate = reachRates[platform];

    // Diminishing returns: larger accounts have lower organic reach percentages
    let sizeMultiplier = 1.0;
    if (followers > 1000000) sizeMultiplier = 0.3;
    else if (followers > 100000) sizeMultiplier = 0.6;
    else if (followers > 10000) sizeMultiplier = 0.8;

    // True Reach = Followers × (Reach Rate / 100) × Size Multiplier × (Engagement Rate / 100)
    const trueReach = followers * (reachRate / 100) * sizeMultiplier * (engagementRate / 100);

    return Math.round(trueReach);
  }

  /**
   * Calculate true reach percentage
   * Returns what % of followers actually engage
   */
  calculateTrueReachPercentage(
    followers: number,
    trueReach: number
  ): number {
    if (followers === 0) return 0;
    return (trueReach / followers) * 100;
  }

  /**
   * Batch calculate relevance for multiple profiles
   */
  calculateBatchRelevance(
    profiles: SearchResultProfile[],
    query: string,
    options?: {
      engagementRates?: Map<string, number>;
      hashtags?: string[];
    }
  ): ProfileWithRelevance[] {
    return profiles.map(profile => {
      const key = `${profile.platform}:${profile.username}`;
      const engagementRate = options?.engagementRates?.get(key) || 0;

      const relevanceScore = this.calculateRelevance(profile, query, {
        engagementRate,
        hashtags: options?.hashtags
      });

      const trueReach = this.calculateTrueReach(
        profile.follower_count,
        engagementRate,
        profile.platform
      );

      return {
        ...profile,
        relevanceScore,
        trueReach,
        rawData: {
          ...profile.rawData,
          engagementRate,
          trueReachPercentage: this.calculateTrueReachPercentage(
            profile.follower_count,
            trueReach
          )
        }
      };
    });
  }

  /**
   * Sort profiles by relevance score
   */
  sortByRelevance(profiles: ProfileWithRelevance[]): ProfileWithRelevance[] {
    return profiles.sort((a, b) => {
      const scoreA = a.relevanceScore?.totalScore || 0;
      const scoreB = b.relevanceScore?.totalScore || 0;
      return scoreB - scoreA; // Descending
    });
  }

  /**
   * Get top N most relevant profiles
   */
  getTopRelevant(
    profiles: ProfileWithRelevance[],
    limit: number = 10
  ): ProfileWithRelevance[] {
    return this.sortByRelevance(profiles).slice(0, limit);
  }
}

// Singleton instance
let relevanceCalculatorInstance: RelevanceCalculatorService | null = null;

/**
 * Get global relevance calculator instance
 */
export function getRelevanceCalculator(): RelevanceCalculatorService {
  if (!relevanceCalculatorInstance) {
    relevanceCalculatorInstance = new RelevanceCalculatorService();
  }
  return relevanceCalculatorInstance;
}
