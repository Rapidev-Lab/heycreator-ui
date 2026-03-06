'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2, Layers, ArrowLeft, Users, Globe, Sparkles } from 'lucide-react';
import FilterSidebar from '@/components/discovery/filters/FilterSidebar';
import ResultsHeader from '@/components/discovery/results/ResultsHeader';
import ResultsGrid from '@/components/discovery/results/ResultsGrid';
import { Platform } from '@/types/api';
import { DiscoveryFilters, formatFollowerCount } from '@/lib/types/discovery-filters';
import { useAuth } from '@/lib/firebase/auth-context';
import PageLoader from '@/components/ui/PageLoader';
import SkeletonGrid from '@/components/ui/SkeletonGrid';
import { CreatorCardSkeleton } from '@/components/ui/skeletons';

// Simplified profile for results display (matches fields used by ResultsGrid)
interface ResultsProfile {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;  // For ResultsGrid
  avatar?: string;             // For backward compatibility
  platforms: Platform[];
  follower_count: number;      // For ResultsGrid
  followers?: number;          // For backward compatibility
  followersFormatted?: string;
  engagement_rate: number;     // For ResultsGrid
  engagement?: number;         // For backward compatibility
  trueReach?: number;
  verified?: boolean;
  verification_badges?: { platform: Platform; verified: boolean }[];  // For ResultsGrid
  location?: string;
  categories?: string[];
  topics?: string[];           // For ResultsGrid
  tier?: string;
  relevanceScore?: number;
  bio?: string;
}

/** Parse a range string like '0-499', '9000+', '0-4%', '5%-9%' into min/max numbers */
function parseRangeToMinMax(range: string): { min: number; max: number } {
  if (range.endsWith('+')) {
    return { min: parseInt(range.replace(/[%+]/g, '')), max: Infinity };
  }
  const clean = range.replace(/%/g, '');
  const [lo, hi] = clean.split('-').map(Number);
  return { min: lo, max: hi };
}

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, loading: authLoading } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [influencers, setInfluencers] = useState<ResultsProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'best-match' | 'followers' | 'engagement' | 'cost' | 'name'>('followers');
  const [searchSource, setSearchSource] = useState<'database' | 'live' | 'hybrid'>('database');

  const [isCoallating, setIsCoallating] = useState(false);
  const [filterKey, setFilterKey] = useState(0);
  const [activePlatformSearches, setActivePlatformSearches] = useState<Set<string>>(new Set());
  const [streamPhase, setStreamPhase] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const dedupKeysRef = useRef<Set<string>>(new Set());

  // Filters state (using DiscoveryFilters type)
  const [filters, setFilters] = useState<DiscoveryFilters>({
    platforms: [],
    followerRange: [],
    engagementRateRange: [],
    trueReachRange: [],
    categories: [],
    verifiedOnly: false
  });

  // --- Client-side filtering and sorting (runs instantly on the fetched results) ---
  const filteredAndSortedResults = useMemo(() => {
    let results = [...influencers];
    const f = filters as any; // FilterSidebar emits custom keys at runtime

    // Platform — normalise sidebar 'x' to match API 'twitter'
    const activePlatforms: string[] = f.selectedPlatforms || [];
    if (activePlatforms.length > 0) {
      const normalised = activePlatforms.map((p: string) => p === 'x' ? 'twitter' : p);
      results = results.filter(p => p.platforms.some(plat => normalised.includes(plat)));
    }

    // Follower count ranges
    const followerRanges: string[] = f.selectedFollowerRanges || [];
    if (followerRanges.length > 0) {
      results = results.filter(p =>
        followerRanges.some(r => {
          const { min, max } = parseRangeToMinMax(r);
          return p.follower_count >= min && p.follower_count <= max;
        })
      );
    }

    // Engagement rate ranges
    const engRanges: string[] = f.selectedEngagementRanges || [];
    if (engRanges.length > 0) {
      results = results.filter(p =>
        engRanges.some(r => {
          const { min, max } = parseRangeToMinMax(r);
          return p.engagement_rate >= min && p.engagement_rate <= max;
        })
      );
    }

    // True Reach ranges
    const trueReachRanges: string[] = f.selectedTrueReachRanges || [];
    if (trueReachRanges.length > 0) {
      results = results.filter(p =>
        trueReachRanges.some(r => {
          const { min, max } = parseRangeToMinMax(r);
          return (p.trueReach || 0) >= min && (p.trueReach || 0) <= max;
        })
      );
    }

    // Location (substring match against selected cities)
    const activeLocations: string[] = f.selectedLocations || [];
    if (activeLocations.length > 0) {
      results = results.filter(p =>
        p.location && activeLocations.some(loc =>
          p.location!.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'followers':
        results.sort((a, b) => b.follower_count - a.follower_count);
        break;
      case 'engagement':
        results.sort((a, b) => b.engagement_rate - a.engagement_rate);
        break;
      // relevance / best-match / cost: keep original API order
    }

    return results;
  }, [influencers, filters, sortBy]);

  // Derive active-filter chips for the summary bar
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    const f = filters as any;
    if (f.selectedPlatforms?.length > 0) {
      chips.push({ key: 'platforms', label: `Platform: ${f.selectedPlatforms.map((p: string) => p === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}` });
    }
    if (f.selectedFollowerRanges?.length > 0) {
      chips.push({ key: 'followers', label: `Followers: ${f.selectedFollowerRanges.join(', ')}` });
    }
    if (f.selectedEngagementRanges?.length > 0) {
      chips.push({ key: 'engagement', label: `Engagement: ${f.selectedEngagementRanges.join(', ')}` });
    }
    if (f.selectedTrueReachRanges?.length > 0) {
      chips.push({ key: 'truereach', label: `True Reach: ${f.selectedTrueReachRanges.join(', ')}` });
    }
    if (f.selectedLocations?.length > 0) {
      chips.push({ key: 'location', label: `Location: ${f.selectedLocations.join(', ')}` });
    }
    return chips;
  }, [filters]);

  // Reset the sidebar to its initial state (re-mount via key flip)
  const clearAllFilters = () => {
    setFilters({ platforms: [], followerRange: [], engagementRateRange: [], trueReachRange: [], categories: [], verifiedOnly: false });
    setFilterKey(prev => prev + 1);
  };

  // Clear selection whenever filters change so stale IDs don't linger
  useEffect(() => {
    setSelectedIds([]);
  }, [filters]);

  // Parse URL parameters
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const vetted = searchParams.get('vetted') === 'true';
  const platformsParam = searchParams.get('platforms') || 'instagram';
  const urlPlatforms = platformsParam.split(',') as Platform[];

  // Load results whenever params change. Cleanup aborts in-flight stream.
  useEffect(() => {
    loadResults();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [query, currentPage]);

  function getProfileUrl(platform: string, username: string): string {
    switch (platform) {
      case 'instagram': return `https://www.instagram.com/${username}`;
      case 'tiktok': return `https://www.tiktok.com/@${username}`;
      case 'youtube': return `https://www.youtube.com/@${username}`;
      case 'twitter': return `https://twitter.com/${username}`;
      case 'facebook': return `https://www.facebook.com/${username}`;
      default: return `https://${platform}.com/${username}`;
    }
  }

  /**
   * Transform a raw SearchResultProfile into our display-friendly ResultsProfile
   */
  function transformProfile(result: any): ResultsProfile {
    return {
      id: result.id || `${result.platform}_${result.username}`,
      name: result.display_name,
      username: result.username,
      profile_image_url: result.avatar_url || '',
      platforms: result.rawData?.linkedPlatforms || [result.platform],
      follower_count: result.follower_count,
      followersFormatted: formatFollowerCount(result.follower_count, result.platform),
      engagement_rate: result.rawData?.engagementRate || 0,
      trueReach: result.rawData?.trueReachPercentage || 0,
      verified: result.verified || false,
      verification_badges: result.verified ? [{ platform: result.platform, verified: true }] : [],
      location: result.rawData?.location,
      categories: result.rawData?.categories || [],
      topics: result.rawData?.categories || [],
      tier: result.rawData?.tier || 'Unknown',
      relevanceScore: result.relevanceScore?.totalScore || 0,
      bio: result.bio
    };
  }

  const MAX_PROFILES = 500;

  /**
   * Deduplicate incoming profiles against what we've already shown.
   * IMPORTANT: This runs OUTSIDE the state updater to avoid React 18 strict mode
   * double-invocation issues (side effects in updaters run twice, causing all
   * profiles to be rejected on the second pass).
   */
  function deduplicateProfiles(incoming: ResultsProfile[]): ResultsProfile[] {
    return incoming.filter(p => {
      const key = `${p.platforms?.[0] || 'unknown'}:${p.username?.toLowerCase()}`;
      if (dedupKeysRef.current.has(key)) return false;
      dedupKeysRef.current.add(key);
      return true;
    });
  }

  /** Pure state updater — no side effects, safe for React 18 strict mode */
  function appendProfiles(newProfiles: ResultsProfile[]) {
    if (newProfiles.length === 0) return;
    setInfluencers(prev => {
      const merged = [...prev, ...newProfiles];
      return merged.length > MAX_PROFILES ? merged.slice(0, MAX_PROFILES) : merged;
    });
    setTotalCount(prev => prev + newProfiles.length);
  }

  /**
   * Load search results via progressive streaming SSE endpoint
   */
  async function loadResults() {
    // Abort any in-flight stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setInfluencers([]);
    dedupKeysRef.current = new Set();
    setTotalCount(0);
    setActivePlatformSearches(new Set());
    setStreamPhase('Looking through our creator network...');
    setSearchSource('database');

    try {
      const discoveryFilters: DiscoveryFilters = {
        query: query || undefined,
        platforms: filters.platforms && filters.platforms.length > 0 ? filters.platforms : urlPlatforms,
        followerRange: filters.followerRange,
        engagementRateRange: filters.engagementRateRange,
        trueReachRange: filters.trueReachRange,
        location: location || filters.location || undefined,
        categories: filters.categories,
        verifiedOnly: vetted || filters.verifiedOnly,
        sortBy: 'relevance' as any,
        page: currentPage,
        limit: 50,
        liveSearch: true
      };

      console.log('🔍 Discovery streaming search:', discoveryFilters);

      const response = await fetch('/api/discover/search/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discoveryFilters),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let hasLiveResults = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Process any remaining data left in the buffer (e.g. the 'complete' event)
          if (buffer.trim()) {
            const remaining = buffer.split('\n\n');
            for (const line of remaining) {
              if (!line.startsWith('data: ')) continue;
              try {
                const evt = JSON.parse(line.slice(6));
                if (evt.type === 'complete') {
                  setIsLoading(false);
                  setStreamPhase('');
                  setActivePlatformSearches(new Set());
                  setSearchSource(hasLiveResults ? 'hybrid' : 'database');
                }
                if (evt.type === 'platform_results') {
                  hasLiveResults = true;
                  const profiles = evt.profiles.map(transformProfile);
                  const deduped = deduplicateProfiles(profiles);
                  appendProfiles(deduped);
                }
              } catch {}
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event: any;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          switch (event.type) {
            case 'database_results': {
              const profiles = event.profiles.map(transformProfile);
              const deduped = deduplicateProfiles(profiles);
              appendProfiles(deduped);
              setSearchSource('database');
              setStreamPhase('Scouring the internet for the best matches...');
              console.log(`✓ Database: ${event.count} results`);
              break;
            }

            case 'platform_started':
              setActivePlatformSearches(prev => new Set([...prev, event.platform]));
              break;

            case 'platform_results': {
              hasLiveResults = true;
              const profiles = event.profiles.map(transformProfile);
              const deduped = deduplicateProfiles(profiles);
              appendProfiles(deduped);
              setSearchSource(prev => prev === 'database' ? 'hybrid' : prev);
              console.log(`✓ ${event.platform}: ${event.count} new results`);
              break;
            }

            case 'platform_completed':
              setActivePlatformSearches(prev => {
                const next = new Set(prev);
                next.delete(event.platform);
                return next;
              });
              break;

            case 'profile_enrichment': {
              console.log(`Received enrichment for ${event.username} on ${event.platform}`);
              const enriched = event.profiles.map(transformProfile);
              setInfluencers(prev => prev.map(existing => {
                const match = enriched.find((e: ResultsProfile) =>
                  e.username?.toLowerCase() === existing.username?.toLowerCase()
                );
                if (!match) return existing;
                return {
                  ...existing,
                  follower_count: match.follower_count > 0 ? match.follower_count : existing.follower_count,
                  followersFormatted: match.follower_count > 0 ? formatFollowerCount(match.follower_count, match.platform) : existing.followersFormatted,
                  engagement_rate: match.engagement_rate > 0 ? match.engagement_rate : existing.engagement_rate,
                  bio: match.bio || existing.bio,
                  trueReach: match.trueReach || existing.trueReach,
                  profile_image_url: match.profile_image_url && match.profile_image_url !== ''
                    ? match.profile_image_url : existing.profile_image_url,
                };
              }));
              break;
            }

            case 'complete':
              setIsLoading(false);
              setStreamPhase('');
              setSearchSource(hasLiveResults ? 'hybrid' : 'database');
              console.log(`✓ Stream complete: ${event.totalResults} total in ${event.searchTime}ms`);
              break;

            case 'error':
              console.error(`[${event.platform || 'general'}] ${event.message}`);
              break;
          }
        }
      }

      setIsLoading(false);
      setStreamPhase('');
      setActivePlatformSearches(new Set());
    } catch (error: any) {
      if (error.name === 'AbortError') return; // Intentional abort
      console.error('Search error:', error);
      setIsLoading(false);
      setStreamPhase('');
      setActivePlatformSearches(new Set());
    }
  }

  /**
   * Handle clicking on a profile card.
   * Navigates IMMEDIATELY to the profile page, which handles save + enrichment.
   */
  function handleProfileClick(profile: ResultsProfile) {
    if (!firebaseUser) {
      router.push('/auth/brand/login');
      return;
    }

    const primaryPlatform = profile.platforms?.[0] || 'instagram';

    // Build a temporary ID for immediate navigation
    const tempId = `${primaryPlatform}_${profile.username}`;

    // Navigate IMMEDIATELY — profile page handles save + enrichment when it detects tempId
    router.push(`/brands/influencers/${tempId}?platform=${primaryPlatform}&username=${encodeURIComponent(profile.username)}&name=${encodeURIComponent(profile.name)}&avatar=${encodeURIComponent(profile.profile_image_url)}&followers=${profile.follower_count}`);
  }

  /**
   * Coalate selected profiles into a single unified profile via the API
   */
  async function handleCoallate() {
    if (!firebaseUser) {
      router.push('/auth/brand/login');
      return;
    }

    setIsCoallating(true);
    try {
      const token = await firebaseUser.getIdToken();

      const selectedProfileData = filteredAndSortedResults
        .filter(p => selectedIds.includes(p.id))
        .map(p => ({
          platform: p.platforms?.[0] || 'instagram',
          username: p.username,
          display_name: p.name,
          follower_count: p.follower_count,
          profile_url: getProfileUrl(p.platforms?.[0] || 'instagram', p.username),
          avatar_url: p.profile_image_url,
          bio: p.bio,
          verified: p.verified || false,
        }));

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': firebaseUser.uid,
        },
        body: JSON.stringify({ selectedProfiles: selectedProfileData }),
      });

      if (response.ok) {
        const result = await response.json();
        const coalatedId = result.data.id;
        console.log(`✓ Coalated ${selectedProfileData.length} profiles → ${coalatedId}`);

        // Fire-and-forget: trigger enrichment for each linked platform
        selectedProfileData.forEach(p => {
          fetch(`/api/influencer/${coalatedId}/enrichment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ platform: p.platform, username: p.username }),
          }).catch(() => {});
        });

        setSelectedIds([]);
        router.push(`/brands/influencers/${coalatedId}`);
      } else {
        console.error('Coalation failed:', await response.text());
      }
    } catch (error) {
      console.error('Coalation error:', error);
    } finally {
      setIsCoallating(false);
    }
  }

  /**
   * Handle filter changes
   */
  function handleFilterChange(newFilters: DiscoveryFilters) {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
  }

  /**
   * Handle sort change
   */
  function handleSortChange(newSort: typeof sortBy) {
    setSortBy(newSort);
    setCurrentPage(1);
  }

  /**
   * Handle page change
   */
  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      <div className="flex">
        {/* Filter Sidebar */}
        <div
          className={`
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:sticky top-0 left-0 h-screen
            w-80 bg-white border-r border-gray-200
            z-50 transition-transform duration-300
            overflow-y-auto
          `}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-3 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSidebar
              key={filterKey}
              filters={filters}
              onChange={handleFilterChange}
              initialPlatforms={urlPlatforms as any[]}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => router.push('/brands/discover')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => router.push('/brands/discover')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-navy-light transition-colors"
                >
                  <Search className="w-4 h-4" />
                  New Search
                </button>
              </div>
              <ResultsHeader
                title={query ? `Results for "${query}"` : 'Discovery Results'}
                count={filteredAndSortedResults.length}
                viewMode={viewMode}
                sortBy={sortBy}
                searchSource={searchSource}
                onViewModeChange={setViewMode}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          {/* Mobile Filters Toggle */}
          <div className="lg:hidden px-4 py-3 border-b border-gray-200 bg-white">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterChips.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-brand-navy text-white text-xs rounded-full">{activeFilterChips.length}</span>
              )}
            </button>
          </div>

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="px-4 sm:px-6 py-2.5 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Filters:</span>
              {activeFilterChips.map(chip => (
                <span key={chip.key} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-brand-navy text-xs font-medium rounded-full">
                  {chip.label}
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-1">
                Clear all
              </button>
            </div>
          )}

          {/* Results Grid */}
          <div className="p-4 sm:p-6">
            {(isLoading || activePlatformSearches.size > 0) && influencers.length === 0 ? (
              <div className="py-12">
                {/* Friendly loading header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                    <Globe className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Finding creators for you</h3>
                  <p className="text-gray-500 text-sm">{streamPhase || 'Scouring the internet for the best matches...'}</p>
                </div>

                {/* Progress steps */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-8">
                  <SearchProgressStep
                    icon={<Users className="w-4 h-4" />}
                    label="Checking our creator network"
                    active={streamPhase.includes('network')}
                    done={!streamPhase.includes('network') && influencers.length > 0}
                  />
                  <SearchProgressStep
                    icon={<Globe className="w-4 h-4" />}
                    label="Searching across the internet"
                    active={streamPhase.includes('internet') || activePlatformSearches.size > 0}
                    done={false}
                  />
                  <SearchProgressStep
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Ranking the best results"
                    active={false}
                    done={false}
                  />
                </div>

                {/* Skeleton cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonGrid count={4} cols="grid-cols-1 md:grid-cols-2">
                  {(i) => <CreatorCardSkeleton key={i} />}
                </SkeletonGrid>
                </div>

                {/* Fun tip */}
                <p className="text-center text-xs text-gray-400 mt-6">
                  Tip: Use filters to narrow down results by platform, followers, or engagement rate
                </p>
              </div>
            ) : !isLoading && activePlatformSearches.size === 0 && influencers.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No influencers found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    clearAllFilters();
                    router.push('/brands/discover');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start New Search
                </button>
              </div>
            ) : filteredAndSortedResults.length === 0 ? (
              /* All results exist but every one was filtered out */
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results match your filters
                </h3>
                <p className="text-gray-600 mb-6">
                  Try widening or clearing your filters to see more results
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Streaming indicator: shown when results exist but more are incoming */}
                {isLoading && influencers.length > 0 && (
                  <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-700">
                      Searching more results
                      <span className="inline-flex ml-1">
                        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                      </span>
                      <span className="ml-2 text-blue-500 text-xs">This may take 3 to 5 minutes</span>
                    </span>
                  </div>
                )}

                {/* Selection hint + Select All / Deselect All */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">
                    Use the checkboxes on each card to select profiles, then merge them into one unified profile
                  </p>
                  <button
                    onClick={() => setSelectedIds(
                      selectedIds.length === filteredAndSortedResults.length && selectedIds.length > 0
                        ? []
                        : filteredAndSortedResults.map(p => p.id)
                    )}
                    className="text-xs text-brand-navy font-semibold hover:underline whitespace-nowrap ml-4"
                  >
                    {selectedIds.length === filteredAndSortedResults.length && selectedIds.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <ResultsGrid
                  influencers={filteredAndSortedResults as any}
                  selectedIds={selectedIds}
                  viewMode={viewMode}
                  onCardClick={(id) => {
                    const profile = filteredAndSortedResults.find(p => p.id === id);
                    if (profile) handleProfileClick(profile);
                  }}
                  onSelectionChange={(ids) => setSelectedIds(ids)}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`
                            px-4 py-2 rounded-lg
                            ${currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {totalPages > 5 && <span className="px-2">...</span>}

                    {totalPages > 5 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`
                          px-4 py-2 rounded-lg
                          ${currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-6 text-center text-sm text-gray-600">
                  {influencers.length >= MAX_PROFILES && totalCount > MAX_PROFILES ? (
                    <span>Showing top {MAX_PROFILES} of {totalCount} results</span>
                  ) : (
                    <>Showing {filteredAndSortedResults.length} of {influencers.length} result{influencers.length !== 1 ? 's' : ''}</>
                  )}
                  {filteredAndSortedResults.length !== influencers.length && influencers.length < MAX_PROFILES && (
                    <span className="ml-1 text-gray-400">({influencers.length - filteredAndSortedResults.length} filtered out)</span>
                  )}
                  {searchSource === 'hybrid' && (
                    <span className="ml-2 text-blue-600">
                      (Database + Live Search)
                    </span>
                  )}
                  {searchSource === 'live' && (
                    <span className="ml-2 text-green-600">
                      (Live Search)
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Coalation Action Bar — fixed bottom bar when 2+ profiles selected */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-brand-navy-dark" />
              <span className="text-sm font-semibold text-gray-800">
                {selectedIds.length} profile{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleCoallate}
                disabled={isCoallating}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-brand-navy-dark text-white rounded-lg hover:bg-brand-navy-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCoallating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                {isCoallating ? 'Collating...' : 'Coalate Profiles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Progress step indicator for the loading state */
function SearchProgressStep({ icon, label, active, done }: { icon: React.ReactNode; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${active ? 'text-blue-600 font-medium' : done ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? 'bg-blue-100' : done ? 'bg-green-100' : 'bg-gray-100'}`}>
        {done ? (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : active ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResultsPageContent />
    </Suspense>
  );
}
