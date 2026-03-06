/**
 * Progressive Streaming Discovery Search (Mock Mode)
 *
 * POST /api/discover/search/stream
 *
 * Queries global_influencers from MockFirestore and streams results via SSE.
 * No external API calls — all data comes from the local mock database.
 */

import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { Platform, SearchResultProfile } from '@/types/api';
import {
  DiscoveryFilters,
  validateDiscoveryFilters,
  parseFollowerRange,
} from '@/lib/types/discovery-filters';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const filters: DiscoveryFilters = await request.json();

    const {
      query = '',
      platforms = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
      followerRange = [],
      location,
      verifiedOnly = false,
      categories = [],
      limit = 50,
    } = filters;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send search_started event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'search_started', phases: ['database'] })}\n\n`)
          );

          // Query Firestore (MockFirestore in mock mode)
          let fsQuery: any = db.collection('global_influencers');

          if (platforms.length > 0 && platforms.length < 5) {
            fsQuery = fsQuery.where('primaryPlatform', 'in', platforms.slice(0, 10));
          }

          if (followerRange.length > 0) {
            const ranges = followerRange.map(parseFollowerRange);
            const minFollowers = Math.min(...ranges.map(r => r.min));
            if (minFollowers > 0) {
              fsQuery = fsQuery.where('totalFollowers', '>=', minFollowers);
            }
          }

          if (verifiedOnly) {
            fsQuery = fsQuery.where('verified', '==', true);
          }

          if (location) {
            fsQuery = fsQuery.where('location', '==', location);
          }

          fsQuery = fsQuery.limit(100);
          const snapshot = await fsQuery.get();

          let results: SearchResultProfile[] = snapshot.docs.map((doc: any) => {
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
          });

          // Client-side text search
          if (query) {
            const q = query.toLowerCase();
            results = results.filter(
              (p) =>
                p.display_name?.toLowerCase().includes(q) ||
                p.username?.toLowerCase().includes(q) ||
                p.bio?.toLowerCase().includes(q)
            );
          }

          // Category filter
          if (categories.length > 0) {
            results = results.filter((p) => {
              const pc = p.rawData?.categories || [];
              return categories.some((c) => pc.includes(c));
            });
          }

          // Send database phase complete
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'phase_complete', phase: 'database', count: results.length })}\n\n`)
          );

          // Stream profiles in batches
          const batchSize = 10;
          for (let i = 0; i < results.length && i < limit; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'profiles', profiles: batch, source: 'database' })}\n\n`)
            );
          }

          // Send complete
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', totalResults: Math.min(results.length, limit) })}\n\n`)
          );

          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(
      encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`),
      {
        status: 500,
        headers: { 'Content-Type': 'text/event-stream' },
      }
    );
  }
}
