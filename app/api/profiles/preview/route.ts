/**
 * API route for generating a preview of a unified profile.
 * POST /api/profiles/preview - Generate preview from selected profiles
 */

import { NextResponse } from 'next/server';
import { profileAggregatorServiceInstance as aggregatorService } from '@/lib/services/profile-aggregator.service';
import { SearchResultProfile } from '@/types/api';

/**
 * POST /api/profiles/preview
 * Generate a preview of what a unified profile would look like
 * without actually creating it.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedProfiles } = body as { selectedProfiles: SearchResultProfile[] };

    // Validate required fields
    if (!selectedProfiles || !Array.isArray(selectedProfiles) || selectedProfiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one profile must be selected to generate a preview',
        },
        { status: 400 }
      );
    }

    // Validate each selected profile
    for (const profile of selectedProfiles) {
      if (!profile.platform || !profile.username) {
        return NextResponse.json(
          {
            success: false,
            error: 'Each selected profile must have platform and username',
          },
          { status: 400 }
        );
      }
    }

    // Generate preview
    const preview = aggregatorService.generatePreview(selectedProfiles);

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error: unknown) {
    console.error('Preview Generation Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
