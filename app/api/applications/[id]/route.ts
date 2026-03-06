/**
 * Individual Application API Routes
 *
 * GET    /api/applications/[id]         - Get application details
 * PATCH  /api/applications/[id]         - Review application (brand) or withdraw (creator)
 * DELETE /api/applications/[id]         - Delete/withdraw application
 */

import { NextRequest } from 'next/server';
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware/campaign-auth';
import {
  getApplicationById,
  getCampaignById,
  reviewApplication,
  withdrawApplication,
  convertTimestamps,
} from '@/lib/firebase/campaigns';
import { ApplicationStatus, ReviewApplicationRequest } from '@/types/campaign';
import { Timestamp } from 'firebase/firestore';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/applications/[id]
 *
 * Get application details with campaign info
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Get application
    const application = await getApplicationById(id);

    if (!application) {
      return createErrorResponse('Application not found', 404, 'NOT_FOUND');
    }

    // Get campaign
    const campaign = await getCampaignById(application.campaignId);

    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Check permissions
    if (auth.role === 'brand') {
      // Brand can only view applications for their campaigns
      if (campaign.brandId !== auth.userId) {
        return createErrorResponse(
          'You do not have permission to view this application',
          403,
          'FORBIDDEN'
        );
      }
    } else {
      // Creator can only view their own applications
      if (application.creatorId !== auth.userId) {
        return createErrorResponse(
          'You do not have permission to view this application',
          403,
          'FORBIDDEN'
        );
      }
    }

    return createSuccessResponse({
      application: convertTimestamps(application),
      campaign: {
        id: campaign.id,
        title: campaign.campaignTitle,
        brandId: campaign.brandId,
        status: campaign.status,
        budget: campaign.budget,
        deliverables: campaign.tasks?.requiredDeliverables || [],
        timeline: {
          startDate: campaign.campaignStart,
          endDate: campaign.campaignEnd,
          applicationDeadline: campaign.budget?.applicationDeadline,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return createErrorResponse('Failed to fetch application', 500);
  }
}

/**
 * PATCH /api/applications/[id]
 *
 * Review application (brand only) or update application
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Get application
    const application = await getApplicationById(id);

    if (!application) {
      return createErrorResponse('Application not found', 404, 'NOT_FOUND');
    }

    // Get campaign
    const campaign = await getCampaignById(application.campaignId);

    if (!campaign) {
      return createErrorResponse('Campaign not found', 404, 'NOT_FOUND');
    }

    // Parse request body
    const body = await request.json();

    if (auth.role === 'brand') {
      // Brand: review application
      if (campaign.brandId !== auth.userId) {
        return createErrorResponse(
          'You do not have permission to review this application',
          403,
          'FORBIDDEN'
        );
      }

      // Validate review request
      const reviewData: ReviewApplicationRequest = body;

      if (!reviewData.status) {
        return createErrorResponse('Status is required', 400, 'MISSING_STATUS');
      }

      if (
        reviewData.status !== ApplicationStatus.ACCEPTED &&
        reviewData.status !== ApplicationStatus.REJECTED
      ) {
        return createErrorResponse(
          'Status must be either accepted or rejected',
          400,
          'INVALID_STATUS'
        );
      }

      // Check if application is pending
      if (application.status !== ApplicationStatus.PENDING) {
        return createErrorResponse(
          `Cannot review application with status: ${application.status}`,
          400,
          'INVALID_APPLICATION_STATUS'
        );
      }

      // If accepting, validate contract terms
      if (reviewData.status === ApplicationStatus.ACCEPTED) {
        if (!reviewData.contractTerms?.agreedPrice) {
          return createErrorResponse(
            'Agreed price is required when accepting application',
            400,
            'MISSING_CONTRACT_TERMS'
          );
        }

        if (!reviewData.contractTerms?.agreedDeliveryDate) {
          return createErrorResponse(
            'Agreed delivery date is required when accepting application',
            400,
            'MISSING_CONTRACT_TERMS'
          );
        }

        // Check budget availability (use fixedAmount or maxRangeAmount as budget limit)
        const agreedPriceCents = Math.round(reviewData.contractTerms.agreedPrice * 100);
        const budgetLimit = campaign.budget?.fixedAmount || campaign.budget?.maxRangeAmount || 0;
        if (budgetLimit > 0 && agreedPriceCents > budgetLimit * 100) {
          return createErrorResponse(
            'Agreed price exceeds campaign budget',
            400,
            'EXCEEDS_BUDGET'
          );
        }
      }

      // If rejecting, require reason
      if (reviewData.status === ApplicationStatus.REJECTED && !reviewData.rejectionReason) {
        return createErrorResponse(
          'Rejection reason is required when rejecting application',
          400,
          'MISSING_REJECTION_REASON'
        );
      }

      // Review application
      await reviewApplication(id, auth.userId, reviewData.status, {
        reviewNotes: reviewData.reviewNotes,
        rejectionReason: reviewData.rejectionReason,
        contractTerms: reviewData.contractTerms
          ? {
              agreedPrice: Math.round(reviewData.contractTerms.agreedPrice * 100),
              agreedDeliveryDate: Timestamp.fromDate(
                new Date(reviewData.contractTerms.agreedDeliveryDate)
              ),
              specialTerms: reviewData.contractTerms.specialTerms,
            }
          : undefined,
      });

      // Get updated application
      const updatedApplication = await getApplicationById(id);

      if (!updatedApplication) {
        return createErrorResponse('Application not found after update', 404, 'NOT_FOUND');
      }

      return createSuccessResponse({
        application: convertTimestamps(updatedApplication),
        message:
          reviewData.status === ApplicationStatus.ACCEPTED
            ? 'Application accepted! The creator will be notified.'
            : 'Application rejected.',
      });
    } else {
      // Creator: can only withdraw pending applications
      if (application.creatorId !== auth.userId) {
        return createErrorResponse(
          'You do not have permission to update this application',
          403,
          'FORBIDDEN'
        );
      }

      return createErrorResponse(
        'Creators can only withdraw applications using the DELETE method',
        400,
        'INVALID_OPERATION'
      );
    }
  } catch (error) {
    console.error('Error updating application:', error);
    return createErrorResponse('Failed to update application', 500);
  }
}

/**
 * DELETE /api/applications/[id]
 *
 * Withdraw application (creator only, pending applications only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // Get application
    const application = await getApplicationById(id);

    if (!application) {
      return createErrorResponse('Application not found', 404, 'NOT_FOUND');
    }

    // Only creators can withdraw
    if (auth.role !== 'influencer') {
      return createErrorResponse(
        'Only creators can withdraw applications',
        403,
        'FORBIDDEN'
      );
    }

    // Check ownership
    if (application.creatorId !== auth.userId) {
      return createErrorResponse(
        'You do not have permission to withdraw this application',
        403,
        'FORBIDDEN'
      );
    }

    // Can only withdraw pending applications
    if (application.status !== ApplicationStatus.PENDING) {
      return createErrorResponse(
        `Cannot withdraw application with status: ${application.status}`,
        400,
        'INVALID_APPLICATION_STATUS'
      );
    }

    // Withdraw application
    await withdrawApplication(id);

    return createSuccessResponse({
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return createErrorResponse('Failed to withdraw application', 500);
  }
}
