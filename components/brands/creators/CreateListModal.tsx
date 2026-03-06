'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CreatorListResponse } from '@/types/creator-list';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (list: CreatorListResponse) => void;
  authFetch: {
    post: (url: string, data: any) => Promise<any>;
  };
}

const PRESET_COLORS = [
  '#FF385C', '#6366F1', '#10B981', '#F59E0B',
  '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6',
];

export default function CreateListModal({
  isOpen,
  onClose,
  onCreated,
  authFetch,
}: CreateListModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a list name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await authFetch.post('/api/brands/lists', { name: name.trim(), description: description.trim(), color });

      if (res.data?.success) {
        onCreated(res.data.data);
        setName('');
        setDescription('');
        setColor(PRESET_COLORS[0]);
        onClose();
      } else {
        setError(res.data?.error || 'Failed to create list');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-list-modal-title"
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 id="create-list-modal-title" className="text-xl font-bold text-gray-900 mb-1">Create a List</h2>
        <p className="text-sm text-gray-500 mb-6">Organize your creators into custom lists</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">List Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fashion Week 2026"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this list..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-brand-navy scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
