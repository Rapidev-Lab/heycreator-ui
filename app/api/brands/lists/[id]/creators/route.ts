import { NextRequest, NextResponse } from 'next/server';
import { requireBrandRole } from '@/lib/middleware/campaign-auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldPath } from 'firebase-admin/firestore';
import type { ListAnalytics } from '@/types/creator-list';

export const dynamic = 'force-dynamic';

// GET /api/brands/lists/[id]/creators — Fetch creators in a list with analytics
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    // Find user_collections where lists array-contains this listId
    const collectionsSnap = await db
      .collection('user_collections')
      .where('userId', '==', auth.uid)
      .where('lists', 'array-contains', listId)
      .limit(limit)
      .get();

    if (collectionsSnap.empty) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        analytics: { avgFollowers: 0, avgEngagementRate: 0, avgGrowth30d: 0, avgAuthenticity: 0 },
      });
    }

    // Get globalInfluencerIds from collections
    const globalIds = collectionsSnap.docs
      .map(doc => doc.data().globalInfluencerId)
      .filter(Boolean);

    if (globalIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        analytics: { avgFollowers: 0, avgEngagementRate: 0, avgGrowth30d: 0, avgAuthenticity: 0 },
      });
    }

    // Fetch global_influencer docs in parallel batches of 30 (Firestore `in` limit)
    const BATCH_SIZE = 30;
    const batchPromises: Promise<FirebaseFirestore.QuerySnapshot>[] = [];

    for (let i = 0; i < globalIds.length; i += BATCH_SIZE) {
      const batchIds = globalIds.slice(i, i + BATCH_SIZE);
      batchPromises.push(
        db.collection('global_influencers')
          .where(FieldPath.documentId(), 'in', batchIds)
          .get()
      );
    }

    const batchResults = await Promise.all(batchPromises);
    const allProfiles = batchResults.flatMap(snap =>
      snap.docs.map(doc => mapDocToProfile(doc))
    );

    // Sort by followers desc
    allProfiles.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0));

    // Compute aggregated analytics
    const analytics = computeAnalytics(allProfiles);

    return NextResponse.json({
      success: true,
      data: allProfiles,
      count: allProfiles.length,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching list creators:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch list creators' }, { status: 500 });
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
      authenticity_score: d.instagramEnrichment?.audienceAuthenticity || 0,
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

function computeAnalytics(profiles: any[]): ListAnalytics {
  if (profiles.length === 0) {
    return { avgFollowers: 0, avgEngagementRate: 0, avgGrowth30d: 0, avgAuthenticity: 0 };
  }

  const total = profiles.reduce(
    (acc, p) => ({
      followers: acc.followers + (p.follower_count || 0),
      engagement: acc.engagement + (p.engagement_rate || 0),
      authenticity: acc.authenticity + (p.audience?.authenticity_score || 0),
    }),
    { followers: 0, engagement: 0, authenticity: 0 }
  );

  return {
    avgFollowers: Math.round(total.followers / profiles.length),
    avgEngagementRate: parseFloat((total.engagement / profiles.length).toFixed(1)),
    avgGrowth30d: 0, // Not tracked yet
    avgAuthenticity: Math.round(total.authenticity / profiles.length),
  };
}
