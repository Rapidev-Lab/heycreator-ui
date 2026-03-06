/**
 * API routes for individual unified profile operations.
 * GET /api/profiles/[id] - Get a unified profile by ID
 * PUT /api/profiles/[id] - Update a unified profile
 * DELETE /api/profiles/[id] - Delete a unified profile
 */

import { NextResponse } from 'next/server';
import { profileAggregatorServiceInstance as aggregatorService } from '@/lib/services/profile-aggregator.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/profiles/[id]
 * Get a unified profile by its ID.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const profile = aggregatorService.getProfile(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: unknown) {
    console.error('Get Profile Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profiles/[id]
 * Update a unified profile.
 * Supports updating profile details and managing linked accounts.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    let updatedProfile;

    switch (action) {
      case 'addAccounts':
        // Add new linked accounts
        if (!data.accounts || !Array.isArray(data.accounts) || data.accounts.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Accounts array is required for addAccounts action' },
            { status: 400 }
          );
        }
        updatedProfile = aggregatorService.addLinkedAccounts(id, data.accounts);
        break;

      case 'removeAccounts':
        // Remove linked accounts
        if (!data.accountIds || !Array.isArray(data.accountIds) || data.accountIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Account IDs array is required for removeAccounts action' },
            { status: 400 }
          );
        }
        updatedProfile = aggregatorService.removeLinkedAccounts(id, data.accountIds);
        break;

      case 'updateDetails':
      default:
        // Update profile details
        const { displayName, bio, location, categories, avatarUrl } = data;
        updatedProfile = aggregatorService.updateProfile(id, {
          displayName,
          bio,
          location,
          categories,
          avatarUrl,
        });
        break;
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error: unknown) {
    console.error('Update Profile Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    // Check for specific error types
    if (errorMessage.includes('already linked') || errorMessage.includes('already in this profile')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 409 } // Conflict
      );
    }

    if (errorMessage.includes('Cannot remove all')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/[id]
 * Soft delete a unified profile.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const deleted = aggregatorService.deleteProfile(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete Profile Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
