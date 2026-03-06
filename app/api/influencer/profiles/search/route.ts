/**
 * Collection Search API
 *
 * POST /api/influencer/profiles/search
 *
 * Searches the user's saved influencer profiles (user_collections) with advanced filtering.
 * This endpoint powers the /brands/influencers page for managing personal collections.
 *
 * Features:
 * - User-scoped search (only returns user's saved profiles)
 * - Joins with global_influencers for full profile data
 * - Keyword search across names, bios, notes
 * - Advanced filtering (collaboration status, lists, custom tags, etc.)
 * - Enrichment status tracking
 * - Pagination support
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { FilterQueryBuilder } from '@/lib/services/filter-query-builder';
import { DiscoverFilters } from '@/types/saved-search';
import { UserCollectionWithProfile } from '@/types/user-collection';
import { requireAuth } from '@/lib/firebase/auth-server';

/**
 * POST /api/influencer/profiles/search
 *
 * Request body: DiscoverFilters (extended with collection-specific filters)
 * Response: { success: true, results: UserCollectionWithProfile[], count: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication - REQUIRED for collection search
    // Support both Bearer token and legacy x-user-id header
    let userId = request.headers.get('x-user-id');
    if (!userId) {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) {
        return authResult;
      }
      userId = authResult.userId;
    }

    // Parse request body
    const filters: DiscoverFilters = await request.json();

    console.log('🔍 Collection search request for user:', userId, {
      keywords: filters.keywords,
      starred: (filters as any).starred,
      collaborationStatus: (filters as any).collaborationStatus,
      enrichmentStatus: (filters as any).enrichmentStatus,
      lists: (filters as any).lists,
      customCategories: (filters as any).customCategories,
    });

    // Initialize filter query builder
    const queryBuilder = new FilterQueryBuilder(db);

    // Build Firestore query for user_collections
    const query = queryBuilder.buildCollectionQuery(userId, filters);

    // Execute query
    const startTime = Date.now();
    const snapshot = await query.get();
    const queryTime = Date.now() - startTime;

    console.log(`✓ User collections query executed in ${queryTime}ms, returned ${snapshot.size} results`);

    // Fetch global profile data for each collection entry — parallel reads
    const joinStartTime = Date.now();

    const joinResults = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const collectionData = doc.data();

        const globalProfileSnap = await db
          .collection('global_influencers')
          .doc(collectionData.globalInfluencerId)
          .get();

        if (!globalProfileSnap.exists || !globalProfileSnap.data()) {
          console.warn(`⚠ Global profile not found for collection: ${doc.id}`);
          return null;
        }

        const globalProfile = globalProfileSnap.data()!;

        return {
          id: doc.id,
          ...collectionData,
          globalProfile: {
            displayName: globalProfile.displayName,
            primaryUsername: globalProfile.primaryUsername,
            bio: globalProfile.bio,
            avatarUrl: globalProfile.avatarUrl,
            verified: globalProfile.verified,
            platforms: (globalProfile.platforms || []).map((p: any) => ({
              platform: p.platform,
              username: p.username,
              followerCount: p.followerCount,
              verified: p.verified,
            })),
            totalFollowers: globalProfile.totalFollowers,
            averageEngagementRate: globalProfile.averageEngagementRate,
            location: globalProfile.location,
            categories: globalProfile.categories,
            topics: globalProfile.topics,
            hasInstagramEnrichment: globalProfile.instagramEnrichment?.hasEnrichment || false,
            hasTikTokEnrichment: globalProfile.tiktokEnrichment?.hasEnrichment || false,
          },
        } as UserCollectionWithProfile;
      })
    );

    // Filter out nulls (missing global profiles)
    const results: UserCollectionWithProfile[] = joinResults.filter(
      (r): r is UserCollectionWithProfile => r !== null
    );

    const joinTime = Date.now() - joinStartTime;
    console.log(`✓ Joined ${results.length} profiles with global data in ${joinTime}ms (parallel)`);

    // Apply keyword search (client-side for now)
    let filteredResults = results;
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase().split(' ');
      filteredResults = results.filter((result) => {
        const searchableText = [
          result.customDisplayName || result.globalProfile.displayName,
          result.globalProfile.primaryUsername,
          result.globalProfile.bio,
          result.notes,
          ...result.customCategories,
          ...result.globalProfile.categories,
          ...result.globalProfile.topics,
        ]
          .join(' ')
          .toLowerCase();

        return keywords.every((keyword) => searchableText.includes(keyword));
      });

      console.log(`✓ Keyword filtering: ${results.length} → ${filteredResults.length} results`);
    }

    // Apply global influencer filters (if any)
    if (filters.platforms || filters.minFollowers || filters.categories || filters.topics) {
      // Convert to GlobalInfluencer format for filtering
      const globalProfiles = filteredResults.map((r) => ({
        ...r.globalProfile,
        id: r.globalInfluencerId,
        platforms: r.globalProfile.platforms as any,
        location: r.globalProfile.location as any,
      })) as any[];

      const filtered = queryBuilder.applyClientSideFilters(globalProfiles, filters);
      const filteredIds = new Set(filtered.map((p) => p.id));

      filteredResults = filteredResults.filter((r) =>
        filteredIds.has(r.globalInfluencerId)
      );

      console.log(`✓ Global profile filtering: ${results.length} → ${filteredResults.length} results`);
    }

    // Return results
    return NextResponse.json({
      success: true,
      results: filteredResults,
      count: filteredResults.length,
      executionTime: {
        queryTime,
        joinTime,
        totalTime: Date.now() - startTime,
      },
    });
  } catch (error: any) {
    console.error('❌ Collection search error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search collection',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/influencer/profiles/search/stats
 *
 * Returns aggregated statistics about the user's collection
 */
export async function GET(request: NextRequest) {
  try {
    let userId = request.headers.get('x-user-id');
    if (!userId) {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) {
        return authResult;
      }
      userId = authResult.userId;
    }

    const startTime = Date.now();

    // Get total count
    const totalSnapshot = await db
      .collection('user_collections')
      .where('userId', '==', userId)
      .count()
      .get();
    const totalCount = totalSnapshot.data().count;

    // Get starred count
    const starredSnapshot = await db
      .collection('user_collections')
      .where('userId', '==', userId)
      .where('starred', '==', true)
      .count()
      .get();
    const starredCount = starredSnapshot.data().count;

    // Get collaboration status breakdown
    const collaborationStatuses = ['none', 'contacted', 'negotiating', 'active', 'completed'];
    const collaborationStats: Record<string, number> = {};

    for (const status of collaborationStatuses) {
      const snapshot = await db
        .collection('user_collections')
        .where('userId', '==', userId)
        .where('collaborationStatus', '==', status)
        .count()
        .get();
      collaborationStats[status] = snapshot.data().count;
    }

    // Get enrichment status breakdown
    const enrichmentStatuses = ['none', 'pending', 'enriching', 'complete', 'failed'];
    const enrichmentStats: Record<string, number> = {};

    for (const status of enrichmentStatuses) {
      const snapshot = await db
        .collection('user_collections')
        .where('userId', '==', userId)
        .where('enrichmentStatus', '==', status)
        .count()
        .get();
      enrichmentStats[status] = snapshot.data().count;
    }

    const queryTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      stats: {
        totalProfiles: totalCount,
        starredProfiles: starredCount,
        collaborationBreakdown: collaborationStats,
        enrichmentBreakdown: enrichmentStats,
      },
      executionTime: queryTime,
    });
  } catch (error: any) {
    console.error('❌ Collection stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch collection stats',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
