import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Mark as API route (not a page)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Update User Email API
 *
 * Updates the email address for users who signed up with Instagram
 * (since Instagram doesn't provide email)
 */

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Get userId from auth header (temporary - should use Firebase Auth token)
    // In production, verify the Firebase ID token here
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Update email in Firebase Auth
    await adminAuth.updateUser(userId, {
      email,
      emailVerified: false, // Email needs to be verified
    });

    // Send verification email
    const verificationLink = await adminAuth.generateEmailVerificationLink(email);

    // Update email in Firestore user document
    await adminDb.collection('users').doc(userId).update({
      email,
      emailVerified: false,
      updatedAt: Timestamp.now(),
    });

    console.log('Email updated successfully for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      verificationLink, // You might want to send this via email instead
    });

  } catch (error: any) {
    console.error('Email update error:', error);

    // Handle specific errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { success: false, error: 'This email is already in use by another account' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update email'
      },
      { status: 500 }
    );
  }
}
