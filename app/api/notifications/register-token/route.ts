/**
 * FCM Token Registration API
 *
 * POST /api/notifications/register-token
 * Save an FCM token for the authenticated user
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

export async function POST(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const body = await request.json();
      const { token } = body;

      if (!token || typeof token !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 400 }
        );
      }

      // Add token to user's fcmTokens array (avoid duplicates)
      await firestore.collection('users').doc(userId).update({
        fcmTokens: FieldValue.arrayUnion(token),
      });

      return NextResponse.json({
        success: true,
        message: 'FCM token registered',
      });
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to register token' },
        { status: 500 }
      );
    }
  });
}
