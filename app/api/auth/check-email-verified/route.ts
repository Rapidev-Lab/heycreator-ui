import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API Route: Check Email Verification Status
 *
 * POST /api/auth/check-email-verified
 *
 * Request body:
 * {
 *   uid: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   emailVerified: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get Firebase Admin Auth instance
    const adminAuth = getAdminAuth();

    // Fetch user record from Firebase Auth
    const userRecord = await adminAuth.getUser(uid);

    // Return email verification status
    return NextResponse.json({
      success: true,
      emailVerified: userRecord.emailVerified,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error('Error checking email verification:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check email verification status'
      },
      { status: 500 }
    );
  }
}
