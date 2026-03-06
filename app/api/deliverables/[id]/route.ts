/**
 * Individual Deliverable API Routes
 *
 * GET    /api/deliverables/[id] - Get deliverable details
 * PUT    /api/deliverables/[id] - Update own deliverable (creator only)
 * DELETE /api/deliverables/[id] - Delete own deliverable (creator only)
 * PATCH  /api/deliverables/[id] - Review deliverable (brand only)
 */

import { NextRequest } from 'next/server';
import {
  requireAuth,
  requireBrandRole,
  requireCreatorRole,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware/campaign-auth';
import {
  getDeliverableById,
  getCampaignById,
  getApplicationById,
  approveDeliverable,
  requestDeliverableRevision,
  updateDeliverable,
  convertTimestamps,
} from '@/lib/firebase/campaigns';
import { getAdminDb } from '@/lib/firebase/admin';
import { DeliverableStatus } from '@/types/campaign';
import { notifyUser } from '@/lib/services/notification.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/deliverables/[id]
 *
 * Get deliverable details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const deliverable = await getDeliverableById(id);
    if (!deliverable) {
      return createErrorResponse('Deliverable not found', 404, 'NOT_FOUND');
    }

    // Get campaign to check permissions
    const campaign = await getCampaignById(deliverable.campaignId);
    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Check permissions
    if (auth.role === 'brand') {
      if (campaign.brandId !== auth.userId) {
        return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
      }
    } else {
      if (deliverable.creatorId !== auth.userId) {
        return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
      }
    }

    return createSuccessResponse({
      deliverable: convertTimestamps(deliverable),
      campaign: {
        id: campaign.id,
        title: campaign.campaignTitle,
      },
    });
  } catch (error) {
    console.error('Error fetching deliverable:', error);
    return createErrorResponse('Failed to fetch deliverable', 500);
  }
}

/**
 * PATCH /api/deliverables/[id]
 *
 * Update deliverable status (brand only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const auth = await requireBrandRole(request);
    if (auth instanceof Response) return auth;

    const deliverable = await getDeliverableById(id);
    if (!deliverable) {
      return createErrorResponse('Deliverable not found', 404, 'NOT_FOUND');
    }

    // Get campaign to check permissions
    const campaign = await getCampaignById(deliverable.campaignId);
    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Check ownership
    if (campaign.brandId !== auth.userId) {
      return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
    }

    const body = await request.json();
    const { action, brandFeedback, revisionNotes } = body;

    if (!action) {
      return createErrorResponse('Action is required', 400, 'MISSING_ACTION');
    }

    const campaignTitle = campaign.campaignTitle || 'your campaign';

    switch (action) {
      case 'approve':
        await approveDeliverable(id);
        notifyUser({
          userId: deliverable.creatorId,
          type: 'deliverable_reviewed',
          title: 'Deliverable Approved',
          message: `Your content for "${campaignTitle}" has been approved!`,
          campaignId: deliverable.campaignId,
          deliverableId: id,
          actionUrl: `/influencers/campaigns/${deliverable.campaignId}`,
        }).catch((err) => console.error('Failed to send notification:', err));
        return createSuccessResponse({
          message: 'Deliverable approved successfully',
        });

      case 'request_revision':
        if (!revisionNotes) {
          return createErrorResponse(
            'Revision notes are required',
            400,
            'MISSING_REVISION_NOTES'
          );
        }
        await requestDeliverableRevision(id, revisionNotes);
        notifyUser({
          userId: deliverable.creatorId,
          type: 'deliverable_reviewed',
          title: 'Revision Requested',
          message: `A revision was requested for your content on "${campaignTitle}".`,
          campaignId: deliverable.campaignId,
          deliverableId: id,
          actionUrl: `/influencers/campaigns/${deliverable.campaignId}`,
        }).catch((err) => console.error('Failed to send notification:', err));
        return createSuccessResponse({
          message: 'Revision requested successfully',
        });

      case 'reject':
        await updateDeliverable(id, {
          status: DeliverableStatus.REJECTED,
          brandFeedback,
        });
        notifyUser({
          userId: deliverable.creatorId,
          type: 'deliverable_reviewed',
          title: 'Deliverable Rejected',
          message: `Your content for "${campaignTitle}" was not approved.`,
          campaignId: deliverable.campaignId,
          deliverableId: id,
          actionUrl: `/influencers/campaigns/${deliverable.campaignId}`,
        }).catch((err) => console.error('Failed to send notification:', err));
        return createSuccessResponse({
          message: 'Deliverable rejected',
        });

      case 'update_feedback':
        await updateDeliverable(id, {
          brandFeedback,
        });
        return createSuccessResponse({
          message: 'Feedback updated successfully',
        });

      default:
        return createErrorResponse('Invalid action', 400, 'INVALID_ACTION');
    }
  } catch (error) {
    console.error('Error updating deliverable:', error);
    return createErrorResponse('Failed to update deliverable', 500);
  }
}

/**
 * PUT /api/deliverables/[id]
 *
 * Update own deliverable content (creator only)
 * Allowed when status is pending, submitted, or revision_requested
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const auth = await requireCreatorRole(request);
    if (auth instanceof Response) return auth;

    const deliverable = await getDeliverableById(id);
    if (!deliverable) {
      return createErrorResponse('Deliverable not found', 404, 'NOT_FOUND');
    }

    if (deliverable.creatorId !== auth.userId) {
      return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
    }

    const body = await request.json();

    // === Handle Live Link Submission (approved → completed) ===
    if (body.action === 'submit_live_link') {
      if (deliverable.status !== DeliverableStatus.APPROVED) {
        return createErrorResponse(
          'Can only submit live link for approved deliverables',
          400,
          'INVALID_STATUS'
        );
      }

      const { liveUrl } = body;
      if (!liveUrl || typeof liveUrl !== 'string' || !liveUrl.trim()) {
        return createErrorResponse('Live URL is required', 400, 'MISSING_LIVE_URL');
      }

      try {
        new URL(liveUrl.trim());
      } catch {
        return createErrorResponse('Invalid URL format', 400, 'INVALID_URL');
      }

      await updateDeliverable(id, {
        liveUrl: liveUrl.trim(),
        status: DeliverableStatus.COMPLETED,
        completedAt: new Date(),
      });

      // Notify the brand
      const campaign = await getCampaignById(deliverable.campaignId);
      if (campaign?.brandId) {
        const application = await getApplicationById(deliverable.applicationId);
        const creatorName = (application as any)?.influencerData?.displayName || auth.name || 'A creator';
        const campaignTitle = campaign.campaignTitle || 'your campaign';

        notifyUser({
          userId: campaign.brandId,
          type: 'deliverable_reviewed',
          title: 'Live Link Submitted',
          message: `${creatorName} has published content for "${campaignTitle}" and submitted the live link.`,
          campaignId: deliverable.campaignId,
          applicationId: deliverable.applicationId,
          deliverableId: id,
          actionUrl: `/brands/campaigns/${deliverable.campaignId}/dashboard?tab=content`,
        }).catch((err) => console.error('Failed to send notification:', err));
      }

      return createSuccessResponse({ message: 'Live link submitted successfully' });
    }

    // === Regular edit flow ===
    const editableStatuses = [
      DeliverableStatus.PENDING,
      DeliverableStatus.SUBMITTED,
      DeliverableStatus.REVISION_REQUESTED,
    ];

    if (!editableStatuses.includes(deliverable.status as DeliverableStatus)) {
      return createErrorResponse(
        'Cannot edit deliverable in its current status',
        400,
        'INVALID_STATUS'
      );
    }
    const updates: Record<string, any> = {};

    if (body.platform !== undefined) updates.platform = body.platform;
    if (body.deliverableType !== undefined) updates.deliverableType = body.deliverableType;
    if (body.contentUrl !== undefined) updates.contentUrl = body.contentUrl;
    if (body.caption !== undefined) updates.caption = body.caption;
    if (body.hashtags !== undefined) updates.hashtags = body.hashtags;
    if (body.contentScreenshots !== undefined) updates.contentScreenshots = body.contentScreenshots;

    // If resubmitting after revision, set status back to submitted
    const isResubmit = body.resubmit && deliverable.status === DeliverableStatus.REVISION_REQUESTED;
    if (isResubmit) {
      updates.status = DeliverableStatus.SUBMITTED;
    }

    await updateDeliverable(id, updates);

    // Notify brand when creator resubmits after revision
    if (isResubmit) {
      const campaign = await getCampaignById(deliverable.campaignId);
      if (campaign?.brandId) {
        const application = await getApplicationById(deliverable.applicationId);
        const creatorName = (application as any)?.influencerData?.displayName || auth.name || 'A creator';
        const campaignTitle = campaign.campaignTitle || 'your campaign';

        notifyUser({
          userId: campaign.brandId,
          type: 'deliverable_submitted',
          title: 'Revised Content Submitted',
          message: `${creatorName} resubmitted updated content for "${campaignTitle}" — ready for review.`,
          campaignId: deliverable.campaignId,
          applicationId: deliverable.applicationId,
          deliverableId: id,
          actionUrl: `/brands/campaigns/${deliverable.campaignId}/dashboard?tab=content`,
        }).catch((err) => console.error('Failed to send notification:', err));
      }
    }

    return createSuccessResponse({ message: 'Deliverable updated successfully' });
  } catch (error) {
    console.error('Error updating deliverable:', error);
    return createErrorResponse('Failed to update deliverable', 500);
  }
}

/**
 * DELETE /api/deliverables/[id]
 *
 * Delete own deliverable (creator only)
 * Only allowed when status is pending or submitted
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const auth = await requireCreatorRole(request);
    if (auth instanceof Response) return auth;

    const deliverable = await getDeliverableById(id);
    if (!deliverable) {
      return createErrorResponse('Deliverable not found', 404, 'NOT_FOUND');
    }

    if (deliverable.creatorId !== auth.userId) {
      return createErrorResponse('Permission denied', 403, 'FORBIDDEN');
    }

    const deletableStatuses = [
      DeliverableStatus.PENDING,
      DeliverableStatus.SUBMITTED,
    ];

    if (!deletableStatuses.includes(deliverable.status as DeliverableStatus)) {
      return createErrorResponse(
        'Cannot delete deliverable in its current status',
        400,
        'INVALID_STATUS'
      );
    }

    const db = getAdminDb();
    await db.collection('deliverable_submissions').doc(id).delete();

    return createSuccessResponse({ message: 'Deliverable deleted successfully' });
  } catch (error) {
    console.error('Error deleting deliverable:', error);
    return createErrorResponse('Failed to delete deliverable', 500);
  }
}
