/**
 * Instagram Profile Enrichment API Route (Mock Mode)
 *
 * POST /api/enrich/instagram
 *
 * In mock mode, enrichment is skipped — returns success with a message.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Enrichment skipped in mock mode',
    data: null,
  });
}
