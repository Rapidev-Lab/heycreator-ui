/**
 * Dashboard Recommended Creators API
 *
 * GET /api/dashboard/recommended
 *
 * Lightweight, DB-only endpoint that returns top creators from Firestore.
 * Never triggers external API calls (no Apify/RapidAPI).
 * Designed for fast dashboard loading.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 6, 20);

    const db = getAdminDb();

    // Get brand profile for smart matching
    const brandDoc = await db.collection('users').doc(auth.userId).get();
    const brandData = brandDoc.data();

    // Build smart query
    let query = db.collection('global_influencers');

    // Filter by minimum engagement rate (2% is good quality)
    const minEngagementRate = 2.0;

    // Strategy 1: Try category match first (if brand has categories)
    if (brandData?.categories && Array.isArray(brandData.categories) && brandData.categories.length > 0) {
      try {
        const categorySnapshot = await query
          .where('categories', 'array-contains-any', brandData.categories.slice(0, 10))
          .where('averageEngagementRate', '>=', minEngagementRate)
          .orderBy('averageEngagementRate', 'desc')
          .limit(limit * 4) // Get extra to account for duplicates + scoring
          .get();

        if (!categorySnapshot.empty) {
          const results = await addStarredStatus(scoreAndRankInfluencers(categorySnapshot.docs, brandData, limit), auth.userId, db);
          return NextResponse.json({
            success: true,
            results,
            metadata: {
              source: 'database',
              count: results.length,
              strategy: 'category_match'
            },
          });
        }
      } catch (error) {
        console.log('[RECOMMENDED] Category match failed, falling back:', error);
      }
    }

    // Strategy 2: Location match (if brand has location)
    if (brandData?.location?.country) {
      try {
        const locationSnapshot = await query
          .where('location.country', '==', brandData.location.country)
          .where('averageEngagementRate', '>=', minEngagementRate)
          .orderBy('averageEngagementRate', 'desc')
          .limit(limit * 4)
          .get();

        if (!locationSnapshot.empty) {
          const results = await addStarredStatus(scoreAndRankInfluencers(locationSnapshot.docs, brandData, limit), auth.userId, db);
          return NextResponse.json({
            success: true,
            results,
            metadata: {
              source: 'database',
              count: results.length,
              strategy: 'location_match'
            },
          });
        }
      } catch (error) {
        console.log('[RECOMMENDED] Location match failed, falling back:', error);
      }
    }

    // Strategy 3: Fallback to top by engagement + followers
    const fallbackSnapshot = await query
      .orderBy('totalFollowers', 'desc')
      .limit(limit * 4)
      .get();

    if (fallbackSnapshot.empty) {
      return NextResponse.json({
        success: true,
        results: [],
        metadata: { source: 'database', count: 0, strategy: 'fallback' },
      });
    }

    const results = await addStarredStatus(scoreAndRankInfluencers(fallbackSnapshot.docs, brandData, limit), auth.userId, db);

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        source: 'database',
        count: results.length,
        strategy: 'fallback'
      },
    });
  } catch (error: any) {
    console.error('[DASHBOARD-RECOMMENDED] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recommendations',
      },
      { status: 500 }
    );
  }
}

/**
 * Score and rank influencers based on brand profile match
 */
function scoreAndRankInfluencers(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  brandData: any,
  limit: number
) {
  const scoredInfluencers = docs.map(doc => {
    const data = doc.data();
    let relevanceScore = 0;

    // 1. Category Match (40 points max)
    if (brandData?.categories && data.categories) {
      const categoryOverlap = data.categories.filter((c: string) =>
        brandData.categories.includes(c)
      ).length;
      relevanceScore += Math.min(categoryOverlap * 10, 40);
    }

    // 2. Engagement Quality (30 points max)
    const engagementRate = data.averageEngagementRate || 0;
    if (engagementRate >= 5) relevanceScore += 30;
    else if (engagementRate >= 3) relevanceScore += 20;
    else if (engagementRate >= 2) relevanceScore += 10;

    // 3. Location Match (20 points)
    if (brandData?.location?.country && data.location?.country === brandData.location.country) {
      relevanceScore += 20;
    }

    // 4. Follower Count Tier (10 points)
    const followers = data.totalFollowers || 0;
    if (followers >= 100000) relevanceScore += 10;
    else if (followers >= 10000) relevanceScore += 5;

    // 5. Verification Bonus (5 points)
    if (data.verified) relevanceScore += 5;

    return {
      ...mapDocToCreator(doc),
      relevanceScore,
    };
  });

  // Sort by relevance score, then by engagement rate
  scoredInfluencers.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    const aEngagement = a.rawData?.engagementRate || 0;
    const bEngagement = b.rawData?.engagementRate || 0;
    return bEngagement - aEngagement;
  });

  // Deduplicate by platform:username, keeping the highest-scored entry
  const seen = new Map<string, boolean>();
  const unique = scoredInfluencers.filter(inf => {
    const key = `${inf.platform}:${(inf.username || '').toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });

  return unique.slice(0, limit);
}

/**
 * Add starred status from user_collections to influencer results
 */
async function addStarredStatus(
  influencers: any[],
  userId: string,
  db: FirebaseFirestore.Firestore
) {
  if (influencers.length === 0) return influencers;

  // Get all influencer IDs
  const influencerIds = influencers.map(inf => inf.id);

  // Query user_collections to find which ones are starred
  const userCollectionsSnapshot = await db
    .collection('user_collections')
    .where('userId', '==', userId)
    .where('globalInfluencerId', 'in', influencerIds)
    .get();

  // Create a map of starred influencers
  const starredMap = new Map<string, boolean>();
  userCollectionsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    starredMap.set(data.globalInfluencerId, data.starred || false);
  });

  // Add starred status to each influencer
  return influencers.map(inf => ({
    ...inf,
    starred: starredMap.get(inf.id) || false,
  }));
}

function mapDocToCreator(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data();
  return {
    id: doc.id,
    platform: data.primaryPlatform || 'instagram',
    username: data.primaryUsername || data.instagramUsername || '',
    display_name: data.displayName || '',
    follower_count: data.totalFollowers || 0,
    profile_url:
      data.platforms?.find(
        (p: any) => p.platform === data.primaryPlatform
      )?.profileUrl || '',
    avatar_url: data.avatarUrl || '',
    bio: data.bio || '',
    verified: data.verified || false,
    rawData: {
      engagementRate:
        data.instagramEnrichment?.averageEngagementRate ||
        data.instagramEnrichment?.engagementRate ||
        0,
      location: data.location?.country || data.location || '',
      categories: data.categories || [],
      trueReach: data.instagramEnrichment?.estimatedReach || 0,
    },
  };
}
