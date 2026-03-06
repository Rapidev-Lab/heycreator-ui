'use client';

import { useState, useCallback } from 'react';
import { ClipboardList, Plus, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';

interface NoteData {
  text: string;
  author: string;
  createdAt: string; // ISO string
}

interface InternalNotesProps {
  profileId: string;
  initialNotes?: NoteData[];
  authToken?: string;
  userName?: string;
}

export function InternalNotes({ profileId, initialNotes = [], authToken, userName }: InternalNotesProps) {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const displayName = userName || 'Unknown';

  const handleSave = useCallback(async () => {
    if (!newNote.trim()) return;
    setIsSaving(true);

    const noteEntry: NoteData = {
      text: newNote.trim(),
      author: displayName,
      createdAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, noteEntry];

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`/api/influencer/${profileId}/notes`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ notes: updatedNotes }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setNotes(updatedNotes);
      setNewNote('');
      setIsAdding(false);
    } catch {
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [profileId, notes, newNote, authToken, displayName]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Internal Notes</h2>
          <span className="text-sm text-gray-400">({notes.length})</span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 mb-2">{note.text}</p>
            <div className="text-xs text-gray-400">
              {note.author}  &middot;  {formatRelativeTime(note.createdAt)}
            </div>
          </div>
        ))}

        {/* Add Note Form */}
        {isAdding && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
              className="w-full h-24 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setIsAdding(false); setNewNote(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newNote.trim() || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && !isAdding && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-400">No notes yet. Click &quot;+ Add Note&quot; to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
