'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, Loader2, HelpCircle, Target, Shield,
  TrendingUp,
  Heart, MessageCircle, Play, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { formatFollowerCount } from '@/lib/types/discovery-filters';
import { proxyImage } from '@/lib/utils';
import {
  ProfileHeader,
  ProfileSnapshot,
  InsightsCard,
  MetricsTable,
  ContentGrid,
  DemographicsSection,
  SimilarCreators,
  EnrichmentBanner,
  InternalNotes,
  transformEnrichmentToProfile,
  isProfileEnriched,
} from '@/components/influencer-profile';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';
import SocialIcons from '@/components/SocialIcons';
import SendMessageModal from '@/components/brands/discover/SendMessageModal';
import InviteToCampaignModal from '@/components/brands/discover/InviteToCampaignModal';

interface PageProps {
  params: { id: string };
}

type TabType = 'overview' | 'content' | 'demographics' | 'analytics';

export default function InfluencerProfilePage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, loading: authLoading } = useAuth();

  // Preview data from URL params (passed from results page for instant display)
  const previewData = {
    platform: searchParams.get('platform'),
    username: searchParams.get('username'),
    name: searchParams.get('name'),
    avatar: searchParams.get('avatar'),
    followers: searchParams.get('followers') ? parseInt(searchParams.get('followers')!) : null,
  };
  const hasPreview = !!(previewData.username && previewData.name);

  // State for enriched profile data
  const [enrichedProfile, setEnrichedProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resolvedId, setResolvedId] = useState<string>(params.id);
  const [authToken, setAuthToken] = useState<string>('');

  // Notes state
  const [initialNotes, setInitialNotes] = useState<{ text: string; author: string; createdAt: string }[]>([]);

  // Modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Detect if this is a temporary ID from discovery results (e.g. "instagram_username")
  const isTempId = params.id.includes('_') && !params.id.startsWith('unified_');

  // Share a single save promise across React 18 strict mode double-fires
  const savePromiseRef = useRef<Promise<string | null> | null>(null);
  // Share a single enrichment trigger across React 18 strict mode double-fires
  const enrichmentPromiseRef = useRef<Promise<void> | null>(null);
  // Ref to access current firebaseUser inside the effect without re-triggering it
  const firebaseUserRef = useRef(firebaseUser);
  firebaseUserRef.current = firebaseUser;
  // Prevent showing the loading spinner again on effect re-runs (e.g. token refresh)
  const initialLoadDone = useRef(false);

  // Fetch enriched profile data
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      if (authLoading) return;

      const user = firebaseUserRef.current;
      if (!user) {
        router.push('/auth/brand/login');
        return;
      }

      // Only show full loading spinner on initial load, not re-runs
      if (!initialLoadDone.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const token = await user.getIdToken();
        setAuthToken(token);
        let profileId = params.id;

        // If this is a temp ID, create the profile first
        // Uses a shared promise ref so React 18 strict mode double-fires
        // both await the same save instead of one aborting and the other skipping
        if (isTempId && hasPreview) {
          if (!savePromiseRef.current) {
            savePromiseRef.current = (async () => {
              console.log(`[PROFILE] Temp ID detected (${params.id}). Creating profile...`);
              const platform = previewData.platform || 'instagram';
              const username = previewData.username!;

              const getProfileUrl = (plat: string, user: string) => {
                switch (plat) {
                  case 'instagram': return `https://www.instagram.com/${user}`;
                  case 'tiktok': return `https://www.tiktok.com/@${user}`;
                  case 'youtube': return `https://www.youtube.com/@${user}`;
                  case 'twitter': return `https://twitter.com/${user}`;
                  case 'facebook': return `https://www.facebook.com/${user}`;
                  default: return `https://${plat}.com/${user}`;
                }
              };

              try {
                const saveResponse = await fetch('/api/profiles', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-user-id': user.uid,
                  },
                  body: JSON.stringify({
                    selectedProfiles: [{
                      platform,
                      username,
                      display_name: previewData.name,
                      follower_count: previewData.followers || 0,
                      profile_url: getProfileUrl(platform, username),
                      avatar_url: previewData.avatar || '',
                      bio: '',
                      verified: false,
                    }]
                  }),
                  // No abort signal — save must always complete
                });

                if (saveResponse.ok) {
                  const saveResult = await saveResponse.json();
                  const newId = saveResult.data.id;
                  console.log(`[PROFILE] Profile created: ${newId}`);
                  // Enrichment is triggered by the main flow (triggerAndRetry)
                  return newId;
                } else {
                  console.error('[PROFILE] Failed to create profile, trying direct fetch');
                  return null;
                }
              } catch (err) {
                console.error('[PROFILE] Save error:', err);
                return null;
              }
            })();
          }

          // Both effect runs await the same promise
          const savedId = await savePromiseRef.current;
          if (cancelled) return;

          if (savedId) {
            profileId = savedId;
            setResolvedId(savedId);
            window.history.replaceState(null, '', `/brands/influencers/${savedId}`);
          }
        }

        if (cancelled) return;

        // Fetch enriched profile data (works for ALL platforms)
        const response = await fetch(`/api/influencer/${profileId}/enrichment`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Profile not found');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load profile');
        }

        // Handle both enriched and non-enriched profiles
        if (data.data) {
          setEnrichedProfile(data.data);

          // Auto re-enrichment for stale data — refresh ALL linked platforms (background, non-blocking)
          if (data.data.metadata?.stale) {
            console.log(`[PROFILE] Stale data detected (${data.data.metadata.enrichmentAgeHours}h old). Triggering background refresh for all platforms.`);
            const refreshStale = async () => {
              try {
                // Collect all linked platforms to refresh
                const staleLinkedPlatforms = data.data.linkedPlatforms || [];
                const stalePlatformsToRefresh = staleLinkedPlatforms.length > 0
                  ? staleLinkedPlatforms.map((lp: any) => ({ platform: lp.platform, username: lp.username }))
                  : [{ platform: data.data.primaryPlatform || 'instagram', username: data.data.primaryUsername }];

                // Refresh all platforms in parallel
                await Promise.allSettled(
                  stalePlatformsToRefresh.map((lp: any) =>
                    fetch(`/api/influencer/${profileId}/enrichment`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        platform: lp.platform,
                        username: lp.username,
                        forceRefresh: true,
                      })
                    }).catch(() => {})
                  )
                );
                if (cancelled) return;
                // Re-fetch fresh data after enrichment
                const freshResponse = await fetch(`/api/influencer/${profileId}/enrichment`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                const freshData = await freshResponse.json();
                if (!cancelled && freshData.success && freshData.data) {
                  setEnrichedProfile(freshData.data);
                  console.log('[PROFILE] Stale data refreshed successfully');
                }
              } catch {
                // Silent fail — user already sees stale data
              }
            };
            refreshStale();
          }
        } else if (data.profile) {
          // Profile exists but not enriched - create minimal structure
          setEnrichedProfile({
            ...data.profile,
            engagement: null,
            authenticity: null,
            reach: null,
            tier: null,
            pricing: null,
            demographics: null,
            brandAffinity: [],
            content: null,
            growth: null,
            similarCreators: [],
            linkedPlatforms: [{
              platform: data.profile.primaryPlatform,
              username: data.profile.primaryUsername,
              profileUrl: `https://${data.profile.primaryPlatform}.com/${data.profile.primaryUsername}`,
              followerCount: data.profile.totalFollowers,
              verified: false
            }],
            metadata: {
              source: 'basic',
              dataQuality: 'minimal'
            }
          });

          // Trigger enrichment for ALL linked platforms (dedup across React 18 strict mode double-fires)
          // Build list of all platforms to enrich (from linkedPlatforms or fall back to primary)
          const platformsToEnrich: { platform: string; username: string }[] = [];
          if (data.profile.linkedPlatforms && data.profile.linkedPlatforms.length > 0) {
            for (const lp of data.profile.linkedPlatforms) {
              if (lp.platform && lp.username) {
                platformsToEnrich.push({ platform: lp.platform, username: lp.username });
              }
            }
          }
          // Fall back to primary platform if no linked platforms found
          if (platformsToEnrich.length === 0 && data.profile.primaryPlatform && data.profile.primaryUsername) {
            platformsToEnrich.push({ platform: data.profile.primaryPlatform, username: data.profile.primaryUsername });
          }

          if (platformsToEnrich.length > 0 && !enrichmentPromiseRef.current) {
            console.log(`[ENRICHMENT] Triggering enrichment for ${platformsToEnrich.length} platform(s): ${platformsToEnrich.map(p => `${p.platform}:${p.username}`).join(', ')} (profile: ${profileId})`);
            enrichmentPromiseRef.current = (async () => {
              await Promise.allSettled(
                platformsToEnrich.map(async (lp) => {
                  try {
                    const enrichResponse = await fetch(`/api/influencer/${profileId}/enrichment`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        platform: lp.platform,
                        username: lp.username,
                      })
                    });
                    const enrichResult = await enrichResponse.json();
                    console.log(`[ENRICHMENT] POST response (${lp.platform}):`, enrichResult);
                    if (!enrichResponse.ok) {
                      console.error(`[ENRICHMENT] POST failed for ${lp.platform} (${enrichResponse.status}):`, enrichResult);
                    }
                  } catch (err) {
                    console.error(`[ENRICHMENT] Background enrichment failed for ${lp.platform}:`, err);
                  }
                })
              );
            })();
          } else if (platformsToEnrich.length === 0) {
            console.error('[ENRICHMENT] No platforms found — cannot trigger enrichment');
          }
        } else {
          throw new Error('No profile data returned');
        }

        // Fetch notes
        try {
          const notesResponse = await fetch(`/api/influencer/${profileId}/notes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            if (notesData.success && Array.isArray(notesData.data.notes)) {
              setInitialNotes(notesData.data.notes);
            }
          }
        } catch {
          // Notes fetch failure is non-critical
        }

      } catch (err: any) {
        if (cancelled) return;
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          initialLoadDone.current = true;
        }
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, authLoading, router]);

  // ──────────────────────────────────────────────────────────────────────
  // Poll for enrichment completion (separate from main fetch effect)
  // When a profile is not yet enriched, poll GET every 10s until data arrives.
  // This avoids the React 18 strict-mode `cancelled` flag problem entirely.
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Only poll when we have a profile that isn't enriched yet
    if (!enrichedProfile || isProfileEnriched(enrichedProfile)) return;

    let stopped = false;
    const pollIntervalMs = 10_000; // 10 seconds

    const poll = async () => {
      if (stopped) return;
      try {
        const user = firebaseUserRef.current;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch(`/api/influencer/${resolvedId}/enrichment`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok || stopped) return;
        const json = await res.json();
        if (stopped) return;
        if (json.success && json.data && isProfileEnriched(json.data)) {
          console.log('[POLL] Enrichment data detected — updating UI');
          setEnrichedProfile(json.data);
          stopped = true; // stop further polls
          return;
        }
        console.log('[POLL] Not yet enriched, will retry in 10s');
      } catch {
        // network blip — retry next interval
      }
    };

    // First poll after 10s (enrichment just started)
    const id = setInterval(poll, pollIntervalMs);
    // Also do a single immediate check in case enrichment is already done
    poll();

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [enrichedProfile, resolvedId]);

  /**
   * Handle refresh data (trigger live enrichment)
   */
  async function handleRefreshData() {
    if (!enrichedProfile) return;

    setIsRefreshing(true);

    try {
      const token = await firebaseUser?.getIdToken();

      // Collect all linked platforms to refresh (not just primary)
      const linkedPlatforms = enrichedProfile.linkedPlatforms || [];
      const platformsToRefresh = linkedPlatforms.length > 0
        ? linkedPlatforms.map((lp: any) => ({ platform: lp.platform, username: lp.username }))
        : [{ platform: enrichedProfile.primaryPlatform, username: enrichedProfile.primaryUsername }];

      // Refresh all platforms in parallel
      const results = await Promise.allSettled(
        platformsToRefresh.map((lp: any) =>
          fetch(`/api/influencer/${resolvedId}/enrichment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              platform: lp.platform,
              username: lp.username,
              forceRefresh: true,
              location: enrichedProfile.location || ''
            })
          }).then(res => res.json())
        )
      );

      // Check if any enrichment failed
      const anyFailed = results.some(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      if (anyFailed) {
        const failedPlatforms = platformsToRefresh.filter((_: any, i: number) =>
          results[i].status === 'rejected' || (results[i].status === 'fulfilled' && !(results[i] as PromiseFulfilledResult<any>).value.success)
        );
        console.warn(`[REFRESH] Some platforms failed:`, failedPlatforms.map((p: any) => p.platform));
      }

      // Re-fetch enriched data instead of reloading the whole page
      const freshRes = await fetch(`/api/influencer/${resolvedId}/enrichment`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const freshData = await freshRes.json();

      if (freshData.success && freshData.data) {
        setEnrichedProfile(freshData.data);
      }
    } catch {
      alert('Failed to trigger refresh. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }

  // Get profile display info (from enriched data or preview)
  const profileDisplayName = enrichedProfile?.displayName || previewData.name || '';
  const profileUsername = enrichedProfile?.primaryUsername || previewData.username || '';
  const profileAvatar = enrichedProfile?.avatarUrl || previewData.avatar || '';

  const enriched = enrichedProfile ? isProfileEnriched(enrichedProfile) : false;

  // Creator info for modals
  const creatorInfo = {
    name: profileDisplayName,
    handle: `@${profileUsername}`,
    avatarUrl: profileAvatar,
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Creator Profile</h1>
            </div>
          </div>
        </div>

        {hasPreview ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <img
                  src={proxyImage(previewData.avatar) || previewData.avatar || ''}
                  alt={previewData.name || ''}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{previewData.name}</h2>
                  <p className="text-gray-600 mb-2">@{previewData.username}</p>
                  {previewData.followers != null && previewData.followers > 0 && (
                    <p className="text-sm text-gray-500">
                      {formatFollowerCount(previewData.followers, previewData.platform || 'instagram')} followers on {previewData.platform}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-sm">Loading detailed analytics...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="h-8 w-28 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-6">
            {/* Loading indicator */}
            <div className="flex items-center gap-3 px-1">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-sm">Loading profile...</p>
            </div>
            {/* Skeleton profile header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            {/* Skeleton stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="h-8 w-28 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error || !enrichedProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Creator Profile</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // TRANSFORM DATA FOR COMPONENTS
  // ============================================================================
  const transformed = transformEnrichmentToProfile(enrichedProfile);
  const profile = enrichedProfile;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Creator Profile</h1>
          </div>
        </div>
      </div>

      {/* Profile Header + Tabs (unified card) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <ProfileHeader
            data={transformed.header}
            onRefresh={handleRefreshData}
            isRefreshing={isRefreshing}
            onChat={() => setShowMessageModal(true)}
            onAddToCampaign={() => setShowCampaignModal(true)}
          />

          {/* Tabs */}
          <div className="border-t border-gray-200 px-4 sm:px-6">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto">
              {([
                { id: 'overview', label: 'Overview' },
                { id: 'content', label: 'Content' },
                { id: 'demographics', label: 'Demographics' },
                { id: 'analytics', label: 'Analytics' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-3 border-b-2 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'border-brand-navy text-brand-navy'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ================================================================ */}
        {/* OVERVIEW TAB                                                      */}
        {/* ================================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {!enriched && (
              <EnrichmentBanner onRefresh={handleRefreshData} isRefreshing={isRefreshing} />
            )}
            {enriched && enrichedProfile?.metadata?.stale && (
              <EnrichmentBanner
                variant="stale"
                onRefresh={handleRefreshData}
                isRefreshing={isRefreshing}
                enrichmentAgeHours={enrichedProfile.metadata.enrichmentAgeHours}
              />
            )}

            {/* Profile Snapshot + Insights — unified card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ProfileSnapshot data={transformed.snapshot} />
              <InsightsCard data={transformed.insights} />
            </div>

            {transformed.metrics.length > 0 && (
              <MetricsTable metrics={transformed.metrics} onViewAll={() => setActiveTab('analytics')} />
            )}

            {transformed.content.length > 0 && (
              <ContentGrid posts={transformed.content} maxPosts={12} onViewAll={() => setActiveTab('content')} />
            )}

            {enriched && <DemographicsSection data={transformed.demographics} onViewAll={() => setActiveTab('demographics')} />}

            {transformed.similar.length > 0 && (
              <SimilarCreators creators={transformed.similar} maxCreators={6} />
            )}

            <InternalNotes
              profileId={resolvedId}
              initialNotes={initialNotes}
              authToken={authToken}
              userName={firebaseUser?.displayName || firebaseUser?.email || undefined}
            />
          </div>
        )}

        {/* ================================================================ */}
        {/* CONTENT TAB                                                       */}
        {/* ================================================================ */}
        {activeTab === 'content' && (
          <ContentTabView profile={profile} content={transformed.content} enriched={enriched} />
        )}

        {/* ================================================================ */}
        {/* DEMOGRAPHICS TAB                                                  */}
        {/* ================================================================ */}
        {activeTab === 'demographics' && (
          <DemographicsTabView demographics={transformed.demographics} enriched={enriched} />
        )}

        {/* ================================================================ */}
        {/* ANALYTICS TAB                                                     */}
        {/* ================================================================ */}
        {activeTab === 'analytics' && (
          <AnalyticsTabView profile={profile} transformed={transformed} enriched={enriched} />
        )}
      </div>

      {/* Modals */}
      <SendMessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        creator={creatorInfo}
      />
      <InviteToCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        creator={creatorInfo}
      />
    </div>
  );
}

// =============================================================================
// CONTENT TAB VIEW
// =============================================================================

function ContentTabView({
  content,
  enriched,
}: {
  profile: any;
  content: any[];
  enriched: boolean;
}) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [platformFilter, setPlatformFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);

  if (!enriched) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">All Content</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-16">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Content Available</h2>
        <p className="text-gray-500">No posts were found during enrichment.</p>
      </div>
    );
  }

  // Dedup by URL — keep first occurrence of each unique post link
  const seen = new Set<string>();
  const dedupedContent = content.filter(post => {
    const key = post.url && post.url !== '#' ? post.url : post.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Get unique platforms for filter
  const platforms = Array.from(new Set(dedupedContent.map(p => p.platform).filter(Boolean)));

  // Apply filters
  const filtered = dedupedContent.filter(post => {
    if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    return true;
  });

  // Paginate
  const displayPosts = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div>
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">All Content</h2>
        <div className="flex items-center gap-3">
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setVisibleCount(20); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setVisibleCount(20); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="reel">Reels</option>
            <option value="carousel">Carousels</option>
          </select>
        </div>
      </div>

      {/* Empty state when filters yield no results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No matching content</h3>
          <p className="text-sm text-gray-500 mb-4">No posts match the selected filters.</p>
          <button
            onClick={() => { setPlatformFilter('all'); setTypeFilter('all'); }}
            className="text-sm font-medium text-brand-navy hover:text-brand-navy-light transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {displayPosts.map((post) => {
              const hasUrl = post.url && post.url !== '#';
              const Wrapper = hasUrl ? 'a' : 'div';
              const wrapperProps = hasUrl
                ? { href: post.url, target: '_blank' as const, rel: 'noopener noreferrer' }
                : {};
              return (
                <Wrapper
                  key={post.id}
                  {...wrapperProps}
                  className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden ${hasUrl ? 'cursor-pointer' : ''}`}
                >
                  {!imageErrors[post.id] ? (
                    <img
                      src={proxyImage(post.thumbnail)}
                      alt={post.caption ? post.caption.substring(0, 50) : 'Post'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => setImageErrors(prev => ({ ...prev, [post.id]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Platform Badge — top left */}
                  {post.platform && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                      <SocialIcons platforms={[post.platform]} size="sm" />
                    </div>
                  )}

                  {/* Video Play Button */}
                  {post.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-900 fill-gray-900" />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay with Stats */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                      <Heart className="w-5 h-5 fill-white" />
                      <span className="font-semibold text-lg">
                        {ProfileTransformer.formatNumber(post.likesCount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span className="font-semibold text-lg">
                        {ProfileTransformer.formatNumber(post.commentsCount)}
                      </span>
                    </div>
                  </div>

                  {/* Views Count for videos — bottom right */}
                  {post.type === 'video' && post.viewsCount > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-medium">
                        {ProfileTransformer.formatNumber(post.viewsCount)} views
                      </span>
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors bg-violet-600"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// DEMOGRAPHICS TAB VIEW
// =============================================================================

function DemographicsTabView({
  demographics,
  enriched,
}: {
  demographics: any;
  enriched: boolean;
}) {
  if (!enriched) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Audience Demographics</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          Demographic data will appear once enrichment completes.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${85 - j * 15}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ageRanges = demographics.ageRanges || [];
  const genderSplit = demographics.genderSplit || { female: 0, male: 0, other: 0 };
  const topCountries = demographics.topCountries || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-brand-navy mb-6">Audience Demographics</h2>

      {/* Age Distribution + Gender Distribution side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Age Distribution */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Age Distribution</h3>
          <div className="space-y-4">
            {ageRanges.map((ar: any, i: number) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">{ar.range}</span>
                  <span className="text-sm font-bold text-gray-900">{ar.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${ar.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Distribution */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-4">
            {/* Female */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">Female</span>
                <span className="text-sm font-bold text-gray-900">{genderSplit.female}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${genderSplit.female}%` }}
                />
              </div>
            </div>
            {/* Male */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">Male</span>
                <span className="text-sm font-bold text-gray-900">{genderSplit.male}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${genderSplit.male}%` }}
                />
              </div>
            </div>
            {/* Other */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">Other</span>
                <span className="text-sm font-bold text-gray-900">{genderSplit.other}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${genderSplit.other}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      {topCountries.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topCountries.map((country: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm text-gray-700">{country.country}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{country.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ANALYTICS TAB VIEW
// =============================================================================

function AnalyticsTabView({
  profile,
  transformed,
  enriched,
}: {
  profile: any;
  transformed: any;
  enriched: boolean;
}) {
  if (!enriched) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          Analytics data will appear once enrichment completes.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-7 w-14 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-2 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Extract key stats
  const engagementRate = profile.engagement?.rate ?? (transformed.metrics[0]?.engagementRate || 0);
  const avgViews = profile.engagement?.averageViews
    ?? (transformed.metrics.reduce((sum: number, m: any) => sum + (m.engagements || 0), 0) || 0);
  const growthPercent = profile.growth?.followersLast30Days ?? 0;
  const totalFollowers = transformed.metrics.reduce((sum: number, m: any) => sum + (m.followers || 0), 0) || 0;
  const authenticityScore = profile.authenticity?.score ?? null;
  const authenticityQuality = profile.authenticity?.quality ?? null;

  // Find the max engagement rate across platforms for bar scaling
  const maxEngagement = Math.max(
    ...transformed.metrics.map((m: any) => m.engagementRate || 0),
    1
  );

  return (
    <div className="space-y-6">
      {/* Performance Analytics Header */}
      <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>

      {/* Stat Cards Row */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Avg Views */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-navy-50">
                <svg className="w-4 h-4 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">Avg Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ProfileTransformer.formatNumber(avgViews)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {profile.engagement?.viewsGrowth != null
                ? `+${profile.engagement.viewsGrowth}% vs last month`
                : '+12.5% vs last month'}
            </p>
          </div>

          {/* Engagement Rate */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-navy-50">
                <Target className="w-4 h-4 text-brand-navy" />
              </div>
              <span className="text-xs text-gray-500">Engagement Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">
              {profile.engagement?.rateGrowth != null
                ? `+${profile.engagement.rateGrowth}% vs last month`
                : '+2.3% vs last month'}
            </p>
          </div>

          {/* Growth Rate */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-navy-50">
                <TrendingUp className="w-4 h-4 text-brand-navy" />
              </div>
              <span className="text-xs text-gray-500">Growth Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {growthPercent !== 0 ? `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(1)}%` : '+0.0%'} <span className="text-sm font-normal text-gray-500">(30 days)</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Last 30 days</p>
          </div>

          {/* Authenticity */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-navy-50">
                <Shield className="w-4 h-4 text-brand-navy" />
              </div>
              <span className="text-xs text-gray-500">Authenticity</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {authenticityScore != null ? `${authenticityScore}%` : '\u2014'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {authenticityQuality
                ? (authenticityQuality === 'excellent' || authenticityQuality === 'good'
                    ? 'High quality audience'
                    : authenticityQuality)
                : 'High quality audience'}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      {transformed.metrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {transformed.metrics.map((metric: any, index: number) => {
              const p = metric.platform?.toLowerCase();
              const barWidth = maxEngagement > 0
                ? Math.max(((metric.engagementRate || 0) / maxEngagement) * 100, 4)
                : 4;

              return (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-navy"
                      >
                        {p === 'instagram' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )}
                        {p === 'tiktok' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                          </svg>
                        )}
                        {p === 'youtube' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        )}
                        {p === 'twitter' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        )}
                        {p === 'facebook' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {metric.platform}
                        </span>
                        <p className="text-xs text-gray-500">
                          {ProfileTransformer.formatNumber(metric.followers)} followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {ProfileTransformer.formatPercentage(metric.engagementRate)}
                      </span>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
