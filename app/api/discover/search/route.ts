/**
 * Advanced Discovery Search API (Mock Mode)
 *
 * POST /api/discover/search
 *
 * Database-only search system — queries global_influencers with filters.
 * No external API calls.
 *
 * Created: February 3, 2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { Platform, SearchResultProfile } from '@/types/api';
import {
  DiscoveryFilters,
  validateDiscoveryFilters,
  parseFollowerRange,
  parseEngagementRateRange,
  parseTrueReachRange,
} from '@/lib/types/discovery-filters';
import { getRelevanceCalculator, ProfileWithRelevance } from '@/lib/services/relevance-calculator.service';
import { getEngagementCalculator } from '@/lib/services/engagement-calculator.service';

/**
 * POST /api/discover/search
 */
export async function POST(request: NextRequest) {
  try {
    const filters: DiscoveryFilters = await request.json();

    const validation = validateDiscoveryFilters(filters);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid filters', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      query = '',
      hashtags = [],
      topics = [],
      platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
      followerRange = [],
      engagementRateRange = [],
      trueReachRange = [],
      location,
      categories = [],
      verifiedOnly = false,
      sortBy = 'relevance',
      page = 1,
      limit = 50,
    } = filters;

    // Database search
    let fsQuery: any = db.collection('global_influencers');

    if (platforms.length > 0 && platforms.length < 5) {
      fsQuery = fsQuery.where('primaryPlatform', 'in', platforms.slice(0, 10));
    }

    if (followerRange.length > 0) {
      const ranges = followerRange.map(parseFollowerRange);
      const minFollowers = Math.min(...ranges.map(r => r.min));
      const maxFollowers = Math.max(...ranges.map(r => r.max));
      if (minFollowers > 0) {
        fsQuery = fsQuery.where('totalFollowers', '>=', minFollowers);
      }
      if (maxFollowers < Infinity) {
        fsQuery = fsQuery.where('totalFollowers', '<=', maxFollowers);
      }
    }

    if (verifiedOnly) {
      fsQuery = fsQuery.where('verified', '==', true);
    }

    if (location) {
      fsQuery = fsQuery.where('location', '==', location);
    }

    fsQuery = fsQuery.limit(100);
    const snapshot = await fsQuery.get();

    let dbProfiles: SearchResultProfile[] = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        platform: (data.primaryPlatform || 'instagram') as Platform,
        username: data.primaryUsername || data.instagramUsername || '',
        display_name: data.displayName || '',
        follower_count: data.totalFollowers || 0,
        profile_url: data.platforms?.find((p: any) => p.platform === data.primaryPlatform)?.profileUrl || '',
        avatar_url: data.avatarUrl || '',
        bio: data.bio || '',
        verified: data.verified || false,
        rawData: {
          engagementRate: data.instagramEnrichment?.averageEngagementRate || 0,
          location: data.location,
          categories: data.categories,
          enrichmentData: data.instagramEnrichment
        }
      };
    });

    // Client-side text search
    if (query) {
      const queryLower = query.toLowerCase();
      dbProfiles = dbProfiles.filter(p =>
        p.display_name?.toLowerCase().includes(queryLower) ||
        p.username?.toLowerCase().includes(queryLower) ||
        p.bio?.toLowerCase().includes(queryLower)
      );
    }

    // Category filter
    if (categories.length > 0) {
      dbProfiles = dbProfiles.filter(p => {
        const profileCategories = p.rawData?.categories || [];
        return categories.some(cat => profileCategories.includes(cat));
      });
    }

    // Hashtag filter
    if (hashtags.length > 0) {
      dbProfiles = dbProfiles.filter(p => {
        const bioLower = p.bio?.toLowerCase() || '';
        return hashtags.some(tag => bioLower.includes(tag.toLowerCase()));
      });
    }

    // Calculate relevance and engagement
    const relevanceCalculator = getRelevanceCalculator();
    const engagementCalculator = getEngagementCalculator();

    let enrichedProfiles: ProfileWithRelevance[] = dbProfiles.map(profile => {
      const engagementRate = profile.rawData?.engagementRate || 0;

      const relevanceScore = relevanceCalculator.calculateRelevance(profile, query, {
        engagementRate,
        hashtags
      });

      const trueReach = relevanceCalculator.calculateTrueReach(
        profile.follower_count,
        engagementRate,
        profile.platform
      );

      const trueReachPercentage = relevanceCalculator.calculateTrueReachPercentage(
        profile.follower_count,
        trueReach
      );

      const tier = engagementCalculator.getInfluencerTier(profile.follower_count);

      return {
        ...profile,
        relevanceScore,
        trueReach,
        rawData: {
          ...profile.rawData,
          engagementRate,
          trueReachPercentage,
          tier: tier.displayName
        }
      };
    });

    // Engagement rate filter
    if (engagementRateRange.length > 0) {
      const ranges = engagementRateRange.map(parseEngagementRateRange);
      enrichedProfiles = enrichedProfiles.filter(p => {
        const rate = p.rawData?.engagementRate || 0;
        return ranges.some(r => rate >= r.min && rate <= r.max);
      });
    }

    // True reach filter
    if (trueReachRange.length > 0) {
      const ranges = trueReachRange.map(parseTrueReachRange);
      enrichedProfiles = enrichedProfiles.filter(p => {
        const reach = p.rawData?.trueReachPercentage || 0;
        return ranges.some(r => reach >= r.min && reach <= r.max);
      });
    }

    // Sort
    enrichedProfiles = sortProfiles(enrichedProfiles, sortBy);

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedProfiles = enrichedProfiles.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      results: paginatedProfiles,
      metadata: {
        query,
        totalResults: enrichedProfiles.length,
        page,
        limit,
        totalPages: Math.ceil(enrichedProfiles.length / limit),
        source: 'database',
        breakdown: {
          database: dbProfiles.length,
          live: 0,
          duplicates: 0,
          filtered: dbProfiles.length - enrichedProfiles.length
        },
        appliedFilters: {
          platforms,
          followerRange,
          engagementRateRange,
          trueReachRange,
          categories,
          verifiedOnly,
          sortBy
        }
      }
    });

  } catch (error: any) {
    console.error('[DISCOVER-API] Error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to search influencers', details: error.message },
      { status: 500 }
    );
  }
}

function sortProfiles(
  profiles: ProfileWithRelevance[],
  sortBy: string
): ProfileWithRelevance[] {
  const sorted = [...profiles];

  switch (sortBy) {
    case 'relevance':
      return sorted.sort((a, b) =>
        (b.relevanceScore?.totalScore || 0) - (a.relevanceScore?.totalScore || 0)
      );
    case 'engagement':
      return sorted.sort((a, b) =>
        (b.rawData?.engagementRate || 0) - (a.rawData?.engagementRate || 0)
      );
    case 'followers-desc':
      return sorted.sort((a, b) => b.follower_count - a.follower_count);
    case 'followers-asc':
      return sorted.sort((a, b) => a.follower_count - b.follower_count);
    case 'cost-asc':
      return sorted.sort((a, b) => a.follower_count - b.follower_count);
    case 'cost-desc':
      return sorted.sort((a, b) => b.follower_count - a.follower_count);
    default:
      return sorted;
  }
}

/**
 * GET /api/discover/search (stats)
 */
export async function GET(request: NextRequest) {
  try {
    const totalSnapshot = await db.collection('global_influencers').count().get();
    const totalCount = totalSnapshot.data().count;

    const verifiedSnapshot = await db
      .collection('global_influencers')
      .where('verified', '==', true)
      .count()
      .get();
    const verifiedCount = verifiedSnapshot.data().count;

    return NextResponse.json({
      success: true,
      stats: {
        totalInfluencers: totalCount,
        verifiedInfluencers: verifiedCount,
        platforms: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
