import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { notifyUser } from '@/lib/services/notification.service';

// Helper to serialize Firestore timestamps
function serializeTimestamp(timestamp: any): string | null {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
}

/**
 * GET /api/campaigns/[id]/invitations
 * Fetch all invitations for a campaign (for brands)
 * Includes influencer profile data for display
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;

      // Verify campaign ownership
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();
      if (!campaignDoc.exists || campaignDoc.data()?.brandId !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      // Fetch invitations for this campaign
      const invitationsSnapshot = await firestore
        .collection('campaign_invitations')
        .where('campaignId', '==', campaignId)
        .orderBy('invitedAt', 'desc')
        .get();

      const rawInvitations = invitationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          campaignId: data.campaignId,
          influencerId: data.influencerId,
          brandId: data.brandId,
          status: data.status,
          message: data.message || null,
          invitedAt: serializeTimestamp(data.invitedAt),
        };
      });

      // Batch fetch influencer data from users collection
      const influencerIds = [...new Set(rawInvitations.map((inv) => inv.influencerId))];
      const influencerMap: Record<string, any> = {};

      // Firestore 'in' queries are limited to 30 items
      const chunks = [];
      for (let i = 0; i < influencerIds.length; i += 30) {
        chunks.push(influencerIds.slice(i, i + 30));
      }

      for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const usersSnapshot = await firestore
          .collection('users')
          .where('__name__', 'in', chunk)
          .get();

        // Collect influencer profile IDs to fetch social data
        const profileFetches: { userId: string; profileId: string }[] = [];

        usersSnapshot.docs.forEach((doc) => {
          const d = doc.data();
          influencerMap[doc.id] = {
            id: doc.id,
            name: d.displayName || d.email?.split('@')[0] || 'Creator',
            username: d.email?.split('@')[0] || '',
            email: d.email || '',
            avatar: d.photoURL || '',
            emailVerified: d.emailVerified || false,
            totalFollowers: 0,
            engagementRate: 0,
            socialStats: [],
          };
          if (d.influencerProfileId) {
            profileFetches.push({ userId: doc.id, profileId: d.influencerProfileId });
          }
        });

        // Fetch influencer profiles to get linkedAccounts / social data
        for (const { userId, profileId } of profileFetches) {
          try {
            const profileDoc = await firestore.collection('influencer_profiles').doc(profileId).get();
            if (profileDoc.exists) {
              const p = profileDoc.data()!;
              const linkedAccounts = p.linkedAccounts || [];
              influencerMap[userId].totalFollowers = p.totalFollowers || 0;
              influencerMap[userId].engagementRate = p.averageEngagementRate || 0;
              influencerMap[userId].socialStats = linkedAccounts.map((a: any) => ({
                platform: a.platform,
                followers: a.followerCount || 0,
              }));
            }
          } catch (err) {
            console.error(`Error fetching influencer profile ${profileId}:`, err);
          }
        }
      }

      // Merge influencer data into invitations
      const invitations = rawInvitations.map((inv) => ({
        ...inv,
        influencer: influencerMap[inv.influencerId] || null,
      }));

      return NextResponse.json({
        success: true,
        data: { invitations },
      });
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch invitations' }, { status: 500 });
    }
  });
}

/**
 * POST /api/campaigns/[id]/invitations
 * Create new invitations for a campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;
      const { influencerIds, message } = await request.json();

      if (!influencerIds?.length) {
        return NextResponse.json({ success: false, error: 'influencerIds required' }, { status: 400 });
      }

      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();
      if (!campaignDoc.exists || campaignDoc.data()?.brandId !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      const batch = firestore.batch();
      const invitations = influencerIds.map((influencerId: string) => {
        const ref = firestore.collection('campaign_invitations').doc();
        batch.set(ref, {
          campaignId,
          influencerId,
          brandId: userId,
          status: 'sent',
          message: message || '',
          invitedAt: FieldValue.serverTimestamp(),
        });
        return ref.id;
      });

      await batch.commit();

      // Notify each invited influencer (fire-and-forget)
      const campaignTitle = campaignDoc.data()?.campaignTitle || campaignDoc.data()?.title || 'a campaign';
      const brandName = campaignDoc.data()?.brandName || 'A brand';
      for (const influencerId of influencerIds) {
        notifyUser({
          userId: influencerId,
          type: 'campaign_invitation',
          title: 'New Campaign Invitation',
          message: `${brandName} has invited you to join "${campaignTitle}"`,
          campaignId,
          actionUrl: `/influencers/marketplace/${campaignId}`,
        }).catch((err) => console.error('Invitation notification failed:', err));
      }

      return NextResponse.json({ success: true, data: { invitations } });
    } catch (error) {
      console.error('Invitation error:', error);
      return NextResponse.json({ success: false, error: 'Failed to send invitations' }, { status: 500 });
    }
  });
}
