import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';

// Force dynamic rendering because we use request.headers for auth
export const dynamic = 'force-dynamic';

/**
 * GET /api/influencer/profiles/[id]
 *
 * Fetches a complete influencer profile with all related data:
 * - Unified profile (basic info, linked accounts, metrics)
 * - Detailed data (analytics, demographics, similar influencers)
 * - Content posts (social media posts)
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 * - x-user-id: (Fallback for development only)
 *
 * Query parameters (optional):
 * - postsLimit: Maximum number of posts to return (default: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Return 401 error response
    }

    const profileId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const postsLimit = parseInt(searchParams.get('postsLimit') || '20', 10);

    console.log(`Fetching complete profile for ID: ${profileId}`);

    // Get Admin DB (bypasses Firestore security rules)
    const db = getAdminDb();

    // NEW ARCHITECTURE: Try to fetch from user_collections first (user's saved profile)
    // If not found, try global_influencers (from discovery search)
    let userCollection: any = null;
    let globalInfluencer: any = null;

    // 1. Try to fetch as user_collection (user's saved profile)
    try {
      const userCollectionRef = db.collection('user_collections').doc(profileId);
      const userCollectionSnap = await userCollectionRef.get();

      if (userCollectionSnap.exists) {
        userCollection = { id: userCollectionSnap.id, ...userCollectionSnap.data() };
        console.log(`✓ Found user_collection: ${userCollection.id}`);

        // Fetch the referenced global influencer
        const globalRef = db.collection('global_influencers').doc(userCollection.globalInfluencerId);
        const globalSnap = await globalRef.get();

        if (globalSnap.exists) {
          globalInfluencer = { id: globalSnap.id, ...globalSnap.data() };
          console.log(`✓ Found global influencer: ${globalInfluencer.displayName}`);
        }
      }
    } catch (error) {
      console.log('Not found as user_collection, trying global_influencers...');
    }

    // 2. If not found in user_collections, try global_influencers directly
    if (!globalInfluencer) {
      try {
        const globalRef = db.collection('global_influencers').doc(profileId);
        const globalSnap = await globalRef.get();

        if (globalSnap.exists) {
          globalInfluencer = { id: globalSnap.id, ...globalSnap.data() };
          console.log(`✓ Found global influencer directly: ${globalInfluencer.displayName}`);
        }
      } catch (error) {
        console.log('Not found in global_influencers either');
      }
    }

    // 3. Profile not found in any collection
    if (!globalInfluencer) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Continue with legacy detailed data and posts fetch for backward compatibility
    let detailedData: any = null;
    let posts: any[] = [];

    // 4. Fetch detailed data (analytics, demographics, etc.) - legacy
    const detailedDataRef = db.collection('influencer_detailed_data').doc(profileId);
    const detailedDataSnap = await detailedDataRef.get();
    detailedData = detailedDataSnap.exists ? detailedDataSnap.data() : null;
    console.log(`✓ Detailed data: ${detailedData ? 'Found' : 'Not available'}`);

    // 5. Fetch content posts - legacy
    const postsQuery = db.collection('content_posts')
      .where('profileId', '==', profileId)
      .orderBy('postedAt', 'desc')
      .limit(postsLimit);

    const postsSnap = await postsQuery.get();
    console.log(`✓ Found ${postsSnap.size} content posts`);

    posts = postsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        postedAt: data.postedAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
      };
    });

    // 6. Combine all data into complete profile
    // Use new architecture data if available, fallback to legacy
    let completeProfile: any;

    if (globalInfluencer) {
      // NEW ARCHITECTURE: Map global_influencer data to UnifiedProfile format
      completeProfile = {
        // Basic profile info from global_influencer
        id: profileId,
        userId: userCollection?.userId || authResult.userId,
        displayName: globalInfluencer.displayName,
        bio: globalInfluencer.bio || '',
        location: globalInfluencer.location?.city || globalInfluencer.location?.country || 'Unknown',
        flag: globalInfluencer.location?.countryCode || '',
        categories: globalInfluencer.categories || [],
        avatarUrl: globalInfluencer.avatarUrl || '',
        status: userCollection?.status || 'active',

        // Custom user data from user_collection (if exists)
        ...(userCollection && {
          customDisplayName: userCollection.customDisplayName,
          customCategories: userCollection.customCategories,
          notes: userCollection.notes,
          lists: userCollection.lists,
          starred: userCollection.starred,
          collaborationStatus: userCollection.collaborationStatus,
          enrichmentStatus: userCollection.enrichmentStatus,
        }),

        // Raw enrichment data (if available)
        ...(globalInfluencer.instagramEnrichment?.rawData && {
          rawEnrichmentData: globalInfluencer.instagramEnrichment.rawData,
        }),

        // Linked accounts from platforms array
        linkedAccounts: (globalInfluencer.platforms || []).map((platform: any) => ({
          id: `${platform.platform}-${platform.username}`,
          platform: platform.platform,
          username: platform.username,
          displayName: globalInfluencer.displayName,
          followerCount: platform.followerCount,
          profileUrl: platform.profileUrl || '',
          avatarUrl: globalInfluencer.avatarUrl || '',
          verified: platform.verified || false,
          linkedAt: globalInfluencer.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          lastSyncedAt: globalInfluencer.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        })),

        // Combined metrics
        combinedMetrics: {
          totalFollowers: globalInfluencer.totalFollowers || 0,
          averageEngagementRate: globalInfluencer.averageEngagementRate || 0,
          totalReach: globalInfluencer.totalFollowers || 0,
          totalEngagements: 0,
          followersByPlatform: (globalInfluencer.platforms || []).map((platform: any) => ({
            platform: platform.platform,
            count: platform.followerCount,
            percentage: globalInfluencer.totalFollowers > 0
              ? (platform.followerCount / globalInfluencer.totalFollowers) * 100
              : 0,
          })),
        },

        // Scores and insights
        influenceScore: globalInfluencer.influenceScore || 75,
        estimatedPrice: globalInfluencer.estimatedPrice || { min: 0, max: 0, currency: 'USD' },
        mainTopics: globalInfluencer.topics || [],
        brandSafety: detailedData?.brandSafety,
        audienceAgeGroup: detailedData?.audienceAgeGroup,
        audienceAuthenticity: detailedData?.audienceAuthenticity,
        audienceLocation: detailedData?.audienceLocation || [],
        portfolio: detailedData?.portfolio || [],

        // Instagram enrichment data (if available)
        ...(globalInfluencer.instagramEnrichment?.hasEnrichment && {
          engagementRate: globalInfluencer.instagramEnrichment.engagementRate,
          platformMetrics: [{
            platform: 'instagram',
            avgLikes: globalInfluencer.instagramEnrichment.avgLikes,
            avgComments: globalInfluencer.instagramEnrichment.avgComments,
            engagementRate: globalInfluencer.instagramEnrichment.engagementRate,
            postingFrequency: globalInfluencer.instagramEnrichment.postingFrequency,
          }],
        }),

        // Content posts
        contentPosts: posts,

        // Timestamps
        createdAt: globalInfluencer.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: globalInfluencer.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
        ...(userCollection?.addedAt && {
          addedToCollectionAt: userCollection.addedAt?.toDate()?.toISOString(),
        }),
      };
    }

    return NextResponse.json({
      success: true,
      profile: completeProfile
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);

    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { error: 'Permission denied. Check Firestore security rules.' },
        { status: 403 }
      );
    }

    if (error.code === 'failed-precondition') {
      return NextResponse.json(
        {
          error: 'Index required for content_posts query.',
          hint: 'Check console for Firestore index creation link.',
          indexUrl: error.message.match(/https:\/\/[^\s]+/)?.[0],
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch profile',
        code: error.code
      },
      { status: 500 }
    );
  }
}
