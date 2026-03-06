'use client';

import { useState } from 'react';
import { X, Instagram, Music2, Youtube, Facebook } from 'lucide-react';

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
  authFetch: {
    post: (url: string, data: any) => Promise<any>;
  };
}

type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

const platforms: { id: Platform; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'e.g., @username or https://instagram.com/username' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, placeholder: 'e.g., @username or https://tiktok.com/@username' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'e.g., channel name or https://youtube.com/@channel' },
  { id: 'twitter', label: 'X (Twitter)', icon: X, placeholder: 'e.g., @handle or https://x.com/handle' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'e.g., page name or https://facebook.com/page' },
];

function detectPlatform(input: string): Platform | null {
  const lower = input.toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
  return null;
}

function extractUsername(input: string): string {
  // Remove URL parts to get username
  let cleaned = input.trim();
  // Remove protocol and domain
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^(www\.)?(instagram|tiktok|youtube|twitter|x|facebook|fb)\.com\/?/, '');
  // Remove leading @
  cleaned = cleaned.replace(/^@/, '');
  // Remove trailing slashes and query params
  cleaned = cleaned.replace(/[?/].*$/, '');
  return cleaned;
}

export default function AddCreatorModal({
  isOpen,
  onClose,
  onAdded,
  authFetch,
}: AddCreatorModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('instagram');
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (val: string) => {
    setInput(val);
    const detected = detectPlatform(val);
    if (detected) {
      setSelectedPlatform(detected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please enter a username or URL');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const username = extractUsername(input);
      if (!username) {
        setError('Could not parse username from input');
        setIsSubmitting(false);
        return;
      }

      // Save profile using existing endpoint
      const res = await authFetch.post('/api/profiles', {
        profiles: [{
          platform: selectedPlatform,
          username,
          display_name: username,
          follower_count: 0,
          profile_url: '',
        }],
      });

      if (res.data?.success) {
        // Fire-and-forget enrichment if we got a profile ID
        const profileId = res.data.data?.id || res.data.data?.profileId;
        if (profileId) {
          authFetch.post(`/api/influencer/${profileId}/enrichment`, {
            platforms: [selectedPlatform],
          }).catch(() => {});
        }

        onAdded();
        setInput('');
        onClose();
      } else {
        setError(res.data?.error || 'Failed to add creator');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add creator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Add a Creator</h2>
        <p className="text-sm text-gray-500 mb-6">Add a creator by their username or profile URL</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => {
                const Icon = p.icon;
                const isActive = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#FF385C] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or URL</label>
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentPlatform.placeholder}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
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
              disabled={isSubmitting || !input.trim()}
              className="px-4 py-2.5 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Creator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
