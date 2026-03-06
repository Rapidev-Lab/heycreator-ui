/**
 * Pending Actions API
 *
 * GET /api/brands/actions
 *
 * Fetches all pending actions for a brand:
 * - Content Approvals (deliverables with status: SUBMITTED)
 * - New Applications (applications with status: PENDING)
 * - Payments Due (deliverables with status: APPROVED + paymentStatus: PENDING)
 *
 * Query params:
 * - type: 'all' | 'content' | 'applications' | 'payments'
 * - campaignId: filter by specific campaign
 * - limit: number of items to return (default: 50)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { ApplicationStatus, DeliverableStatus, PaymentStatus } from '@/types/campaign';

export const dynamic = 'force-dynamic';

type ActionType = 'content' | 'applications' | 'payments';

interface PendingAction {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: string;
  amount?: number; // For payments
  deliverableId?: string; // For content approvals and payments
  applicationId?: string; // For applications
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Verify user is a brand
    const db = getAdminDb();
    let userRole = auth.role;
    if (!userRole) {
      const userDoc = await db.collection('users').doc(auth.userId).get();
      userRole = userDoc.data()?.role;
    }

    if (userRole !== 'brand') {
      return NextResponse.json(
        { success: false, error: 'Only brands can access pending actions' },
        { status: 403 }
      );
    }

    const brandId = auth.userId;

    // Parse query params
    const typeFilter = request.nextUrl.searchParams.get('type') || 'all';
    const campaignIdFilter = request.nextUrl.searchParams.get('campaignId');
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10), 100);

    // Fetch brand's campaigns
    let campaignsQuery = db.collection('campaigns').where('brandId', '==', brandId);
    const campaignsSnapshot = await campaignsQuery.get();

    const campaignMap: Record<string, string> = {};
    let campaignIds: string[] = [];

    campaignsSnapshot.docs.forEach(doc => {
      campaignMap[doc.id] = doc.data().campaignTitle || 'Untitled Campaign';
      campaignIds.push(doc.id);
    });

    // Filter by specific campaign if provided
    if (campaignIdFilter) {
      campaignIds = campaignIds.filter(id => id === campaignIdFilter);
    }

    if (campaignIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          actions: [],
          counts: { content: 0, applications: 0, payments: 0, total: 0 }
        }
      });
    }

    const actions: PendingAction[] = [];
    const batchSize = 10;

    // Helper to get creator info
    const getCreatorInfo = async (creatorId: string) => {
      try {
        const userDoc = await db.collection('users').doc(creatorId).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          return {
            name: data?.displayName || data?.email?.split('@')[0] || 'Creator',
            avatar: data?.photoURL || ''
          };
        }
      } catch (e) {
        console.error('Error fetching creator:', e);
      }
      return { name: 'Creator', avatar: '' };
    };

    // Cache for creator info
    const creatorCache: Record<string, { name: string; avatar: string }> = {};

    // Fetch Content Approvals (deliverables with status: SUBMITTED)
    if (typeFilter === 'all' || typeFilter === 'content') {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const snapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('status', '==', DeliverableStatus.SUBMITTED)
          .orderBy('submittedAt', 'desc')
          .limit(limit)
          .get();

        for (const doc of snapshot.docs) {
          const data = doc.data();
          const creatorId = data.influencerId || data.creatorId || '';

          if (!creatorCache[creatorId]) {
            creatorCache[creatorId] = await getCreatorInfo(creatorId);
          }

          const submittedAt = data.submittedAt?.toDate
            ? data.submittedAt.toDate()
            : new Date(data.submittedAt || Date.now());

          actions.push({
            id: doc.id,
            type: 'content',
            title: 'Content Approval',
            description: data.title || data.type || 'Content submission awaiting review',
            campaignId: data.campaignId,
            campaignTitle: campaignMap[data.campaignId] || 'Unknown Campaign',
            creatorId,
            creatorName: creatorCache[creatorId].name,
            creatorAvatar: creatorCache[creatorId].avatar,
            createdAt: submittedAt.toISOString(),
            deliverableId: doc.id
          });
        }
      }
    }

    // Fetch New Applications (status: PENDING)
    if (typeFilter === 'all' || typeFilter === 'applications') {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const snapshot = await db
          .collection('campaign_applications')
          .where('campaignId', 'in', batch)
          .where('status', '==', ApplicationStatus.PENDING)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();

        for (const doc of snapshot.docs) {
          const data = doc.data();
          const creatorId = data.influencerId || data.creatorId || '';

          if (!creatorCache[creatorId]) {
            creatorCache[creatorId] = await getCreatorInfo(creatorId);
          }

          const createdAt = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt || Date.now());

          actions.push({
            id: doc.id,
            type: 'applications',
            title: 'New Application',
            description: data.pitchMessage || 'Creator applied to your campaign',
            campaignId: data.campaignId,
            campaignTitle: campaignMap[data.campaignId] || 'Unknown Campaign',
            creatorId,
            creatorName: creatorCache[creatorId].name,
            creatorAvatar: creatorCache[creatorId].avatar,
            createdAt: createdAt.toISOString(),
            applicationId: doc.id,
            amount: data.proposedRate
          });
        }
      }
    }

    // Fetch Payments Due (deliverables: APPROVED + paymentStatus: PENDING)
    if (typeFilter === 'all' || typeFilter === 'payments') {
      for (let i = 0; i < campaignIds.length; i += batchSize) {
        const batch = campaignIds.slice(i, i + batchSize);

        const snapshot = await db
          .collection('deliverables')
          .where('campaignId', 'in', batch)
          .where('status', '==', DeliverableStatus.APPROVED)
          .where('paymentStatus', '==', PaymentStatus.PENDING)
          .orderBy('approvedAt', 'desc')
          .limit(limit)
          .get();

        for (const doc of snapshot.docs) {
          const data = doc.data();
          const creatorId = data.influencerId || data.creatorId || '';

          if (!creatorCache[creatorId]) {
            creatorCache[creatorId] = await getCreatorInfo(creatorId);
          }

          const approvedAt = data.approvedAt?.toDate
            ? data.approvedAt.toDate()
            : new Date(data.approvedAt || Date.now());

          actions.push({
            id: doc.id,
            type: 'payments',
            title: 'Payment Due',
            description: data.title || 'Approved content awaiting payment',
            campaignId: data.campaignId,
            campaignTitle: campaignMap[data.campaignId] || 'Unknown Campaign',
            creatorId,
            creatorName: creatorCache[creatorId].name,
            creatorAvatar: creatorCache[creatorId].avatar,
            createdAt: approvedAt.toISOString(),
            deliverableId: doc.id,
            amount: data.paymentAmount
          });
        }
      }
    }

    // Sort all actions by date (newest first)
    actions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate counts
    const counts = {
      content: actions.filter(a => a.type === 'content').length,
      applications: actions.filter(a => a.type === 'applications').length,
      payments: actions.filter(a => a.type === 'payments').length,
      total: actions.length
    };

    return NextResponse.json({
      success: true,
      data: {
        actions: actions.slice(0, limit),
        counts
      }
    });

  } catch (error: any) {
    console.error('[PENDING-ACTIONS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending actions',
        details: error.message
      },
      { status: 500 }
    );
  }
}
