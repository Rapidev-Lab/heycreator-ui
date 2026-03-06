/**
 * Multi-Platform Influencer Enrichment API (Mock Mode)
 *
 * GET /api/influencer/[id]/enrichment
 *   Returns enriched profile data with metrics, authenticity, and pricing.
 *   Reads from Firestore (MockFirestore in mock mode).
 *
 * POST /api/influencer/[id]/enrichment
 *   In mock mode, returns existing data instead of triggering external enrichment.
 *
 * Created: February 3, 2026
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

import { db } from '@/lib/firebase/admin';
import { Platform } from '@/types/api';
import { getEngagementCalculator } from '@/lib/services/engagement-calculator.service';
import { getPricingEngine } from '@/lib/services/pricing-engine.service';
import { getRelevanceCalculator } from '@/lib/services/relevance-calculator.service';
import { getPlatformConfig, CACHE_CONFIG } from '@/lib/config/platform-config';
import { getCache, createCacheKey } from '@/lib/utils/cache-manager';

/**
 * Compute weighted average age from ageRanges array.
 */
function computeAverageAge(ageRanges: { range: string; percentage: number }[]): number | null {
  if (!ageRanges || ageRanges.length === 0) return null;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const { range, percentage } of ageRanges) {
    if (!range || !percentage) continue;
    const match = range.match(/(\d+)\s*[-–]\s*(\d+)/);
    let midpoint: number;
    if (match) {
      midpoint = (parseInt(match[1]) + parseInt(match[2])) / 2;
    } else if (range.includes('+')) {
      midpoint = 70;
    } else {
      continue;
    }
    weightedSum += midpoint * percentage;
    totalWeight += percentage;
  }

  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}

/**
 * GET /api/influencer/[id]/enrichment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check in-memory cache
    const cache = getCache();
    const cacheKey = createCacheKey(CACHE_CONFIG.prefix.enrichment, id);
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      const cached = cachedResult as any;
      if (cached.metadata?.lastEnriched) {
        const ageMs = Date.now() - new Date(cached.metadata.lastEnriched).getTime();
        cached.metadata.enrichmentAgeHours = Math.round(ageMs / (1000 * 60 * 60));
        cached.metadata.stale = ageMs > 604800000;
      }
      return NextResponse.json({ success: true, data: cached });
    }

    // Fetch from Firestore
    const profileDoc = await db.collection('global_influencers').doc(id).get();

    if (!profileDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const profileData = profileDoc.data()!;

    let primaryPlatform: Platform;
    let primaryUsername: string;
    let totalFollowers: number;
    let primaryFollowers: number;

    if (profileData.linkedAccounts && Array.isArray(profileData.linkedAccounts)) {
      const primaryAccount = profileData.linkedAccounts[0];
      primaryPlatform = (primaryAccount?.platform || 'instagram') as Platform;
      primaryUsername = primaryAccount?.username || '';
      totalFollowers = profileData.combinedMetrics?.totalFollowers || 0;
      primaryFollowers = primaryAccount?.followerCount || 0;
    } else {
      primaryPlatform = (profileData.primaryPlatform || 'instagram') as Platform;
      primaryUsername = profileData.primaryUsername || '';
      totalFollowers = profileData.totalFollowers || 0;
      const platformsArr = profileData.platforms || [];
      const primaryPlatformData = platformsArr.find((p: any) =>
        typeof p === 'object' && p.platform === primaryPlatform
      );
      primaryFollowers = primaryPlatformData?.followerCount || totalFollowers;
    }

    // Collect posts & followers from ALL platform enrichments
    const ALL_PLATFORMS = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];

    const platformUsernameMap: Record<string, string> = {};
    if (profileData.linkedAccounts && Array.isArray(profileData.linkedAccounts)) {
      for (const acc of profileData.linkedAccounts) {
        if (acc.platform && acc.username) {
          platformUsernameMap[acc.platform] = acc.username;
        }
      }
    }
    if (primaryUsername) {
      platformUsernameMap[primaryPlatform] = primaryUsername;
    }

    const allPlatformPosts: any[] = [];
    let combinedFollowers = 0;

    for (const plat of ALL_PLATFORMS) {
      const platKey = `${plat}Enrichment`;
      const platData = profileData[platKey];
      if (platData?.hasEnrichment && platData.topPosts) {
        const posts = platData.topPosts.map((p: any) => ({ ...p, platform: p.platform || plat }));
        allPlatformPosts.push(...posts);
      }
      if (platData?.followerCount) {
        combinedFollowers += platData.followerCount;
      }
    }

    allPlatformPosts.sort((a, b) => {
      const engA = (a.likes || a.likesCount || 0) + (a.comments || a.commentsCount || 0);
      const engB = (b.likes || b.likesCount || 0) + (b.comments || b.commentsCount || 0);
      return engB - engA;
    });

    let enrichmentData: any = null;
    let source = 'none';

    const enrichmentKey = `${primaryPlatform}Enrichment`;
    if (profileData[enrichmentKey]) {
      enrichmentData = profileData[enrichmentKey];
      source = 'cached';
    }

    if (!enrichmentData || !enrichmentData.hasEnrichment) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Profile found but not yet enriched',
        profile: {
          id: profileDoc.id,
          displayName: profileData.displayName,
          primaryPlatform,
          primaryUsername,
          totalFollowers,
          avatarUrl: profileData.avatarUrl || enrichmentData?.profilePicUrl || enrichmentData?.profilePicUrlHd || '',
          bio: profileData.bio
        },
        suggestion: `Call POST /api/influencer/${id}/enrich to trigger enrichment`
      });
    }

    // Calculate engagement metrics
    const calculator = getEngagementCalculator();
    const relevanceCalculator = getRelevanceCalculator();
    const pricingEngine = getPricingEngine();

    const followers = enrichmentData.followerCount || primaryFollowers || totalFollowers;
    const engagementRate = enrichmentData.averageEngagementRate || 0;
    const averageLikes = enrichmentData.averageLikes || 0;
    const averageComments = enrichmentData.averageComments || 0;

    const engagementQuality = calculator.assessEngagementQuality(
      engagementRate,
      primaryPlatform,
      followers
    );

    const authenticity = calculator.calculateAuthenticityScore(
      engagementRate,
      followers,
      primaryPlatform,
      {
        averageLikesPerPost: averageLikes,
        averageCommentsPerPost: averageComments,
        followersGrowthLast30Days: enrichmentData.followersGrowthLast30Days
      }
    );

    const trueReach = relevanceCalculator.calculateTrueReach(
      followers,
      engagementRate,
      primaryPlatform
    );

    const trueReachPercentage = relevanceCalculator.calculateTrueReachPercentage(
      followers,
      trueReach
    );

    const tier = calculator.getInfluencerTier(followers);

    const pricingTiers = pricingEngine.generateTieredPricing({
      followers,
      platform: primaryPlatform,
      engagementRate,
      category: profileData.categories?.[0]
    });

    const basePricing = pricingEngine.calculateCampaignPricing({
      influencer: {
        displayName: profileData.displayName,
        followers,
        platform: primaryPlatform,
        engagementRate,
        category: profileData.categories?.[0]
      },
      campaign: {
        contentType: primaryPlatform === 'youtube' ? 'video' :
                     primaryPlatform === 'tiktok' ? 'video' : 'post',
        campaignType: 'sponsored_post',
        quantity: 1
      }
    });

    const enrichedProfile = {
      id: profileDoc.id,
      displayName: profileData.displayName,
      primaryPlatform,
      primaryUsername,
      avatarUrl: profileData.avatarUrl || enrichmentData?.profilePicUrl || enrichmentData?.profilePicUrlHd || '',
      bio: profileData.bio,
      location: profileData.location,
      categories: profileData.categories || [],

      totalFollowers: combinedFollowers > 0 ? combinedFollowers : followers,
      linkedPlatforms: profileData.linkedAccounts
        ? profileData.linkedAccounts.map((acc: any) => {
            const accEnrichment = profileData[`${acc.platform}Enrichment`];
            return {
              platform: acc.platform,
              username: acc.username,
              profileUrl: acc.profileUrl || `https://${acc.platform}.com/${acc.username}`,
              followerCount: accEnrichment?.followerCount || acc.followerCount || 0,
              verified: accEnrichment?.verified || acc.isVerified || false,
            };
          })
        : (profileData.platforms || []).map((p: any) => {
            if (typeof p === 'string') {
              const platEnrichment = profileData[`${p}Enrichment`];
              return {
                platform: p,
                username: platformUsernameMap[p] || primaryUsername,
                profileUrl: `https://${p}.com/${platformUsernameMap[p] || primaryUsername}`,
                followerCount: platEnrichment?.followerCount || (p === primaryPlatform ? followers : 0),
                verified: platEnrichment?.verified || false,
              };
            }
            const platEnrichment = profileData[`${p.platform}Enrichment`];
            return {
              platform: p.platform,
              username: p.username || primaryUsername,
              profileUrl: p.profileUrl || `https://${p.platform}.com/${p.username || primaryUsername}`,
              followerCount: platEnrichment?.followerCount || p.followerCount || 0,
              verified: platEnrichment?.verified || p.verified || false,
            };
          }),

      engagement: {
        rate: engagementRate,
        quality: engagementQuality.tier,
        score: engagementQuality.score,
        percentileRank: engagementQuality.percentileRank,
        benchmark: calculator.getBenchmarks(primaryPlatform),
        averageLikes,
        averageComments,
        averageShares: enrichmentData.averageShares || 0,
        formatted: {
          rate: calculator.formatEngagementRate(engagementRate),
          averageLikes: calculator.formatEngagementCount(averageLikes),
          averageComments: calculator.formatEngagementCount(averageComments)
        }
      },

      authenticity: {
        score: authenticity.score,
        quality: authenticity.quality,
        suspiciousFollowers: authenticity.suspiciousFollowerPercentage,
        flags: authenticity.flags,
        factors: authenticity.factors,
        warning: authenticity.quality === 'suspicious' || authenticity.quality === 'questionable'
      },

      reach: {
        trueReach,
        trueReachPercentage,
        estimatedReachPerPost: Math.round(followers * 0.35),
        formatted: {
          trueReach: calculator.formatEngagementCount(trueReach),
          percentage: `${trueReachPercentage.toFixed(2)}%`
        }
      },

      tier: {
        ...tier,
        formatted: {
          followers: calculator.formatEngagementCount(followers)
        }
      },

      pricing: {
        basePrice: basePricing.pricePerPost,
        tiers: pricingTiers.map(t => ({
          ...t,
          formatted: {
            basePrice: pricingEngine.formatCurrency(t.basePrice),
            finalPrice: pricingEngine.formatCurrency(t.finalPrice),
            pricePerPost: pricingEngine.formatCurrency(t.pricePerPost),
            savings: pricingEngine.formatCurrency(t.savings)
          }
        })),
        recommendation: basePricing.recommendation
      },

      demographics: enrichmentData.audienceDemographics ? {
        averageAge: computeAverageAge(enrichmentData.audienceDemographics.ageRanges),
        ageRanges: enrichmentData.audienceDemographics.ageRanges || [],
        genderSplit: enrichmentData.audienceDemographics.genderSplit || {},
        topCountries: enrichmentData.audienceDemographics.topCountries || [],
        topCities: enrichmentData.audienceDemographics.topCities || [],
        languages: enrichmentData.audienceDemographics.languages || [],
        interests: enrichmentData.audienceDemographics.interests || [],
        brandAffinity: enrichmentData.brandAffinity || []
      } : null,

      brandAffinity: enrichmentData.brandAffinity || [],

      content: {
        totalPosts: enrichmentData.postsCount || 0,
        topPerformingPosts: (allPlatformPosts.length > 0 ? allPlatformPosts : enrichmentData.topPosts || []).map((p: any) => {
          const postPlatform = p.platform || primaryPlatform;
          const postUsername = platformUsernameMap[postPlatform] || primaryUsername;

          let postUrl = p.url;
          if (!postUrl || postUrl === '#') {
            if (postPlatform === 'instagram' && p.shortcode) {
              postUrl = `https://www.instagram.com/p/${p.shortcode}/`;
            } else if (postPlatform === 'tiktok' && (p.id || p.shortcode)) {
              const videoId = p.id || p.shortcode;
              postUrl = p.webVideoUrl || `https://www.tiktok.com/@${postUsername}/video/${videoId}`;
            } else if (postPlatform === 'youtube' && (p.shortcode || p.id)) {
              postUrl = `https://www.youtube.com/watch?v=${p.shortcode || p.id}`;
            } else if (postPlatform === 'twitter' && p.id) {
              postUrl = `https://x.com/${postUsername}/status/${p.id}`;
            } else if (postPlatform === 'facebook' && p.id) {
              postUrl = `https://www.facebook.com/${postUsername}/posts/${p.id}`;
            }
          }
          return {
            ...p,
            platform: postPlatform,
            url: postUrl,
            timestamp: p.timestamp?._seconds
              ? new Date(p.timestamp._seconds * 1000).toISOString()
              : p.timestamp?.seconds
                ? new Date(p.timestamp.seconds * 1000).toISOString()
                : p.timestamp instanceof Date
                  ? p.timestamp.toISOString()
                  : p.timestamp || '',
          };
        }),
        averagePostFrequency: enrichmentData.averagePostFrequency || 'Weekly',
        bestPostingTimes: enrichmentData.bestPostingTimes || []
      },

      growth: {
        followersLast7Days: enrichmentData.followersGrowthLast7Days || 0,
        followersLast30Days: enrichmentData.followersGrowthLast30Days || 0,
        trend: enrichmentData.followersGrowthLast30Days > 0 ? 'growing' :
               enrichmentData.followersGrowthLast30Days < 0 ? 'declining' : 'stable'
      },

      similarCreators: enrichmentData.similarCreators || [],
      enrichedSimilarCreators: enrichmentData.enrichedSimilarCreators || [],

      platformData: {
        [primaryPlatform]: enrichmentData
      },

      metadata: (() => {
        const lastEnriched = enrichmentData.lastEnriched || new Date().toISOString();
        const enrichmentAgeMs = Date.now() - new Date(lastEnriched).getTime();
        const enrichmentAgeHours = Math.round(enrichmentAgeMs / (1000 * 60 * 60));
        const platformConfig = getPlatformConfig(primaryPlatform);
        const enrichmentTTLMs = (platformConfig?.cache?.enrichmentTTL || 604800) * 1000;
        const stale = enrichmentAgeMs > enrichmentTTLMs;

        return {
          source,
          lastEnriched,
          enrichmentVersion: '2.0',
          dataQuality: enrichmentData.hasEnrichment ? 'complete' : 'partial',
          stale,
          enrichmentAgeHours,
        };
      })()
    };

    // Cache the result
    const platformCfg = getPlatformConfig(primaryPlatform);
    const cacheTTL = platformCfg?.cache?.profileTTL || 86400;
    cache.set(cacheKey, enrichedProfile, cacheTTL);

    return NextResponse.json({
      success: true,
      data: enrichedProfile
    });

  } catch (error: any) {
    console.error('[ENRICHMENT-API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load enrichment data',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/influencer/[id]/enrichment
 *
 * In mock mode, returns existing data instead of triggering external enrichment.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { platform, username } = body;

    if (!platform || !username) {
      return NextResponse.json(
        { success: false, error: 'platform and username are required' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const profileDoc = await db.collection('global_influencers').doc(id).get();

    if (!profileDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // In mock mode, return existing enrichment data
    const enrichmentKey = `${platform}Enrichment`;
    const existingEnrichment = profileDoc.data()?.[enrichmentKey];

    if (existingEnrichment?.hasEnrichment) {
      return NextResponse.json({
        success: true,
        message: 'Profile already enriched (mock mode — external enrichment skipped)',
        cached: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Enrichment skipped in mock mode',
      cached: false,
    });

  } catch (error: any) {
    console.error('[ENRICHMENT-API] Error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to trigger enrichment', details: error.message },
      { status: 500 }
    );
  }
}
