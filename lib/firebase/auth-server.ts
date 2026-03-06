import { NextRequest } from 'next/server';
import { getAdminAuth } from './admin';

/**
 * Server-side authentication utilities for API routes
 * These functions use Firebase Admin SDK to verify tokens
 */

export interface AuthResult {
  success: boolean;
  uid?: string;
  error?: string;
}

/**
 * Verify Firebase ID token from request headers
 * Extracts token from Authorization header and verifies it
 *
 * @param request - Next.js request object
 * @returns AuthResult with uid if successful, error if failed
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Get Authorization header
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      return {
        success: false,
        error: 'No authorization header provided'
      };
    }

    // Check if it's a Bearer token
    if (!authorization.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Invalid authorization format. Expected: Bearer <token>'
      };
    }

    // Extract the token
    const idToken = authorization.split('Bearer ')[1];

    if (!idToken) {
      return {
        success: false,
        error: 'No token provided'
      };
    }

    try {
      // Verify the token with Firebase Admin (lazy initialized)
      const adminAuth = getAdminAuth();
      const decodedToken = await adminAuth.verifyIdToken(idToken);

      return {
        success: true,
        uid: decodedToken.uid
      };
    } catch (adminError) {
      // If Firebase Admin is not configured (development), return failure
      // The getUserIdFromRequest function will fall back to x-user-id header
      console.warn('⚠️ Firebase Admin not available:', adminError instanceof Error ? adminError.message : 'Unknown error');

      return {
        success: false,
        error: 'Firebase Admin not configured'
      };
    }
  } catch (error) {
    console.error('Error verifying auth token:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify token'
    };
  }
}

/**
 * Get user ID from request headers
 * Fallback to x-user-id header for development/testing
 *
 * @param request - Next.js request object
 * @returns User ID string or null if not authenticated
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try to verify token first
  const authResult = await verifyAuthToken(request);

  if (authResult.success && authResult.uid) {
    return authResult.uid;
  }

  // Fallback to x-user-id header (for development/testing only)
  const userId = request.headers.get('x-user-id');

  if (userId) {
    console.warn('⚠️ Using x-user-id header for authentication. This should only be used in development!');
    return userId;
  }

  return null;
}

/**
 * Require authentication for an API route
 * Returns error response if not authenticated, otherwise returns user ID
 *
 * @param request - Next.js request object
 * @returns Object with userId if authenticated, or Response with error
 */
export async function requireAuth(request: NextRequest): Promise<{ userId: string } | Response> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized. Please provide a valid authentication token.'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return { userId };
}
