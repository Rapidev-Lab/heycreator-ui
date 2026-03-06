/**
 * Real-time Search API (Mock Mode)
 *
 * POST /api/search/realtime
 *
 * Queries global_influencers from MockFirestore. No live API calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Platform } from '@/types/api';

export const dynamic = 'force-dynamic';

interface SearchResult {
  profileId: string;
  fullName: string;
  primaryUsername: string;
  totalFollowers: number;
  totalFollowing: number;
  avatar: string;
  platforms: Array<{
    platform: string;
    username: string;
    followers: number;
    verified: boolean;
    avatar: string;
  }>;
  searchScore: number;
}

interface RealtimeSearchResponse {
  success: boolean;
  results: SearchResult[];
  source: string;
  searchTime: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { query, platforms, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json<RealtimeSearchResponse>(
        { success: false, results: [], source: 'local', searchTime: Date.now() - startTime, error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json<RealtimeSearchResponse>(
        { success: false, results: [], source: 'local', searchTime: Date.now() - startTime, error: 'At least one platform must be selected' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    const snapshot = await db.collection('global_influencers').limit(50).get();

    for (const doc of snapshot.docs) {
      const profile = doc.data();

      const displayNameMatch = profile.displayName?.toLowerCase().includes(normalizedQuery) || false;
      const usernameMatch = profile.primaryUsername?.toLowerCase().includes(normalizedQuery) || false;

      const profilePlatforms = (profile.platforms || []).map((p: any) => p.platform);
      const hasPlatform = platforms.some((platform: string) => profilePlatforms.includes(platform));

      if ((displayNameMatch || usernameMatch) && hasPlatform) {
        results.push({
          profileId: doc.id,
          fullName: profile.displayName || profile.primaryUsername || 'Unknown',
          primaryUsername: profile.primaryUsername || '',
          totalFollowers: profile.totalFollowers || 0,
          totalFollowing: 0,
          avatar: profile.avatarUrl || '/default-avatar.png',
          platforms: (profile.platforms || [])
            .filter((p: any) => platforms.includes(p.platform))
            .map((p: any) => ({
              platform: p.platform,
              username: p.username || '',
              followers: p.followerCount || 0,
              verified: p.verified || false,
              avatar: profile.avatarUrl || '',
            })),
          searchScore: 0,
        });
      }
    }

    // Sort by followers
    results.sort((a, b) => b.totalFollowers - a.totalFollowers);

    return NextResponse.json<RealtimeSearchResponse>({
      success: true,
      results: results.slice(0, limit),
      source: 'local',
      searchTime: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json<RealtimeSearchResponse>(
      { success: false, results: [], source: 'local', searchTime: Date.now() - startTime, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
