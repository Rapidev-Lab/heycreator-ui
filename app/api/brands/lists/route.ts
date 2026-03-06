import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { CreateListRequest, CreatorListResponse } from '@/types/creator-list';

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

// GET /api/brands/lists — Get all lists for the brand user
export async function GET(request: NextRequest) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('creator_lists')
      .where('userId', '==', auth.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const lists: CreatorListResponse[] = snapshot.docs.map(toResponse);

    return NextResponse.json({ success: true, data: lists, count: lists.length });
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lists' }, { status: 500 });
  }
}

// POST /api/brands/lists — Create a new list
export async function POST(request: NextRequest) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: CreateListRequest = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, error: 'List name is required' }, { status: 400 });
    }

    const name = body.name.trim();
    const db = getAdminDb();

    // Check for duplicate name
    const existing = await db
      .collection('creator_lists')
      .where('userId', '==', auth.uid)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ success: false, error: 'A list with this name already exists' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();
    const docRef = await db.collection('creator_lists').add({
      userId: auth.uid,
      name,
      description: body.description?.trim() || '',
      color: body.color || '',
      creatorCount: 0,
      tags: body.tags || [],
      mentions: body.mentions || [],
      locations: body.locations || [],
      influenceSize: body.influenceSize || 'all',
      visibility: body.visibility || 'public',
      createdAt: now,
      updatedAt: now,
    });

    const created = await docRef.get();
    return NextResponse.json({ success: true, data: toResponse(created) }, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ success: false, error: 'Failed to create list' }, { status: 500 });
  }
}
