'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, UserPlus, Eye, ArrowRightLeft, Trash2, ListPlus } from 'lucide-react';
import TagChipInput from './TagChipInput';
import PerformanceAnalytics from './PerformanceAnalytics';
import ResultsHeader from '@/components/discovery/results/ResultsHeader';
import ResultsGrid from '@/components/discovery/results/ResultsGrid';
import type { CardMenuItem } from '@/components/brands/discover/RecommendedCreatorCard';
import type { InfluencerProfile } from '@/types/discovery';
import type { CreatorListResponse, ListAnalytics, UpdateListRequest } from '@/types/creator-list';

type InfluenceSize = 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'all';

interface ListDetailViewProps {
  list?: CreatorListResponse;
  onBack: () => void;
  onSave: (data: UpdateListRequest) => Promise<void>;
  onDelete?: () => void;
  creators: InfluencerProfile[];
  creatorsLoading: boolean;
  suggestions: InfluencerProfile[];
  suggestionsLoading: boolean;
  analytics?: ListAnalytics;
  onAddCreator: () => void;
  onViewCreatorProfile: (id: string) => void;
  onAddToAnotherList: (creatorId: string) => void;
  onMoveCreator: (creatorId: string) => void;
  onRemoveCreator: (creatorId: string) => void;
  onAddSuggestionToList: (creatorId: string) => void;
}

const INFLUENCE_SIZES: { value: InfluenceSize; label: string; range: string }[] = [
  { value: 'all', label: 'All Sizes', range: '' },
  { value: 'nano', label: 'Nano', range: '1K - 10K' },
  { value: 'micro', label: 'Micro', range: '10K - 100K' },
  { value: 'mid', label: 'Mid-Tier', range: '100K - 500K' },
  { value: 'macro', label: 'Macro', range: '500K - 1M' },
  { value: 'mega', label: 'Mega', range: '1M+' },
];

export default function ListDetailView({
  list,
  onBack,
  onSave,
  onDelete,
  creators,
  creatorsLoading,
  suggestions,
  suggestionsLoading,
  analytics,
  onAddCreator,
  onViewCreatorProfile,
  onAddToAnotherList,
  onMoveCreator,
  onRemoveCreator,
  onAddSuggestionToList,
}: ListDetailViewProps) {
  const isCreateMode = !list;

  // Form state
  const [name, setName] = useState(list?.name || '');
  const [tags, setTags] = useState<string[]>(list?.tags || []);
  const [mentions, setMentions] = useState<string[]>(list?.mentions || []);
  const [locations, setLocations] = useState<string[]>(list?.locations || []);
  const [influenceSize, setInfluenceSize] = useState<InfluenceSize>(
    (list?.influenceSize as InfluenceSize) || 'all'
  );
  const [visibility, setVisibility] = useState<'public' | 'private'>(list?.visibility || 'public');
  const [isSaving, setIsSaving] = useState(false);

  // Creator section state
  const [creatorViewMode, setCreatorViewMode] = useState<'grid' | 'list'>('grid');
  const [creatorSort, setCreatorSort] = useState<any>('relevance');
  const [suggestionViewMode, setSuggestionViewMode] = useState<'grid' | 'list'>('grid');
  const [suggestionSort, setSuggestionSort] = useState<any>('relevance');

  // Sync form when list prop changes (use id + updatedAt for reliable change detection)
  useEffect(() => {
    if (list) {
      setName(list.name);
      setTags(list.tags || []);
      setMentions(list.mentions || []);
      setLocations(list.locations || []);
      setInfluenceSize((list.influenceSize as InfluenceSize) || 'all');
      setVisibility(list.visibility || 'public');
    }
  }, [list?.id, list?.updatedAt]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        tags,
        mentions,
        locations,
        influenceSize,
        visibility,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCreatorMenuItems = (influencer: InfluencerProfile): CardMenuItem[] => [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: () => onViewCreatorProfile(influencer.id),
    },
    {
      label: 'Add to Another List',
      icon: ListPlus,
      onClick: () => onAddToAnotherList(influencer.id),
    },
    {
      label: 'Move',
      icon: ArrowRightLeft,
      onClick: () => onMoveCreator(influencer.id),
    },
    {
      label: 'Remove',
      icon: Trash2,
      onClick: () => onRemoveCreator(influencer.id),
      variant: 'danger',
    },
  ];

  const getSuggestionMenuItems = (influencer: InfluencerProfile): CardMenuItem[] => [
    {
      label: 'Add to List',
      icon: ListPlus,
      onClick: () => onAddSuggestionToList(influencer.id),
    },
    {
      label: 'View Profile',
      icon: Eye,
      onClick: () => onViewCreatorProfile(influencer.id),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {isCreateMode ? 'Create a List' : list.name}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-5 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {onDelete && !isCreateMode && (
            <button
              onClick={onDelete}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* List Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">List Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. Fashion, Summer Creators, Skincare Enthusiasts..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy outline-none"
          />
        </div>

        {/* Saved Tags + Mentions (two column) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TagChipInput
            label="Saved Tags"
            tags={tags}
            onChange={setTags}
            placeholder="#summer #brand #ad"
          />
          <TagChipInput
            label="Mentions / Tags / Brands"
            tags={mentions}
            onChange={setMentions}
            placeholder="@ecoglowsa @sustainablebeautysa"
          />
        </div>

        {/* Relevant Locations + Size of Influence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TagChipInput
            label="Relevant Locations"
            tags={locations}
            onChange={setLocations}
            placeholder="Cape Town, Johannesburg..."
            commaSeparatedOnly
          />
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Size of Influence
            </label>
            <div className="flex flex-wrap gap-2">
              {INFLUENCE_SIZES.map(({ value, label, range }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setInfluenceSize(value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    influenceSize === value
                      ? 'bg-brand-navy text-white'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                  {range && <span className="text-xs ml-1 opacity-70">({range})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Visibility */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Campaign Visibility
          </label>
          <div className="flex gap-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-1 w-4 h-4 text-brand-navy focus:ring-brand-navy"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Public</span>
                <p className="text-xs text-gray-500 mt-0.5">Visible to all agency users</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
                className="mt-1 w-4 h-4 text-brand-navy focus:ring-brand-navy"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Private</span>
                <p className="text-xs text-gray-500 mt-0.5">Only visible to invited agency users</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Performance Analytics (edit mode only, when there are creators) */}
      {!isCreateMode && analytics && (
        <PerformanceAnalytics analytics={analytics} isLoading={creatorsLoading} />
      )}

      {/* My Creators Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            My Creators ({creators.length})
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={onAddCreator}
              className="hidden items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add a Creator
            </button>
          </div>
        </div>

        <ResultsHeader
          count={creators.length}
          viewMode={creatorViewMode}
          onViewModeChange={setCreatorViewMode}
          sortBy={creatorSort}
          onSortChange={setCreatorSort}
        />

        <div className="mt-4">
          {creators.length === 0 && !creatorsLoading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-900 font-semibold mb-1">No Creators Added Yet</p>
              <p className="text-sm text-gray-500">Create your list by adding Creators.</p>
            </div>
          ) : (
            <ResultsGrid
              influencers={creators}
              isLoading={creatorsLoading}
              viewMode={creatorViewMode}
              onCardClick={onViewCreatorProfile}
              getMenuItems={getCreatorMenuItems}
            />
          )}
        </div>
      </div>

      {/* Smart Suggestions Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Smart Suggestions ({suggestions.length})
          </h3>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Suggested Creators based on search criteria
        </p>

        <ResultsHeader
          count={suggestions.length}
          viewMode={suggestionViewMode}
          onViewModeChange={setSuggestionViewMode}
          sortBy={suggestionSort}
          onSortChange={setSuggestionSort}
        />

        <div className="mt-4">
          {suggestions.length === 0 && !suggestionsLoading ? (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {isCreateMode
                  ? 'Suggestions will appear after you save the list with tags or criteria.'
                  : 'No suggestions available based on current criteria.'}
              </p>
            </div>
          ) : (
            <ResultsGrid
              influencers={suggestions}
              isLoading={suggestionsLoading}
              viewMode={suggestionViewMode}
              onCardClick={onViewCreatorProfile}
              getMenuItems={getSuggestionMenuItems}
            />
          )}
        </div>
      </div>
    </div>
  );
}
