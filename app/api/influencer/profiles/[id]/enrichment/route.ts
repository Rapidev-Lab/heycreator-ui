import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';
import { ApifyEnrichmentData } from '@/types/apify';
import { EnrichmentMetadataExtractor } from '@/lib/services/enrichment-metadata-extractor';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering because we use request.headers for auth
export const dynamic = 'force-dynamic';

/**
 * GET /api/influencer/profiles/[id]/enrichment
 *
 * Fetches or generates enrichment data for an influencer profile.
 *
 * Flow:
 * 1. Check if enrichment data exists in unified_profiles.rawEnrichmentData
 * 2. If not, try to load from demo APIFY.json (for development)
 * 3. Return the enrichment data
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 *
 * Query parameters (optional):
 * - refresh: Set to 'true' to force refresh from Apify (future feature)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult; // Return 401 error response
    }

    const profileId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    console.log(`Fetching enrichment data for profile ID: ${profileId}`);

    // Get Admin DB
    const db = getAdminDb();

    // 1. Check if enrichment data exists in Firestore
    if (!forceRefresh) {
      const profileRef = db.collection('unified_profiles').doc(profileId);
      const profileSnap = await profileRef.get();

      if (profileSnap.exists) {
        const profileData = profileSnap.data()!;

        // Check for enrichmentDataUrl first (new approach - full data in Storage)
        if (profileData.enrichmentDataUrl) {
          console.log('✓ Found enrichmentDataUrl, redirecting to Storage');
          console.log(`  URL: ${profileData.enrichmentDataUrl}`);

          try {
            const storageResponse = await fetch(profileData.enrichmentDataUrl);
            if (storageResponse.ok) {
              const enrichmentData = await storageResponse.json();
              console.log('✓ Loaded enrichment data from Storage');
              return NextResponse.json({
                success: true,
                data: enrichmentData,
                cached: true,
                fromStorage: true,
              });
            }
          } catch (storageError) {
            console.error('Failed to fetch from Storage:', storageError);
            // Continue to check other methods
          }
        }

        // Fallback: Check for old rawEnrichmentData field
        if (profileData.rawEnrichmentData) {
          console.log('✓ Found cached enrichment data in Firestore');
          return NextResponse.json({
            success: true,
            data: profileData.rawEnrichmentData,
            cached: true,
          });
        }
      }
    }

    // 2. Try to load demo enrichment data (ONLY for Cristiano - for development)
    // Check if this is actually Cristiano's profile before loading demo data
    const profileRef = db.collection('unified_profiles').doc(profileId);
    const profileSnap = await profileRef.get();

    let isCristianoProfile = false;
    if (profileSnap.exists) {
      const profileData = profileSnap.data()!;
      const instagramAccount = profileData.linkedAccounts?.find((acc: any) => acc.platform === 'instagram');
      isCristianoProfile = instagramAccount?.username === 'cristiano' || profileId.includes('cristiano');
    }

    if (isCristianoProfile) {
      console.log('⚠ No cached data found. Loading demo APIFY.json for Cristiano...');

      try {
        // Load APIFY.json from public folder
        const jsonPath = path.join(process.cwd(), 'public', 'APIFY.json');

        if (fs.existsSync(jsonPath)) {
          const jsonData = fs.readFileSync(jsonPath, 'utf-8');
          const enrichmentData: ApifyEnrichmentData = JSON.parse(jsonData);

          console.log(`✓ Loaded demo enrichment data for: ${enrichmentData.username}`);

        // Extract metadata and create/update global influencer entry
        try {
          const globalInfluencerData = EnrichmentMetadataExtractor.createGlobalInfluencerFromEnrichment(
            enrichmentData,
            authResult.userId
          );

          // Check if global influencer exists (by Instagram username)
          const globalQuery = await db
            .collection('global_influencers')
            .where('primaryUsername', '==', enrichmentData.username)
            .where('primaryPlatform', '==', 'instagram')
            .limit(1)
            .get();

          let globalInfluencerId: string;

          if (!globalQuery.empty) {
            // Update existing global influencer
            globalInfluencerId = globalQuery.docs[0].id;
            await db.collection('global_influencers').doc(globalInfluencerId).update({
              ...globalInfluencerData,
              updatedAt: new Date(),
              // Increment view count
              viewCount: (globalQuery.docs[0].data().viewCount || 0) + 1,
            });
            console.log(`✓ Updated global influencer: ${globalInfluencerId}`);
          } else {
            // Create new global influencer
            const newDoc = await db.collection('global_influencers').add(globalInfluencerData);
            globalInfluencerId = newDoc.id;
            console.log(`✓ Created new global influencer: ${globalInfluencerId}`);
          }

          // Note: For demo data, we're still storing in Firestore since it's just Cristiano's data
          // In production, this would be saved to Firebase Storage instead
          const profileRef = db.collection('unified_profiles').doc(profileId);
          await profileRef.update({
            rawEnrichmentData: enrichmentData, // Demo data only
            updatedAt: new Date(),
          });

          console.log('✓ Cached demo enrichment data in Firestore');
        } catch (extractError) {
          console.error('Error extracting/saving global influencer:', extractError);
          // Continue anyway - still return enrichment data
        }

        return NextResponse.json({
          success: true,
          data: enrichmentData,
          cached: false,
          demo: true,
        });
        }
      } catch (err) {
        console.error('Error loading demo APIFY.json:', err);
      }
    }

    // 3. No enrichment data available
    return NextResponse.json(
      {
        success: false,
        error: 'Enrichment data not available for this profile',
        hint: 'Only demo data available for specific profiles',
      },
      { status: 404 }
    );

  } catch (error: any) {
    console.error('Error fetching enrichment data:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch enrichment data',
        code: error.code
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/influencer/profiles/[id]/enrichment
 *
 * Triggers enrichment of a profile using Apify API (future feature).
 *
 * Body:
 * - username: Instagram username to enrich
 * - platform: Social media platform (currently only 'instagram')
 * - methods: Array of enrichment methods to run (1-8)
 *
 * Headers required:
 * - Authorization: Bearer <Firebase ID token>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const profileId = params.id;
    const body = await request.json();
    const { username, platform = 'instagram', methods = [1, 2, 8] } = body;

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log(`Triggering enrichment for ${username} on ${platform}...`);

    // TODO: Implement actual Apify API call
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Enrichment triggered (feature coming soon)',
      profileId,
      username,
      platform,
      methods,
      status: 'pending',
    });

  } catch (error: any) {
    console.error('Error triggering enrichment:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to trigger enrichment'
      },
      { status: 500 }
    );
  }
}
