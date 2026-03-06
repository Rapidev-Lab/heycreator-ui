/**
 * Applications API Routes
 *
 * GET /api/applications - Get all applications for authenticated user
 * - Brands: Get applications for their campaigns
 * - Creators: Get their own applications
 */

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import {
  requireAuth,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/middleware/campaign-auth';
import {
  getCreatorApplications,
  getBrandApplications,
  getBrandCampaigns,
  convertTimestamps,
} from '@/lib/firebase/campaigns';
import { ApplicationStatus } from '@/types/campaign';

/**
 * GET /api/applications
 *
 * Get applications based on user role:
 * - Brands: Get all applications across their campaigns
 * - Creators: Get their own applications
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status')?.split(',') as ApplicationStatus[] | undefined;

    if (auth.role === 'brand') {
      // Fetch applications and campaigns in parallel (2 queries instead of N+1)
      const [applications, campaigns] = await Promise.all([
        getBrandApplications(auth.userId, { status: statusFilter }),
        getBrandCampaigns(auth.userId),
      ]);

      // Build a campaign lookup map for O(1) access
      const campaignMap = new Map(
        campaigns.map((c) => [c.id, c])
      );

      // Attach campaign info to each application
      const applicationsWithCampaign = applications.map((app) => {
        const campaign = campaignMap.get(app.campaignId);
        return {
          ...convertTimestamps(app),
          campaign: campaign
            ? {
                id: campaign.id,
                title: campaign.campaignTitle,
                status: campaign.status,
              }
            : null,
        };
      });

      return createSuccessResponse({
        applications: applicationsWithCampaign,
        count: applicationsWithCampaign.length,
        stats: {
          total: applicationsWithCampaign.length,
          pending: applicationsWithCampaign.filter((a) => a.status === ApplicationStatus.PENDING).length,
          underReview: applicationsWithCampaign.filter((a) => a.status === ApplicationStatus.UNDER_REVIEW)
            .length,
          accepted: applicationsWithCampaign.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
          rejected: applicationsWithCampaign.filter((a) => a.status === ApplicationStatus.REJECTED).length,
        },
      });
    } else {
      // Creator: get their own applications
      const applications = await getCreatorApplications(auth.userId, {
        status: statusFilter,
      });

      return createSuccessResponse({
        applications: applications.map(convertTimestamps),
        count: applications.length,
        stats: {
          total: applications.length,
          pending: applications.filter((a) => a.status === ApplicationStatus.PENDING).length,
          underReview: applications.filter((a) => a.status === ApplicationStatus.UNDER_REVIEW).length,
          accepted: applications.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
          rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
          withdrawn: applications.filter((a) => a.status === ApplicationStatus.WITHDRAWN).length,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    return createErrorResponse('Failed to fetch applications', 500);
  }
}
