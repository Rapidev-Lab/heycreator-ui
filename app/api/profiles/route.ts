/**
 * API routes for profile operations.
 * POST /api/profiles - Create a new profile (saves to global_influencers + user_collections)
 * GET /api/profiles - Get all profiles for current user (from user_collections + global_influencers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { CreateUnifiedProfileRequest } from '@/types/aggregator';
import { requireAuth } from '@/lib/firebase/auth-server';
import * as admin from 'firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';
import { profileCoallator } from '@/lib/services/profile-coallator.service';

// Force dynamic rendering because we use request.headers for auth
export const dynamic = 'force-dynamic';

/**
 * POST /api/profiles
 * Create a new unified profile from selected search result profiles.
 * Saves to Firestore for persistence.
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 * - x-user-id: (Fallback for development only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and get user ID
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Return 401 error response
    }
    const { userId } = authResult;

    const body = await request.json();
    const { selectedProfiles, displayName, bio, location, categories, avatarUrl } =
      body as CreateUnifiedProfileRequest;

    // Validate required fields
    if (!selectedProfiles || !Array.isArray(selectedProfiles) || selectedProfiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one profile must be selected to create a unified profile',
        },
        { status: 400 }
      );
    }

    // Validate each selected profile has required fields
    for (const profile of selectedProfiles) {
      if (!profile.platform || !profile.username) {
        return NextResponse.json(
          {
            success: false,
            error: 'Each selected profile must have platform and username',
          },
          { status: 400 }
        );
      }
    }

    // Get Admin DB (bypasses Firestore security rules)
    const db = getAdminDb();

    // Create a unique key for the primary account (for deduplication)
    const primaryProfile = selectedProfiles[0];
    const primaryAccountKey = `${primaryProfile.platform}:${primaryProfile.username.toLowerCase()}`;

    // Atomic dedup using Firestore transaction + deterministic lock document.
    // A query-based check is NOT atomic — two concurrent requests can both pass it.
    // Instead, we use a deterministic doc ID so transaction.get() acquires a lock.
    const dedupDocId = `${userId}__${primaryAccountKey}`.replace(/[\/\\]/g, '_');
    const dedupRef = db.collection('profile_dedup_locks').doc(dedupDocId);

    const txResult = await db.runTransaction(async (transaction) => {
      const dedupDoc = await transaction.get(dedupRef);

      if (dedupDoc.exists) {
        // Profile already reserved by a previous request
        return { alreadyExists: true, profileId: dedupDoc.data()!.profileId as string };
      }

      // Reserve a new profile ID atomically
      const newProfileId = db.collection('global_influencers').doc().id;
      transaction.set(dedupRef, {
        profileId: newProfileId,
        userId,
        primaryAccountKey,
        createdAt: admin.firestore.Timestamp.now(),
      });

      return { alreadyExists: false, profileId: newProfileId };
    });

    if (txResult.alreadyExists) {
      // Return the existing profile
      const existingDoc = await db.collection('global_influencers').doc(txResult.profileId).get();
      if (existingDoc.exists) {
        const existingData = existingDoc.data();
        console.log('✓ Profile already exists, returning existing profile:', existingDoc.id);
        return NextResponse.json({
          success: true,
          message: 'Profile already exists',
          data: { id: existingDoc.id, ...existingData },
        });
      }
      // Edge case: lock exists but profile was deleted — remove stale lock and proceed
      await dedupRef.delete();
    }

    const profileId = txResult.profileId;
    console.log('✓ Creating new profile with ID:', profileId);

    // ⚡ USE PROFILECOALLATOR for intelligent profile merging
    console.log(`✓ Coallating ${selectedProfiles.length} platform accounts...`);
    const coallatedProfile = await profileCoallator.coallateProfiles(selectedProfiles, {
      userId,
      forceNewProfile: false,
    });

    console.log('✓ ProfileCoallator completed:');
    console.log(`  - Total followers: ${coallatedProfile.combinedMetrics.totalFollowers.toLocaleString()}`);
    console.log(`  - Influence score: ${coallatedProfile.influenceScore}`);
    console.log(`  - Categories: ${coallatedProfile.categories.join(', ') || 'None'}`);
    console.log(`  - Estimated price: ${coallatedProfile.estimatedPrice}`);

    // Override with custom fields if provided
    const finalProfile = {
      ...coallatedProfile,
      id: profileId, // Use generated Firestore ID
      userId,
      primaryAccountKey, // For deduplication: "platform:username"
      displayName: displayName || coallatedProfile.displayName,
      bio: bio || coallatedProfile.bio,
      location: location || coallatedProfile.location || '',
      categories: categories && categories.length > 0 ? categories : coallatedProfile.categories,
      avatarUrl: avatarUrl || coallatedProfile.avatarUrl || '',
      // Additional fields not in coallator (for backwards compatibility)
      flag: '',
      mainTopics: [],
      brandSafety: 'Safe',
      audienceAgeGroup: '',
      audienceAuthenticity: 'Good',
      audienceLocation: [],
      portfolio: [],
      sponsoredContentFrequency: '',
    };

    // =========================================================================
    // ATOMIC BATCH WRITE: global_influencers + user_collections
    // All-or-nothing — if any write fails, none are committed.
    // =========================================================================
    const now = admin.firestore.Timestamp.now();
    const primaryAccount = finalProfile.linkedAccounts[0];
    const primaryPlatform = primaryAccount?.platform || 'instagram';
    const primaryUsername = primaryAccount?.username || '';

    // Convert linkedAccounts to Firestore Timestamps
    const linkedAccountsWithTimestamps = finalProfile.linkedAccounts.map(account => ({
      ...account,
      linkedAt: now,
      lastSyncedAt: now,
    }));

    // Single source of truth: global_influencers holds ALL profile data
    const globalInfluencerData = {
      // Discovery fields (searchable/filterable)
      displayName: finalProfile.displayName,
      primaryUsername,
      bio: finalProfile.bio || '',
      avatarUrl: finalProfile.avatarUrl || '',
      verified: primaryAccount?.verified || false,
      platforms: finalProfile.linkedAccounts.map((acc: any) => ({
        platform: acc.platform,
        username: acc.username,
        followerCount: acc.followerCount || 0,
        followingCount: 0,
        verified: acc.verified || false,
        profileUrl: acc.profileUrl || `https://${acc.platform}.com/${acc.username}`,
        lastUpdated: now,
      })),
      totalFollowers: finalProfile.combinedMetrics?.totalFollowers || 0,
      averageEngagementRate: finalProfile.combinedMetrics?.averageEngagementRate || 0,
      totalReach: finalProfile.combinedMetrics?.totalReach || 0,
      primaryPlatform,
      location: { country: '', city: '' },
      categories: finalProfile.categories || [],
      topics: finalProfile.categories || [],
      addedToCollectionCount: 1,
      viewCount: 0,
      searchKeywords: [
        finalProfile.displayName?.toLowerCase(),
        primaryUsername?.toLowerCase(),
        ...(finalProfile.categories || []).map((c: string) => c.toLowerCase()),
      ].filter(Boolean),
      createdAt: now,
      updatedAt: now,

      // Consolidated from unified_profiles
      linkedAccounts: linkedAccountsWithTimestamps,
      combinedMetrics: finalProfile.combinedMetrics,
      influenceScore: finalProfile.influenceScore,
      estimatedPrice: finalProfile.estimatedPrice,
      userId,
      primaryAccountKey,

      // Backward-compat fields
      flag: finalProfile.flag || '',
      mainTopics: finalProfile.mainTopics || [],
      brandSafety: finalProfile.brandSafety || 'Safe',
      audienceAgeGroup: finalProfile.audienceAgeGroup || '',
      audienceAuthenticity: finalProfile.audienceAuthenticity || 'Good',
      audienceLocation: finalProfile.audienceLocation || [],
      portfolio: finalProfile.portfolio || [],
      sponsoredContentFrequency: finalProfile.sponsoredContentFrequency || '',
    };

    const userCollectionData = {
      userId,
      globalInfluencerId: profileId,
      profileStatus: 'active' as const,
      customCategories: [],
      notes: '',
      lists: [],
      starred: false,
      collaborationStatus: 'none',
      enrichmentStatus: 'none',
      addedAt: now,
      lastViewedAt: now,
      updatedAt: now,
    };

    // Dedup check for user_collections (must run before batch)
    const existingCollection = await db.collection('user_collections')
      .where('userId', '==', userId)
      .where('globalInfluencerId', '==', profileId)
      .limit(1)
      .get();

    const batch = db.batch();
    batch.set(db.collection('global_influencers').doc(profileId), globalInfluencerData);
    if (existingCollection.empty) {
      batch.set(db.collection('user_collections').doc(), userCollectionData);
    }
    await batch.commit();

    console.log(`✓ Created global_influencers + user_collections: ${profileId}`);

    // Return the created profile (convert Timestamps to ISO strings)
    const responseProfile = {
      ...globalInfluencerData,
      id: profileId,
      createdAt: globalInfluencerData.createdAt.toDate().toISOString(),
      updatedAt: globalInfluencerData.updatedAt.toDate().toISOString(),
      linkedAccounts: linkedAccountsWithTimestamps.map(account => ({
        ...account,
        linkedAt: account.linkedAt.toDate().toISOString(),
        lastSyncedAt: account.lastSyncedAt.toDate().toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseProfile,
    });

  } catch (error: unknown) {
    console.error('Create Profile Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profiles
 * Get all profiles for current user.
 * Queries user_collections → batch-fetches global_influencers.
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 * - x-user-id: (Fallback for development only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get user ID
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Return 401 error response
    }
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);

    // Get Admin DB (bypasses Firestore security rules)
    const db = getAdminDb();

    // Parse filter parameters
    const statusFilter = searchParams.get('status') || 'active';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Step 1: Query user_collections for this user
    const ucQuery = db.collection('user_collections')
      .where('userId', '==', userId)
      .orderBy('updatedAt', sortOrder);

    const ucSnapshot = await ucQuery.get();

    // Filter by profileStatus (default 'active')
    const ucDocs = ucSnapshot.docs.filter(doc => {
      const data = doc.data();
      return (data.profileStatus || 'active') === statusFilter;
    });

    if (ucDocs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Step 2: Batch-fetch global_influencers by IDs
    const globalIds = ucDocs.map(d => d.data().globalInfluencerId).filter(Boolean);
    const profileMap = new Map<string, any>();

    // Firestore 'in' query supports max 30 values per query
    for (let i = 0; i < globalIds.length; i += 30) {
      const batchIds = globalIds.slice(i, i + 30);
      const snap = await db.collection('global_influencers')
        .where(FieldPath.documentId(), 'in', batchIds)
        .get();
      snap.docs.forEach(doc => profileMap.set(doc.id, doc.data()));
    }

    // Step 3: Merge user_collections metadata with global profile data
    const profiles = ucDocs.map(ucDoc => {
      const uc = ucDoc.data();
      const global = profileMap.get(uc.globalInfluencerId);
      if (!global) return null;

      return {
        id: uc.globalInfluencerId,
        ...global,
        status: uc.profileStatus || 'active',
        createdAt: global.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: global.updatedAt?.toDate?.()?.toISOString() || null,
        linkedAccounts: global.linkedAccounts?.map((account: any) => ({
          ...account,
          linkedAt: account.linkedAt?.toDate?.()?.toISOString() || null,
          lastSyncedAt: account.lastSyncedAt?.toDate?.()?.toISOString() || null,
        })),
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: profiles,
      count: profiles.length,
    });

  } catch (error: unknown) {
    console.error('Get Profiles Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
