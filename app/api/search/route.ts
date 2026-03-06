/**
 * Search API - Keyword-based influencer search (Mock Mode)
 *
 * POST /api/search
 *
 * Queries global_influencers from MockFirestore with keyword matching.
 * No external API calls.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { Platform, SearchResultProfile } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      query,
      platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
      limit = 50,
    } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const normalizedQuery = query.toLowerCase().trim();

    // Query all global influencers and filter client-side
    let fsQuery: any = db.collection('global_influencers');

    if (platforms.length > 0 && platforms.length < 5) {
      fsQuery = fsQuery.where('primaryPlatform', 'in', platforms.slice(0, 10));
    }

    fsQuery = fsQuery.limit(100);
    const snapshot = await fsQuery.get();

    let results: SearchResultProfile[] = snapshot.docs
      .map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          platform: (data.primaryPlatform || 'instagram') as Platform,
          username: data.primaryUsername || '',
          display_name: data.displayName || '',
          follower_count: data.totalFollowers || 0,
          profile_url: '',
          avatar_url: data.avatarUrl || '',
          bio: data.bio || '',
          verified: data.verified || false,
          rawData: {
            engagementRate: data.instagramEnrichment?.averageEngagementRate || 0,
            location: data.location,
            categories: data.categories,
          },
        };
      })
      .filter(
        (p: SearchResultProfile) =>
          p.display_name?.toLowerCase().includes(normalizedQuery) ||
          p.username?.toLowerCase().includes(normalizedQuery) ||
          p.bio?.toLowerCase().includes(normalizedQuery)
      );

    // Sort by follower count descending
    results.sort((a, b) => b.follower_count - a.follower_count);
    results = results.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        query,
        totalResults: results.length,
        searchTime: Date.now() - startTime,
        source: 'database',
      },
    });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
