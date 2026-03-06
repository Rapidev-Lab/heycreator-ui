import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { UpdateListRequest, CreatorListResponse } from '@/types/creator-list';

function toResponse(doc: FirebaseFirestore.DocumentSnapshot): CreatorListResponse {
  const data = doc.data()!;
  return {
    id: doc.id,
    name: data.name,
    description: data.description || undefined,
    color: data.color || undefined,
    creatorCount: data.creatorCount || 0,
    tags: data.tags || [],
    mentions: data.mentions || [],
    locations: data.locations || [],
    influenceSize: data.influenceSize || undefined,
    visibility: data.visibility || 'public',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

// PATCH /api/brands/lists/[id] — Update a list
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = params;
    const body: UpdateListRequest = await request.json();
    const db = getAdminDb();

    const listRef = db.collection('creator_lists').doc(id);
    const listDoc = await listRef.get();

    if (!listDoc.exists) {
      return NextResponse.json({ success: false, error: 'List not found' }, { status: 404 });
    }

    if (listDoc.data()?.userId !== auth.uid) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ success: false, error: 'List name cannot be empty' }, { status: 400 });
      }
      // Check duplicate name (excluding current list)
      const existing = await db
        .collection('creator_lists')
        .where('userId', '==', auth.uid)
        .where('name', '==', name)
        .limit(1)
        .get();

      if (!existing.empty && existing.docs[0].id !== id) {
        return NextResponse.json({ success: false, error: 'A list with this name already exists' }, { status: 400 });
      }
      updates.name = name;
    }

    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.color !== undefined) updates.color = body.color;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.mentions !== undefined) updates.mentions = body.mentions;
    if (body.locations !== undefined) updates.locations = body.locations;
    if (body.influenceSize !== undefined) updates.influenceSize = body.influenceSize;
    if (body.visibility !== undefined) updates.visibility = body.visibility;

    await listRef.update(updates);
    const updated = await listRef.get();

    return NextResponse.json({ success: true, data: toResponse(updated) });
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ success: false, error: 'Failed to update list' }, { status: 500 });
  }
}

// DELETE /api/brands/lists/[id] — Delete a list and cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = params;
    const db = getAdminDb();

    const listRef = db.collection('creator_lists').doc(id);
    const listDoc = await listRef.get();

    if (!listDoc.exists) {
      return NextResponse.json({ success: false, error: 'List not found' }, { status: 404 });
    }

    if (listDoc.data()?.userId !== auth.uid) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Cascade: remove this list ID from all user_collections that reference it
    const collectionsSnap = await db
      .collection('user_collections')
      .where('userId', '==', auth.uid)
      .where('lists', 'array-contains', id)
      .get();

    // Process in batches of 400 to stay within Firestore limits
    const BATCH_SIZE = 400;
    for (let i = 0; i < collectionsSnap.docs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = collectionsSnap.docs.slice(i, i + BATCH_SIZE);

      chunk.forEach(doc => {
        batch.update(doc.ref, {
          lists: FieldValue.arrayRemove(id),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      // Delete the list doc in the first batch
      if (i === 0) {
        batch.delete(listRef);
      }

      await batch.commit();
    }

    // If no collections referenced this list, still delete it
    if (collectionsSnap.empty) {
      await listRef.delete();
    }

    return NextResponse.json({ success: true, message: 'List deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete list' }, { status: 500 });
  }
}
