import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UpdateCreatorListsRequest } from '@/types/creator-list';

// PATCH /api/brands/creators/[id]/lists — Add/remove a creator to/from lists
// [id] = globalInfluencerId
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const globalInfluencerId = params.id;
    const body: UpdateCreatorListsRequest = await request.json();
    const { addToLists = [], removeFromLists = [] } = body;

    if (addToLists.length === 0 && removeFromLists.length === 0) {
      return NextResponse.json({ success: false, error: 'No list changes specified' }, { status: 400 });
    }

    const db = getAdminDb();

    // Find the user_collections entry for this creator
    const collectionSnap = await db
      .collection('user_collections')
      .where('userId', '==', auth.uid)
      .where('globalInfluencerId', '==', globalInfluencerId)
      .limit(1)
      .get();

    let collectionDocRef: FirebaseFirestore.DocumentReference;
    let currentLists: string[] = [];

    if (collectionSnap.empty) {
      // Auto-create user_collections entry if it doesn't exist
      // This handles the case when a suggestion (from global_influencers) is added directly to a list
      const newDoc = await db.collection('user_collections').add({
        userId: auth.uid,
        globalInfluencerId,
        lists: [],
        starred: false,
        collaborationStatus: 'none',
        notes: '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      collectionDocRef = newDoc;
      currentLists = [];
    } else {
      const collectionDoc = collectionSnap.docs[0];
      collectionDocRef = collectionDoc.ref;
      currentLists = collectionDoc.data().lists || [];
    }

    // Build batch update
    const batch = db.batch();

    // Update the user_collections doc
    const collectionUpdates: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (addToLists.length > 0) {
      collectionUpdates.lists = FieldValue.arrayUnion(...addToLists);
    }

    batch.update(collectionDocRef, collectionUpdates);

    // Increment creatorCount for lists being added to (only if creator wasn't already in them)
    for (const listId of addToLists) {
      if (!currentLists.includes(listId)) {
        batch.update(db.collection('creator_lists').doc(listId), {
          creatorCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // Decrement creatorCount for lists being removed from (only if creator was in them)
    for (const listId of removeFromLists) {
      if (currentLists.includes(listId)) {
        batch.update(db.collection('creator_lists').doc(listId), {
          creatorCount: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    await batch.commit();

    // If we need to also remove lists, do a second update
    if (removeFromLists.length > 0) {
      await collectionDocRef.update({
        lists: FieldValue.arrayRemove(...removeFromLists),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // Fetch updated lists array
    const updatedDoc = await collectionDocRef.get();
    const updatedLists: string[] = updatedDoc.data()?.lists || [];

    return NextResponse.json({ success: true, lists: updatedLists });
  } catch (error) {
    console.error('Error updating creator lists:', error);
    return NextResponse.json({ success: false, error: 'Failed to update creator lists' }, { status: 500 });
  }
}
