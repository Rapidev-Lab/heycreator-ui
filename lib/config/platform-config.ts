/**
 * Production-Grade Platform Configuration
 *
 * Industry-standard settings for each social media platform including:
 * - Engagement rate benchmarks
 * - API rate limits
 * - Pricing multipliers
 * - Quality thresholds
 * - Platform-specific weights
 */

import { Platform } from '@/types/api';

export interface PlatformBenchmarks {
  // Engagement rate benchmarks (%)
  engagement: {
    poor: number;      // Below this = poor engagement
    average: number;   // Average engagement rate
    good: number;      // Above this = good engagement
    excellent: number; // Above this = excellent engagement
  };

  // Quality thresholds
  quality: {
    minFollowers: number;        // Minimum followers to be considered
    minEngagementRate: number;   // Minimum engagement rate (%)
    maxFollowerGrowthRate: number; // Max monthly growth (suspicious if higher)
  };

  // Pricing configuration
  pricing: {
    baseCPM: number;           // Cost per 1000 followers (base rate)
    engagementMultiplier: number; // How much to weight engagement
    nichePremium: number;      // Premium for niche categories
  };

  // Platform weight (for primary platform selection)
  weight: number; // Higher = more valuable for brands

  // API configuration
  api: {
    rateLimit: number;    // Requests per minute
    timeout: number;      // Timeout in seconds
    retryAttempts: number; // Number of retry attempts
  };

  // Cache configuration
  cache: {
    searchTTL: number;     // Search results cache TTL (seconds)
    profileTTL: number;    // Profile data cache TTL (seconds)
    enrichmentTTL: number; // Enrichment data cache TTL (seconds)
  };
}

export const PLATFORM_CONFIG: Record<Platform, PlatformBenchmarks> = {
  instagram: {
    engagement: {
      poor: 1.0,      // <1% is poor
      average: 3.0,   // 3% is average
      good: 6.0,      // 6% is good
      excellent: 10.0 // >10% is excellent
    },
    quality: {
      minFollowers: 1000,
      minEngagementRate: 0.5,
      maxFollowerGrowthRate: 50.0 // 50% monthly growth is suspicious
    },
    pricing: {
      baseCPM: 10,              // $10 per 1000 followers
      engagementMultiplier: 2.5, // Engagement is 2.5x important
      nichePremium: 1.5          // 1.5x for niche categories
    },
    weight: 1.0, // Baseline platform
    api: {
      rateLimit: 10,
      timeout: 60,
      retryAttempts: 3
    },
    cache: {
      searchTTL: 3600,      // 1 hour
      profileTTL: 86400,    // 24 hours
      enrichmentTTL: 604800 // 7 days
    }
  },

  tiktok: {
    engagement: {
      poor: 5.0,      // <5% is poor
      average: 9.0,   // 9% is average
      good: 15.0,     // 15% is good
      excellent: 25.0 // >25% is excellent
    },
    quality: {
      minFollowers: 1000,
      minEngagementRate: 2.0,
      maxFollowerGrowthRate: 100.0 // TikTok can grow faster
    },
    pricing: {
      baseCPM: 8,                // $8 per 1000 followers (cheaper than IG)
      engagementMultiplier: 3.0, // Engagement is MORE important on TikTok
      nichePremium: 1.3
    },
    weight: 0.9, // Slightly less valuable than Instagram for brands
    api: {
      rateLimit: 8,
      timeout: 60,
      retryAttempts: 3
    },
    cache: {
      searchTTL: 3600,
      profileTTL: 86400,
      enrichmentTTL: 604800
    }
  },

  youtube: {
    engagement: {
      poor: 2.0,      // <2% is poor
      average: 4.0,   // 4% is average
      good: 8.0,      // 8% is good
      excellent: 15.0 // >15% is excellent
    },
    quality: {
      minFollowers: 1000, // Subscribers
      minEngagementRate: 1.0,
      maxFollowerGrowthRate: 30.0
    },
    pricing: {
      baseCPM: 15,               // $15 per 1000 subscribers (higher than IG)
      engagementMultiplier: 2.0,
      nichePremium: 1.8          // YouTube niche content commands premium
    },
    weight: 1.2, // More valuable - longer content, higher engagement
    api: {
      rateLimit: 12,
      timeout: 45,
      retryAttempts: 3
    },
    cache: {
      searchTTL: 3600,
      profileTTL: 86400,
      enrichmentTTL: 604800
    }
  },

  twitter: {
    engagement: {
      poor: 0.5,     // <0.5% is poor
      average: 1.5,  // 1.5% is average
      good: 3.0,     // 3% is good
      excellent: 6.0 // >6% is excellent
    },
    quality: {
      minFollowers: 1000,
      minEngagementRate: 0.3,
      maxFollowerGrowthRate: 40.0
    },
    pricing: {
      baseCPM: 5,                // $5 per 1000 followers (cheaper)
      engagementMultiplier: 1.5,
      nichePremium: 1.2
    },
    weight: 0.6, // Less valuable for typical brand campaigns
    api: {
      rateLimit: 15,
      timeout: 30,
      retryAttempts: 3
    },
    cache: {
      searchTTL: 1800,     // 30 minutes (Twitter moves fast)
      profileTTL: 43200,   // 12 hours
      enrichmentTTL: 259200 // 3 days
    }
  },

  facebook: {
    engagement: {
      poor: 0.5,     // <0.5% is poor
      average: 1.0,  // 1% is average
      good: 2.0,     // 2% is good
      excellent: 4.0 // >4% is excellent
    },
    quality: {
      minFollowers: 1000,
      minEngagementRate: 0.3,
      maxFollowerGrowthRate: 25.0
    },
    pricing: {
      baseCPM: 7,                // $7 per 1000 followers
      engagementMultiplier: 1.8,
      nichePremium: 1.4
    },
    weight: 0.8, // Moderate value
    api: {
      rateLimit: 10,
      timeout: 45,
      retryAttempts: 3
    },
    cache: {
      searchTTL: 3600,
      profileTTL: 86400,
      enrichmentTTL: 604800
    }
  }
};

/**
 * Category-specific multipliers for pricing
 * Some niches command premium rates due to higher brand spending
 */
export const CATEGORY_PRICING_MULTIPLIERS: Record<string, number> = {
  // Premium categories (high brand spending)
  'Beauty': 1.8,
  'Fashion': 1.7,
  'Technology': 1.6,
  'Finance': 1.9,
  'Health & Fitness': 1.5,
  'Luxury': 2.0,

  // Standard categories
  'Food & Beverage': 1.3,
  'Travel': 1.4,
  'Lifestyle': 1.2,
  'Gaming': 1.3,
  'Education': 1.1,
  'Parenting': 1.2,

  // Lower-paying categories
  'Entertainment': 1.0,
  'Comedy': 0.9,
  'Pets': 1.0,
  'DIY & Crafts': 0.9,

  // Default
  'Other': 1.0
};

/**
 * Minimum quality thresholds for search results
 */
export const QUALITY_THRESHOLDS = {
  minInfluenceScore: 40,      // Minimum score to show in results
  minFollowers: 500,          // Absolute minimum followers
  minEngagementRate: 0.1,     // 0.1% minimum engagement
  maxSuspiciousGrowth: 200.0, // Flag if growth >200% monthly

  // Spam detection
  spam: {
    maxBioLength: 500,        // Flag if bio is too long (spam)
    minBioLength: 10,         // Flag if bio is too short (inactive)
    suspiciousKeywords: [     // Flag profiles with these
      'follow for follow',
      'f4f',
      'like for like',
      'l4l',
      'dm for promo',
      'buy followers'
    ]
  }
};

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  enabled: true,
  defaultTTL: 3600, // 1 hour default

  // Cache keys prefix
  prefix: {
    search: 'search:',
    profile: 'profile:',
    enrichment: 'enrichment:',
    metrics: 'metrics:'
  },

  // Maximum cache size (number of entries)
  maxSize: {
    search: 10000,
    profile: 50000,
    enrichment: 10000
  }
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  enabled: true,

  // Global limits
  global: {
    requestsPerMinute: 60,
    requestsPerHour: 1000
  },

  // Per-platform limits (inherited from PLATFORM_CONFIG)
  perPlatform: true,

  // Strategy: 'sliding-window' | 'token-bucket' | 'fixed-window'
  strategy: 'sliding-window' as const
};

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform: Platform): PlatformBenchmarks {
  return PLATFORM_CONFIG[platform];
}

/**
 * Get engagement benchmark for platform
 */
export function getEngagementBenchmark(platform: Platform, level: 'poor' | 'average' | 'good' | 'excellent'): number {
  return PLATFORM_CONFIG[platform].engagement[level];
}

/**
 * Get category pricing multiplier
 */
export function getCategoryMultiplier(category: string): number {
  return CATEGORY_PRICING_MULTIPLIERS[category] || CATEGORY_PRICING_MULTIPLIERS['Other'];
}

/**
 * Check if profile meets quality thresholds
 */
export function meetsQualityThreshold(
  followers: number,
  engagementRate: number,
  platform: Platform
): boolean {
  const config = PLATFORM_CONFIG[platform];

  return (
    followers >= config.quality.minFollowers &&
    engagementRate >= config.quality.minEngagementRate
  );
}
