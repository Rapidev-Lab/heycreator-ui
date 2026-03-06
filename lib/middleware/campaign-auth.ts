import { NextRequest, NextResponse } from 'next/server';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/lib/firebase/admin';
import { headers } from 'next/headers';

type AuthenticatedFunction = (decodedToken: DecodedIdToken) => Promise<NextResponse>;

// Extended DecodedIdToken with custom claims
export interface AuthToken extends DecodedIdToken {
  userId: string;
  role?: 'brand' | 'influencer';
}

// Helper functions for consistent API responses
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function createErrorResponse(error: string, status: number = 400, code?: string) {
  const response: { success: false; error: string; code?: string } = {
    success: false,
    error,
  };
  if (code) {
    response.code = code;
  }
  return NextResponse.json(response, { status });
}

// Helper to validate required fields in request body
export function validateRequiredFields<T extends Record<string, any>>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => !body[field]);
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing.map(String) : undefined,
  };
}

// Function overloads for requireAuth
export async function requireAuth(request: NextRequest): Promise<AuthToken | NextResponse>;
export async function requireAuth(handler: AuthenticatedFunction): Promise<NextResponse>;
export async function requireAuth(
  requestOrHandler: NextRequest | AuthenticatedFunction
): Promise<AuthToken | NextResponse> {
  // If it's a NextRequest (not a function), extract and verify token
  if (typeof requestOrHandler !== 'function') {
    const request = requestOrHandler as NextRequest;
    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    try {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);
      return {
        ...decodedToken,
        userId: decodedToken.uid,
        role: decodedToken.role as 'brand' | 'influencer' | undefined,
      } as AuthToken;
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  // If it's a handler function, use the old pattern with headers()
  const handler = requestOrHandler as AuthenticatedFunction;
  const headersList = headers();
  const authorization = headersList.get('authorization');
  const userId = headersList.get('x-user-id');

  // Support Bearer token (production) or x-user-id (development fallback)
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.split('Bearer ')[1];
    try {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);
      return handler(decodedToken);
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  } else if (userId && process.env.NODE_ENV === 'development') {
    // Development fallback: use x-user-id header
    console.warn('Using x-user-id header for authentication (development only)');
    const mockToken: DecodedIdToken = {
      uid: userId,
      aud: '',
      auth_time: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
      iat: Date.now() / 1000,
      iss: '',
      sub: userId,
      firebase: {
        identities: {},
        sign_in_provider: 'custom',
      },
    };
    return handler(mockToken);
  }

  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

// Function overloads for requireBrandRole
export async function requireBrandRole(request: NextRequest): Promise<AuthToken | NextResponse>;
export async function requireBrandRole(handler: AuthenticatedFunction): Promise<NextResponse>;
export async function requireBrandRole(
  requestOrHandler: NextRequest | AuthenticatedFunction
): Promise<AuthToken | NextResponse> {
  // If it's a NextRequest (not a function), authenticate and check role
  if (typeof requestOrHandler !== 'function') {
    const auth = await requireAuth(requestOrHandler);
    if (auth instanceof NextResponse) return auth;

    // Check role from Firestore if not in token
    let userRole = auth.role;
    if (!userRole) {
      try {
        const { getAdminDb } = await import('@/lib/firebase/admin');
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(auth.uid).get();
        userRole = userDoc.data()?.role;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return NextResponse.json({ success: false, error: 'Failed to verify user role' }, { status: 500 });
      }
    }

    if (userRole !== 'brand') {
      return NextResponse.json({ success: false, error: 'Forbidden: Brand role required' }, { status: 403 });
    }

    return { ...auth, role: userRole } as AuthToken;
  }

  // If it's a handler function, use the old pattern
  const handler = requestOrHandler as AuthenticatedFunction;
  return requireAuth(async (decodedToken) => {
    // Check role from Firestore if not in token
    let userRole = decodedToken.role as 'brand' | 'influencer' | undefined;
    if (!userRole) {
      try {
        const { getAdminDb } = await import('@/lib/firebase/admin');
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        userRole = userDoc.data()?.role;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return NextResponse.json({ success: false, error: 'Failed to verify user role' }, { status: 500 });
      }
    }

    if (userRole !== 'brand') {
      return NextResponse.json({ success: false, error: 'Forbidden: Brand role required' }, { status: 403 });
    }
    return handler({ ...decodedToken, role: userRole });
  });
}

// Function overloads for requireCreatorRole
export async function requireCreatorRole(request: NextRequest): Promise<AuthToken | NextResponse>;
export async function requireCreatorRole(handler: AuthenticatedFunction): Promise<NextResponse>;
export async function requireCreatorRole(
  requestOrHandler: NextRequest | AuthenticatedFunction
): Promise<AuthToken | NextResponse> {
  // If it's a NextRequest (not a function), authenticate and check role
  if (typeof requestOrHandler !== 'function') {
    const auth = await requireAuth(requestOrHandler);
    if (auth instanceof NextResponse) return auth;

    // Check role from Firestore if not in token
    let userRole = auth.role;
    if (!userRole) {
      try {
        const { getAdminDb } = await import('@/lib/firebase/admin');
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(auth.uid).get();
        userRole = userDoc.data()?.role;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return NextResponse.json({ success: false, error: 'Failed to verify user role' }, { status: 500 });
      }
    }

    if (userRole !== 'influencer') {
      return NextResponse.json({ success: false, error: 'Forbidden: Influencer role required' }, { status: 403 });
    }

    return { ...auth, role: userRole } as AuthToken;
  }

  // If it's a handler function, use the old pattern
  const handler = requestOrHandler as AuthenticatedFunction;
  return requireAuth(async (decodedToken) => {
    // Check role from Firestore if not in token
    let userRole = decodedToken.role as 'brand' | 'influencer' | undefined;
    if (!userRole) {
      try {
        const { getAdminDb } = await import('@/lib/firebase/admin');
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        userRole = userDoc.data()?.role;
      } catch (error) {
        console.error('Error fetching user role:', error);
        return NextResponse.json({ success: false, error: 'Failed to verify user role' }, { status: 500 });
      }
    }

    if (userRole !== 'influencer') {
      return NextResponse.json({ success: false, error: 'Forbidden: Influencer role required' }, { status: 403 });
    }
    return handler({ ...decodedToken, role: userRole });
  });
}