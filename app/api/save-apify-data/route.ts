/**
 * API Route to Save Raw Apify Data to APIFY.JSON
 * POST /api/save-apify-data
 * Body: { rawMethodData: any }
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawMethodData, username, timestamp } = body;

    if (!rawMethodData) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    // Prepare the data to save
    const dataToSave = {
      savedAt: timestamp || new Date().toISOString(),
      username: username || 'unknown',
      rawMethodData: rawMethodData,
    };

    // Save to project root as APIFY.JSON
    const filePath = join(process.cwd(), 'APIFY.json');
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

    console.log(`[APIFY DATA] Saved raw data to ${filePath}`);

    return NextResponse.json({
      success: true,
      message: 'Raw Apify data saved to APIFY.json',
      filePath: 'APIFY.json',
      dataSize: JSON.stringify(dataToSave).length,
    });
  } catch (error: any) {
    console.error('[APIFY DATA] Save error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save data',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
