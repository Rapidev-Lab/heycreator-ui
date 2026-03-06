import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

/**
 * GET /api/users/[id]
 * Fetch user data including Instagram token data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = params.id;

      // Users can only fetch their own data (unless admin in future)
      if (decodedToken.uid !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: You can only access your own user data',
          },
          { status: 403 }
        );
      }

      const adminDb = getAdminDb();
      const userDoc = await adminDb.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // Convert Firestore Timestamps to ISO strings for JSON serialization
      const sanitizedData = {
        ...userData,
        createdAt: userData?.createdAt?.toDate?.()?.toISOString(),
        lastLoginAt: userData?.lastLoginAt?.toDate?.()?.toISOString(),
        updatedAt: userData?.updatedAt?.toDate?.()?.toISOString(),
        instagramTokenData: userData?.instagramTokenData
          ? {
              ...userData.instagramTokenData,
              expiresAt: userData.instagramTokenData.expiresAt?.toDate?.()?.toISOString(),
              createdAt: userData.instagramTokenData.createdAt?.toDate?.()?.toISOString(),
              lastRefreshedAt: userData.instagramTokenData.lastRefreshedAt?.toDate?.()?.toISOString(),
            }
          : null,
      };

      return NextResponse.json({
        success: true,
        data: sanitizedData,
      });
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to fetch user data',
        },
        { status: 500 }
      );
    }
  });
}
