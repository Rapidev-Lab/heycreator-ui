import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { notifyUser } from '@/lib/services/notification.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { status } = await request.json();

      if (!['accepted', 'declined'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }

      const invitationRef = firestore.collection('campaign_invitations').doc(params.id);
      const invitationDoc = await invitationRef.get();

      if (!invitationDoc.exists || invitationDoc.data()?.influencerId !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      await invitationRef.update({
        status,
        respondedAt: new Date(),
      });

      const invData = invitationDoc.data()!;
      const brandId = invData.brandId;
      const campaignId = invData.campaignId;

      // When accepted, create an accepted campaign_applications record
      // so the campaign appears in "My Campaigns" and deliverables flow works
      if (status === 'accepted') {
        // Check if application already exists (avoid duplicates)
        const existingApp = await firestore
          .collection('campaign_applications')
          .where('campaignId', '==', campaignId)
          .where('influencerId', '==', userId)
          .limit(1)
          .get();

        if (existingApp.empty) {
          // Fetch influencer data for the application record
          let influencerData: any = {};
          let followerCount = 0;
          let engagementRate = 0;

          const profileSnapshot = await firestore
            .collection('global_influencers')
            .where('userId', '==', userId)
            .limit(1)
            .get();

          if (!profileSnapshot.empty) {
            const profile = profileSnapshot.docs[0].data();
            const metrics = profile.metrics || {};
            followerCount = metrics.totalFollowers || 0;
            engagementRate = metrics.averageEngagementRate || 0;
            influencerData = {
              displayName: profile.displayName || profile.email || 'Unknown',
              photoURL: profile.photoURL || null,
              bio: profile.bio || '',
              platforms: profile.platforms || [],
              categories: profile.categories || [],
            };
          } else {
            const userDoc = await firestore.collection('users').doc(userId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              influencerData = {
                displayName: userData?.displayName || userData?.email || 'Unknown',
                photoURL: userData?.photoURL || null,
                bio: userData?.bio || '',
              };
            }
          }

          const applicationRef = firestore.collection('campaign_applications').doc();
          await applicationRef.set({
            id: applicationRef.id,
            campaignId,
            brandId,
            influencerId: userId,
            status: 'accepted',
            pitchMessage: invData.message || 'Accepted via invitation',
            proposedRate: null,
            questionAnswers: [],
            qualificationMet: true,
            followerCount,
            engagementRate,
            influencerData,
            appliedAt: new Date(),
            reviewedAt: new Date(),
            updatedAt: new Date(),
          });

          // Update campaign stats
          const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();
          const campaignData = campaignDoc.data();
          if (campaignData) {
            await firestore.collection('campaigns').doc(campaignId).update({
              'stats.applications': (campaignData.stats?.applications || 0) + 1,
              'stats.acceptedApplications': (campaignData.stats?.acceptedApplications || 0) + 1,
              updatedAt: new Date(),
            });
          }
        }
      }

      // Notify the brand about the influencer's response (fire-and-forget)
      if (brandId) {
        const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();
        const campaignTitle = campaignDoc.data()?.campaignTitle || campaignDoc.data()?.title || 'a campaign';

        const userDoc = await firestore.collection('users').doc(userId).get();
        const influencerName = userDoc.data()?.displayName || 'A creator';

        const action = status === 'accepted' ? 'accepted' : 'declined';
        notifyUser({
          userId: brandId,
          type: 'invitation_response',
          title: `Invitation ${action}`,
          message: `${influencerName} has ${action} your invitation to "${campaignTitle}"`,
          campaignId,
          actionUrl: `/brands/campaigns/${campaignId}/dashboard`,
        }).catch((err) => console.error('Invitation response notification failed:', err));
      }

      return NextResponse.json({ success: true, data: { status } });
    } catch (error) {
      console.error('Update invitation error:', error);
      return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    }
  });
}
