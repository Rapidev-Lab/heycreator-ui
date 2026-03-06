/**
 * Influencer Invitations API
 *
 * GET /api/influencers/invitations
 * Fetch all campaign invitations for the authenticated influencer
 *
 * Performance: Uses batch reads (getAll) instead of per-invitation campaign lookups.
 * Campaign data is cached server-side for 60s.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

// ── Server-side in-memory cache for campaign data ──
const CACHE_TTL_MS = 60_000; // 60 seconds

interface CampaignCacheEntry {
  data: Record<string, any>;
  timestamp: number;
}

const campaignCache = new Map<string, CampaignCacheEntry>();

function getCachedCampaign(id: string): Record<string, any> | null {
  const entry = campaignCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    campaignCache.delete(id);
    return null;
  }
  return entry.data;
}

/** Helper for Firestore Timestamps */
function toISO(val: any): string | null {
  if (!val) return null;
  if (val.toDate) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

export async function GET(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;

      const snapshot = await firestore
        .collection('campaign_invitations')
        .where('influencerId', '==', userId)
        .orderBy('invitedAt', 'desc')
        .get();

      if (snapshot.empty) {
        return NextResponse.json({ success: true, data: { invitations: [] } });
      }

      // Collect unique campaign IDs, separate cached vs uncached
      const campaignDataMap = new Map<string, Record<string, any>>();
      const uncachedIds: string[] = [];

      for (const doc of snapshot.docs) {
        const cid = doc.data().campaignId;
        if (!cid || campaignDataMap.has(cid)) continue;
        const cached = getCachedCampaign(cid);
        if (cached) {
          campaignDataMap.set(cid, cached);
        } else if (!uncachedIds.includes(cid)) {
          uncachedIds.push(cid);
        }
      }

      // Batch-fetch uncached campaigns in 1 round-trip
      if (uncachedIds.length > 0) {
        const refs = uncachedIds.map((id) => firestore.collection('campaigns').doc(id));
        const docs = await firestore.getAll(...refs);
        const now = Date.now();
        for (const doc of docs) {
          if (doc.exists) {
            const data = doc.data() as Record<string, any>;
            campaignDataMap.set(doc.id, data);
            campaignCache.set(doc.id, { data, timestamp: now });
          }
        }
      }

      // Batch-fetch brand info from users collection
      const brandIdSet = new Set<string>();
      for (const [, campaign] of campaignDataMap) {
        if (campaign.brandId) brandIdSet.add(campaign.brandId);
      }
      const brandMap = new Map<string, { name: string; logo: string }>();
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
              logo: d?.photoURL || '',
            });
          }
        }
      }

      // Build invitation objects; track unseen IDs for fire-and-forget mark
      const unseenIds: string[] = [];

      const invitations = snapshot.docs.map((doc) => {
        const data = doc.data();
        const campaign = campaignDataMap.get(data.campaignId);

        const applicationDeadline = campaign?.budget?.applicationDeadline;
        const campaignEnd = campaign?.campaignEnd;
        const dueDate = toISO(applicationDeadline) || toISO(campaignEnd) || null;

        // Serialize budget timestamps for JSON
        let budgetSerialized = campaign?.budget || null;
        if (budgetSerialized) {
          budgetSerialized = {
            ...budgetSerialized,
            applicationDeadline: toISO(budgetSerialized.applicationDeadline),
            contentCreationDate: toISO(budgetSerialized.contentCreationDate),
            contentCreationStart: toISO(budgetSerialized.contentCreationStart),
            contentCreationEnd: toISO(budgetSerialized.contentCreationEnd),
          };
        }

        // Derive deliverables from campaign tasks
        const rawDeliverables = campaign?.tasks?.requiredDeliverables || [];
        const deliverables = rawDeliverables.map((d: any) => ({
          platform: d.platform || '',
          contentType: d.type || d.contentType || '',
          quantity: d.quantity || 1,
          description: d.description || '',
        }));

        if (!data.seenAt) {
          unseenIds.push(doc.id);
        }

        return {
          id: doc.id,
          campaignId: data.campaignId,
          status: data.status,
          message: data.message,
          invitedAt: toISO(data.invitedAt) || new Date().toISOString(),
          seenAt: toISO(data.seenAt) || null,
          campaign: campaign ? {
            id: data.campaignId,
            title: campaign.campaignTitle || campaign.title,
            description: campaign.description,
            budget: budgetSerialized,
            brandName: (campaign.brandId && brandMap.get(campaign.brandId)?.name) || campaign.brandName || 'Unknown Brand',
            brandLogo: (campaign.brandId && brandMap.get(campaign.brandId)?.logo) || campaign.brandLogo || '',
            productImageUrl: campaign.campaignProduct?.productImagesUrls?.[0] || '',
            dueDate,
            categories: campaign.categories || [],
            platforms: campaign.platforms || [],
            deliverables,
          } : null,
        };
      });

      // Fire-and-forget: mark unseen invitations as seen
      if (unseenIds.length > 0) {
        const batch = firestore.batch();
        const now = new Date();
        for (const id of unseenIds) {
          batch.update(firestore.collection('campaign_invitations').doc(id), { seenAt: now });
        }
        batch.commit().catch((err) =>
          console.error('Failed to mark invitations as seen:', err)
        );
      }

      const response = NextResponse.json({ success: true, data: { invitations } });
      response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
      return response;
    } catch (error) {
      console.error('Fetch invitations error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
    }
  });
}
