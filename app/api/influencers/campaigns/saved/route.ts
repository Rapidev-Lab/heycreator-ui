/**
 * Saved Campaigns API
 *
 * GET  /api/influencers/campaigns/saved            — Fetch all saved campaign IDs
 * GET  /api/influencers/campaigns/saved?expand=true — Fetch saved IDs + full campaign data
 * POST /api/influencers/campaigns/saved             — Toggle save/unsave a campaign (body: { campaignId })
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

const COLLECTION = 'saved_campaigns';

/** Convert Firestore Timestamps to ISO strings */
function toISO(val: any): string | null {
  if (!val) return null;
  if (val.toDate) return val.toDate().toISOString();
  if (val instanceof Date) return val.toISOString();
  return val;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const userId = auth.uid;
  const { searchParams } = new URL(request.url);
  const expand = searchParams.get('expand') === 'true';

  try {
    const snapshot = await firestore
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get();

    const savedCampaignIds = snapshot.docs.map((doc) => doc.data().campaignId as string);

    if (!expand || savedCampaignIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { savedCampaignIds },
      });
    }

    // Batch-fetch campaign docs (Firestore `in` limit = 30)
    const campaignDocs: any[] = [];
    for (let i = 0; i < savedCampaignIds.length; i += 30) {
      const chunk = savedCampaignIds.slice(i, i + 30);
      const refs = chunk.map((id) => firestore.collection('campaigns').doc(id));
      const docs = await firestore.getAll(...refs);
      for (const doc of docs) {
        if (doc.exists) {
          campaignDocs.push({ id: doc.id, data: doc.data() as Record<string, any> });
        }
      }
    }

    // Collect unique brand IDs and batch-fetch brand info
    const brandIdSet = new Set<string>();
    for (const { data } of campaignDocs) {
      if (data.brandId) brandIdSet.add(data.brandId);
    }

    const brandMap = new Map<string, { name: string; logo: string | null; verified: boolean }>();
    if (brandIdSet.size > 0) {
      const brandRefs = Array.from(brandIdSet).map((id) => firestore.collection('users').doc(id));
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

    // Build the same shape as the marketplace API response
    const campaigns = campaignDocs.map(({ id, data }) => {
      const rawBudget = data.budget || {};
      const deadlineISO = toISO(rawBudget.applicationDeadline);
      const brandInfo = brandMap.get(data.brandId) || { name: 'Unknown Brand', logo: null, verified: false };

      return {
        id,
        title: data.campaignTitle,
        description: data.description,
        productCategory: data.campaignCategories?.[0] || data.campaignProduct?.productType || '',
        budget: {
          ...rawBudget,
          applicationDeadline: deadlineISO,
          contentCreationDate: toISO(rawBudget.contentCreationDate),
          contentCreationStart: toISO(rawBudget.contentCreationStart),
          contentCreationEnd: toISO(rawBudget.contentCreationEnd),
        },
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
        createdAt: toISO(data.createdAt),
        product: data.campaignProduct || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { savedCampaignIds, campaigns },
    });
  } catch (error) {
    console.error('Error fetching saved campaigns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved campaigns' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const userId = auth.uid;

  let body: { campaignId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }

  const { campaignId } = body;
  if (!campaignId) {
    return NextResponse.json(
      { success: false, error: 'campaignId is required' },
      { status: 400 },
    );
  }

  try {
    // Check if already saved
    const existing = await firestore
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('campaignId', '==', campaignId)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Unsave — delete the document
      await existing.docs[0].ref.delete();
      return NextResponse.json({
        success: true,
        data: { saved: false, campaignId },
      });
    }

    // Save — create new document
    await firestore.collection(COLLECTION).add({
      userId,
      campaignId,
      savedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { saved: true, campaignId },
    });
  } catch (error) {
    console.error('Error toggling saved campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save campaign' },
      { status: 500 },
    );
  }
}
