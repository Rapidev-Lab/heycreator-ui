'use client';

import { useState, useMemo } from 'react';
import { SearchResultProfile, Platform } from '@/types/api';
import { UnifiedProfilePreview, GroupedSearchResults } from '@/types/aggregator';
import { useAuth } from '@/lib/firebase/auth-context';
import SocialIcons from './SocialIcons';
import {
  Check,
  X,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Edit3,
  Plus,
  Eye,
  Link2,
} from 'lucide-react';
import { proxyImage } from '@/lib/utils';

interface ProfileAggregatorProps {
  searchResults: SearchResultProfile[];
  onClose: () => void;
  onProfileCreated: (profileId: string) => void;
  isLoading?: boolean;
}

export default function ProfileAggregator({
  searchResults,
  onClose,
  onProfileCreated,
  isLoading = false,
}: ProfileAggregatorProps) {
  // Auth context
  const { firebaseUser } = useAuth();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Preview state
  const [preview, setPreview] = useState<UnifiedProfilePreview | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Custom fields for the unified profile
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customBio, setCustomBio] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);

  // UI state
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(
    () => new Set(['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'] as Platform[])
  );
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'customize'>('select');

  // Group search results by platform
  const groupedResults: GroupedSearchResults[] = useMemo(() => {
    const grouped = new Map<Platform, SearchResultProfile[]>();

    for (const result of searchResults) {
      const existing = grouped.get(result.platform) || [];
      existing.push(result);
      grouped.set(result.platform, existing);
    }

    return Array.from(grouped.entries())
      .map(([platform, results]) => ({
        platform,
        results,
        count: results.length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [searchResults]);

  // Get selected profiles
  const selectedProfiles = useMemo(() => {
    return searchResults.filter(profile => {
      const profileId = `${profile.platform}-${profile.username}`;
      return selectedIds.has(profileId);
    });
  }, [searchResults, selectedIds]);

  // Toggle profile selection
  const toggleSelection = (profile: SearchResultProfile) => {
    const profileId = `${profile.platform}-${profile.username}`;
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
    setPreview(null); // Clear preview when selection changes
    setError(null);
  };

  // Toggle platform expansion
  const togglePlatformExpansion = (platform: Platform) => {
    setExpandedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  // Generate preview
  const generatePreview = async () => {
    if (selectedProfiles.length === 0) {
      setError('Please select at least one profile to aggregate');
      return;
    }

    setIsGeneratingPreview(true);
    setError(null);

    try {
      if (!firebaseUser) {
        throw new Error('Not authenticated');
      }

      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/profiles/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedProfiles }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate preview');
      }

      setPreview(result.data);
      setCustomDisplayName(result.data.displayName);
      setCustomBio(result.data.bio || '');
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Create unified profile
  const createUnifiedProfile = async () => {
    if (selectedProfiles.length === 0) {
      setError('Please select at least one profile');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      if (!firebaseUser) {
        throw new Error('Not authenticated. Please log in.');
      }

      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedProfiles,
          displayName: customDisplayName || undefined,
          bio: customBio || undefined,
          location: customLocation || undefined,
          categories: customCategories.length > 0 ? customCategories : undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create unified profile');
      }

      onProfileCreated(result.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsCreating(false);
    }
  };

  // Format follower count
  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get platform color
  const getPlatformColor = (platform: Platform): string => {
    const colors: Record<Platform, string> = {
      instagram: 'from-purple-500 to-pink-500',
      tiktok: 'from-black to-gray-800',
      youtube: 'from-red-500 to-red-600',
      twitter: 'from-blue-400 to-blue-500',
      facebook: 'from-blue-600 to-blue-700',
    };
    return colors[platform] || 'from-gray-400 to-gray-500';
  };

  // Get platform display name
  const getPlatformName = (platform: Platform): string => {
    const names: Record<Platform, string> = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      twitter: 'X (Twitter)',
      facebook: 'Facebook',
    };
    return names[platform] || platform;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              {step === 'select' && 'Create Unified Profile'}
              {step === 'preview' && 'Preview & Customize'}
              {step === 'customize' && 'Customize Profile'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'select' && 'Select profiles that belong to the same person'}
              {step === 'preview' && 'Review the merged profile before creating'}
              {step === 'customize' && 'Customize the profile details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-gray-600">Loading search results...</span>
            </div>
          ) : step === 'select' ? (
            /* Selection Step */
            <div className="space-y-4">
              {/* Selection Summary */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedIds.size} {selectedIds.size === 1 ? 'profile' : 'profiles'} selected
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <button
                    onClick={() => {
                      setSelectedIds(new Set());
                      setPreview(null);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Grouped Results */}
              {groupedResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No search results to aggregate. Run a search first.
                </div>
              ) : (
                groupedResults.map(({ platform, results, count }) => (
                  <div key={platform} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Platform Header */}
                    <button
                      onClick={() => togglePlatformExpansion(platform)}
                      className={`w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r ${getPlatformColor(platform)} text-white`}
                    >
                      <div className="flex items-center gap-3">
                        <SocialIcons platforms={[platform as any]} size="sm" />
                        <span className="font-medium">{getPlatformName(platform)}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          {count} {count === 1 ? 'result' : 'results'}
                        </span>
                      </div>
                      {expandedPlatforms.has(platform) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    {/* Platform Results */}
                    {expandedPlatforms.has(platform) && (
                      <div className="divide-y divide-gray-100">
                        {results.map(profile => {
                          const profileId = `${profile.platform}-${profile.username}`;
                          const isSelected = selectedIds.has(profileId);

                          return (
                            <div
                              key={profileId}
                              onClick={() => toggleSelection(profile)}
                              className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                              }`}
                            >
                              {/* Checkbox */}
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-primary border-primary'
                                    : 'border-gray-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>

                              {/* Avatar */}
                              {profile.avatar_url ? (
                                <img
                                  src={proxyImage(profile.avatar_url)}
                                  alt={profile.display_name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                                  {profile.display_name.charAt(0)}
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900 truncate">
                                    {profile.display_name}
                                  </h4>
                                  {profile.verified && (
                                    <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                                      Verified
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  @{profile.username}
                                </p>
                              </div>

                              {/* Followers */}
                              <div className="text-right flex-shrink-0">
                                <div className="font-semibold text-gray-900">
                                  {formatFollowers(profile.follower_count)}
                                </div>
                                <div className="text-xs text-gray-500">followers</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Preview Step */
            <div className="space-y-6">
              {preview && (
                <>
                  {/* Preview Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <div className="flex items-start gap-6">
                      {/* Avatar */}
                      {preview.avatarUrl ? (
                        <img
                          src={proxyImage(preview.avatarUrl)}
                          alt={preview.displayName}
                          className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white shadow-lg">
                          {preview.displayName.charAt(0)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {showCustomFields ? customDisplayName || preview.displayName : preview.displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <SocialIcons platforms={preview.platforms as any} size="md" />
                        </div>
                        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                          {showCustomFields ? customBio || preview.bio : preview.bio || 'No bio available'}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatFollowers(preview.totalFollowers)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Total Followers</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {preview.averageEngagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Avg. Engagement</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {preview.linkedAccountsCount}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Linked Accounts</div>
                      </div>
                    </div>
                  </div>

                  {/* Linked Accounts List */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      Linked Accounts
                    </h4>
                    <div className="space-y-2">
                      {preview.selectedProfiles.map(profile => (
                        <div
                          key={`${profile.platform}-${profile.username}`}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <SocialIcons platforms={[profile.platform as any]} size="sm" />
                          <span className="font-medium text-gray-900">{profile.display_name}</span>
                          <span className="text-gray-500">@{profile.username}</span>
                          <span className="ml-auto text-sm text-gray-600">
                            {formatFollowers(profile.follower_count)} followers
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customize Fields Toggle */}
                  <button
                    onClick={() => setShowCustomFields(!showCustomFields)}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {showCustomFields ? 'Hide customization' : 'Customize profile details'}
                    </span>
                  </button>

                  {/* Custom Fields */}
                  {showCustomFields && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={customDisplayName}
                          onChange={e => setCustomDisplayName(e.target.value)}
                          placeholder={preview.displayName}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={customBio}
                          onChange={e => setCustomBio(e.target.value)}
                          placeholder={preview.bio || 'Enter a bio...'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={customLocation}
                          onChange={e => setCustomLocation(e.target.value)}
                          placeholder="e.g., Los Angeles, CA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            {step === 'select' && selectedIds.size > 0 && (
              <span>
                Combined followers: <strong>{formatFollowers(
                  selectedProfiles.reduce((sum, p) => sum + p.follower_count, 0)
                )}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step === 'preview' && (
              <button
                onClick={() => {
                  setStep('select');
                  setPreview(null);
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {step === 'select' ? (
              <button
                onClick={generatePreview}
                disabled={selectedIds.size === 0 || isGeneratingPreview}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  selectedIds.size === 0 || isGeneratingPreview
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Preview
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={createUnifiedProfile}
                disabled={isCreating}
                className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  isCreating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Unified Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
