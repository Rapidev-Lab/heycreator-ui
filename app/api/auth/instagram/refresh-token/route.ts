import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { InstagramTokenData } from '@/types/firebase';

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Instagram Token Refresh Handler
 *
 * This endpoint refreshes a long-lived Instagram access token.
 * Long-lived tokens are valid for 60 days and can be refreshed as long as:
 * - The token is at least 24 hours old
 * - The token has not expired
 *
 * This should be called periodically (e.g., every 30 days) to keep tokens valid.
 */

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const tokenData = userData?.instagramTokenData as InstagramTokenData | undefined;

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'No Instagram token found for this user' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const now = Date.now();
    const expiresAt = tokenData.expiresAt.toMillis();

    if (now >= expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token has expired and cannot be refreshed. User must re-authenticate.'
        },
        { status: 400 }
      );
    }

    // Check if token is at least 24 hours old
    const createdAt = tokenData.lastRefreshedAt?.toMillis() || tokenData.createdAt.toMillis();
    const tokenAge = now - createdAt;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (tokenAge < twentyFourHours) {
      const hoursUntilRefresh = Math.ceil((twentyFourHours - tokenAge) / (60 * 60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Token can only be refreshed after 24 hours. Try again in ${hoursUntilRefresh} hour(s).`
        },
        { status: 400 }
      );
    }

    // Refresh the token
    console.log('Refreshing Instagram token for user:', uid);
    console.log('Token age (hours):', Math.floor(tokenAge / (60 * 60 * 1000)));

    // Mock mode: skip external API call, generate mock refreshed token
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      const expires_in = 5184000; // 60 days in seconds
      const newExpiresAt = Timestamp.fromMillis(Date.now() + expires_in * 1000);

      const updatedTokenData: InstagramTokenData = {
        ...tokenData,
        accessToken: `mock_refreshed_token_${Date.now()}`,
        expiresAt: newExpiresAt,
        lastRefreshedAt: Timestamp.now(),
      };

      await adminDb.collection('users').doc(uid).update({
        instagramTokenData: updatedTokenData,
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json({
        success: true,
        data: {
          expiresAt: newExpiresAt.toMillis(),
          expiresIn: expires_in,
        },
      });
    }

    const refreshResponse = await fetch(
      `https://graph.instagram.com/refresh_access_token?` +
      new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: tokenData.accessToken,
      }),
      { method: 'GET' }
    );

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      console.error('Token refresh failed:', errorData);
      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || 'Failed to refresh token'
        },
        { status: 400 }
      );
    }

    const refreshData = await refreshResponse.json();
    const { access_token: newToken, expires_in } = refreshData;

    // Calculate new expiration timestamp
    const newExpiresAt = Timestamp.fromMillis(Date.now() + expires_in * 1000);

    // Update token data
    const updatedTokenData: InstagramTokenData = {
      ...tokenData,
      accessToken: newToken,
      expiresAt: newExpiresAt,
      lastRefreshedAt: Timestamp.now(),
    };

    // Save to Firestore
    await adminDb.collection('users').doc(uid).update({
      instagramTokenData: updatedTokenData,
      updatedAt: Timestamp.now(),
    });

    console.log('Token refreshed successfully, new expiration:', new Date(newExpiresAt.toMillis()));

    return NextResponse.json({
      success: true,
      data: {
        expiresAt: newExpiresAt.toMillis(),
        expiresIn: expires_in,
      },
    });

  } catch (error: any) {
    console.error('Instagram token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * Check if a user's Instagram token needs to be refreshed
 * Returns true if the token will expire in the next 7 days
 */
export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Get user document
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const tokenData = userData?.instagramTokenData as InstagramTokenData | undefined;

    if (!tokenData) {
      return NextResponse.json({
        success: true,
        data: {
          hasToken: false,
          needsRefresh: false,
        },
      });
    }

    const now = Date.now();
    const expiresAt = tokenData.expiresAt.toMillis();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    // Check if token expires in the next 7 days
    const needsRefresh = (expiresAt - now) < sevenDays;
    const isExpired = now >= expiresAt;

    return NextResponse.json({
      success: true,
      data: {
        hasToken: true,
        needsRefresh,
        isExpired,
        expiresAt,
        daysUntilExpiration: Math.floor((expiresAt - now) / (24 * 60 * 60 * 1000)),
      },
    });

  } catch (error: any) {
    console.error('Instagram token check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
