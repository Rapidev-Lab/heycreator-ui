import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/influencer/my-profile/link-account
 *
 * Creates a global_influencers document for a linked social account
 * (if one doesn't already exist), updates the influencer profile's
 * globalInfluencerIds, and fires background enrichment.
 *
 * Request body:
 *   { platform: string, username: string }
 *
 * Returns:
 *   { success: true, globalInfluencerId: string, status: 'existing' | 'created' }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { userId } = authResult;

    const body = await request.json();
    const { platform, username } = body;

    if (!platform || !username) {
      return NextResponse.json(
        { success: false, error: 'platform and username are required' },
        { status: 400 }
      );
    }

    // Normalize
    const normalizedPlatform = platform.toLowerCase().trim();
    const normalizedUsername = username.replace(/^@/, '').toLowerCase().trim();

    if (!normalizedUsername) {
      return NextResponse.json(
        { success: false, error: 'username cannot be empty' },
        { status: 400 }
      );
    }

    const primaryAccountKey = `${normalizedPlatform}:${normalizedUsername}`;
    const db = getAdminDb();

    // Fetch the user's actual display name from users/influencer_profiles
    let userDisplayName = normalizedUsername; // fallback
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (userData?.displayName) {
      userDisplayName = userData.displayName;
    }
    // Also check influencer_profiles for a more complete name
    const profileId = userData?.influencerProfileId;
    if (profileId) {
      const profileDoc = await db.collection('influencer_profiles').doc(profileId).get();
      const profileData = profileDoc.data();
      if (profileData?.displayName) {
        userDisplayName = profileData.displayName;
      }
    }

    // Check if global_influencers doc already exists
    const existingSnapshot = await db
      .collection('global_influencers')
      .where('primaryAccountKey', '==', primaryAccountKey)
      .limit(1)
      .get();

    let globalInfluencerId: string;
    let status: 'existing' | 'created';

    if (!existingSnapshot.empty) {
      // Already exists
      globalInfluencerId = existingSnapshot.docs[0].id;
      status = 'existing';
    } else {
      // Create a minimal global_influencers doc
      // Note: serverTimestamp() cannot be used inside arrays, so use a plain Date for linkedAt
      const now = admin.firestore.FieldValue.serverTimestamp();
      const newDoc = await db.collection('global_influencers').add({
        displayName: userDisplayName,
        primaryUsername: normalizedUsername,
        primaryPlatform: normalizedPlatform,
        primaryAccountKey,
        linkedAccounts: [
          {
            platform: normalizedPlatform,
            username: normalizedUsername,
            followerCount: 0,
            linkedAt: new Date().toISOString(),
          },
        ],
        totalFollowers: 0,
        userId,
        source: 'self-linked',
        createdAt: now,
        updatedAt: now,
      });
      globalInfluencerId = newDoc.id;
      status = 'created';
    }

    // Update influencer_profiles: globalInfluencerIds + linkedAccounts entry
    // (userDoc and profileId already fetched above)

    if (profileId) {
      const profileDocForAccounts = await db.collection('influencer_profiles').doc(profileId).get();
      const profileData = profileDocForAccounts.data() || {};
      const linkedAccounts: any[] = profileData.linkedAccounts || [];

      // Update or add the linked account with globalInfluencerId
      let found = false;
      const updatedAccounts = linkedAccounts.map((acct: any) => {
        const acctPlatform = (acct.platform || '').toLowerCase();
        const acctUsername = (acct.username || '').replace(/^@/, '').toLowerCase().trim();
        if (acctPlatform === normalizedPlatform && acctUsername === normalizedUsername) {
          found = true;
          return { ...acct, globalInfluencerId, verificationStatus: 'verified' };
        }
        return acct;
      });

      if (!found) {
        updatedAccounts.push({
          platform: normalizedPlatform,
          username: normalizedUsername,
          profileUrl: '',
          followerCount: 0,
          isVerified: false,
          verificationStatus: 'verified',
          connectedAt: new Date().toISOString(),
          globalInfluencerId,
        });
      }

      await db.collection('influencer_profiles').doc(profileId).update({
        globalInfluencerIds: admin.firestore.FieldValue.arrayUnion(globalInfluencerId),
        linkedAccounts: updatedAccounts,
      });
    }

    // Fire-and-forget: trigger enrichment
    let enrichmentTriggered = false;
    try {
      const origin = request.headers.get('origin') || request.headers.get('host') || '';
      const protocol = origin.startsWith('http') ? '' : 'http://';
      const baseUrl = origin.startsWith('http') ? origin : `${protocol}${origin}`;
      const authHeader = request.headers.get('Authorization') || '';

      fetch(`${baseUrl}/api/influencer/${globalInfluencerId}/enrichment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          platform: normalizedPlatform,
          username: normalizedUsername,
        }),
      }).catch((err) => {
        console.warn('[LINK-ACCOUNT] Background enrichment failed:', err);
      });
      enrichmentTriggered = true;
    } catch {
      // Non-blocking — enrichment failure should not break the response
    }

    return NextResponse.json({
      success: true,
      data: {
        globalInfluencerId,
        status,
        enrichmentTriggered,
      },
    });
  } catch (error) {
    console.error('[LINK-ACCOUNT] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
