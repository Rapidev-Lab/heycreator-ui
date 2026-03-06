/**
 * Pricing API - Calculate influencer campaign pricing
 *
 * POST /api/pricing/calculate
 * POST /api/pricing/tiers
 * POST /api/pricing/roi
 *
 * Uses PricingEngine for production-grade pricing calculations
 * with engagement-based adjustments and industry multipliers.
 *
 * Created: February 3, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { Platform } from '@/types/api';
import { getPricingEngine } from '@/lib/services/pricing-engine.service';

/**
 * POST /api/pricing/calculate
 *
 * Calculate pricing for a specific campaign scenario
 *
 * Request body:
 * {
 *   influencer: { followers, platform, engagementRate, category? },
 *   campaign: { contentType, campaignType, usageRights?, quantity }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { action, ...body } = await request.json();

    const pricingEngine = getPricingEngine();

    // Route to specific action
    switch (action) {
      case 'calculate':
        return handleCalculate(body, pricingEngine);

      case 'tiers':
        return handleTiers(body, pricingEngine);

      case 'roi':
        return handleROI(body, pricingEngine);

      case 'compare-campaigns':
        return handleCompareCampaigns(body, pricingEngine);

      case 'compare-content':
        return handleCompareContent(body, pricingEngine);

      case 'platform-insights':
        return handlePlatformInsights(body, pricingEngine);

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use: calculate, tiers, roi, compare-campaigns, compare-content, platform-insights'
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[PRICING-API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Pricing calculation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate campaign pricing
 */
function handleCalculate(body: any, pricingEngine: any) {
  const { influencer, campaign } = body;

  // Validation
  if (!influencer || !campaign) {
    return NextResponse.json(
      { success: false, error: 'Missing influencer or campaign data' },
      { status: 400 }
    );
  }

  const requiredInfluencerFields = ['followers', 'platform', 'engagementRate'];
  const missingInfluencerFields = requiredInfluencerFields.filter(
    field => influencer[field] === undefined
  );

  if (missingInfluencerFields.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing influencer fields: ${missingInfluencerFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  const requiredCampaignFields = ['contentType', 'campaignType', 'quantity'];
  const missingCampaignFields = requiredCampaignFields.filter(
    field => campaign[field] === undefined
  );

  if (missingCampaignFields.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing campaign fields: ${missingCampaignFields.join(', ')}`
      },
      { status: 400 }
    );
  }

  // Calculate pricing
  const pricing = pricingEngine.calculateCampaignPricing({
    influencer: {
      displayName: influencer.displayName || 'Influencer',
      followers: influencer.followers,
      platform: influencer.platform as Platform,
      engagementRate: influencer.engagementRate,
      category: influencer.category
    },
    campaign: {
      contentType: campaign.contentType,
      campaignType: campaign.campaignType,
      usageRights: campaign.usageRights,
      quantity: campaign.quantity
    }
  });

  return NextResponse.json({
    success: true,
    pricing,
    formatted: {
      basePrice: pricingEngine.formatCurrency(pricing.basePrice),
      pricePerPost: pricingEngine.formatCurrency(pricing.pricePerPost),
      totalPrice: pricingEngine.formatCurrency(pricing.totalPrice),
      priceRange: pricing.priceRange.formatted
    }
  });
}

/**
 * Generate tiered pricing packages
 */
function handleTiers(body: any, pricingEngine: any) {
  const { influencer, contentType = 'post' } = body;

  if (!influencer) {
    return NextResponse.json(
      { success: false, error: 'Missing influencer data' },
      { status: 400 }
    );
  }

  const tiers = pricingEngine.generateTieredPricing(
    {
      followers: influencer.followers,
      platform: influencer.platform as Platform,
      engagementRate: influencer.engagementRate,
      category: influencer.category
    },
    contentType
  );

  // Add formatted currency
  const formattedTiers = tiers.map((tier: any) => ({
    ...tier,
    formatted: {
      basePrice: pricingEngine.formatCurrency(tier.basePrice),
      finalPrice: pricingEngine.formatCurrency(tier.finalPrice),
      pricePerPost: pricingEngine.formatCurrency(tier.pricePerPost),
      savings: pricingEngine.formatCurrency(tier.savings)
    }
  }));

  return NextResponse.json({
    success: true,
    tiers: formattedTiers
  });
}

/**
 * Calculate ROI estimate
 */
function handleROI(body: any, pricingEngine: any) {
  const { pricing, influencer, brandMetrics } = body;

  if (!pricing || !influencer || !brandMetrics) {
    return NextResponse.json(
      { success: false, error: 'Missing required data for ROI calculation' },
      { status: 400 }
    );
  }

  if (!brandMetrics.averageOrderValue) {
    return NextResponse.json(
      { success: false, error: 'averageOrderValue is required' },
      { status: 400 }
    );
  }

  const roi = pricingEngine.calculateROI(
    pricing,
    {
      followers: influencer.followers,
      platform: influencer.platform as Platform,
      engagementRate: influencer.engagementRate
    },
    {
      averageOrderValue: brandMetrics.averageOrderValue,
      conversionRateEstimate: brandMetrics.conversionRateEstimate
    }
  );

  return NextResponse.json({
    success: true,
    roi,
    formatted: {
      estimatedReach: roi.estimatedReach.toLocaleString(),
      estimatedImpressions: roi.estimatedImpressions.toLocaleString(),
      estimatedEngagements: roi.estimatedEngagements.toLocaleString(),
      costPerEngagement: pricingEngine.formatCurrency(roi.costPerEngagement),
      projectedRevenue: pricingEngine.formatCurrency(roi.projectedRevenue),
      roi: `${roi.roi.toFixed(0)}%`
    }
  });
}

/**
 * Compare pricing across campaign types
 */
function handleCompareCampaigns(body: any, pricingEngine: any) {
  const { influencer } = body;

  if (!influencer) {
    return NextResponse.json(
      { success: false, error: 'Missing influencer data' },
      { status: 400 }
    );
  }

  const comparison = pricingEngine.compareCampaignTypes({
    followers: influencer.followers,
    platform: influencer.platform as Platform,
    engagementRate: influencer.engagementRate,
    category: influencer.category
  });

  // Format prices
  const formatted: Record<string, any> = {};
  for (const [type, pricing] of Object.entries(comparison) as [string, any][]) {
    formatted[type] = {
      ...pricing,
      formatted: {
        pricePerPost: pricingEngine.formatCurrency(pricing.pricePerPost),
        totalPrice: pricingEngine.formatCurrency(pricing.totalPrice),
        priceRange: pricing.priceRange.formatted
      }
    };
  }

  return NextResponse.json({
    success: true,
    comparison: formatted
  });
}

/**
 * Compare pricing across content types
 */
function handleCompareContent(body: any, pricingEngine: any) {
  const { influencer } = body;

  if (!influencer) {
    return NextResponse.json(
      { success: false, error: 'Missing influencer data' },
      { status: 400 }
    );
  }

  const comparison = pricingEngine.compareContentTypes({
    followers: influencer.followers,
    platform: influencer.platform as Platform,
    engagementRate: influencer.engagementRate,
    category: influencer.category
  });

  // Format prices
  const formatted: Record<string, any> = {};
  for (const [type, pricing] of Object.entries(comparison) as [string, any][]) {
    formatted[type] = {
      ...pricing,
      formatted: {
        pricePerPost: pricingEngine.formatCurrency(pricing.pricePerPost),
        totalPrice: pricingEngine.formatCurrency(pricing.totalPrice),
        priceRange: pricing.priceRange.formatted
      }
    };
  }

  return NextResponse.json({
    success: true,
    comparison: formatted
  });
}

/**
 * Get platform-specific insights
 */
function handlePlatformInsights(body: any, pricingEngine: any) {
  const { platform } = body;

  if (!platform) {
    return NextResponse.json(
      { success: false, error: 'Platform is required' },
      { status: 400 }
    );
  }

  const insights = pricingEngine.getPlatformInsights(platform as Platform);

  return NextResponse.json({
    success: true,
    platform,
    insights
  });
}
