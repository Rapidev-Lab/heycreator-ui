/**
 * Pricing Engine Service
 *
 * Production-grade pricing calculator for influencer marketing campaigns.
 * Integrates engagement metrics, platform specifics, and market factors.
 *
 * Features:
 * - Dynamic pricing based on engagement quality
 * - Campaign-specific pricing scenarios
 * - Tiered pricing options (bronze, silver, gold, platinum)
 * - ROI estimation for brands
 * - Bulk discount calculation
 * - Package pricing
 *
 * Created: February 3, 2026
 */

import { Platform } from '@/types/api';
import {
  calculatePrice,
  calculateBasePrice,
  formatPriceRange,
  getFollowerTier,
  getEngagementMultiplier,
  PLATFORM_BASE_RATES,
  CONTENT_TYPE_MULTIPLIERS,
  CAMPAIGN_TYPE_MULTIPLIERS,
  USAGE_RIGHTS_MULTIPLIERS,
  INDUSTRY_DEMAND_MULTIPLIERS,
  PricingFactors
} from '@/lib/config/pricing-config';
import { getEngagementCalculator } from './engagement-calculator.service';

/**
 * Pricing scenario for a specific campaign
 */
export interface PricingScenario {
  influencer: {
    displayName: string;
    followers: number;
    platform: Platform;
    engagementRate: number;
    category?: string;
  };
  campaign: {
    contentType: string;
    campaignType: string;
    usageRights?: string;
    quantity: number; // Number of posts
  };
}

/**
 * Calculated pricing result
 */
export interface PricingResult {
  basePrice: number;
  pricePerPost: number;
  totalPrice: number;
  priceRange: {
    min: number;
    max: number;
    formatted: string;
  };
  breakdown: {
    base: number;
    engagement: number;
    category: number;
    contentType: number;
    campaignType: number;
    usageRights: number;
    quantity: number;
  };
  multipliers: {
    engagement: number;
    category: number;
    contentType: number;
    campaignType: number;
    usageRights: number;
  };
  followerTier: string;
  recommendation: string;
}

/**
 * Tiered pricing package
 */
export interface PricingTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  displayName: string;
  posts: number;
  deliverables: string[];
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  pricePerPost: number;
  savings: number;
  recommended: boolean;
  features: string[];
}

/**
 * ROI estimation for brands
 */
export interface ROIEstimate {
  estimatedReach: number;
  estimatedImpressions: number;
  estimatedEngagements: number;
  costPerEngagement: number;
  costPerImpression: number;
  projectedConversionRate: number; // Percentage
  projectedConversions: number;
  projectedRevenue: number; // Based on AOV
  roi: number; // Percentage
  roiCategory: 'poor' | 'fair' | 'good' | 'excellent';
}

export class PricingEngineService {
  private engagementCalculator = getEngagementCalculator();

  /**
   * Calculate pricing for a campaign scenario
   */
  calculateCampaignPricing(scenario: PricingScenario): PricingResult {
    const { influencer, campaign } = scenario;

    // Build pricing factors
    const factors: PricingFactors = {
      followers: influencer.followers,
      platform: influencer.platform,
      engagementRate: influencer.engagementRate,
      category: influencer.category,
      contentType: campaign.contentType,
      campaignType: campaign.campaignType,
      usageRights: campaign.usageRights
    };

    // Calculate base pricing
    const pricing = calculatePrice(factors);

    // Apply quantity discount (if buying multiple posts)
    const quantityDiscount = this.calculateQuantityDiscount(campaign.quantity);
    const pricePerPost = pricing.adjustedPrice * (1 - quantityDiscount);
    const totalPrice = pricePerPost * campaign.quantity;

    // Calculate price range
    const minPrice = totalPrice * 0.8;
    const maxPrice = totalPrice * 1.2;

    // Get follower tier
    const followerTier = getFollowerTier(influencer.followers);

    // Generate recommendation
    const recommendation = this.generateRecommendation(influencer, pricing, quantityDiscount);

    return {
      basePrice: pricing.basePrice,
      pricePerPost: Math.round(pricePerPost),
      totalPrice: Math.round(totalPrice),
      priceRange: {
        min: Math.round(minPrice),
        max: Math.round(maxPrice),
        formatted: formatPriceRange(minPrice, maxPrice)
      },
      breakdown: {
        base: pricing.basePrice,
        engagement: pricing.basePrice * pricing.breakdown.engagementMultiplier,
        category: pricing.basePrice * pricing.breakdown.categoryMultiplier,
        contentType: pricing.basePrice * pricing.breakdown.contentTypeMultiplier,
        campaignType: pricing.basePrice * pricing.breakdown.campaignTypeMultiplier,
        usageRights: pricing.basePrice * pricing.breakdown.usageRightsMultiplier,
        quantity: campaign.quantity
      },
      multipliers: {
        engagement: pricing.breakdown.engagementMultiplier,
        category: pricing.breakdown.categoryMultiplier,
        contentType: pricing.breakdown.contentTypeMultiplier,
        campaignType: pricing.breakdown.campaignTypeMultiplier,
        usageRights: pricing.breakdown.usageRightsMultiplier
      },
      followerTier,
      recommendation
    };
  }

  /**
   * Generate tiered pricing packages
   * Offers Bronze, Silver, Gold, Platinum options
   */
  generateTieredPricing(
    influencer: {
      followers: number;
      platform: Platform;
      engagementRate: number;
      category?: string;
    },
    baseContentType: string = 'post'
  ): PricingTier[] {
    const basePricing = this.calculateCampaignPricing({
      influencer: {
        ...influencer,
        displayName: 'Influencer' // Default name for tiered pricing
      },
      campaign: {
        contentType: baseContentType,
        campaignType: 'sponsored_post',
        quantity: 1
      }
    });

    const basePrice = basePricing.pricePerPost;

    return [
      // Bronze: 1 post
      {
        name: 'bronze',
        displayName: 'Bronze',
        posts: 1,
        deliverables: ['1 Sponsored Post', 'Organic posting', 'Basic analytics'],
        basePrice,
        discountPercent: 0,
        finalPrice: basePrice,
        pricePerPost: basePrice,
        savings: 0,
        recommended: false,
        features: [
          'Single post',
          'Organic reach only',
          'Standard engagement',
          'Basic reporting'
        ]
      },

      // Silver: 3 posts (10% discount)
      {
        name: 'silver',
        displayName: 'Silver',
        posts: 3,
        deliverables: ['3 Sponsored Posts', 'Story mentions', 'Detailed analytics', 'Content rights (3 months)'],
        basePrice: basePrice * 3,
        discountPercent: 10,
        finalPrice: Math.round(basePrice * 3 * 0.9),
        pricePerPost: Math.round(basePrice * 0.9),
        savings: Math.round(basePrice * 3 * 0.1),
        recommended: false,
        features: [
          '3 posts over 2 weeks',
          'Story mentions included',
          'Detailed performance report',
          '3-month content usage rights',
          'Save 10%'
        ]
      },

      // Gold: 5 posts (15% discount) - RECOMMENDED
      {
        name: 'gold',
        displayName: 'Gold',
        posts: 5,
        deliverables: [
          '5 Sponsored Posts',
          'Story mentions',
          'Reel/Video content',
          'Premium analytics',
          'Content rights (6 months)',
          'Dedicated account manager'
        ],
        basePrice: basePrice * 5,
        discountPercent: 15,
        finalPrice: Math.round(basePrice * 5 * 0.85),
        pricePerPost: Math.round(basePrice * 0.85),
        savings: Math.round(basePrice * 5 * 0.15),
        recommended: true,
        features: [
          '5 posts over 4 weeks',
          'Mix of posts, stories, and reels',
          'Premium analytics dashboard',
          '6-month content usage rights',
          'Dedicated support',
          'Save 15%'
        ]
      },

      // Platinum: 10 posts (20% discount)
      {
        name: 'platinum',
        displayName: 'Platinum',
        posts: 10,
        deliverables: [
          '10 Sponsored Posts',
          'Story mentions',
          'Video content',
          'Advanced analytics',
          'Content rights (12 months)',
          'Priority support',
          'Campaign strategy session'
        ],
        basePrice: basePrice * 10,
        discountPercent: 20,
        finalPrice: Math.round(basePrice * 10 * 0.8),
        pricePerPost: Math.round(basePrice * 0.8),
        savings: Math.round(basePrice * 10 * 0.2),
        recommended: false,
        features: [
          '10 posts over 8 weeks',
          'Multi-format content mix',
          'Advanced analytics & insights',
          '12-month content usage rights',
          'Priority support',
          'Strategy consultation',
          'Save 20%'
        ]
      }
    ];
  }

  /**
   * Calculate ROI estimate for a campaign
   *
   * @param averageOrderValue - Brand's average order value (AOV)
   * @param conversionRateEstimate - Expected conversion rate (default: platform-specific)
   */
  calculateROI(
    pricing: PricingResult,
    influencer: {
      followers: number;
      platform: Platform;
      engagementRate: number;
    },
    brandMetrics: {
      averageOrderValue: number; // AOV in USD
      conversionRateEstimate?: number; // Optional custom conversion rate
    }
  ): ROIEstimate {
    const { followers, platform, engagementRate } = influencer;
    const { averageOrderValue, conversionRateEstimate } = brandMetrics;

    // Estimate reach (30-50% of followers typically see organic content)
    const reachPercent = 0.35; // 35% average
    const estimatedReach = Math.round(followers * reachPercent);

    // Estimate impressions (each person sees content ~1.5x on average)
    const estimatedImpressions = Math.round(estimatedReach * 1.5);

    // Estimate engagements
    const estimatedEngagements = Math.round(estimatedReach * (engagementRate / 100));

    // Calculate cost per metrics
    const totalCost = pricing.totalPrice;
    const costPerEngagement = totalCost / estimatedEngagements;
    const costPerImpression = totalCost / estimatedImpressions;

    // Estimate conversion rate (if not provided, use platform-specific defaults)
    const defaultConversionRates: Record<Platform, number> = {
      instagram: 2.0,  // 2% typical for Instagram
      tiktok: 2.5,     // 2.5% for TikTok (younger audience)
      youtube: 3.0,    // 3% for YouTube (longer content)
      twitter: 1.5,    // 1.5% for Twitter
      facebook: 1.8    // 1.8% for Facebook
    };

    const conversionRate = conversionRateEstimate ?? defaultConversionRates[platform];

    // Calculate conversions and revenue
    const projectedConversions = Math.round(estimatedEngagements * (conversionRate / 100));
    const projectedRevenue = projectedConversions * averageOrderValue;

    // Calculate ROI
    const roi = ((projectedRevenue - totalCost) / totalCost) * 100;

    // Determine ROI category
    let roiCategory: 'poor' | 'fair' | 'good' | 'excellent';
    if (roi < 100) {
      roiCategory = 'poor';
    } else if (roi < 200) {
      roiCategory = 'fair';
    } else if (roi < 400) {
      roiCategory = 'good';
    } else {
      roiCategory = 'excellent';
    }

    return {
      estimatedReach,
      estimatedImpressions,
      estimatedEngagements,
      costPerEngagement: Number(costPerEngagement.toFixed(2)),
      costPerImpression: Number(costPerImpression.toFixed(4)),
      projectedConversionRate: conversionRate,
      projectedConversions,
      projectedRevenue: Math.round(projectedRevenue),
      roi: Number(roi.toFixed(1)),
      roiCategory
    };
  }

  /**
   * Calculate bulk discount percentage based on quantity
   */
  private calculateQuantityDiscount(quantity: number): number {
    if (quantity >= 10) return 0.20; // 20% off for 10+
    if (quantity >= 5) return 0.15;  // 15% off for 5-9
    if (quantity >= 3) return 0.10;  // 10% off for 3-4
    return 0; // No discount for 1-2
  }

  /**
   * Generate pricing recommendation text
   */
  private generateRecommendation(
    influencer: { followers: number; platform: Platform; engagementRate: number },
    pricing: { breakdown: any },
    quantityDiscount: number
  ): string {
    const engagementQuality = this.engagementCalculator.assessEngagementQuality(
      influencer.engagementRate,
      influencer.platform,
      influencer.followers
    );

    const recommendations: string[] = [];

    // Engagement-based recommendation
    if (engagementQuality.tier === 'excellent') {
      recommendations.push('Premium pricing justified by excellent engagement rate');
    } else if (engagementQuality.tier === 'good') {
      recommendations.push('Competitive pricing with above-average engagement');
    } else if (engagementQuality.tier === 'poor') {
      recommendations.push('Consider negotiating lower rate due to below-average engagement');
    }

    // Quantity discount recommendation
    if (quantityDiscount > 0) {
      recommendations.push(`${(quantityDiscount * 100).toFixed(0)}% bulk discount applied`);
    } else {
      recommendations.push('Book 3+ posts for 10% discount');
    }

    // Follower tier recommendation
    const tier = this.engagementCalculator.getInfluencerTier(influencer.followers);
    recommendations.push(`${tier.displayName} - appropriate for targeted campaigns`);

    return recommendations.join(' • ');
  }

  /**
   * Compare pricing across different campaign types
   */
  compareCampaignTypes(
    influencer: {
      followers: number;
      platform: Platform;
      engagementRate: number;
      category?: string;
    }
  ): Record<string, PricingResult> {
    const campaignTypes = Object.keys(CAMPAIGN_TYPE_MULTIPLIERS);
    const results: Record<string, PricingResult> = {};

    for (const campaignType of campaignTypes) {
      results[campaignType] = this.calculateCampaignPricing({
        influencer: {
          ...influencer,
          displayName: 'Influencer'
        },
        campaign: {
          contentType: 'post',
          campaignType,
          quantity: 1
        }
      });
    }

    return results;
  }

  /**
   * Compare pricing across content types
   */
  compareContentTypes(
    influencer: {
      followers: number;
      platform: Platform;
      engagementRate: number;
      category?: string;
    }
  ): Record<string, PricingResult> {
    const platformContentTypes = CONTENT_TYPE_MULTIPLIERS[influencer.platform as keyof typeof CONTENT_TYPE_MULTIPLIERS];
    if (!platformContentTypes) {
      return {};
    }

    const contentTypes = Object.keys(platformContentTypes);
    const results: Record<string, PricingResult> = {};

    for (const contentType of contentTypes) {
      results[contentType] = this.calculateCampaignPricing({
        influencer: {
          ...influencer,
          displayName: 'Influencer'
        },
        campaign: {
          contentType,
          campaignType: 'sponsored_post',
          quantity: 1
        }
      });
    }

    return results;
  }

  /**
   * Get platform-specific pricing insights
   */
  getPlatformInsights(platform: Platform): {
    baseCPM: number;
    minimumPrice: number;
    averagePrice: string;
    topTierPrice: string;
    strengths: string[];
    considerations: string[];
  } {
    const platformRate = PLATFORM_BASE_RATES[platform];

    const insights = {
      instagram: {
        averagePrice: '$100-$5,000',
        topTierPrice: '$50,000-$250,000',
        strengths: [
          'High visual appeal',
          'Strong shopping integration',
          'Multiple content formats',
          'Excellent for fashion/beauty/lifestyle'
        ],
        considerations: [
          'Engagement rates declining (avg 3%)',
          'Algorithm favors video content',
          'Stories disappear after 24h'
        ]
      },
      tiktok: {
        averagePrice: '$80-$4,000',
        topTierPrice: '$40,000-$200,000',
        strengths: [
          'Highest engagement rates (avg 9%)',
          'Viral potential',
          'Younger audience (Gen Z)',
          'Authentic, creative content'
        ],
        considerations: [
          'Content lifespan can be short',
          'Less established e-commerce features',
          'Audience may be less affluent'
        ]
      },
      youtube: {
        averagePrice: '$200-$10,000',
        topTierPrice: '$100,000-$500,000',
        strengths: [
          'Long-form content',
          'High trust and authority',
          'Excellent for product reviews',
          'Evergreen content value'
        ],
        considerations: [
          'Longer production time',
          'Higher production costs',
          'Lower engagement rates'
        ]
      },
      twitter: {
        averagePrice: '$50-$1,000',
        topTierPrice: '$10,000-$50,000',
        strengths: [
          'Real-time engagement',
          'Tech-savvy audience',
          'Good for announcements/news',
          'Thread format for storytelling'
        ],
        considerations: [
          'Lowest engagement rates',
          'Limited visual appeal',
          'Content gets buried quickly'
        ]
      },
      facebook: {
        averagePrice: '$80-$2,000',
        topTierPrice: '$20,000-$100,000',
        strengths: [
          'Older, more affluent audience',
          'Strong ad platform integration',
          'Groups and communities',
          'Good for B2C brands'
        ],
        considerations: [
          'Declining youth engagement',
          'Lower organic reach',
          'Less trendy/cool factor'
        ]
      }
    };

    return {
      baseCPM: platformRate.cpm,
      minimumPrice: platformRate.minimum,
      ...insights[platform]
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}

// Singleton instance
let pricingEngineInstance: PricingEngineService | null = null;

/**
 * Get global pricing engine instance
 */
export function getPricingEngine(): PricingEngineService {
  if (!pricingEngineInstance) {
    pricingEngineInstance = new PricingEngineService();
  }
  return pricingEngineInstance;
}
