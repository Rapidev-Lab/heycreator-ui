import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// DELETE /api/brands/creators/[id] — Remove a creator from the user's collection and the database
// [id] = globalInfluencerId (Firestore doc ID in global_influencers)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const globalInfluencerId = params.id;
    const db = getAdminDb();

    // 1. Find the user_collections entry linking this user to the creator
    const collectionSnap = await db
      .collection('user_collections')
      .where('userId', '==', auth.uid)
      .where('globalInfluencerId', '==', globalInfluencerId)
      .limit(1)
      .get();

    if (!collectionSnap.empty) {
      const collectionDoc = collectionSnap.docs[0];
      const lists: string[] = collectionDoc.data().lists || [];

      const batch = db.batch();

      // Decrement creatorCount on every list the creator was in
      for (const listId of lists) {
        batch.update(db.collection('creator_lists').doc(listId), {
          creatorCount: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Delete the user_collections document
      batch.delete(collectionDoc.ref);

      await batch.commit();
    }

    // 2. Delete the global_influencers document
    await db.collection('global_influencers').doc(globalInfluencerId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting creator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete creator' },
      { status: 500 }
    );
  }
}
