/**
 * Campaign Application Submission API
 *
 * POST /api/influencers/campaigns/[id]/apply
 * Submit application to a campaign
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { notifyUser } from '@/lib/services/notification.service';

/**
 * POST /api/influencers/campaigns/[id]/apply
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;

      // Parse request body
      const body = await request.json();
      const { pitchMessage, proposedRate, questionAnswers } = body;

      // Fetch campaign
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Campaign not found',
          },
          { status: 404 }
        );
      }

      const campaignData = campaignDoc.data();

      // Validate campaign is still active (support both 'active' and 'PUBLISHED')
      if (campaignData?.status !== 'PUBLISHED' && campaignData?.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            error: 'Campaign is no longer accepting applications',
          },
          { status: 400 }
        );
      }

      // Check if application deadline has passed
      const rawDeadline = campaignData?.budget?.applicationDeadline || campaignData?.timeline?.applicationDeadline;
      if (rawDeadline) {
        let deadline: Date;
        // Handle both Firestore Timestamp and Date objects
        if (typeof rawDeadline.toDate === 'function') {
          deadline = rawDeadline.toDate();
        } else if (rawDeadline instanceof Date) {
          deadline = rawDeadline;
        } else {
          deadline = new Date(rawDeadline);
        }

        // Set deadline to end of day (23:59:59) to allow applications throughout the deadline day
        deadline.setHours(23, 59, 59, 999);

        if (new Date() > deadline) {
          return NextResponse.json(
            {
              success: false,
              error: 'Application deadline has passed',
            },
            { status: 400 }
          );
        }
      }

      // Check if user is not the brand owner
      if (campaignData?.brandId === userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'You cannot apply to your own campaign',
          },
          { status: 403 }
        );
      }

      // Check if user has already applied
      const existingApplication = await firestore
        .collection('campaign_applications')
        .where('campaignId', '==', campaignId)
        .where('influencerId', '==', userId)
        .limit(1)
        .get();

      if (!existingApplication.empty) {
        return NextResponse.json(
          {
            success: false,
            error: 'You have already applied to this campaign',
          },
          { status: 400 }
        );
      }

      // Fetch influencer's profile from global_influencers
      const profileSnapshot = await firestore
        .collection('global_influencers')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      let followerCount = 0;
      let engagementRate = 0;
      let influencerData: any = {};

      // Always fetch the user's full name from users/influencer_profiles
      // (global_influencers.displayName may contain a social username instead)
      const userDoc = await firestore.collection('users').doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      let fullName = userData?.displayName || '';

      // Check influencer_profiles for a more complete name
      const infProfileId = userData?.influencerProfileId;
      if (infProfileId) {
        const infProfileDoc = await firestore.collection('influencer_profiles').doc(infProfileId).get();
        const infProfileData = infProfileDoc.exists ? infProfileDoc.data() : null;
        if (infProfileData?.displayName) {
          fullName = infProfileData.displayName;
        }
      }

      if (!profileSnapshot.empty) {
        const profile = profileSnapshot.docs[0].data();
        const metrics = profile.metrics || {};
        followerCount = metrics.totalFollowers || 0;
        engagementRate = metrics.averageEngagementRate || 0;

        // Gather additional influencer data for the application
        // Prefer the full name from users/influencer_profiles over global_influencers
        influencerData = {
          displayName: fullName || profile.displayName || userData?.email || 'Unknown',
          photoURL: profile.photoURL || userData?.photoURL || null,
          bio: profile.bio || '',
          platforms: profile.platforms || [],
          categories: profile.categories || [],
        };
      } else {
        // Fallback to user collection if no unified profile exists
        influencerData = {
          displayName: fullName || userData?.email || 'Unknown',
          photoURL: userData?.photoURL || null,
          bio: userData?.bio || '',
        };
      }

      // Calculate if qualification is met
      const qualificationMet =
        followerCount >= (campaignData.requirements?.minFollowers || 0) &&
        engagementRate >= (campaignData.requirements?.minEngagementRate || 0);

      // Create application document
      const applicationRef = firestore.collection('campaign_applications').doc();
      const applicationData = {
        id: applicationRef.id,
        campaignId,
        brandId: campaignData.brandId,
        influencerId: userId,
        status: 'pending',
        pitchMessage: pitchMessage || '',
        proposedRate: proposedRate || null,
        questionAnswers: questionAnswers || [],
        qualificationMet,
        followerCount,
        engagementRate,
        influencerData, // Include denormalized influencer data for faster access
        appliedAt: new Date(),
        updatedAt: new Date(),
      };

      await applicationRef.set(applicationData);

      // Update campaign stats
      await firestore.collection('campaigns').doc(campaignId).update({
        'stats.applications': (campaignData.stats?.applications || 0) + 1,
        'stats.pendingApplications': (campaignData.stats?.pendingApplications || 0) + 1,
        updatedAt: new Date(),
      });

      // Notify the brand about the new application (fire-and-forget)
      const creatorName = influencerData.displayName || 'A creator';
      const campaignTitle = campaignData.campaignTitle || 'your campaign';
      notifyUser({
        userId: campaignData.brandId,
        type: 'application_received',
        title: 'New Application',
        message: `${creatorName} applied to "${campaignTitle}"`,
        campaignId,
        applicationId: applicationRef.id,
        actionUrl: `/brands/campaigns/${campaignId}/dashboard?tab=creators&subtab=applications`,
      }).catch((err) => console.error('Failed to send notification:', err));

      return NextResponse.json({
        success: true,
        data: {
          application: {
            id: applicationRef.id,
            campaignId,
            status: 'pending',
            qualificationMet,
            appliedAt: new Date(),
          },
        },
        message: 'Application submitted successfully',
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to submit application',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  });
}
