/**
 * Engagement Calculator Service
 *
 * Calculates engagement metrics, rates, and quality scores for influencer profiles.
 *
 * Features:
 * - Platform-specific engagement rate calculation
 * - Engagement tier classification (nano, micro, macro, etc.)
 * - Authenticity scoring (fake follower detection)
 * - Trend analysis (growing, stable, declining)
 * - Audience quality assessment
 *
 * Created: February 3, 2026
 */

import { Platform } from '@/types/api';

/**
 * Engagement metrics for a single post or profile
 */
export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  saves?: number;
  totalEngagements: number;
  engagementRate: number; // Percentage (0-100)
}

/**
 * Engagement rate calculation options
 */
export interface EngagementCalculationInput {
  platform: Platform;
  followers: number;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  saves?: number;
  posts?: number; // Number of recent posts (for average calculation)
}

/**
 * Engagement quality assessment
 */
export interface EngagementQuality {
  tier: 'poor' | 'average' | 'good' | 'excellent';
  score: number; // 0-100
  benchmark: number; // Platform-specific benchmark
  percentileRank: number; // Where they rank (0-100)
  flags: string[];
}

/**
 * Authenticity assessment (fake follower detection)
 */
export interface AuthenticityScore {
  score: number; // 0-100 (100 = highly authentic)
  suspiciousFollowerPercentage: number; // Estimated % of fake followers
  quality: 'suspicious' | 'questionable' | 'good' | 'excellent';
  flags: string[];
  factors: {
    engagementConsistency: number; // 0-100
    followerEngagementRatio: number; // 0-100
    growthPattern: number; // 0-100
  };
}

/**
 * Engagement trend analysis
 */
export interface EngagementTrend {
  direction: 'growing' | 'stable' | 'declining';
  changePercent: number; // +/- percentage
  velocity: 'slow' | 'moderate' | 'fast';
  momentum: number; // 0-100
}

/**
 * Platform-specific engagement benchmarks
 * Based on industry research (2024-2026)
 */
const ENGAGEMENT_BENCHMARKS: Record<Platform, {
  poor: number;
  average: number;
  good: number;
  excellent: number;
  industry: string;
}> = {
  instagram: {
    poor: 1.0,
    average: 3.0,
    good: 6.0,
    excellent: 10.0,
    industry: 'Instagram (2026)'
  },
  tiktok: {
    poor: 5.0,
    average: 9.0,
    good: 15.0,
    excellent: 20.0,
    industry: 'TikTok (2026)'
  },
  youtube: {
    poor: 2.0,
    average: 4.0,
    good: 8.0,
    excellent: 12.0,
    industry: 'YouTube (2026)'
  },
  twitter: {
    poor: 0.5,
    average: 1.5,
    good: 3.0,
    excellent: 5.0,
    industry: 'Twitter/X (2026)'
  },
  facebook: {
    poor: 0.5,
    average: 1.0,
    good: 2.0,
    excellent: 4.0,
    industry: 'Facebook (2026)'
  }
};

/**
 * Engagement weight by interaction type
 * (for calculating total engagement score)
 */
const ENGAGEMENT_WEIGHTS = {
  like: 1.0,     // Baseline
  comment: 3.0,  // 3x more valuable than like
  share: 5.0,    // 5x more valuable than like
  save: 4.0,     // 4x more valuable than like
  view: 0.1      // Views are less valuable
};

export class EngagementCalculatorService {
  /**
   * Calculate engagement rate for a profile or post
   *
   * Formula: (Total Engagements / Followers) × 100
   *
   * For video platforms (TikTok, YouTube):
   * Formula: (Total Engagements / Views) × 100
   */
  calculateEngagementRate(input: EngagementCalculationInput): EngagementMetrics {
    const {
      platform,
      followers,
      likes,
      comments,
      shares = 0,
      views = 0,
      saves = 0,
      posts = 1
    } = input;

    // Calculate weighted total engagements
    const totalEngagements = (
      likes * ENGAGEMENT_WEIGHTS.like +
      comments * ENGAGEMENT_WEIGHTS.comment +
      shares * ENGAGEMENT_WEIGHTS.share +
      saves * ENGAGEMENT_WEIGHTS.save
    );

    // Choose denominator based on platform
    let denominator = followers;
    if ((platform === 'tiktok' || platform === 'youtube') && views > 0) {
      // Video platforms: use views if available
      denominator = views;
    }

    // Calculate rate (avoid division by zero)
    const engagementRate = denominator > 0
      ? (totalEngagements / denominator) * 100 / posts
      : 0;

    return {
      likes,
      comments,
      shares,
      views: views > 0 ? views : undefined,
      saves: saves > 0 ? saves : undefined,
      totalEngagements: Math.round(totalEngagements),
      engagementRate: Number(engagementRate.toFixed(2))
    };
  }

  /**
   * Assess engagement quality against platform benchmarks
   */
  assessEngagementQuality(
    engagementRate: number,
    platform: Platform,
    followers: number
  ): EngagementQuality {
    const benchmark = ENGAGEMENT_BENCHMARKS[platform];
    const flags: string[] = [];

    // Determine tier
    let tier: 'poor' | 'average' | 'good' | 'excellent';
    let score: number;
    let percentileRank: number;

    if (engagementRate < benchmark.poor) {
      tier = 'poor';
      score = 25;
      percentileRank = 15;
      flags.push('Below minimum engagement threshold');
    } else if (engagementRate < benchmark.average) {
      tier = 'average';
      score = 50;
      percentileRank = 40;
    } else if (engagementRate < benchmark.good) {
      tier = 'good';
      score = 75;
      percentileRank = 70;
      flags.push('Above average engagement');
    } else if (engagementRate < benchmark.excellent) {
      tier = 'excellent';
      score = 90;
      percentileRank = 90;
      flags.push('Excellent engagement rate');
    } else {
      tier = 'excellent';
      score = 100;
      percentileRank = 95;
      flags.push('Outstanding engagement rate');
    }

    // Adjust score based on follower count (larger audiences = harder to maintain high ER)
    if (followers > 1000000 && engagementRate > benchmark.average) {
      score += 5; // Bonus for large accounts with good engagement
      flags.push('Strong engagement for large audience');
    }

    // Warning for suspiciously high engagement
    if (engagementRate > benchmark.excellent * 2) {
      flags.push('⚠️ Suspiciously high engagement rate - verify authenticity');
      score -= 10;
    }

    return {
      tier,
      score: Math.min(100, Math.max(0, score)),
      benchmark: benchmark.average,
      percentileRank,
      flags
    };
  }

  /**
   * Calculate authenticity score (fake follower detection)
   *
   * Based on:
   * 1. Engagement rate vs follower count consistency
   * 2. Follower/engagement ratio
   * 3. Growth pattern analysis (if historical data available)
   */
  calculateAuthenticityScore(
    engagementRate: number,
    followers: number,
    platform: Platform,
    options?: {
      averageLikesPerPost?: number;
      averageCommentsPerPost?: number;
      followersGrowthLast30Days?: number;
    }
  ): AuthenticityScore {
    const flags: string[] = [];
    let score = 100; // Start at 100 (authentic)
    let suspiciousFollowerPercentage = 0;

    const benchmark = ENGAGEMENT_BENCHMARKS[platform];

    // Factor 1: Engagement consistency (most important)
    let engagementConsistency = 100;
    if (engagementRate < benchmark.poor) {
      engagementConsistency = 30;
      score -= 40;
      suspiciousFollowerPercentage += 30;
      flags.push('Very low engagement for follower count');
    } else if (engagementRate < benchmark.average * 0.5) {
      engagementConsistency = 50;
      score -= 20;
      suspiciousFollowerPercentage += 15;
      flags.push('Below average engagement');
    }

    // Factor 2: Follower/engagement ratio
    let followerEngagementRatio = 100;
    if (options?.averageLikesPerPost !== undefined) {
      const likeToFollowerRatio = (options.averageLikesPerPost / followers) * 100;

      if (likeToFollowerRatio < 0.5 && followers > 10000) {
        followerEngagementRatio = 40;
        score -= 25;
        suspiciousFollowerPercentage += 20;
        flags.push('Poor like-to-follower ratio');
      } else if (likeToFollowerRatio < 1.0 && followers > 50000) {
        followerEngagementRatio = 60;
        score -= 15;
        suspiciousFollowerPercentage += 10;
      }
    }

    // Factor 3: Growth pattern analysis
    let growthPattern = 100;
    if (options?.followersGrowthLast30Days !== undefined) {
      const growthRate = (options.followersGrowthLast30Days / followers) * 100;

      // Suspiciously fast growth (>50% in 30 days for large accounts)
      if (growthRate > 50 && followers > 50000) {
        growthPattern = 50;
        score -= 20;
        suspiciousFollowerPercentage += 15;
        flags.push('⚠️ Unusually rapid follower growth');
      }

      // Negative growth with low engagement = red flag
      if (growthRate < -10 && engagementRate < benchmark.poor) {
        growthPattern = 30;
        score -= 15;
        flags.push('Declining followers and low engagement');
      }
    }

    // Comment ratio check (comments should be ~10-30% of likes typically)
    if (options?.averageCommentsPerPost && options?.averageLikesPerPost) {
      const commentToLikeRatio = (options.averageCommentsPerPost / options.averageLikesPerPost) * 100;

      if (commentToLikeRatio < 1 && followers > 50000) {
        score -= 10;
        suspiciousFollowerPercentage += 5;
        flags.push('Very low comment ratio');
      }
    }

    // Final score bounds
    score = Math.max(0, Math.min(100, score));
    suspiciousFollowerPercentage = Math.max(0, Math.min(80, suspiciousFollowerPercentage));

    // Determine quality
    let quality: 'suspicious' | 'questionable' | 'good' | 'excellent';
    if (score < 40) {
      quality = 'suspicious';
    } else if (score < 60) {
      quality = 'questionable';
    } else if (score < 80) {
      quality = 'good';
    } else {
      quality = 'excellent';
    }

    return {
      score,
      suspiciousFollowerPercentage,
      quality,
      flags,
      factors: {
        engagementConsistency,
        followerEngagementRatio,
        growthPattern
      }
    };
  }

  /**
   * Calculate engagement trend (growth/decline analysis)
   *
   * Compares recent engagement vs historical average
   */
  calculateEngagementTrend(
    currentEngagementRate: number,
    historicalEngagementRate: number
  ): EngagementTrend {
    const changePercent = ((currentEngagementRate - historicalEngagementRate) / historicalEngagementRate) * 100;
    const absChange = Math.abs(changePercent);

    // Direction
    let direction: 'growing' | 'stable' | 'declining';
    if (changePercent > 5) {
      direction = 'growing';
    } else if (changePercent < -5) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }

    // Velocity
    let velocity: 'slow' | 'moderate' | 'fast';
    if (absChange < 10) {
      velocity = 'slow';
    } else if (absChange < 30) {
      velocity = 'moderate';
    } else {
      velocity = 'fast';
    }

    // Momentum (0-100, higher = stronger trend)
    const momentum = Math.min(100, Math.round(absChange * 2));

    return {
      direction,
      changePercent: Number(changePercent.toFixed(1)),
      velocity,
      momentum
    };
  }

  /**
   * Get engagement tier based on follower count
   *
   * Tiers:
   * - Nano: 1K-10K
   * - Micro: 10K-50K
   * - Mid: 50K-100K
   * - Macro: 100K-500K
   * - Mega: 500K-1M
   * - Celebrity: 1M+
   */
  getInfluencerTier(followers: number): {
    tier: string;
    displayName: string;
    minFollowers: number;
    maxFollowers: number;
  } {
    if (followers >= 1000000) {
      return {
        tier: 'celebrity',
        displayName: 'Celebrity Influencer',
        minFollowers: 1000000,
        maxFollowers: Infinity
      };
    } else if (followers >= 500000) {
      return {
        tier: 'mega',
        displayName: 'Mega Influencer',
        minFollowers: 500000,
        maxFollowers: 999999
      };
    } else if (followers >= 100000) {
      return {
        tier: 'macro',
        displayName: 'Macro Influencer',
        minFollowers: 100000,
        maxFollowers: 499999
      };
    } else if (followers >= 50000) {
      return {
        tier: 'mid',
        displayName: 'Mid-tier Influencer',
        minFollowers: 50000,
        maxFollowers: 99999
      };
    } else if (followers >= 10000) {
      return {
        tier: 'micro',
        displayName: 'Micro Influencer',
        minFollowers: 10000,
        maxFollowers: 49999
      };
    } else {
      return {
        tier: 'nano',
        displayName: 'Nano Influencer',
        minFollowers: 1000,
        maxFollowers: 9999
      };
    }
  }

  /**
   * Calculate average engagement across multiple posts
   */
  calculateAverageEngagement(posts: EngagementMetrics[]): EngagementMetrics {
    if (posts.length === 0) {
      return {
        likes: 0,
        comments: 0,
        shares: 0,
        totalEngagements: 0,
        engagementRate: 0
      };
    }

    const sum = posts.reduce((acc, post) => ({
      likes: acc.likes + post.likes,
      comments: acc.comments + post.comments,
      shares: acc.shares + post.shares,
      views: (acc.views || 0) + (post.views || 0),
      saves: (acc.saves || 0) + (post.saves || 0),
      totalEngagements: acc.totalEngagements + post.totalEngagements,
      engagementRate: acc.engagementRate + post.engagementRate
    }), {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      saves: 0,
      totalEngagements: 0,
      engagementRate: 0
    });

    const count = posts.length;

    return {
      likes: Math.round(sum.likes / count),
      comments: Math.round(sum.comments / count),
      shares: Math.round(sum.shares / count),
      views: sum.views && sum.views > 0 ? Math.round(sum.views / count) : undefined,
      saves: sum.saves && sum.saves > 0 ? Math.round(sum.saves / count) : undefined,
      totalEngagements: Math.round(sum.totalEngagements / count),
      engagementRate: Number((sum.engagementRate / count).toFixed(2))
    };
  }

  /**
   * Get platform-specific engagement benchmarks
   */
  getBenchmarks(platform: Platform) {
    return ENGAGEMENT_BENCHMARKS[platform];
  }

  /**
   * Format engagement rate for display
   */
  formatEngagementRate(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  /**
   * Format engagement count for display
   */
  formatEngagementCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

// Singleton instance
let calculatorInstance: EngagementCalculatorService | null = null;

/**
 * Get global engagement calculator instance
 */
export function getEngagementCalculator(): EngagementCalculatorService {
  if (!calculatorInstance) {
    calculatorInstance = new EngagementCalculatorService();
  }
  return calculatorInstance;
}
