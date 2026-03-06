/**
 * Influencer Applications API
 *
 * GET /api/influencers/applications
 * Get all applications for the current influencer
 *
 * Performance: Uses batch reads (getAll) instead of sequential per-doc fetches.
 * Campaign + brand data is cached server-side for 60s.
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

// ── Server-side in-memory cache for campaign + brand data ──
const CACHE_TTL_MS = 60_000; // 60 seconds

interface CampaignCacheEntry {
  data: Record<string, any>;
  timestamp: number;
}

const campaignCache = new Map<string, CampaignCacheEntry>();
const brandCache = new Map<string, { name: string; logo: string | null; timestamp: number }>();

function getCachedCampaign(id: string): Record<string, any> | null {
  const entry = campaignCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    campaignCache.delete(id);
    return null;
  }
  return entry.data;
}

function getCachedBrand(id: string): { name: string; logo: string | null } | null {
  const entry = brandCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    brandCache.delete(id);
    return null;
  }
  return { name: entry.name, logo: entry.logo };
}

/** Helper for Firestore Timestamps */
function toISO(val: any): string | null {
  if (!val) return null;
  if (val.toDate) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

/**
 * GET /api/influencers/applications
 */
export async function GET(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { searchParams } = new URL(request.url);

      // Parse filters
      const statusFilter = searchParams.get('status') || 'all';
      const sortBy = searchParams.get('sortBy') || 'latest';
      const page = Number(searchParams.get('page')) || 1;
      const limit = Number(searchParams.get('limit')) || 10;

      // Step 1: Fetch all applications for this user (single query)
      const snapshot = await firestore
        .collection('campaign_applications')
        .where('influencerId', '==', userId)
        .get();

      // Filter status in JavaScript
      const filteredDocs = statusFilter !== 'all'
        ? snapshot.docs.filter((doc) => doc.data().status === statusFilter)
        : snapshot.docs;

      if (filteredDocs.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            applications: [],
            stats: { total: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 },
            pagination: { page, limit, total: 0, totalPages: 0 },
          },
        });
      }

      // Step 2: Collect unique campaign IDs, separate cached vs uncached
      const campaignDataMap = new Map<string, Record<string, any>>();
      const uncachedCampaignIds: string[] = [];

      for (const doc of filteredDocs) {
        const campaignId = doc.data().campaignId;
        if (!campaignId || campaignDataMap.has(campaignId)) continue;
        const cached = getCachedCampaign(campaignId);
        if (cached) {
          campaignDataMap.set(campaignId, cached);
        } else {
          uncachedCampaignIds.push(campaignId);
        }
      }

      // Step 3: Batch-fetch uncached campaigns using getAll() (1 round-trip instead of N)
      if (uncachedCampaignIds.length > 0) {
        const campaignRefs = uncachedCampaignIds.map((id) =>
          firestore.collection('campaigns').doc(id)
        );
        const campaignDocs = await firestore.getAll(...campaignRefs);
        const now = Date.now();
        for (const doc of campaignDocs) {
          if (doc.exists) {
            const data = doc.data() as Record<string, any>;
            campaignDataMap.set(doc.id, data);
            campaignCache.set(doc.id, { data, timestamp: now });
          }
        }
      }

      // Step 4: Collect unique brand IDs, separate cached vs uncached
      const brandDataMap = new Map<string, { name: string; logo: string | null }>();
      const uncachedBrandIds: string[] = [];

      for (const [, cData] of campaignDataMap) {
        const bid = cData.brandId;
        if (!bid || brandDataMap.has(bid)) continue;
        const cached = getCachedBrand(bid);
        if (cached) {
          brandDataMap.set(bid, cached);
        } else {
          uncachedBrandIds.push(bid);
        }
      }

      // Step 5: Batch-fetch uncached brands using getAll() (1 round-trip instead of N)
      if (uncachedBrandIds.length > 0) {
        const brandRefs = uncachedBrandIds.map((id) =>
          firestore.collection('users').doc(id)
        );
        const brandDocs = await firestore.getAll(...brandRefs);
        const now = Date.now();
        for (const doc of brandDocs) {
          if (doc.exists) {
            const d = doc.data();
            const brand = {
              name: d?.displayName || d?.email || 'Unknown Brand',
              logo: d?.photoURL || null,
            };
            brandDataMap.set(doc.id, brand);
            brandCache.set(doc.id, { ...brand, timestamp: now });
          }
        }
      }

      // Step 6: Build application objects (no more per-doc fetches)
      const applications: any[] = [];

      for (const doc of filteredDocs) {
        const appData = doc.data();
        const cData = campaignDataMap.get(appData.campaignId);
        if (!cData) continue;

        const brandInfo = brandDataMap.get(cData.brandId) || {
          name: 'Unknown Brand',
          logo: null,
        };

        const budget = cData.budget || {};
        const rawDeliverables = cData.tasks?.requiredDeliverables || [];
        const deliverables = rawDeliverables.map((d: any) => ({
          platform: d.platform || 'instagram',
          contentType: d.contentType || d.type || 'post',
          quantity: d.quantity || 1,
        }));

        const platforms: string[] = [];
        for (const d of rawDeliverables) {
          if (d.platform && !platforms.includes(d.platform)) {
            platforms.push(d.platform);
          }
        }

        const productImageUrl = cData.campaignProduct?.productImagesUrls?.[0] || '';

        const campaignData = {
          id: appData.campaignId,
          title: cData.campaignTitle || cData.title || '',
          description: cData.description || '',
          categories: cData.campaignCategories || [],
          campaignObjectives: cData.campaignObjectives || [],
          brandName: brandInfo.name,
          brandLogo: brandInfo.logo,
          budget: {
            compensationModel: budget.compensationModel || 'fixed',
            currency: budget.currency || 'ZAR',
            fixedAmount: budget.fixedAmount || 0,
            minRangeAmount: budget.minRangeAmount || 0,
            maxRangeAmount: budget.maxRangeAmount || 0,
            applicationDeadline: toISO(budget.applicationDeadline),
          },
          timeline: {
            campaignStart: toISO(cData.campaignStart),
            campaignEnd: toISO(cData.campaignEnd),
          },
          status: cData.status,
          deliverables,
          platforms,
          productImageUrl,
        };

        const appliedAtDate = appData.appliedAt?.toDate?.() || new Date(appData.appliedAt);
        const reviewedAtDate = appData.reviewedAt?.toDate?.() || (appData.reviewedAt ? new Date(appData.reviewedAt) : null);

        applications.push({
          id: doc.id,
          status: appData.status,
          appliedAt: appliedAtDate.toISOString(),
          reviewedAt: reviewedAtDate ? reviewedAtDate.toISOString() : null,
          reviewNotes: appData.reviewNotes || null,
          rejectionReason: appData.rejectionReason || null,
          qualificationMet: appData.qualificationMet,
          pitchMessage: appData.pitchMessage,
          proposedRate: appData.proposedRate || null,
          campaign: campaignData,
        });
      }

      // Sort applications
      applications.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
          case 'status':
            const statusOrder = { pending: 0, accepted: 1, rejected: 2, withdrawn: 3 };
            return (statusOrder[a.status as keyof typeof statusOrder] || 99) -
                   (statusOrder[b.status as keyof typeof statusOrder] || 99);
          case 'latest':
          default:
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        }
      });

      // Calculate stats
      const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        withdrawn: applications.filter(a => a.status === 'withdrawn').length,
      };

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedApplications = applications.slice(startIndex, endIndex);

      const response = NextResponse.json({
        success: true,
        data: {
          applications: paginatedApplications,
          stats,
          pagination: {
            page,
            limit,
            total: applications.length,
            totalPages: Math.ceil(applications.length / limit),
          },
        },
      });

      response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');

      return response;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch applications',
        },
        { status: 500 }
      );
    }
  });
}
