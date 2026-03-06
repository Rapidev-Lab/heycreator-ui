import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/influencer/my-profile
 *
 * Resolves the authenticated influencer's global_influencers document ID
 * by matching linkedAccounts usernames against primaryAccountKey.
 *
 * Returns:
 * - globalInfluencerIds: string[] of matched global_influencers doc IDs
 * - primaryGlobalId: first matched ID (or null)
 * - hasEnrichment: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { userId } = authResult;

    const db = getAdminDb();

    // Step 1: Get user doc to find influencerProfileId
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;
    const profileId = userData.influencerProfileId;

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'No influencer profile found' },
        { status: 404 }
      );
    }

    // Step 2: Read influencer_profiles doc
    const profileDoc = await db.collection('influencer_profiles').doc(profileId).get();
    if (!profileDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Influencer profile not found' },
        { status: 404 }
      );
    }

    const profileData = profileDoc.data()!;
    const linkedAccounts: any[] = profileData.linkedAccounts || [];

    // Check if we already have cached globalInfluencerIds
    if (profileData.globalInfluencerIds && profileData.globalInfluencerIds.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          globalInfluencerIds: profileData.globalInfluencerIds,
          primaryGlobalId: profileData.globalInfluencerIds[0],
          hasEnrichment: true,
        },
      });
    }

    if (linkedAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          globalInfluencerIds: [],
          primaryGlobalId: null,
          hasEnrichment: false,
        },
      });
    }

    // Step 3: For each linked account, query global_influencers
    const globalIds: string[] = [];

    for (const account of linkedAccounts) {
      const platform = (account.platform || '').toLowerCase();
      const username = (account.username || '').toLowerCase();
      if (!platform || !username) continue;

      const key = `${platform}:${username}`;
      const snapshot = await db
        .collection('global_influencers')
        .where('primaryAccountKey', '==', key)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        globalIds.push(snapshot.docs[0].id);
      }
    }

    // Step 4: Cache the result back to influencer_profiles
    if (globalIds.length > 0) {
      await db.collection('influencer_profiles').doc(profileId).update({
        globalInfluencerIds: globalIds,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        globalInfluencerIds: globalIds,
        primaryGlobalId: globalIds[0] || null,
        hasEnrichment: globalIds.length > 0,
      },
    });
  } catch (error) {
    console.error('[MY-PROFILE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/influencer/my-profile
 *
 * Updates the influencer's settings (profile info, payment, linked accounts).
 * Replaces direct Firestore writes from the client.
 *
 * Request body: SettingsFormData
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const {
      displayName,
      phoneNumber,
      bio,
      location,
      website,
      categories,
      relevantTags,
      mentionsBrands,
      relevantLocations,
      influenceSize,
      avatarUrl,
      paymentDetails,
      linkedAccounts,
    } = body;

    console.log('[MY-PROFILE PUT] Received linkedAccounts:', JSON.stringify(linkedAccounts));

    if (!displayName || !displayName.trim()) {
      return NextResponse.json(
        { success: false, error: 'displayName is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Update users collection
    const userUpdate: Record<string, any> = {
      displayName: displayName.trim(),
      phoneNumber: phoneNumber || null,
      updatedAt: now,
    };
    if (avatarUrl !== undefined) {
      userUpdate.photoURL = avatarUrl || null;
    }
    await db.collection('users').doc(userId).update(userUpdate);

    // Update influencer_profiles collection
    const userDoc = await db.collection('users').doc(userId).get();
    const profileId = userDoc.data()?.influencerProfileId;

    if (profileId) {
      const linkedAccountsToWrite = linkedAccounts || [];
      console.log('[MY-PROFILE PUT] Writing to influencer_profiles:', profileId, 'linkedAccounts count:', linkedAccountsToWrite.length);
      const profileUpdate: Record<string, any> = {
        displayName: displayName.trim(),
        bio: bio || '',
        location: location || '',
        website: website || '',
        categories: categories || [],
        relevantTags: relevantTags || [],
        mentionsBrands: mentionsBrands || [],
        relevantLocations: relevantLocations || [],
        influenceSize: influenceSize || [],
        paymentDetails: paymentDetails || {},
        linkedAccounts: linkedAccountsToWrite,
        updatedAt: now,
      };
      if (avatarUrl !== undefined) {
        profileUpdate.avatarUrl = avatarUrl || '';
      }
      await db.collection('influencer_profiles').doc(profileId).update(profileUpdate);
      console.log('[MY-PROFILE PUT] Write successful');
    } else {
      console.warn('[MY-PROFILE PUT] No profileId found, skipping influencer_profiles update');
    }

    return NextResponse.json({
      success: true,
      data: { profileId },
    });
  } catch (error) {
    console.error('[MY-PROFILE PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
