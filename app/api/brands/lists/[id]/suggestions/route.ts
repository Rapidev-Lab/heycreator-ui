import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

// GET /api/brands/lists/[id]/suggestions — Smart suggestions for a list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireBrandRole(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const listId = params.id;
    const db = getAdminDb();

    // Verify list exists and belongs to user
    const listDoc = await db.collection('creator_lists').doc(listId).get();
    if (!listDoc.exists || listDoc.data()?.userId !== auth.uid) {
      return NextResponse.json({ success: false, error: 'List not found' }, { status: 404 });
    }

    const listData = listDoc.data()!;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 20);

    // Get IDs of creators already in this list (to exclude them)
    const existingSnap = await db
      .collection('user_collections')
      .where('userId', '==', auth.uid)
      .where('lists', 'array-contains', listId)
      .select('globalInfluencerId')
      .get();

    const excludeIds = new Set(
      existingSnap.docs.map(doc => doc.data().globalInfluencerId).filter(Boolean)
    );

    // Build query based on list criteria
    const tags: string[] = listData.tags || [];
    const locations: string[] = listData.locations || [];
    const criteria: string[] = [];

    let results: any[] = [];

    // Strategy 1: Match by categories/tags if list has tags
    if (tags.length > 0) {
      // Strip '#' from tags for category matching
      const categoryTerms = tags.map((t: string) => t.replace(/^#/, '').toLowerCase());
      criteria.push(`tags: ${tags.join(', ')}`);

      // Firestore array-contains-any supports up to 30 values
      const queryTerms = categoryTerms.slice(0, 10);
      const snap = await db
        .collection('global_influencers')
        .where('categories', 'array-contains-any', queryTerms)
        .orderBy('totalFollowers', 'desc')
        .limit(limit + excludeIds.size) // Over-fetch to account for exclusions
        .get();

      results = snap.docs
        .filter(doc => !excludeIds.has(doc.id))
        .slice(0, limit)
        .map(mapDocToProfile);
    }

    // Strategy 2: If not enough from tags, fill with top followers
    if (results.length < limit) {
      const remaining = limit - results.length;
      const existingResultIds = new Set(results.map(r => r.id));

      criteria.push('top followers');

      const snap = await db
        .collection('global_influencers')
        .orderBy('totalFollowers', 'desc')
        .limit(remaining + excludeIds.size + existingResultIds.size)
        .get();

      const additional = snap.docs
        .filter(doc => !excludeIds.has(doc.id) && !existingResultIds.has(doc.id))
        .slice(0, remaining)
        .map(mapDocToProfile);

      results = [...results, ...additional];
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      criteria,
    });
  } catch (error) {
    console.error('Error fetching list suggestions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

function mapDocToProfile(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const d = doc.data();
  const platforms = d.platforms || [];

  return {
    id: doc.id,
    name: d.displayName || '',
    username: d.primaryUsername || '',
    display_name: d.displayName || '',
    bio: d.bio || '',
    profile_image_url: d.avatarUrl || '',
    platforms: platforms.map((p: any) => p.platform),
    primary_platform: platforms[0]?.platform || 'instagram',
    profile_urls: {},
    follower_count: d.totalFollowers || 0,
    engagement_rate: d.averageEngagementRate || 0,
    influence_score: 0,
    avg_likes: 0,
    avg_comments: 0,
    avg_shares: 0,
    location: {
      country: d.location?.country || '',
      country_code: '',
      city: d.location?.city || '',
    },
    gender: 'unknown' as const,
    languages: [] as string[],
    audience: {
      total_followers: d.totalFollowers || 0,
      gender_split: { male: 0, female: 0, other: 0 },
      age_split: { '12-17': 0, '18-24': 0, '25-34': 0, '35-49': 0, '50+': 0 },
      top_locations: [],
      authenticity_score: 0,
    },
    topics: d.topics || [],
    primary_topic: (d.categories || [])[0] || '',
    hashtags: [] as string[],
    brand_mentions: [],
    has_sponsored_posts: false,
    sponsored_post_count: 0,
    post_frequency: 0,
    has_email: false,
    accepts_messages: false,
    is_vetted: false,
    verification_badges: platforms.map((p: any) => ({
      platform: p.platform,
      verified: p.verified || false,
    })),
    created_at: '',
    updated_at: '',
    last_scraped_at: '',
  };
}
