/**
 * Real-time Search Streaming API (Mock Mode)
 *
 * POST /api/search/realtime-stream
 *
 * Streams search results from MockFirestore via SSE. No external API calls.
 */

import { NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Platform } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { query, platforms, limit = 20 } = body;

    if (!query || query.trim().length < 2) {
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: 'Query must be at least 2 characters' })}\n\n`),
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } }
      );
    }

    if (!platforms || platforms.length === 0) {
      return new Response(
        encoder.encode(`data: ${JSON.stringify({ error: 'At least one platform must be selected' })}\n\n`),
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const db = getAdminDb();
          const normalizedQuery = query.toLowerCase().trim();

          const snapshot = await db.collection('global_influencers').limit(50).get();

          const results: any[] = [];
          for (const doc of snapshot.docs) {
            const data = doc.data();
            const nameMatch = data.displayName?.toLowerCase().includes(normalizedQuery);
            const usernameMatch = data.primaryUsername?.toLowerCase().includes(normalizedQuery);

            if (nameMatch || usernameMatch) {
              results.push({
                id: doc.id,
                platform: data.primaryPlatform || 'instagram',
                username: data.primaryUsername || '',
                display_name: data.displayName || '',
                follower_count: data.totalFollowers || 0,
                avatar_url: data.avatarUrl || '',
                bio: data.bio || '',
              });
            }
          }

          // Stream results
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'results',
              platform: 'database',
              items: results.slice(0, limit),
              count: Math.min(results.length, limit),
            })}\n\n`)
          );

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
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (error: any) {
    return new Response(
      encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`),
      { status: 500, headers: { 'Content-Type': 'text/event-stream' } }
    );
  }
}
