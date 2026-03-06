import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';

// GET /api/brands/creators/export — Export creators as CSV
export async function GET(request: NextRequest) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    // Query user_collections
    let query: FirebaseFirestore.Query = db
      .collection('user_collections')
      .where('userId', '==', auth.uid);

    if (listId) {
      query = query.where('lists', 'array-contains', listId);
    }

    const collectionsSnap = await query.get();

    if (collectionsSnap.empty) {
      const headers = 'Name,Username,Platform,Followers,Engagement Rate,Location,Bio,Categories,Lists,Starred,Status,Added At\n';
      return new NextResponse(headers, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="my-creators-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Fetch global influencer profiles for all collections
    const globalIds = collectionsSnap.docs.map(d => d.data().globalInfluencerId).filter(Boolean);
    const profileMap = new Map<string, any>();

    // Fetch in batches of 10 (Firestore 'in' limit)
    for (let i = 0; i < globalIds.length; i += 10) {
      const batch = globalIds.slice(i, i + 10);
      const profilesSnap = await db
        .collection('global_influencers')
        .where('__name__', 'in', batch)
        .get();

      profilesSnap.docs.forEach(doc => {
        profileMap.set(doc.id, doc.data());
      });
    }

    // Fetch list names for display
    const allListIds = new Set<string>();
    collectionsSnap.docs.forEach(doc => {
      (doc.data().lists || []).forEach((id: string) => allListIds.add(id));
    });

    const listNameMap = new Map<string, string>();
    if (allListIds.size > 0) {
      const listIdsArray = Array.from(allListIds);
      for (let i = 0; i < listIdsArray.length; i += 10) {
        const batch = listIdsArray.slice(i, i + 10);
        const listsSnap = await db
          .collection('creator_lists')
          .where('__name__', 'in', batch)
          .get();

        listsSnap.docs.forEach(doc => {
          listNameMap.set(doc.id, doc.data().name);
        });
      }
    }

    // Build CSV
    const escCsv = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    const header = 'Name,Username,Platform,Followers,Engagement Rate,Location,Bio,Categories,Lists,Starred,Status,Added At';
    const rows = collectionsSnap.docs.map(doc => {
      const c = doc.data();
      const profile = profileMap.get(c.globalInfluencerId) || {};

      const listNames = (c.lists || [])
        .map((id: string) => listNameMap.get(id) || id)
        .join('; ');

      return [
        escCsv(c.customDisplayName || profile.displayName || ''),
        escCsv(profile.primaryUsername || ''),
        escCsv(profile.primaryPlatform || ''),
        profile.totalFollowers || 0,
        ((profile.averageEngagementRate || 0) * 100).toFixed(2) + '%',
        escCsv([profile.location?.city, profile.location?.country].filter(Boolean).join(', ')),
        escCsv((profile.bio || '').substring(0, 200)),
        escCsv((profile.categories || []).join('; ')),
        escCsv(listNames),
        c.starred ? 'Yes' : 'No',
        c.collaborationStatus || 'none',
        c.addedAt?.toDate?.()?.toISOString()?.split('T')[0] || '',
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="my-creators-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting creators:', error);
    return NextResponse.json({ success: false, error: 'Failed to export' }, { status: 500 });
  }
}
