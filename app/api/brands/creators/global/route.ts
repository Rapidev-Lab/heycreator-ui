/**
 * Global Creators API
 *
 * GET /api/brands/creators/global
 *
 * Fetches all influencer profiles from the global_influencers collection.
 * Returns data mapped to InfluencerProfile format for RecommendedCreatorCard.
 *
 * Query params:
 *   limit  — max results (default 200)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Auth check — support both Bearer token and legacy header
    let userId = request.headers.get('x-user-id');
    if (!userId) {
      const authResult = await requireAuth(request);
      if (authResult instanceof Response) return authResult;
      userId = authResult.userId;
    }

    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '200', 10),
      500
    );

    const snapshot = await db
      .collection('global_influencers')
      .orderBy('totalFollowers', 'desc')
      .limit(limit)
      .get();

    const results = snapshot.docs.map((doc) => {
      const d = doc.data();
      const platforms = d.platforms || [];

      // Extract enrichment demographics from the primary platform's enrichment data
      const primaryPlatform = platforms[0]?.platform || 'instagram';
      const enrichment = d[`${primaryPlatform}Enrichment`] || d.instagramEnrichment || {};
      const audienceDemo = enrichment.audienceDemographics || null;
      const brandAffinityData = enrichment.brandAffinity || [];

      // Map enrichment ageRanges to InfluencerProfile age_split format
      const ageSplit: Record<string, number> = { '12-17': 0, '18-24': 0, '25-34': 0, '35-49': 0, '50+': 0 };
      if (audienceDemo?.ageRanges) {
        for (const ar of audienceDemo.ageRanges) {
          if (ar.range === '13-17') ageSplit['12-17'] += ar.percentage || 0;
          else if (ar.range === '18-24') ageSplit['18-24'] += ar.percentage || 0;
          else if (ar.range === '25-34') ageSplit['25-34'] += ar.percentage || 0;
          else if (ar.range === '35-44') ageSplit['35-49'] += ar.percentage || 0;
          else if (ar.range === '45-54') ageSplit['50+'] += ar.percentage || 0;
          else if (ar.range === '55+') ageSplit['50+'] += ar.percentage || 0;
        }
      }

      const genderSplit = audienceDemo?.genderSplit || { male: 0, female: 0 };
      const topLocations = (audienceDemo?.topCountries || []).map((c: any) => ({
        country: c.country || '',
        percentage: c.percentage || 0,
      }));

      // Compute true reach percentage from followers and engagement rate
      const totalFollowers = d.totalFollowers || 0;
      const engRate = d.averageEngagementRate || 0;
      const trueReachPct = (totalFollowers > 0 && engRate > 0)
        ? parseFloat(((35 * engRate) / 100).toFixed(2))
        : 0;

      return {
        // Basic info
        id: doc.id,
        name: d.displayName || '',
        username: d.primaryUsername || '',
        display_name: d.displayName || '',
        bio: d.bio || '',
        profile_image_url: d.avatarUrl || '',

        // Platform & links
        platforms: platforms.map((p: any) => p.platform),
        primary_platform: primaryPlatform,
        profile_urls: {},

        // Metrics
        follower_count: totalFollowers,
        engagement_rate: engRate,
        influence_score: 0,
        avg_likes: 0,
        avg_comments: 0,
        avg_shares: 0,

        // Location
        location: {
          country: d.location?.country || '',
          country_code: '',
          city: d.location?.city || '',
        },

        // Demographics (populated from enrichment data)
        gender: 'unknown' as const,
        languages: [] as string[],
        audience: {
          total_followers: totalFollowers,
          gender_split: {
            male: genderSplit.male || 0,
            female: genderSplit.female || 0,
            other: Math.max(0, 100 - (genderSplit.male || 0) - (genderSplit.female || 0)),
          },
          age_split: ageSplit,
          top_locations: topLocations,
          authenticity_score: 0,
        },

        // Enrichment-derived audience demographics (raw arrays for filtering)
        audience_demographics: audienceDemo ? {
          age_ranges: audienceDemo.ageRanges || [],
          gender_split: { male: genderSplit.male || 0, female: genderSplit.female || 0 },
          top_countries: audienceDemo.topCountries || [],
          top_cities: audienceDemo.topCities || [],
          interests: audienceDemo.interests || [],
        } : undefined,

        // Brand affinity from enrichment
        brand_affinity: brandAffinityData.length > 0 ? brandAffinityData : undefined,

        // True Reach (computed)
        true_reach_percentage: trueReachPct,

        // Topics & categories
        topics: d.topics || [],
        primary_topic: (d.categories || [])[0] || '',
        hashtags: [] as string[],

        // Brand collaborations
        brand_mentions: [],
        has_sponsored_posts: false,
        sponsored_post_count: 0,
        post_frequency: 0,

        // Contact & verification
        has_email: false,
        accepts_messages: false,
        is_vetted: false,
        verification_badges: platforms.map((p: any) => ({
          platform: p.platform,
          verified: p.verified || false,
        })),

        // Metadata
        created_at: '',
        updated_at: '',
        last_scraped_at: '',
      };
    });

    // Dedup by username+platform — multiple users saving the same
    // influencer creates separate global_influencers docs.
    // Keep the entry with the richest data (longest bio).
    const bestByKey = new Map<string, typeof results[0]>();
    for (const r of results) {
      if (!r.username) continue;
      const key = `${r.primary_platform}:${r.username}`.toLowerCase();
      const existing = bestByKey.get(key);
      if (!existing || r.bio.length > existing.bio.length) {
        bestByKey.set(key, r);
      }
    }
    const deduped = [...bestByKey.values()];

    return NextResponse.json({
      success: true,
      data: deduped,
      count: deduped.length,
    });
  } catch (error: any) {
    console.error('Error fetching global creators:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creators', details: error.message },
      { status: 500 }
    );
  }
}
