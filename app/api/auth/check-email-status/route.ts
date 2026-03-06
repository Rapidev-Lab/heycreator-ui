import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Check Email Status API Route
 *
 * This endpoint checks if an email exists in Firebase Auth and whether it's verified.
 * Used to provide better error messages when login fails.
 *
 * POST /api/auth/check-email-status
 *
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "exists": true,
 *   "emailVerified": false,
 *   "uid": "user-uid"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();

    try {
      // Try to get user by email
      const userRecord = await adminAuth.getUserByEmail(email);

      return NextResponse.json({
        success: true,
        exists: true,
        emailVerified: userRecord.emailVerified,
        uid: userRecord.uid,
      });
    } catch (error: any) {
      // If user not found, return exists: false
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({
          success: true,
          exists: false,
          emailVerified: false,
        });
      }

      // Other errors
      throw error;
    }
  } catch (error: any) {
    console.error('Error checking email status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check email status',
      },
      { status: 500 }
    );
  }
}
