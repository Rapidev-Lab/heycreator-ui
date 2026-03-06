/**
 * Brand Application Review API
 *
 * GET /api/brands/campaigns/[id]/applications/[applicationId]
 * Get full application details
 *
 * PATCH /api/brands/campaigns/[id]/applications/[applicationId]
 * Accept or reject an application
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { notifyUser } from '@/lib/services/notification.service';

/**
 * GET /api/brands/campaigns/[id]/applications/[applicationId]
 * Get full application details with influencer profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { id: campaignId, applicationId } = params;

      // Verify campaign ownership
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists || campaignDoc.data()?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Fetch application
      const applicationDoc = await firestore
        .collection('campaign_applications')
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }

      const appData = applicationDoc.data();

      // Verify application belongs to this campaign
      if (appData?.campaignId !== campaignId) {
        return NextResponse.json(
          { success: false, error: 'Application does not belong to this campaign' },
          { status: 400 }
        );
      }

      // Fetch full influencer profile
      const influencerDoc = await firestore.collection('users').doc(appData.influencerId).get();
      const influencerData = influencerDoc.exists ? influencerDoc.data() : null;

      // Convert timestamps
      const appliedAtDate = appData.appliedAt?.toDate?.() || new Date(appData.appliedAt);
      const reviewedAtDate = appData.reviewedAt?.toDate?.() || (appData.reviewedAt ? new Date(appData.reviewedAt) : null);

      return NextResponse.json({
        success: true,
        data: {
          application: {
            id: applicationDoc.id,
            status: appData.status,
            appliedAt: appliedAtDate.toISOString(),
            reviewedAt: reviewedAtDate ? reviewedAtDate.toISOString() : null,
            reviewNotes: appData.reviewNotes || null,
            rejectionReason: appData.rejectionReason || null,
            pitchMessage: appData.pitchMessage || '',
            proposedRate: appData.proposedRate || null,
            qualificationScore: appData.qualificationScore || 0,
          },
          influencer: influencerData ? {
            id: appData.influencerId,
            displayName: influencerData.displayName || influencerData.email,
            photoURL: influencerData.photoURL || null,
            email: influencerData.email,
            totalFollowers: influencerData.totalFollowers || 0,
            engagementRate: influencerData.engagementRate || 0,
            platforms: influencerData.platforms || [],
            categories: influencerData.categories || [],
            bio: influencerData.bio || '',
          } : null,
        },
      });
    } catch (error) {
      console.error('Error fetching application details:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch application details' },
        { status: 500 }
      );
    }
  });
}

/**
 * PATCH /api/brands/campaigns/[id]/applications/[applicationId]
 * Accept or reject an application
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { id: campaignId, applicationId } = params;
      const body = await request.json();
      const { action, reviewNotes, rejectionReason } = body;

      // Validate action
      if (!['accept', 'reject'].includes(action)) {
        return NextResponse.json(
          { success: false, error: 'Invalid action. Must be "accept" or "reject"' },
          { status: 400 }
        );
      }

      // Verify campaign ownership
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists || campaignDoc.data()?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Fetch application
      const applicationRef = firestore.collection('campaign_applications').doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }

      const appData = applicationDoc.data();

      // Verify application belongs to this campaign
      if (appData?.campaignId !== campaignId) {
        return NextResponse.json(
          { success: false, error: 'Application does not belong to this campaign' },
          { status: 400 }
        );
      }

      // Check if application is already reviewed
      if (appData.status === 'accepted' || appData.status === 'rejected') {
        return NextResponse.json(
          { success: false, error: `Application already ${appData.status}` },
          { status: 400 }
        );
      }

      // Check if application was withdrawn
      if (appData.status === 'withdrawn') {
        return NextResponse.json(
          { success: false, error: 'Cannot review withdrawn application' },
          { status: 400 }
        );
      }

      // Determine new status
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';

      // Prepare update data
      const updateData: any = {
        status: newStatus,
        reviewedAt: FieldValue.serverTimestamp(),
        reviewedBy: userId,
      };

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
      }

      if (action === 'reject' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      // Use transaction to update application and campaign stats
      await firestore.runTransaction(async (transaction) => {
        // Update application
        transaction.update(applicationRef, updateData);

        // Update campaign stats
        const campaignRef = firestore.collection('campaigns').doc(campaignId);
        const statsField = action === 'accept' ? 'stats.acceptedApplications' : 'stats.rejectedApplications';

        transaction.update(campaignRef, {
          [statsField]: FieldValue.increment(1),
          'stats.pendingApplications': FieldValue.increment(-1),
        });
      });

      // Notify the creator about the review (fire-and-forget)
      const campaignTitle = campaignDoc.data()?.campaignTitle || 'a campaign';
      const statusLabel = newStatus === 'accepted' ? 'Accepted' : 'Rejected';
      notifyUser({
        userId: appData.influencerId,
        type: 'application_reviewed',
        title: `Application ${statusLabel}`,
        message: `Your application to "${campaignTitle}" has been ${newStatus}`,
        campaignId,
        applicationId,
        actionUrl: '/influencers/campaigns?tab=applications',
      }).catch((err) => console.error('Failed to send notification:', err));

      return NextResponse.json({
        success: true,
        message: `Application ${newStatus} successfully`,
        data: {
          applicationId,
          status: newStatus,
          reviewedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error reviewing application:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to review application' },
        { status: 500 }
      );
    }
  });
}
