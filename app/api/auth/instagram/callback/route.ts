import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import {
  InstagramBusinessAccount,
  InstagramTokenData,
  InstagramOAuthResponse,
} from "@/types/firebase";

/**
 * Instagram OAuth Callback Handler
 *
 * This endpoint handles the OAuth callback from Instagram Business Login.
 * It exchanges the authorization code for access tokens and creates/updates
 * the user in Firebase.
 *
 * Flow:
 * 1. Receive authorization code from Instagram
 * 2. Exchange code for short-lived access token
 * 3. Exchange short-lived token for long-lived token (60 days)
 * 4. Fetch Instagram Business Account data
 * 5. Create or update Firebase user
 * 6. Return custom Firebase token + Instagram data
 */

export async function POST(req: NextRequest) {
  try {
    const { code, state } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Mock mode: return mock auth data without calling Instagram APIs
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      const mockInstagramData: InstagramBusinessAccount = {
        id: 'mock_ig_12345',
        username: 'mock_creator',
        name: 'Mock Creator',
        profile_picture_url: '',
        followers_count: 25000,
        follows_count: 500,
        media_count: 150,
        biography: 'Mock Instagram profile for UI testing',
        website: 'https://heycreator.com',
      };

      const adminDb = getAdminDb();
      const adminAuth = getAdminAuth();

      // Create or find mock user in MockFirestore
      const existingSnapshot = await adminDb
        .collection('users')
        .where('instagramTokenData.instagramUserId', '==', mockInstagramData.id)
        .limit(1)
        .get();

      let uid: string;
      let isNewUser: boolean;

      if (!existingSnapshot.empty) {
        uid = existingSnapshot.docs[0].id;
        isNewUser = false;
      } else {
        uid = `mock_uid_${Date.now()}`;
        isNewUser = true;
        await adminDb.collection('users').doc(uid).set({
          uid,
          email: `${mockInstagramData.username}@instagram.heycreator.com`,
          role: 'influencer',
          displayName: mockInstagramData.name,
          authProviders: ['instagram'],
          instagramTokenData: {
            accessToken: 'mock_token_xyz',
            tokenType: 'bearer',
            expiresAt: Timestamp.fromMillis(Date.now() + 60 * 24 * 60 * 60 * 1000),
            instagramUserId: mockInstagramData.id,
            username: mockInstagramData.username,
            scopes: [],
            createdAt: Timestamp.now(),
          },
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          isActive: true,
          isSuspended: false,
        });
      }

      const customToken = `mock_firebase_token_${uid}`;

      const response: InstagramOAuthResponse = {
        customToken,
        instagramData: mockInstagramData,
        isNewUser,
      };

      return NextResponse.json({ success: true, data: response });
    }

    // Validate environment variables
    // Use server-only vars if available, fallback to public vars for backwards compatibility
    const appId =
      process.env.INSTAGRAM_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const appSecret =
      process.env.INSTAGRAM_APP_SECRET ||
      process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET;
    const redirectUri =
      process.env.INSTAGRAM_REDIRECT_URI ||
      process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    console.log("=== Instagram Callback Debug ===");
    console.log("Environment Variables Check:");
    console.log(
      "  - INSTAGRAM_APP_ID:",
      process.env.INSTAGRAM_APP_ID ? "✅ Set" : "❌ Not set"
    );
    console.log(
      "  - NEXT_PUBLIC_INSTAGRAM_APP_ID:",
      process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ? "✅ Set" : "❌ Not set"
    );
    console.log(
      "  - INSTAGRAM_REDIRECT_URI:",
      process.env.INSTAGRAM_REDIRECT_URI ? "✅ Set" : "❌ Not set"
    );
    console.log(
      "  - NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI:",
      process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ? "✅ Set" : "❌ Not set"
    );
    console.log("Using:");
    console.log("  - App ID:", appId);
    console.log("  - Redirect URI:", redirectUri);
    console.log("  - Code received:", code?.substring(0, 20) + "...");

    if (!appId || !appSecret || !redirectUri) {
      console.error("Missing Instagram OAuth configuration");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Step 1: Exchange authorization code for short-lived access token
    console.log("Exchanging authorization code for access token...");

    const body = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      `https://api.instagram.com/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // body: new URLSearchParams(tokenParams),
        body,
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.error_message || "Failed to exchange authorization code",
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log({ tokenData });
    // ---- STEP 1: Extract short-lived token ----
    console.log(
      "🔵 Raw tokenData received:",
      JSON.stringify(tokenData, null, 2)
    );

    const { access_token: shortLivedToken, user_id: instagramUserId } =
      tokenData;

    console.log("✅ Short-lived token obtained");
    console.log("   Instagram User ID:", instagramUserId);
    console.log("   Token preview:", shortLivedToken?.slice(0, 10), "...");

    if (!shortLivedToken || !instagramUserId) {
      console.error("❌ Missing short-lived token or user ID");
      return NextResponse.json(
        { success: false, error: "Invalid token response from Instagram" },
        { status: 400 }
      );
    }

    // ---- STEP 2: Exchange for long-lived token ----
    console.log("🔵 Exchanging short-lived token for long-lived token...");
    console.log("   Client Secret present:", Boolean(appSecret));

    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type: "ig_exchange_token",
          client_secret: appSecret,
          access_token: shortLivedToken,
        }),
      { method: "GET" }
    );

    console.log(
      "🔵 Long-lived token response status:",
      longLivedTokenResponse.status
    );

    const longLivedTokenRaw = await longLivedTokenResponse.json();
    console.log(
      "🔵 Long-lived token raw response:",
      JSON.stringify(longLivedTokenRaw, null, 2)
    );

    if (!longLivedTokenResponse.ok) {
      console.error("❌ Long-lived token exchange failed");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to get long-lived token",
          details: longLivedTokenRaw,
        },
        { status: 400 }
      );
    }

    const { access_token: longLivedToken, expires_in } = longLivedTokenRaw;

    console.log("✅ Long-lived token obtained");
    console.log("   Expires in (seconds):", expires_in);
    console.log("   Token preview:", longLivedToken?.slice(0, 10), "...");

    // ---- STEP 3: Fetch Instagram Business Account Profile ----
    console.log("🔵 Fetching Instagram profile data...");
    console.log("   Using Instagram User ID:", instagramUserId);

    const profileUrl =
      `https://graph.instagram.com/me?` +
      new URLSearchParams({
        fields:
          "id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website",
        access_token: longLivedToken,
      });

    console.log("🔵 Profile request URL:", profileUrl);

    const profileResponse = await fetch(profileUrl, { method: "GET" });

    console.log("🔵 Profile response status:", profileResponse.status);

    const profileRaw = await profileResponse.json();
    console.log(
      "🔵 Raw profile response:",
      JSON.stringify(profileRaw, null, 2)
    );

    if (!profileResponse.ok) {
      console.error("❌ Failed to fetch Instagram profile");
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch Instagram profile data",
          details: profileRaw,
        },
        { status: 400 }
      );
    }

    const instagramData: InstagramBusinessAccount = profileRaw;

    console.log("✅ Instagram profile fetched");
    console.log("   Username:", instagramData.username);
    console.log("   Followers:", instagramData.followers_count);

    // ---- STEP 4: Calculate token expiration ----
    const expiresAt = Timestamp.fromMillis(Date.now() + expires_in * 1000);

    console.log(
      "🔵 Token expiration timestamp:",
      expiresAt.toDate().toISOString()
    );

    // ---- STEP 5: Create or update Firebase user ----
    console.log("🔵 Creating or updating Firebase user...");

    const { uid, isNewUser } = await createOrUpdateInstagramUser(
      instagramData,
      {
        accessToken: longLivedToken,
        tokenType: "bearer",
        expiresAt,
        instagramUserId: instagramData.id,
        username: instagramData.username,
        scopes: tokenData.permissions ?? [],
        createdAt: Timestamp.now(),
      }
    );

    console.log("✅ Firebase user processed");
    console.log("   UID:", uid);
    console.log("   New user:", isNewUser);

    // ---- STEP 6: Create Firebase custom token ----
    console.log("🔵 Creating Firebase custom auth token...");

    const customToken = await getAdminAuth().createCustomToken(uid);

    console.log("✅ Custom Firebase token generated");

    // ---- STEP 7: Final response ----
    const response: InstagramOAuthResponse = {
      customToken,
      instagramData,
      isNewUser,
    };

    console.log("🎉 Instagram OAuth flow completed successfully");

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Instagram OAuth callback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Create or update user with Instagram authentication
 * Returns the Firebase UID and whether this is a new user
 */
async function createOrUpdateInstagramUser(
  instagramData: InstagramBusinessAccount,
  tokenData: InstagramTokenData
): Promise<{ uid: string; isNewUser: boolean }> {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    // Check if user already exists with this Instagram ID
    const usersSnapshot = await adminDb
      .collection("users")
      .where("instagramTokenData.instagramUserId", "==", instagramData.id)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      // Existing user - update token data
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;

      console.log("Existing user found:", uid);

      // Update Instagram token data
      await adminDb.collection("users").doc(uid).update({
        instagramTokenData: tokenData,
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update influencer profile with Instagram data
      const userData = userDoc.data();
      if (userData.influencerProfileId) {
        await updateInfluencerProfileWithInstagram(
          userData.influencerProfileId,
          instagramData
        );
      }

      return { uid, isNewUser: false };
    }

    // New user - create Firebase Auth user and Firestore documents
    console.log("Creating new user with Instagram authentication...");

    // Create a unique email using Instagram username
    const email = `${instagramData.username}@instagram.heycreator.com`;
    const displayName = instagramData.name || instagramData.username;

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      displayName,
      photoURL: instagramData.profile_picture_url,
      emailVerified: true, // Instagram login bypasses email verification
    });

    const uid = userRecord.uid;

    // Create influencer profile
    const influencerProfileId = adminDb
      .collection("influencer_profiles")
      .doc().id;

    await adminDb
      .collection("influencer_profiles")
      .doc(influencerProfileId)
      .set({
        id: influencerProfileId,
        userId: uid,
        displayName,
        bio: instagramData.biography || "",
        website: instagramData.website || "",
        linkedAccounts: [
          {
            platform: "instagram",
            username: instagramData.username,
            profileUrl: `https://instagram.com/${instagramData.username}`,
            followerCount: instagramData.followers_count || 0,
            isVerified: true,
            verificationStatus: "verified",
            connectedAt: Timestamp.now(),
            lastSyncedAt: Timestamp.now(),
          },
        ],
        primaryPlatform: "instagram",
        avatarUrl: instagramData.profile_picture_url || "",
        totalFollowers: instagramData.followers_count || 0,
        isVerified: false,
        isPublic: true,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    // Create user document with Instagram token data
    await adminDb
      .collection("users")
      .doc(uid)
      .set({
        uid,
        email,
        role: "influencer",
        displayName,
        photoURL: instagramData.profile_picture_url || "",
        emailVerified: true,
        authProviders: ["instagram"],
        influencerProfileId,
        instagramTokenData: tokenData,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        isSuspended: false,
      });

    console.log("New user created successfully:", uid);

    return { uid, isNewUser: true };
  } catch (error) {
    console.error("Error creating/updating Instagram user:", error);
    throw error;
  }
}

/**
 * Update influencer profile with latest Instagram data
 */
async function updateInfluencerProfileWithInstagram(
  profileId: string,
  instagramData: InstagramBusinessAccount
): Promise<void> {
  try {
    const adminDb = getAdminDb();
    const profileRef = adminDb.collection("influencer_profiles").doc(profileId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      console.error("Influencer profile not found:", profileId);
      return;
    }

    const profileData = profileDoc.data();
    const linkedAccounts = profileData?.linkedAccounts || [];

    // Find existing Instagram account
    const instagramAccountIndex = linkedAccounts.findIndex(
      (account: any) => account.platform === "instagram"
    );

    if (instagramAccountIndex >= 0) {
      // Update existing Instagram account
      linkedAccounts[instagramAccountIndex] = {
        ...linkedAccounts[instagramAccountIndex],
        username: instagramData.username,
        profileUrl: `https://instagram.com/${instagramData.username}`,
        followerCount: instagramData.followers_count || 0,
        lastSyncedAt: Timestamp.now(),
      };
    } else {
      // Add new Instagram account
      linkedAccounts.push({
        platform: "instagram",
        username: instagramData.username,
        profileUrl: `https://instagram.com/${instagramData.username}`,
        followerCount: instagramData.followers_count || 0,
        isVerified: true,
        verificationStatus: "verified",
        connectedAt: Timestamp.now(),
        lastSyncedAt: Timestamp.now(),
      });
    }

    // Calculate total followers
    const totalFollowers = linkedAccounts.reduce(
      (sum: number, account: any) => sum + (account.followerCount || 0),
      0
    );

    // Update profile
    await profileRef.update({
      linkedAccounts,
      totalFollowers,
      avatarUrl:
        instagramData.profile_picture_url || profileData?.avatarUrl || "",
      bio: instagramData.biography || profileData?.bio || "",
      website: instagramData.website || profileData?.website || "",
      updatedAt: Timestamp.now(),
    });

    console.log("Influencer profile updated with Instagram data");
  } catch (error) {
    console.error("Error updating influencer profile:", error);
  }
}
