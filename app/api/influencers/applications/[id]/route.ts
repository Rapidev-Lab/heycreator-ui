/**
 * Withdraw Campaign Application API
 *
 * DELETE /api/influencers/applications/[id]
 * Withdraw an application (change status to 'withdrawn')
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

/**
 * DELETE /api/influencers/applications/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const applicationId = params.id;

      // Fetch application
      const applicationDoc = await firestore
        .collection('campaign_applications')
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found',
          },
          { status: 404 }
        );
      }

      const applicationData = applicationDoc.data();

      // Verify ownership
      if (applicationData?.influencerId !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized to withdraw this application',
          },
          { status: 403 }
        );
      }

      // Check if already withdrawn
      if (applicationData?.status === 'withdrawn') {
        return NextResponse.json(
          {
            success: false,
            error: 'Application is already withdrawn',
          },
          { status: 400 }
        );
      }

      // Check if already accepted/rejected
      if (applicationData?.status === 'accepted' || applicationData?.status === 'rejected') {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot withdraw ${applicationData.status} application`,
          },
          { status: 400 }
        );
      }

      // Update application status to withdrawn
      await applicationDoc.ref.update({
        status: 'withdrawn',
        withdrawnAt: new Date(),
        updatedAt: new Date(),
      });

      // Update campaign stats
      const campaignId = applicationData.campaignId;
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (campaignDoc.exists) {
        const campaignData = campaignDoc.data();
        await firestore.collection('campaigns').doc(campaignId).update({
          'stats.pendingApplications': Math.max((campaignData?.stats?.pendingApplications || 1) - 1, 0),
          updatedAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Application withdrawn successfully',
        data: {
          applicationId,
          status: 'withdrawn',
          withdrawnAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to withdraw application',
        },
        { status: 500 }
      );
    }
  });
}
