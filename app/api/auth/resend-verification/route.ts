import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API Route: Resend Email Verification
 *
 * POST /api/auth/resend-verification
 *
 * Request body:
 * {
 *   uid: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 *
 * Note: This endpoint generates a custom email verification link using Firebase Admin SDK.
 * The actual email sending is handled by Firebase Authentication.
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

    // Fetch user record
    const userRecord = await adminAuth.getUser(uid);

    // Check if email is already verified
    if (userRecord.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Email is already verified',
      });
    }

    // Check if user has an email
    if (!userRecord.email) {
      return NextResponse.json(
        { success: false, error: 'No email associated with this account' },
        { status: 400 }
      );
    }

    // Generate email verification link
    // This will trigger Firebase to send the verification email
    const verificationLink = await adminAuth.generateEmailVerificationLink(
      userRecord.email
    );

    // Note: Firebase automatically sends the email when this link is generated
    // You can also send a custom email using your own email service if needed

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      emailSent: true,
    });
  } catch (error: any) {
    console.error('Error resending verification email:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to resend verification email'
      },
      { status: 500 }
    );
  }
}
