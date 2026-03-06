import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireCreatorRole } from '@/lib/middleware/campaign-auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireCreatorRole(async (decodedToken) => {
    try {
      const creatorId = decodedToken.uid;
      const campaignId = params.id;
      const body = await req.json();
      const { pitchMessage } = body;

      const newApplicationRef = firestore.collection('applications').doc();
      const newApplication = {
        id: newApplicationRef.id,
        creatorId,
        campaignId,
        pitchMessage,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await newApplicationRef.set(newApplication);

      // Optionally, update the campaign's application count
      const campaignRef = firestore.collection('campaigns').doc(campaignId);
      await firestore.runTransaction(async (transaction) => {
        const campaignDoc = await transaction.get(campaignRef);
        if (campaignDoc.exists) {
          const currentApplications = campaignDoc.data()?.stats.applications || 0;
          transaction.update(campaignRef, {
            'stats.applications': currentApplications + 1,
            'stats.pendingApplications': (campaignDoc.data()?.stats.pendingApplications || 0) + 1,
          });
        }
      });

      return NextResponse.json({ success: true, data: newApplication });
    } catch (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create application' },
        { status: 500 }
      );
    }
  });
}