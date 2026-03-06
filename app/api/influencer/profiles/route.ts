import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';
import { FieldPath } from 'firebase-admin/firestore';

// Force dynamic rendering because we use request.headers for auth
export const dynamic = 'force-dynamic';

/**
 * GET /api/influencer/profiles
 *
 * Fetches all profiles for the authenticated user.
 * Queries user_collections → batch-fetches global_influencers.
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 * - x-user-id: (Fallback for development only)
 *
 * Query parameters (optional):
 * - status: Filter by status ('active', 'archived', 'deleted')
 * - limit: Maximum number of profiles to return
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user ID
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Return 401 error response
    }
    const { userId } = authResult;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status') || 'active';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    console.log(`Fetching profiles for user: ${userId}, status: ${statusFilter}`);

    // Get Admin DB (bypasses Firestore security rules)
    const db = getAdminDb();

    // Step 1: Query user_collections for this user
    let ucQuery = db.collection('user_collections')
      .where('userId', '==', userId)
      .orderBy('addedAt', 'desc');

    if (limit) {
      ucQuery = ucQuery.limit(limit);
    }

    const ucSnapshot = await ucQuery.get();

    // Filter by profileStatus (default 'active')
    const ucDocs = ucSnapshot.docs.filter(doc => {
      const data = doc.data();
      return (data.profileStatus || 'active') === statusFilter;
    });

    if (ucDocs.length === 0) {
      console.log('Found 0 profiles');
      return NextResponse.json({
        success: true,
        count: 0,
        profiles: [],
      });
    }

    // Step 2: Batch-fetch global_influencers by IDs
    const globalIds = ucDocs.map(d => d.data().globalInfluencerId).filter(Boolean);
    const profileMap = new Map<string, any>();

    for (let i = 0; i < globalIds.length; i += 30) {
      const batchIds = globalIds.slice(i, i + 30);
      const snap = await db.collection('global_influencers')
        .where(FieldPath.documentId(), 'in', batchIds)
        .get();
      snap.docs.forEach(doc => profileMap.set(doc.id, doc.data()));
    }

    // Step 3: Merge and transform
    const profiles = ucDocs.map(ucDoc => {
      const uc = ucDoc.data();
      const data = profileMap.get(uc.globalInfluencerId);
      if (!data) return null;

      return {
        id: uc.globalInfluencerId,
        ...data,
        status: uc.profileStatus || 'active',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        linkedAccounts: data.linkedAccounts?.map((account: any) => ({
          ...account,
          linkedAt: account.linkedAt?.toDate?.()?.toISOString() || null,
          lastSyncedAt: account.lastSyncedAt?.toDate?.()?.toISOString() || null,
        })),
      };
    }).filter(Boolean);

    console.log(`Found ${profiles.length} profiles`);

    return NextResponse.json({
      success: true,
      count: profiles.length,
      profiles: profiles,
    });

  } catch (error: any) {
    console.error('Error fetching profiles:', error);

    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { error: 'Permission denied. Check Firestore security rules.' },
        { status: 403 }
      );
    }

    if (error.code === 'failed-precondition') {
      return NextResponse.json(
        { error: 'Index required. Check console for index creation link.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch profiles',
        code: error.code
      },
      { status: 500 }
    );
  }
}
