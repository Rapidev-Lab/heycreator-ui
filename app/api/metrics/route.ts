/**
 * Metrics API - Calculate engagement metrics and authenticity
 *
 * POST /api/metrics/engagement
 * POST /api/metrics/authenticity
 * POST /api/metrics/quality
 * POST /api/metrics/trend
 *
 * Uses EngagementCalculator for production-grade metrics.
 *
 * Created: February 3, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { Platform } from '@/types/api';
import { getEngagementCalculator } from '@/lib/services/engagement-calculator.service';

/**
 * POST /api/metrics
 *
 * Calculate various engagement metrics
 */
export async function POST(request: NextRequest) {
  try {
    const { action, ...body } = await request.json();

    const calculator = getEngagementCalculator();

    // Route to specific action
    switch (action) {
      case 'engagement':
        return handleEngagement(body, calculator);

      case 'quality':
        return handleQuality(body, calculator);

      case 'authenticity':
        return handleAuthenticity(body, calculator);

      case 'trend':
        return handleTrend(body, calculator);

      case 'average':
        return handleAverage(body, calculator);

      case 'tier':
        return handleTier(body, calculator);

      case 'benchmarks':
        return handleBenchmarks(body, calculator);

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use: engagement, quality, authenticity, trend, average, tier, benchmarks'
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[METRICS-API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Metrics calculation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate engagement rate
 */
function handleEngagement(body: any, calculator: any) {
  const { platform, followers, likes, comments, shares, views, saves, posts } = body;

  // Validation
  if (!platform || followers === undefined || likes === undefined || comments === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: platform, followers, likes, comments' },
      { status: 400 }
    );
  }

  const metrics = calculator.calculateEngagementRate({
    platform: platform as Platform,
    followers,
    likes,
    comments,
    shares: shares || 0,
    views: views || 0,
    saves: saves || 0,
    posts: posts || 1
  });

  return NextResponse.json({
    success: true,
    metrics,
    formatted: {
      engagementRate: calculator.formatEngagementRate(metrics.engagementRate),
      totalEngagements: calculator.formatEngagementCount(metrics.totalEngagements),
      likes: calculator.formatEngagementCount(metrics.likes),
      comments: calculator.formatEngagementCount(metrics.comments),
      shares: metrics.shares ? calculator.formatEngagementCount(metrics.shares) : undefined
    }
  });
}

/**
 * Assess engagement quality
 */
function handleQuality(body: any, calculator: any) {
  const { engagementRate, platform, followers } = body;

  if (engagementRate === undefined || !platform || followers === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: engagementRate, platform, followers' },
      { status: 400 }
    );
  }

  const quality = calculator.assessEngagementQuality(
    engagementRate,
    platform as Platform,
    followers
  );

  return NextResponse.json({
    success: true,
    quality,
    formatted: {
      tier: quality.tier,
      score: `${quality.score}/100`,
      benchmark: calculator.formatEngagementRate(quality.benchmark),
      percentileRank: `Top ${100 - quality.percentileRank}%`
    }
  });
}

/**
 * Calculate authenticity score
 */
function handleAuthenticity(body: any, calculator: any) {
  const {
    engagementRate,
    followers,
    platform,
    averageLikesPerPost,
    averageCommentsPerPost,
    followersGrowthLast30Days
  } = body;

  if (engagementRate === undefined || followers === undefined || !platform) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: engagementRate, followers, platform' },
      { status: 400 }
    );
  }

  const authenticity = calculator.calculateAuthenticityScore(
    engagementRate,
    followers,
    platform as Platform,
    {
      averageLikesPerPost,
      averageCommentsPerPost,
      followersGrowthLast30Days
    }
  );

  return NextResponse.json({
    success: true,
    authenticity,
    formatted: {
      score: `${authenticity.score}/100`,
      quality: authenticity.quality,
      suspiciousFollowers: `${authenticity.suspiciousFollowerPercentage.toFixed(0)}%`,
      factors: {
        engagement: `${authenticity.factors.engagementConsistency}/100`,
        followerRatio: `${authenticity.factors.followerEngagementRatio}/100`,
        growth: `${authenticity.factors.growthPattern}/100`
      }
    },
    warning: authenticity.quality === 'suspicious' || authenticity.quality === 'questionable'
      ? 'This account shows signs of inflated follower counts or fake engagement'
      : null
  });
}

/**
 * Calculate engagement trend
 */
function handleTrend(body: any, calculator: any) {
  const { currentEngagementRate, historicalEngagementRate } = body;

  if (currentEngagementRate === undefined || historicalEngagementRate === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: currentEngagementRate, historicalEngagementRate' },
      { status: 400 }
    );
  }

  const trend = calculator.calculateEngagementTrend(
    currentEngagementRate,
    historicalEngagementRate
  );

  return NextResponse.json({
    success: true,
    trend,
    formatted: {
      direction: trend.direction,
      change: `${trend.changePercent > 0 ? '+' : ''}${trend.changePercent}%`,
      velocity: trend.velocity,
      momentum: `${trend.momentum}/100`
    },
    summary: generateTrendSummary(trend)
  });
}

/**
 * Calculate average engagement across posts
 */
function handleAverage(body: any, calculator: any) {
  const { posts } = body;

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Posts array is required and must not be empty' },
      { status: 400 }
    );
  }

  const average = calculator.calculateAverageEngagement(posts);

  return NextResponse.json({
    success: true,
    average,
    postCount: posts.length,
    formatted: {
      engagementRate: calculator.formatEngagementRate(average.engagementRate),
      totalEngagements: calculator.formatEngagementCount(average.totalEngagements),
      likes: calculator.formatEngagementCount(average.likes),
      comments: calculator.formatEngagementCount(average.comments)
    }
  });
}

/**
 * Get influencer tier
 */
function handleTier(body: any, calculator: any) {
  const { followers } = body;

  if (followers === undefined) {
    return NextResponse.json(
      { success: false, error: 'followers field is required' },
      { status: 400 }
    );
  }

  const tier = calculator.getInfluencerTier(followers);

  return NextResponse.json({
    success: true,
    tier,
    formatted: {
      followers: followers.toLocaleString(),
      range: `${tier.minFollowers.toLocaleString()} - ${tier.maxFollowers === Infinity ? '∞' : tier.maxFollowers.toLocaleString()}`
    }
  });
}

/**
 * Get platform benchmarks
 */
function handleBenchmarks(body: any, calculator: any) {
  const { platform } = body;

  if (!platform) {
    return NextResponse.json(
      { success: false, error: 'platform field is required' },
      { status: 400 }
    );
  }

  const benchmarks = calculator.getBenchmarks(platform as Platform);

  return NextResponse.json({
    success: true,
    platform,
    benchmarks,
    formatted: {
      poor: calculator.formatEngagementRate(benchmarks.poor),
      average: calculator.formatEngagementRate(benchmarks.average),
      good: calculator.formatEngagementRate(benchmarks.good),
      excellent: calculator.formatEngagementRate(benchmarks.excellent)
    }
  });
}

/**
 * Generate human-readable trend summary
 */
function generateTrendSummary(trend: any): string {
  const { direction, changePercent, velocity } = trend;

  const directionText = direction === 'growing' ? 'increasing' :
                       direction === 'declining' ? 'decreasing' :
                       'stable';

  const velocityText = velocity === 'fast' ? 'rapidly' :
                      velocity === 'moderate' ? 'moderately' :
                      'slowly';

  const absChange = Math.abs(changePercent);

  if (direction === 'stable') {
    return `Engagement is stable with minimal change (${absChange.toFixed(1)}%)`;
  }

  return `Engagement is ${velocityText} ${directionText} by ${absChange.toFixed(1)}%`;
}
