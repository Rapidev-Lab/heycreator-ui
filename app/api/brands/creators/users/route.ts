/**
 * GET /api/brands/creators/users
 *
 * Fetches users with role='influencer' from the users collection.
 * Supports search query parameter for filtering by name/email.
 * Returns basic user data for display in the invite modal.
 */

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

export async function GET(request: NextRequest) {
  return requireAuth(async () => {
    try {
      const limit = Math.min(
        parseInt(request.nextUrl.searchParams.get('limit') || '20', 10),
        50
      );
      const searchQuery = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';

      // Fetch users with role = 'influencer'
      let query = firestore
        .collection('users')
        .where('role', '==', 'influencer');

      // Note: Firestore doesn't support full-text search, so we fetch all and filter client-side
      // For production, consider using Algolia or similar
      const usersSnapshot = await query.limit(100).get();

      let creators = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid,
          displayName: data.displayName || '',
          email: data.email || '',
          photoURL: data.photoURL || '',
          phoneNumber: data.phoneNumber || '',
          emailVerified: data.emailVerified || false,
          isActive: data.isActive !== false,
          influencerProfileId: data.influencerProfileId || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        };
      });

      // Filter by search query if provided
      if (searchQuery) {
        creators = creators.filter((c) =>
          c.displayName?.toLowerCase().includes(searchQuery) ||
          c.email?.toLowerCase().includes(searchQuery)
        );
      }

      // Filter active users and apply limit
      creators = creators.filter((c) => c.isActive).slice(0, limit);

      return NextResponse.json({
        success: true,
        data: creators,
        count: creators.length,
      });
    } catch (error: any) {
      console.error('Error fetching influencer users:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch creators', details: error.message },
        { status: 500 }
      );
    }
  });
}
