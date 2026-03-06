/**
 * Deliverables API Routes
 *
 * GET  /api/deliverables - Get deliverables for user (role-based)
 * POST /api/deliverables - Submit a new deliverable (creator only)
 */

import { NextRequest } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import {
  requireAuth,
  requireCreatorRole,
  createErrorResponse,
  createSuccessResponse,
  validateRequiredFields,
} from '@/lib/middleware/campaign-auth';
import {
  submitDeliverable,
  getApplicationDeliverables,
  getCampaignDeliverables,
  getApplicationById,
  getCampaignById,
  convertTimestamps,
  addDeliverableSubmissionToCampaign,
} from '@/lib/firebase/campaigns';
import { SubmitDeliverableRequest, DeliverableStatus, PaymentStatus } from '@/types/campaign';
import { notifyUser } from '@/lib/services/notification.service';

/**
 * GET /api/deliverables
 *
 * Get deliverables based on user role:
 * - Brands: Get deliverables for their campaigns
 * - Creators: Get their own deliverables
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const applicationId = searchParams.get('applicationId');

    let deliverables: any[] = [];

    if (campaignId) {
      // Get deliverables for specific campaign
      const campaign = await getCampaignById(campaignId);
      if (!campaign) {
        return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
      }

      // Check permissions
      if (auth.role === 'brand' && campaign.brandId !== auth.userId) {
        return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
      }

      deliverables = await getCampaignDeliverables(campaignId);

      // Enrich deliverables with creator info from applications
      const uniqueAppIds = [...new Set(deliverables.map((d: any) => d.applicationId).filter(Boolean))];
      const appMap: Record<string, any> = {};
      for (const appId of uniqueAppIds) {
        try {
          const app = await getApplicationById(appId);
          if (app) appMap[appId] = app;
        } catch {
          // skip if application fetch fails
        }
      }

      // Fetch actual user names for creators whose displayName is an email
      const creatorIds = [...new Set(Object.values(appMap).map((a: any) => a.influencerId || a.creatorId).filter(Boolean))];
      const userNameMap: Record<string, { name: string; avatar: string | null }> = {};
      for (let i = 0; i < creatorIds.length; i += 30) {
        const chunk = creatorIds.slice(i, i + 30);
        if (chunk.length === 0) continue;
        try {
          const usersSnap = await firestore.collection('users').where('__name__', 'in', chunk).get();
          usersSnap.docs.forEach((doc) => {
            const u = doc.data();
            userNameMap[doc.id] = {
              name: u.displayName || u.fullName || '',
              avatar: u.photoURL || null,
            };
          });
        } catch { /* skip */ }
      }

      deliverables = deliverables.map((d: any) => {
        const app = appMap[d.applicationId];
        const creatorId = app?.influencerId || app?.creatorId;
        const userData = creatorId ? userNameMap[creatorId] : null;
        let creatorName = app?.influencerData?.displayName || app?.influencerData?.name || 'Creator';
        // If displayName looks like an email, use the user's actual name
        if (creatorName.includes('@') && userData?.name) {
          creatorName = userData.name;
        }
        const creatorAvatar = app?.influencerData?.profileImage || app?.influencerData?.photoURL || userData?.avatar || null;
        return { ...d, creatorName, creatorAvatar };
      });
    } else if (applicationId) {
      // Get deliverables for specific application
      const application = await getApplicationById(applicationId);
      if (!application) {
        return createErrorResponse('Application not found', 404, 'NOT_FOUND');
      }

      // Check permissions (Firestore stores 'influencerId', type uses 'creatorId')
      const ownerId = application.creatorId || (application as any).influencerId;
      if (auth.role === 'influencer' && ownerId !== auth.userId) {
        return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
      }

      deliverables = await getApplicationDeliverables(applicationId);
    } else {
      return createErrorResponse('campaignId or applicationId is required', 400, 'MISSING_PARAM');
    }

    return createSuccessResponse({
      deliverables: deliverables.map(convertTimestamps),
      count: deliverables.length,
    });
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    return createErrorResponse('Failed to fetch deliverables', 500);
  }
}

/**
 * POST /api/deliverables
 *
 * Submit a new deliverable (creator only)
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireCreatorRole(request);
    if (auth instanceof Response) return auth;

    const body: Omit<SubmitDeliverableRequest, 'contentScreenshots'> & {
      contentScreenshots?: string[];
      isDraft?: boolean;
    } = await request.json();

    const isDraft = body.isDraft === true;

    // Validate required fields (contentUrl optional for drafts)
    const requiredFields: (keyof typeof body)[] = isDraft
      ? ['applicationId', 'deliverableType', 'platform']
      : ['applicationId', 'deliverableType', 'platform', 'contentUrl'];

    const validation = validateRequiredFields(body, requiredFields);

    if (!validation.valid) {
      return createErrorResponse(
        `Missing required fields: ${validation.missing?.join(', ')}`,
        400,
        'MISSING_FIELDS'
      );
    }

    // Get application to verify ownership and get campaign details
    const application = await getApplicationById(body.applicationId);
    if (!application) {
      return createErrorResponse('Application not found', 404, 'NOT_FOUND');
    }

    // Check ownership (Firestore stores 'influencerId', type uses 'creatorId')
    const appCreatorId = application.creatorId || (application as any).influencerId;
    if (appCreatorId !== auth.userId) {
      return createErrorResponse(
        'You can only submit deliverables for your own applications',
        403,
        'FORBIDDEN'
      );
    }

    // Check application is accepted
    if (application.status !== 'accepted') {
      return createErrorResponse(
        'Can only submit deliverables for accepted applications',
        400,
        'INVALID_STATUS'
      );
    }

    // Get campaign
    const campaign = await getCampaignById(application.campaignId);
    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Validate content URL (skip for drafts without URL)
    if (body.contentUrl && !body.contentUrl.startsWith('http')) {
      return createErrorResponse('Content URL must be a valid HTTP(S) URL', 400, 'INVALID_URL');
    }

    // Create deliverable
    const deliverableId = await submitDeliverable({
      brandId: campaign.brandId,
      campaignId: application.campaignId,
      applicationId: body.applicationId,
      creatorId: auth.userId,
      deliverableType: body.deliverableType,
      platform: body.platform,
      contentUrl: body.contentUrl || '',
      contentScreenshots: body.contentScreenshots || [],
      caption: body.caption,
      hashtags: body.hashtags,
      status: isDraft ? DeliverableStatus.PENDING : DeliverableStatus.SUBMITTED,
      paymentStatus: PaymentStatus.PENDING,
    });

    // Add deliverable ID to campaign's deliverableSubmissions array for quick lookup
    await addDeliverableSubmissionToCampaign(application.campaignId, deliverableId);

    // Notify the brand when a creator submits (not drafts)
    if (!isDraft && campaign.brandId) {
      const creatorName = (application as any)?.influencerData?.displayName || auth.name || 'A creator';
      const campaignTitle = campaign.campaignTitle || 'your campaign';

      notifyUser({
        userId: campaign.brandId,
        type: 'deliverable_submitted',
        title: 'New Deliverable Submitted',
        message: `${creatorName} submitted content for "${campaignTitle}" — ready for review.`,
        campaignId: application.campaignId,
        applicationId: body.applicationId,
        deliverableId,
        actionUrl: `/brands/campaigns/${application.campaignId}/dashboard?tab=content`,
      }).catch((err) => console.error('Failed to send deliverable notification:', err));
    }

    return createSuccessResponse(
      {
        deliverableId,
        message: isDraft
          ? 'Draft saved successfully.'
          : 'Deliverable submitted successfully! The brand will review it soon.',
      },
      201
    );
  } catch (error) {
    console.error('Error submitting deliverable:', error);
    return createErrorResponse('Failed to submit deliverable', 500);
  }
}
