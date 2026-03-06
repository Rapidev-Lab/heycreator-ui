/**
 * Internal Notes API
 *
 * GET  /api/influencer/[id]/notes - Fetch notes for a profile
 * PATCH /api/influencer/[id]/notes - Save/update notes
 *
 * Notes are stored as a JSON array of { text, author, createdAt } objects
 * in the `internalNotes` field of global_influencers.
 * Backward compatible: old plain-string notes are auto-migrated on read.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

interface NoteData {
  text: string;
  author: string;
  createdAt: string; // ISO string
}

/**
 * Parse internalNotes from Firestore.
 * Handles both new format (JSON array) and legacy format (plain string).
 */
function parseNotes(raw: unknown): NoteData[] {
  if (!raw) return [];

  // New format: already an array
  if (Array.isArray(raw)) {
    return raw.filter((n: any) => n && typeof n.text === 'string');
  }

  // Try JSON parse (stored as JSON string)
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((n: any) => n && typeof n.text === 'string');
      }
    } catch {
      // Legacy plain-string format — wrap in a single note
    }

    // Legacy: plain string (possibly with \n---\n separators)
    if (raw.trim()) {
      const parts = raw.split('\n---\n').filter(p => p.trim());
      return parts.map(text => ({
        text: text.trim(),
        author: 'Unknown',
        createdAt: new Date().toISOString(),
      }));
    }
  }

  return [];
}

/**
 * GET /api/influencer/[id]/notes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const doc = await db.collection('global_influencers').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    const notes = parseNotes(data?.internalNotes);

    return NextResponse.json({
      success: true,
      data: {
        notes,
        updatedAt: data?.notesUpdatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error('[NOTES-API] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/influencer/[id]/notes
 * Accepts { notes: NoteData[] }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { notes } = body;

    if (!Array.isArray(notes)) {
      return NextResponse.json(
        { success: false, error: 'notes must be an array of { text, author, createdAt }' },
        { status: 400 }
      );
    }

    const globalRef = db.collection('global_influencers').doc(id);
    const globalDoc = await globalRef.get();

    if (!globalDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    await globalRef.update({
      internalNotes: notes,
      notesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: { notes },
    });
  } catch (error: any) {
    console.error('[NOTES-API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save notes' },
      { status: 500 }
    );
  }
}
