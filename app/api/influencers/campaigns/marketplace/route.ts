/**
 * Campaign Marketplace API
 *
 * GET /api/influencers/campaigns/marketplace
 * Fetch all public active campaigns with filtering, search, and pagination
 *
 * Performance: shared data (campaigns + brands) is cached in-memory with 60s TTL.
 * Only user-specific data (applications, invitations, profile) is fetched fresh.
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { CampaignAudience } from '@/types/campaign';
import {
  computeRelevanceScore,
  buildInfluencerMatchData,
  type CampaignMatchData,
} from '@/lib/services/campaign-recommendation.service';

interface MarketplaceFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  platform?: string;
  search?: string;
  sortBy?: 'latest' | 'budget' | 'deadline' | 'relevance';
  page?: number;
  limit?: number;
}

// ── Server-side in-memory cache for shared data ──
// Public campaigns + brand info are the same for ALL users.
// Caching them avoids the two heaviest Firestore reads on every request.

const CACHE_TTL_MS = 60_000; // 60 seconds

interface CachedCampaignDoc {
  id: string;
  data: Record<string, any>;
}

interface SharedCache {
  campaigns: CachedCampaignDoc[];
  brandMap: Map<string, { name: string; logo: string | null; verified: boolean }>;
  categories: Set<string>;
  minBudget: number;
  maxBudget: number;
  timestamp: number;
}

const globalCache = global as typeof globalThis & {
  _marketplaceCache?: SharedCache;
};

function getCachedSharedData(): SharedCache | null {
  const cache = globalCache._marketplaceCache;
  if (!cache) return null;
  if (Date.now() - cache.timestamp > CACHE_TTL_MS) {
    globalCache._marketplaceCache = undefined;
    return null;
  }
  return cache;
}

/** Helper to convert Firestore Timestamps to ISO strings */
function toISO(val: any): string | null {
  if (!val) return null;
  if (val.toDate) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

/**
 * Fetch & cache the shared data: public campaigns + brand info.
 * Called at most once per 60 seconds regardless of concurrent requests.
 */
let fetchPromise: Promise<SharedCache> | null = null;

async function getSharedData(): Promise<SharedCache> {
  const cached = getCachedSharedData();
  if (cached) return cached;

  // Deduplicate concurrent fetches
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const publicSnapshot = await firestore
        .collection('campaigns')
        .where('campaignVisibility', '==', 'public')
        .where('status', '==', 'PUBLISHED')
        .get();

      const campaigns: CachedCampaignDoc[] = publicSnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));

      // Collect unique brand IDs
      const brandIdSet = new Set<string>();
      const categories = new Set<string>();
      let minBudget = Infinity;
      let maxBudget = 0;

      for (const { data } of campaigns) {
        if (data.brandId) brandIdSet.add(data.brandId);
        if (data.campaignCategories && Array.isArray(data.campaignCategories)) {
          data.campaignCategories.forEach((cat: string) => categories.add(cat));
        }
        if (data.campaignProduct?.productType) {
          categories.add(data.campaignProduct.productType);
        }
        const budgetAmount = getBudgetAmount(data.budget);
        if (budgetAmount > 0) {
          minBudget = Math.min(minBudget, budgetAmount);
          maxBudget = Math.max(maxBudget, budgetAmount);
        }
      }

      // Batch-fetch all brand docs in one call
      const brandMap = new Map<string, { name: string; logo: string | null; verified: boolean }>();
      if (brandIdSet.size > 0) {
        const brandRefs = Array.from(brandIdSet).map((id) =>
          firestore.collection('users').doc(id)
        );
        const brandDocs = await firestore.getAll(...brandRefs);
        for (const doc of brandDocs) {
          if (doc.exists) {
            const d = doc.data();
            brandMap.set(doc.id, {
              name: d?.displayName || d?.email || 'Unknown Brand',
              logo: d?.photoURL || null,
              verified: d?.verified || false,
            });
          }
        }
      }

      const result: SharedCache = {
        campaigns,
        brandMap,
        categories,
        minBudget,
        maxBudget,
        timestamp: Date.now(),
      };

      globalCache._marketplaceCache = result;
      return result;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Check if influencer meets campaign audience requirements (sync — uses pre-fetched profile)
 */
function checkQualification(
  influencerProfile: any | null,
  audience: Partial<CampaignAudience>
): boolean {
  if (!influencerProfile) return false;

  const metrics = influencerProfile.metrics || {};

  // Check follower count
  const totalFollowers = metrics.totalFollowers || 0;
  if (audience.minFollowers && totalFollowers < audience.minFollowers) {
    return false;
  }

  // Check engagement rate
  const avgEngagement = metrics.averageEngagementRate || 0;
  if (audience.minEngagements && avgEngagement < audience.minEngagements) {
    return false;
  }

  // All checks passed
  return true;
}

/**
 * Get all campaign IDs the user has applied to
 * Returns a Set for O(1) lookup performance
 */
async function getUserApplications(userId: string): Promise<Set<string>> {
  try {
    const applicationsSnapshot = await firestore
      .collection('applications')
      .where('influencerId', '==', userId)
      .select('campaignId') // Only fetch campaignId field for efficiency
      .get();

    const appliedCampaignIds = new Set<string>();
    applicationsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.campaignId) {
        appliedCampaignIds.add(data.campaignId);
      }
    });

    return appliedCampaignIds;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return new Set<string>();
  }
}

/**
 * Get budget amount from campaign data
 */
function getBudgetAmount(budget: any): number {
  if (!budget) return 0;
  if (budget.compensationModel === 'fixed') {
    return budget.fixedAmount || 0;
  }
  return budget.maxRangeAmount || budget.fixedAmount || 0;
}

/**
 * GET /api/influencers/campaigns/marketplace
 */
export async function GET(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { searchParams } = new URL(request.url);

      // Parse filters
      const filters: MarketplaceFilters = {
        category: searchParams.get('category') || undefined,
        budgetMin: searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined,
        budgetMax: searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined,
        platform: searchParams.get('platform') || undefined,
        search: searchParams.get('search') || undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'latest',
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
      };

      // ── Parallel: shared cached data + user-specific fresh queries ──
      const [shared, appliedCampaignIds, invitationsSnapshot, influencerProfile, influencerProfileDoc] =
        await Promise.all([
          // 1. Shared data (served from cache if <60s old)
          getSharedData(),
          // 2. User's applied campaign IDs
          getUserApplications(userId),
          // 3. Accepted invitations for private campaigns
          firestore
            .collection('campaign_invitations')
            .where('influencerId', '==', userId)
            .where('status', '==', 'accepted')
            .get(),
          // 4. Influencer profile from global_influencers (fetched ONCE, not per-campaign)
          firestore
            .collection('global_influencers')
            .where('userId', '==', userId)
            .limit(1)
            .get()
            .then((snap) => (snap.empty ? null : snap.docs[0].data()))
            .catch(() => null),
          // 5. Influencer profile from influencer_profiles (for categories/niches)
          firestore
            .collection('influencer_profiles')
            .where('userId', '==', userId)
            .limit(1)
            .get()
            .then((snap) => (snap.empty ? null : snap.docs[0].data()))
            .catch(() => null),
        ]);

      // Build match data once for scoring all campaigns
      const influencerMatchData = buildInfluencerMatchData(influencerProfile, influencerProfileDoc);

      const { campaigns: publicCampaigns, brandMap, categories, minBudget, maxBudget } = shared;

      // Build a Set of public campaign IDs for dedup
      const publicIdSet = new Set(publicCampaigns.map((c) => c.id));

      // Merge invited private campaigns (only if not already in public set)
      const invitedCampaignIds = new Set(
        invitationsSnapshot.docs.map((doc) => doc.data().campaignId)
      );
      const allCampaigns = [...publicCampaigns];

      if (invitedCampaignIds.size > 0) {
        const privateIds = Array.from(invitedCampaignIds).filter((id) => !publicIdSet.has(id));
        if (privateIds.length > 0) {
          const privateRefs = privateIds.map((id) => firestore.collection('campaigns').doc(id));
          const privateDocs = await firestore.getAll(...privateRefs);
          for (const doc of privateDocs) {
            if (doc.exists) {
              const data = doc.data();
              if (data?.status === 'PUBLISHED') {
                allCampaigns.push({ id: doc.id, data: data as Record<string, any> });

                // Fetch brand info for private campaigns not in the cached brand map
                if (data.brandId && !brandMap.has(data.brandId)) {
                  try {
                    const brandDoc = await firestore.collection('users').doc(data.brandId).get();
                    if (brandDoc.exists) {
                      const d = brandDoc.data();
                      brandMap.set(data.brandId, {
                        name: d?.displayName || d?.email || 'Unknown Brand',
                        logo: d?.photoURL || null,
                        verified: d?.verified || false,
                      });
                    }
                  } catch {
                    // ignore
                  }
                }
              }
            }
          }
        }
      }

      // ── Build response list in single pass ──
      let resultCampaigns: any[] = [];

      for (const { id, data } of allCampaigns) {
        const budgetAmount = getBudgetAmount(data.budget);

        // Apply budget filter
        if (filters.budgetMin && budgetAmount < filters.budgetMin) continue;
        if (filters.budgetMax && budgetAmount > filters.budgetMax) continue;

        // Apply category filter
        if (filters.category) {
          const hasCategory =
            (data.campaignCategories && data.campaignCategories.includes(filters.category)) ||
            data.campaignProduct?.productType === filters.category;
          if (!hasCategory) continue;
        }

        // Apply search filter — match across ALL campaign data points
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const brand = brandMap.get(data.brandId);

          // Build a searchable text blob from all campaign fields
          const searchableChunks: string[] = [
            data.campaignTitle || '',
            data.description || '',
            brand?.name || '',
            ...(data.campaignCategories || []),
            ...(data.campaignObjectives || []),
            data.kpi || '',
            data.campaignProduct?.productType || '',
            data.campaignProduct?.productName || '',
            data.audience?.targetLocation || '',
            data.audience?.interests_and_affiliates || '',
            data.audience?.gender || '',
            ...(data.tasks?.dos || []),
            ...(data.tasks?.donts || []),
            ...(data.tasks?.metaData?.requiredHashTags || []),
            ...(data.tasks?.metaData?.mentions_or_tags || []),
            ...(data.tasks?.requiredDeliverables || []).flatMap((d: any) => [
              d.platform || '', d.contentType || '', d.description || '',
            ]),
            ...(data.tasks?.questions || []).map((q: any) =>
              typeof q === 'string' ? q : q?.question || ''
            ),
          ];
          const blob = searchableChunks.join(' ').toLowerCase();

          // Support multi-word queries: every word must appear somewhere in the blob
          const words = searchLower.split(/\s+/).filter(Boolean);
          const matches = words.every(word => blob.includes(word));
          if (!matches) continue;
        }

        const qualifies = checkQualification(influencerProfile, data.audience || {});
        const brandInfo = brandMap.get(data.brandId) || {
          name: 'Unknown Brand',
          logo: null,
          verified: false,
        };

        const rawBudget = data.budget || {};
        const deadlineISO = toISO(rawBudget.applicationDeadline);

        // Extract campaign platforms from deliverables
        const campaignPlatforms: string[] = [];
        const rawDeliverables = data.tasks?.requiredDeliverables || [];
        for (const d of rawDeliverables) {
          if (d.platform && !campaignPlatforms.includes(d.platform.toLowerCase())) {
            campaignPlatforms.push(d.platform.toLowerCase());
          }
        }

        // Compute relevance score
        const campaignMatchData: CampaignMatchData = {
          categories: data.campaignCategories || [],
          platforms: campaignPlatforms,
          targetLocation: data.audience?.targetLocation || '',
          minFollowers: data.audience?.minFollowers || 0,
          minEngagements: data.audience?.minEngagements || 0,
          applicationDeadline: deadlineISO,
          qualifies,
        };
        const relevanceScore = computeRelevanceScore(influencerMatchData, campaignMatchData);

        resultCampaigns.push({
          id,
          title: data.campaignTitle,
          description: data.description,
          productCategory:
            data.campaignCategories?.[0] || data.campaignProduct?.productType || '',
          budget: {
            ...rawBudget,
            applicationDeadline: deadlineISO,
            contentCreationDate: toISO(rawBudget.contentCreationDate),
            contentCreationStart: toISO(rawBudget.contentCreationStart),
            contentCreationEnd: toISO(rawBudget.contentCreationEnd),
          },
          budgetAmount,
          timeline: {
            applicationDeadline: deadlineISO,
            startDate: toISO(data.campaignStart),
            endDate: toISO(data.campaignEnd),
          },
          tasks: data.tasks || {},
          audience: data.audience,
          categories: data.campaignCategories || [],
          objectives: data.campaignObjectives || [],
          stats: data.stats || { views: 0, applications: 0 },
          brandInfo,
          qualifies,
          hasApplied: appliedCampaignIds.has(id),
          createdAt: toISO(data.createdAt),
          product: data.campaignProduct || null,
          relevanceScore,
        });
      }

      // Sort campaigns
      resultCampaigns.sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevance':
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
          case 'budget':
            return (b.budgetAmount || 0) - (a.budgetAmount || 0);
          case 'deadline':
            const aDeadline = a.timeline?.applicationDeadline
              ? new Date(a.timeline.applicationDeadline)
              : new Date();
            const bDeadline = b.timeline?.applicationDeadline
              ? new Date(b.timeline.applicationDeadline)
              : new Date();
            return aDeadline.getTime() - bDeadline.getTime();
          case 'latest':
          default:
            const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return bDate.getTime() - aDate.getTime();
        }
      });

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCampaigns = resultCampaigns.slice(startIndex, endIndex);

      const response = NextResponse.json({
        success: true,
        data: {
          campaigns: paginatedCampaigns,
          pagination: {
            page,
            limit,
            total: resultCampaigns.length,
            totalPages: Math.ceil(resultCampaigns.length / limit),
          },
          filters: {
            categories: Array.from(categories),
            budgetRange: {
              min: minBudget === Infinity ? 0 : minBudget,
              max: maxBudget,
            },
          },
        },
      });

      // Allow browser/CDN to serve stale responses for 30s while revalidating
      response.headers.set(
        'Cache-Control',
        'private, max-age=30, stale-while-revalidate=60'
      );

      return response;
    } catch (error) {
      console.error('Error fetching marketplace campaigns:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch campaigns',
        },
        { status: 500 }
      );
    }
  });
}
