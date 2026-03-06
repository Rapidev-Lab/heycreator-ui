import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

/**
 * PATCH /api/brands/campaigns/[id]
 * Handles partial updates like bookmarking or draft status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const campaignId = params.id;
      const body = await request.json();
      
      // Extract the new bookmarked field
      const { bookmarked } = body;

      // 1. Reference the campaign document
      const campaignRef = firestore.collection('campaigns').doc(campaignId);
      const campaignDoc = await campaignRef.get();

      if (!campaignDoc.exists) {
        return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
      }

      // 2. Ownership Check (Security)
      if (campaignDoc.data()?.brandId !== userId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      // 3. Update the document
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      // Map the "yes"/"no" bookmark status
      if (bookmarked !== undefined) {
        updateData.bookmarked = bookmarked;
      }

      await campaignRef.update(updateData);

      return NextResponse.json({
        success: true,
        message: `Campaign ${bookmarked === 'yes' ? 'bookmarked' : 'unbookmarked'} successfully`
      });
    } catch (error: any) {
      console.error('Error in PATCH handler:', error);
      return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
  });
}