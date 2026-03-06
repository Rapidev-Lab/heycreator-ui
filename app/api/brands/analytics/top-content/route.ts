/**
 * Brand Analytics Top Content API Route
 *
 * GET /api/brands/analytics/top-content - Get approved deliverables for brand's campaigns
 */

import { NextRequest } from 'next/server';
import {
  requireBrandRole,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware/campaign-auth';
import {
  getApplicationById,
  getCampaignById,
} from '@/lib/firebase/campaigns';
import { getAdminDb } from '@/lib/firebase/admin';
import { DeliverableStatus } from '@/types/campaign';

const COLLECTIONS = {
  CAMPAIGNS: 'campaigns',
  DELIVERABLES: 'deliverable_submissions',
};

/**
 * GET /api/brands/analytics/top-content
 *
 * Get approved/completed deliverables for a brand
 * Primary: Query by brandId (new deliverables have this field)
 * Fallback: Query by campaignId (for existing deliverables without brandId)
 * Returns content formatted for TopContentCard component
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireBrandRole(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const db = getAdminDb();
    const approvedStatuses = [DeliverableStatus.APPROVED, DeliverableStatus.COMPLETED];
    const allDeliverables: any[] = [];
    const seenIds = new Set<string>();


    // Step 1: Query deliverables directly by brandId
    // First, get ALL deliverables for this brand to debug
    const allBrandDeliverablesSnapshot = await db
      .collection(COLLECTIONS.DELIVERABLES)
      .where('brandId', '==', auth.userId)
      .get();


    allBrandDeliverablesSnapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Check if status matches approved statuses
      if (approvedStatuses.includes(data.status)) {
        seenIds.add(doc.id);
        allDeliverables.push({ id: doc.id, ...data });
      }
    });

    // Step 2: Fallback - Query by campaignId for existing deliverables without brandId
    if (allDeliverables.length < limit) {
      const campaignsSnapshot = await db
        .collection(COLLECTIONS.CAMPAIGNS)
        .where('brandId', '==', auth.userId)
        .where('deletedAt', '==', null)
        .get();

      if (!campaignsSnapshot.empty) {
        const campaignIds = campaignsSnapshot.docs.map((doc) => doc.id);

        for (let i = 0; i < campaignIds.length; i += 30) {
          const chunk = campaignIds.slice(i, i + 30);
          const deliverablesSnapshot = await db
            .collection(COLLECTIONS.DELIVERABLES)
            .where('campaignId', 'in', chunk)
            .where('status', 'in', approvedStatuses)
            .get();

          deliverablesSnapshot.docs.forEach((doc) => {
            if (!seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              allDeliverables.push({ id: doc.id, ...doc.data() });
            }
          });
        }
      }
    }


    if (allDeliverables.length === 0) {
      return createSuccessResponse({
        content: [],
        count: 0,
      });
    }

    // Build campaign map for enrichment
    const uniqueCampaignIds = [...new Set(allDeliverables.map((d) => d.campaignId).filter(Boolean))];
    const campaignMap: Record<string, any> = {};
    for (const campaignId of uniqueCampaignIds) {
      const campaign = await getCampaignById(campaignId);
      if (campaign) {
        campaignMap[campaignId] = campaign;
      }
    }

    // Sort by submittedAt descending and limit
    allDeliverables.sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(a.submittedAt || 0);
      const dateB = b.submittedAt?.toDate?.() || new Date(b.submittedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    const limitedDeliverables = allDeliverables.slice(0, limit);

    // Step 3: Enrich deliverables with creator info from applications
    const uniqueAppIds = [
      ...new Set(limitedDeliverables.map((d) => d.applicationId).filter(Boolean)),
    ];
    const appMap: Record<string, any> = {};
    for (const appId of uniqueAppIds) {
      try {
        const app = await getApplicationById(appId);
        if (app) appMap[appId] = app;
      } catch {
        // Skip if application fetch fails
      }
    }

    // Step 4: Format for TopContentCard
    const topContent = limitedDeliverables.map((deliverable, index) => {
      const app = appMap[deliverable.applicationId];
      const campaign = campaignMap[deliverable.campaignId];
      const creatorName =
        app?.influencerData?.displayName ||
        app?.influencerData?.name ||
        'Creator';
      const creatorAvatar =
        app?.influencerData?.profileImage ||
        app?.influencerData?.photoURL ||
        null;

      // Determine content type based on deliverableType
      const contentType =
        deliverable.deliverableType?.toLowerCase().includes('video') ||
        deliverable.deliverableType?.toLowerCase().includes('reel') ||
        deliverable.deliverableType?.toLowerCase().includes('story')
          ? 'Video'
          : 'Post';

      // Get submission date for time display
      const submittedAt = deliverable.submittedAt?.toDate?.()
        ? deliverable.submittedAt.toDate()
        : deliverable.submittedAt
          ? new Date(deliverable.submittedAt)
          : new Date();

      return {
        id: deliverable.id,
        influencerName: creatorName,
        avatarUrl: creatorAvatar,
        platform: deliverable.platform || 'instagram',
        contentType,
        caption: deliverable.caption || campaign?.description || '',
        thumbnailUrl: deliverable.contentScreenshots?.[0] || null,
        contentUrl: deliverable.contentUrl || null,
        campaignTitle: campaign?.campaignTitle || 'Campaign',
        // Metrics (may not be available for all deliverables)
        reach: deliverable.metrics?.reach || 0,
        likes: deliverable.metrics?.likes || 0,
        comments: deliverable.metrics?.comments || 0,
        engagementRate: deliverable.metrics?.engagementRate || 0,
        submittedAt: submittedAt.toISOString(),
      };
    });

    return createSuccessResponse({
      content: topContent,
      count: topContent.length,
      total: allDeliverables.length,
    });
  } catch (error) {
    console.error('Error fetching top content:', error);
    return createErrorResponse('Failed to fetch top content', 500);
  }
}
