'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { CreatorListResponse } from '@/types/creator-list';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  currentLists: string[];
  availableLists: CreatorListResponse[];
  onSave: (addToLists: string[], removeFromLists: string[]) => Promise<void>;
  onCreateList: () => void;
}

export default function AddToListModal({
  isOpen,
  onClose,
  creatorId,
  currentLists,
  availableLists,
  onSave,
  onCreateList,
}: AddToListModalProps) {
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLists(new Set(currentLists));
    }
  }, [isOpen, currentLists]);

  if (!isOpen) return null;

  const toggleList = (listId: string) => {
    setSelectedLists(prev => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentSet = new Set(currentLists);
      const addToLists = Array.from(selectedLists).filter(id => !currentSet.has(id));
      const removeFromLists = currentLists.filter(id => !selectedLists.has(id));

      if (addToLists.length > 0 || removeFromLists.length > 0) {
        await onSave(addToLists, removeFromLists);
      }
      onClose();
    } catch (err) {
      console.error('Error saving list assignment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-list-modal-title"
        className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 id="add-to-list-modal-title" className="text-lg font-bold text-gray-900 mb-1">Add to List</h2>
        <p className="text-sm text-gray-500 mb-4">Select lists for this creator</p>

        {availableLists.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 mb-3">No lists created yet</p>
            <button
              onClick={() => { onClose(); onCreateList(); }}
              className="text-sm font-medium text-brand-navy hover:underline"
            >
              Create your first list
            </button>
          </div>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto mb-4">
            {availableLists.map(list => {
              const isChecked = selectedLists.has(list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {list.color && (
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{list.name}</p>
                      <p className="text-xs text-gray-500">{list.creatorCount} creator{list.creatorCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isChecked && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}

        {availableLists.length > 0 && (
          <>
            <button
              onClick={() => { onClose(); onCreateList(); }}
              className="w-full text-center text-sm font-medium text-brand-navy hover:underline mb-4"
            >
              + Create New List
            </button>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
