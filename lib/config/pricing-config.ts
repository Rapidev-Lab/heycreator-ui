/**
 * Production-Grade Pricing Configuration
 *
 * Based on industry research and real market rates for influencer marketing.
 * Sources: Influencer Marketing Hub, AspireIQ, CreatorIQ pricing data (2024-2026)
 */

import { Platform } from '@/types/api';

/**
 * Content type pricing multipliers
 * Different content types command different rates
 */
export const CONTENT_TYPE_MULTIPLIERS = {
  // Instagram
  instagram: {
    story: 0.3,           // Story (24hr lifespan)
    post: 1.0,            // Feed post (baseline)
    reel: 1.5,            // Reel (higher engagement)
    carousel: 1.2,        // Carousel post
    igtv: 1.8,            // IGTV video
    live: 2.0             // Live session
  },

  // TikTok
  tiktok: {
    video: 1.0,           // Standard video (baseline)
    duet: 0.8,            // Duet video
    stitch: 0.8,          // Stitch video
    live: 2.5,            // TikTok Live
    series: 1.6           // Video series
  },

  // YouTube
  youtube: {
    short: 0.5,           // YouTube Short
    video: 1.0,           // Standard video (baseline)
    dedicated: 2.5,       // Dedicated video (product focus)
    review: 2.0,          // Product review
    integration: 1.8,     // Sponsored integration
    live: 2.2             // Live stream
  },

  // Twitter
  twitter: {
    tweet: 1.0,           // Tweet (baseline)
    thread: 1.5,          // Tweet thread
    retweet: 0.3,         // Retweet
    space: 2.0            // Twitter Space
  },

  // Facebook
  facebook: {
    post: 1.0,            // Standard post (baseline)
    story: 0.3,           // Story
    video: 1.4,           // Video post
    live: 2.0             // Facebook Live
  }
};

/**
 * Follower tier pricing
 * Base price ranges by follower count (USD)
 */
export interface FollowerTierPricing {
  min: number;
  max: number;
  avgCPM: number; // Average cost per 1000 followers
}

export const FOLLOWER_TIER_PRICING: Record<string, FollowerTierPricing> = {
  'nano': {        // 1K - 10K followers
    min: 10,
    max: 100,
    avgCPM: 10
  },
  'micro': {       // 10K - 50K followers
    min: 100,
    max: 500,
    avgCPM: 12
  },
  'mid': {         // 50K - 100K followers
    min: 500,
    max: 1500,
    avgCPM: 15
  },
  'macro': {       // 100K - 500K followers
    min: 1500,
    max: 10000,
    avgCPM: 18
  },
  'mega': {        // 500K - 1M followers
    min: 10000,
    max: 50000,
    avgCPM: 20
  },
  'celebrity': {   // 1M+ followers
    min: 50000,
    max: 500000,
    avgCPM: 25
  }
};

/**
 * Get follower tier based on count
 */
export function getFollowerTier(followers: number): string {
  if (followers < 10000) return 'nano';
  if (followers < 50000) return 'micro';
  if (followers < 100000) return 'mid';
  if (followers < 500000) return 'macro';
  if (followers < 1000000) return 'mega';
  return 'celebrity';
}

/**
 * Engagement rate multipliers
 * High engagement commands premium pricing
 */
export function getEngagementMultiplier(engagementRate: number, platform: Platform): number {
  // Platform-specific benchmarks
  const benchmarks = {
    instagram: { poor: 1, average: 3, good: 6 },
    tiktok: { poor: 5, average: 9, good: 15 },
    youtube: { poor: 2, average: 4, good: 8 },
    twitter: { poor: 0.5, average: 1.5, good: 3 },
    facebook: { poor: 0.5, average: 1, good: 2 }
  };

  const benchmark = benchmarks[platform];

  if (engagementRate < benchmark.poor) {
    return 0.5; // Low engagement = 50% of base price
  } else if (engagementRate < benchmark.average) {
    return 0.8; // Below average = 80% of base price
  } else if (engagementRate < benchmark.good) {
    return 1.0; // Average = 100% of base price
  } else if (engagementRate < benchmark.good * 1.5) {
    return 1.5; // Good = 150% of base price
  } else {
    return 2.0; // Excellent = 200% of base price
  }
}

/**
 * Campaign type multipliers
 * Different campaign types have different rates
 */
export const CAMPAIGN_TYPE_MULTIPLIERS = {
  'product_mention': 0.5,      // Brief product mention
  'product_placement': 0.8,    // Product in content
  'product_review': 1.2,       // Dedicated review
  'sponsored_post': 1.0,       // Standard sponsored content
  'brand_ambassador': 2.5,     // Long-term partnership
  'event_coverage': 1.5,       // Event attendance/coverage
  'giveaway': 0.7,             // Giveaway/contest
  'affiliate': 0.3,            // Affiliate link only
  'takeover': 3.0              // Account takeover
};

/**
 * Usage rights multipliers
 * Brands paying for content usage rights
 */
export const USAGE_RIGHTS_MULTIPLIERS = {
  'organic_only': 1.0,         // Organic post only
  'one_month': 1.2,            // 1 month usage rights
  'three_months': 1.5,         // 3 months usage rights
  'six_months': 1.8,           // 6 months usage rights
  'one_year': 2.2,             // 1 year usage rights
  'perpetual': 3.0,            // Unlimited usage rights
  'whitelisting': 1.5,         // Ad whitelisting/boosting
  'exclusivity': 2.5           // Category exclusivity
};

/**
 * Platform-specific base rates (per post)
 * These are multiplied by follower count and engagement
 */
export const PLATFORM_BASE_RATES: Record<Platform, { cpm: number; minimum: number; maximum: number }> = {
  instagram: {
    cpm: 10,      // $10 per 1000 followers
    minimum: 50,  // Minimum $50 per post
    maximum: 250000 // Maximum $250K per post
  },
  tiktok: {
    cpm: 8,
    minimum: 40,
    maximum: 200000
  },
  youtube: {
    cpm: 15,
    minimum: 100,
    maximum: 500000
  },
  twitter: {
    cpm: 5,
    minimum: 25,
    maximum: 50000
  },
  facebook: {
    cpm: 7,
    minimum: 40,
    maximum: 100000
  }
};

/**
 * Industry/niche demand multipliers
 * Some industries have higher demand = higher prices
 */
export const INDUSTRY_DEMAND_MULTIPLIERS: Record<string, number> = {
  // High demand (competitive industries)
  'Beauty & Cosmetics': 1.8,
  'Fashion & Apparel': 1.7,
  'Technology & Gadgets': 1.6,
  'Finance & Investing': 1.9,
  'Health & Wellness': 1.6,
  'Luxury Goods': 2.2,
  'Automotive': 1.7,

  // Medium demand
  'Food & Beverage': 1.4,
  'Travel & Hospitality': 1.5,
  'Home & Garden': 1.3,
  'Sports & Fitness': 1.4,
  'Gaming & Esports': 1.5,

  // Standard demand
  'Education': 1.1,
  'Parenting & Family': 1.2,
  'Pets & Animals': 1.1,
  'Art & Design': 1.0,
  'Music': 1.0,

  // Lower demand
  'Entertainment & Comedy': 0.9,
  'DIY & Crafts': 0.9,
  'Books & Literature': 0.8,

  // Default
  'General': 1.0
};

/**
 * Calculate base price for a creator
 * This is the foundation - all other multipliers apply on top
 */
export function calculateBasePrice(
  followers: number,
  platform: Platform
): number {
  const platformRate = PLATFORM_BASE_RATES[platform];
  const basePrice = (followers / 1000) * platformRate.cpm;

  // Enforce minimum and maximum
  return Math.max(
    platformRate.minimum,
    Math.min(platformRate.maximum, basePrice)
  );
}

/**
 * Calculate final price with all multipliers
 */
export interface PricingFactors {
  followers: number;
  platform: Platform;
  engagementRate: number;
  category?: string;
  contentType?: string;
  campaignType?: string;
  usageRights?: string;
}

export function calculatePrice(factors: PricingFactors): {
  basePrice: number;
  adjustedPrice: number;
  minPrice: number;
  maxPrice: number;
  breakdown: {
    base: number;
    engagementMultiplier: number;
    categoryMultiplier: number;
    contentTypeMultiplier: number;
    campaignTypeMultiplier: number;
    usageRightsMultiplier: number;
  };
} {
  // 1. Calculate base price
  const basePrice = calculateBasePrice(factors.followers, factors.platform);

  // 2. Apply engagement multiplier (MOST IMPORTANT)
  const engagementMultiplier = getEngagementMultiplier(
    factors.engagementRate,
    factors.platform
  );

  // 3. Apply category/industry multiplier
  const categoryMultiplier = factors.category
    ? (INDUSTRY_DEMAND_MULTIPLIERS[factors.category] || 1.0)
    : 1.0;

  // 4. Apply content type multiplier
  const contentTypeMultiplier = factors.contentType && CONTENT_TYPE_MULTIPLIERS[factors.platform as keyof typeof CONTENT_TYPE_MULTIPLIERS]
    ? ((CONTENT_TYPE_MULTIPLIERS[factors.platform as keyof typeof CONTENT_TYPE_MULTIPLIERS] as any)[factors.contentType] || 1.0)
    : 1.0;

  // 5. Apply campaign type multiplier
  const campaignTypeMultiplier = factors.campaignType
    ? (CAMPAIGN_TYPE_MULTIPLIERS[factors.campaignType as keyof typeof CAMPAIGN_TYPE_MULTIPLIERS] || 1.0)
    : 1.0;

  // 6. Apply usage rights multiplier
  const usageRightsMultiplier = factors.usageRights
    ? (USAGE_RIGHTS_MULTIPLIERS[factors.usageRights as keyof typeof USAGE_RIGHTS_MULTIPLIERS] || 1.0)
    : 1.0;

  // Calculate final adjusted price
  const adjustedPrice = basePrice *
    engagementMultiplier *
    categoryMultiplier *
    contentTypeMultiplier *
    campaignTypeMultiplier *
    usageRightsMultiplier;

  // Calculate price range (±20%)
  const minPrice = adjustedPrice * 0.8;
  const maxPrice = adjustedPrice * 1.2;

  return {
    basePrice: Math.round(basePrice),
    adjustedPrice: Math.round(adjustedPrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    breakdown: {
      base: basePrice,
      engagementMultiplier,
      categoryMultiplier,
      contentTypeMultiplier,
      campaignTypeMultiplier,
      usageRightsMultiplier
    }
  };
}

/**
 * Format price range as string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  if (minPrice < 1000) {
    return `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
  }

  // For large numbers, use K notation
  const formatLarge = (num: number): string => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return formatter.format(num);
  };

  return `${formatLarge(minPrice)} - ${formatLarge(maxPrice)}`;
}
