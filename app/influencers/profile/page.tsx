'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Loader2,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Heart,
  MessageCircle,
  Play,
  Image as ImageIcon,
  Target,
  Shield,
  TrendingUp,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ProtectedRoute, EmailVerificationGuard, ProfileCompletionGuard } from '@/components/auth';
import { useAuth } from '@/lib/firebase/auth-context';
import { proxyImage } from '@/lib/utils';
import { InfluencerProfile } from '@/types/firebase';
import PageLoader from '@/components/ui/PageLoader';
import {
  CreatorProfileCard,
  ProfileSnapshot,
  InsightsCard,
  MetricsTable,
  ContentGrid,
  DemographicsSection,
  SimilarCreators,
  EnrichmentBanner,
  transformEnrichmentToProfile,
  isProfileEnriched,
} from '@/components/influencer-profile';
import { SettingsTab, SettingsFormData } from '@/components/influencer-profile/SettingsTab';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';
import SocialIcons from '@/components/SocialIcons';

type TopTab = 'overview' | 'settings';
type InnerTab = 'overview' | 'content' | 'demographics' | 'analytics';

function InfluencerProfilePageContent() {
  const { firebaseUser, userProfile, roleProfile, refreshUserProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  // Top-level tab — respect ?tab=settings URL param
  const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'overview';
  const [topTab, setTopTab] = useState<TopTab>(initialTab);

  // Inner sub-tab for Overview
  const [innerTab, setInnerTab] = useState<InnerTab>('overview');

  // Enrichment data
  const [enrichedProfile, setEnrichedProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalId, setGlobalId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Cast roleProfile
  const influencerProfile = roleProfile as InfluencerProfile | null;

  // ============================================================================
  // FETCH ENRICHMENT DATA
  // ============================================================================
  useEffect(() => {
    if (authLoading || !firebaseUser) return;

    let cancelled = false;

    async function fetchEnrichment() {
      setIsLoading(true);
      try {
        const token = await firebaseUser!.getIdToken();

        // Step 1: Resolve global_influencers ID
        const myProfileRes = await fetch('/api/influencer/my-profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!myProfileRes.ok) {
          setIsLoading(false);
          return;
        }

        const myProfileData = await myProfileRes.json();
        if (!myProfileData.success || !myProfileData.data.primaryGlobalId) {
          setIsLoading(false);
          return;
        }

        const gid = myProfileData.data.primaryGlobalId;
        if (cancelled) return;
        setGlobalId(gid);

        // Step 2: Fetch enrichment
        const enrichRes = await fetch(`/api/influencer/${gid}/enrichment`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!enrichRes.ok) {
          setIsLoading(false);
          return;
        }

        const enrichData = await enrichRes.json();
        if (cancelled) return;

        if (enrichData.success && enrichData.data) {
          setEnrichedProfile(enrichData.data);
        }
      } catch (err) {
        console.error('[PROFILE] Enrichment fetch error:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchEnrichment();
    return () => { cancelled = true; };
  }, [authLoading, firebaseUser]);

  // ============================================================================
  // REFRESH HANDLER (manual only — no automatic polling)
  // ============================================================================
  async function handleRefreshData() {
    if (!firebaseUser) return;
    setIsRefreshing(true);
    try {
      const token = await firebaseUser.getIdToken();

      // Resolve globalId if we don't have one yet
      let gid = globalId;
      if (!gid) {
        const myProfileRes = await fetch('/api/influencer/my-profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const myProfileData = await myProfileRes.json();
        if (myProfileData.success && myProfileData.data.primaryGlobalId) {
          gid = myProfileData.data.primaryGlobalId;
          setGlobalId(gid);
        }
      }

      if (!gid) {
        // No global_influencers doc exists — nothing to enrich
        setIsRefreshing(false);
        return;
      }

      // Determine which platforms to refresh
      const linkedPlatforms = enrichedProfile?.linkedPlatforms || [];
      const platformsToRefresh = linkedPlatforms.length > 0
        ? linkedPlatforms.map((lp: any) => ({ platform: lp.platform, username: lp.username }))
        : enrichedProfile
          ? [{ platform: enrichedProfile.primaryPlatform, username: enrichedProfile.primaryUsername }]
          : influencerProfile?.linkedAccounts?.filter(a => a.username?.trim()).map(a => ({ platform: a.platform, username: a.username })) || [];

      if (platformsToRefresh.length > 0) {
        await Promise.allSettled(
          platformsToRefresh.map((lp: any) =>
            fetch(`/api/influencer/${gid}/enrichment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ platform: lp.platform, username: lp.username, forceRefresh: true }),
            }).then(res => res.json())
          )
        );
      }

      // Fetch the latest enrichment data
      const freshRes = await fetch(`/api/influencer/${gid}/enrichment`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const freshData = await freshRes.json();
      if (freshData.success && freshData.data) {
        setEnrichedProfile(freshData.data);
      }
    } catch (err) {
      console.error('[PROFILE] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }

  // ============================================================================
  // CONNECT ACCOUNT (triggers enrichment immediately)
  // ============================================================================
  async function handleConnectAccount(platform: string, username: string): Promise<{ success: boolean; globalInfluencerId?: string }> {
    if (!firebaseUser) return { success: false };

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/influencer/my-profile/link-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, username }),
      });

      const json = await res.json();
      if (!json.success) return { success: false };

      // Refresh enrichment data in the background
      const gid = json.data.globalInfluencerId;
      if (gid) {
        setGlobalId(gid);
        // Fetch fresh enrichment data so Overview tab updates
        fetch(`/api/influencer/${gid}/enrichment`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && data.data) setEnrichedProfile(data.data);
          })
          .catch(() => {});
      }

      // Refresh user profile so linked account status persists immediately
      await refreshUserProfile();

      return { success: true, globalInfluencerId: gid };
    } catch (err) {
      console.error('[PROFILE] Connect account error:', err);
      return { success: false };
    }
  }

  // ============================================================================
  // SAVE SETTINGS (via PUT API)
  // ============================================================================
  async function handleSaveSettings(formData?: SettingsFormData) {
    if (!firebaseUser || !userProfile || !influencerProfile) return;

    // If no formData passed, try to get from the window ref
    const data = formData || await (window as any).__settingsFormData?.();
    if (!data) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/influencer/my-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to save profile');
      }

      await refreshUserProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  // ============================================================================
  // DERIVED DATA
  // ============================================================================
  const enriched = enrichedProfile ? isProfileEnriched(enrichedProfile) : false;
  const transformed = enrichedProfile ? transformEnrichmentToProfile(enrichedProfile) : null;

  const profileName = enrichedProfile?.displayName || influencerProfile?.displayName || userProfile?.displayName || '';
  const profileAvatar = enrichedProfile?.avatarUrl || influencerProfile?.avatarUrl || userProfile?.photoURL || '';
  const profileBio = enrichedProfile?.bio || influencerProfile?.bio || '';
  const profileLocation = enrichedProfile?.location || influencerProfile?.location || '';
  const profileCategory = enrichedProfile?.categories?.[0] || influencerProfile?.categories?.[0] || '';
  const totalFollowers = enrichedProfile?.totalFollowers || influencerProfile?.totalFollowers || 0;
  const engagementRate = enrichedProfile?.engagement?.rate || influencerProfile?.averageEngagementRate || 0;

  // A connected account exists if we have a globalId or any linked account with a username
  const hasConnectedAccount = !!(globalId || influencerProfile?.linkedAccounts?.some(a => a.username?.trim()));

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <ProtectedRoute allowedRoles={['influencer']}>
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      View and manage your Creator profile.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveSettings()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>

                {/* Save Status */}
                {saveSuccess && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">Profile updated successfully!</span>
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800">{saveError}</span>
                  </div>
                )}

                {/* Top Tabs */}
                <div className="flex gap-6 mt-6 border-b border-gray-200 -mb-[1px]">
                  {([
                    { id: 'overview' as TopTab, label: 'Overview' },
                    { id: 'settings' as TopTab, label: 'Settings' },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setTopTab(tab.id)}
                      className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                        topTab === tab.id
                          ? 'border-brand-navy text-brand-navy'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* ================================================================ */}
              {/* OVERVIEW TAB                                                      */}
              {/* ================================================================ */}
              {topTab === 'overview' && (
                <div className="space-y-6">
                  {/* Creator Profile Card */}
                  <CreatorProfileCard
                    avatarUrl={profileAvatar}
                    displayName={profileName}
                    category={profileCategory}
                    location={profileLocation}
                    bio={profileBio}
                    totalFollowers={totalFollowers}
                    engagementRate={engagementRate}
                    campaignCount={0}
                    onEditClick={() => setTopTab('settings')}
                  />

                  {/* Refresh Enrichment Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleRefreshData}
                      disabled={!hasConnectedAccount || isRefreshing}
                      title={!hasConnectedAccount ? 'Connect a social account in Settings to enable enrichment' : 'Refresh profile analytics'}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasConnectedAccount && !isRefreshing
                          ? 'bg-brand-navy text-white hover:bg-opacity-90'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                  </div>

                  {/* Loading state for enrichment */}
                  {isLoading && (
                    <div className="flex items-center gap-3 px-1">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <p className="text-gray-600 text-sm">Loading analytics data...</p>
                    </div>
                  )}

                  {/* No enrichment data */}
                  {!isLoading && !enrichedProfile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-semibold text-blue-900">
                            Analytics not yet available
                          </h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Connect your social media accounts in the Settings tab and make sure they
                            match a discovered profile. Once your profile is found and enriched by a
                            brand, detailed analytics will appear here.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enriched content */}
                  {!isLoading && enrichedProfile && transformed && (
                    <>
                      {/* Inner Sub-Tabs */}
                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-4 sm:px-6 border-b border-gray-200">
                          <div className="flex gap-4 sm:gap-8 overflow-x-auto">
                            {([
                              { id: 'overview' as InnerTab, label: 'Overview' },
                              { id: 'content' as InnerTab, label: 'Content' },
                              { id: 'demographics' as InnerTab, label: 'Demographics' },
                              { id: 'analytics' as InnerTab, label: 'Analytics' },
                            ]).map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => setInnerTab(tab.id)}
                                className={`py-3 border-b-2 text-sm font-medium transition-colors ${
                                  innerTab === tab.id
                                    ? 'border-brand-navy text-brand-navy'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Inner Tab Content */}
                      {innerTab === 'overview' && (
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

                          <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <ProfileSnapshot data={transformed.snapshot} />
                            <InsightsCard data={transformed.insights} />
                          </div>

                          {transformed.metrics.length > 0 && (
                            <MetricsTable metrics={transformed.metrics} onViewAll={() => setInnerTab('analytics')} />
                          )}

                          {transformed.content.length > 0 && (
                            <ContentGrid posts={transformed.content} maxPosts={12} onViewAll={() => setInnerTab('content')} />
                          )}

                          {enriched && <DemographicsSection data={transformed.demographics} onViewAll={() => setInnerTab('demographics')} />}

                          {transformed.similar.length > 0 && (
                            <SimilarCreators creators={transformed.similar} maxCreators={6} />
                          )}
                        </div>
                      )}

                      {innerTab === 'content' && (
                        <ContentTabView
                          profile={enrichedProfile}
                          content={transformed.content}
                          enriched={enriched}
                        />
                      )}

                      {innerTab === 'demographics' && (
                        <DemographicsTabView
                          demographics={transformed.demographics}
                          enriched={enriched}
                        />
                      )}

                      {innerTab === 'analytics' && (
                        <AnalyticsTabView
                          profile={enrichedProfile}
                          transformed={transformed}
                          enriched={enriched}
                        />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ================================================================ */}
              {/* SETTINGS TAB                                                      */}
              {/* ================================================================ */}
              {topTab === 'settings' && (
                <SettingsTab
                  roleProfile={influencerProfile}
                  userProfile={userProfile}
                  userEmail={userProfile?.email || firebaseUser?.email || ''}
                  phoneNumber={userProfile?.phoneNumber || ''}
                  userId={firebaseUser?.uid || ''}
                  onSave={handleSaveSettings}
                  onConnect={handleConnectAccount}
                  enrichedBio={enrichedProfile?.bio || ''}
                />
              )}
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    </ProtectedRoute>
  );
}

export default function InfluencerProfilePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InfluencerProfilePageContent />
    </Suspense>
  );
}

// =============================================================================
// CONTENT TAB VIEW (same pattern as brand-side)
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

  const seen = new Set<string>();
  const dedupedContent = content.filter(post => {
    const key = post.url && post.url !== '#' ? post.url : post.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const platforms = Array.from(new Set(dedupedContent.map(p => p.platform).filter(Boolean)));

  const filtered = dedupedContent.filter(post => {
    if (platformFilter !== 'all' && post.platform !== platformFilter) return false;
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    return true;
  });

  const displayPosts = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">All Content</h2>
        <div className="flex items-center gap-3">
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setVisibleCount(20); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            <option value="all">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setVisibleCount(20); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="reel">Reels</option>
            <option value="carousel">Carousels</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No matching content</h3>
          <p className="text-sm text-gray-500 mb-4">No posts match the selected filters.</p>
          <button
            onClick={() => { setPlatformFilter('all'); setTypeFilter('all'); }}
            className="text-sm font-medium text-brand-navy hover:underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
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

                  {post.platform && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                      <SocialIcons platforms={[post.platform]} size="sm" />
                    </div>
                  )}

                  {post.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-900 fill-gray-900" />
                      </div>
                    </div>
                  )}

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

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors bg-brand-navy hover:bg-opacity-90"
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
                    className="h-full rounded-full transition-all duration-500 bg-brand-navy"
                    style={{ width: `${ar.percentage}%` }}
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
            {[
              { label: 'Female', value: genderSplit.female },
              { label: 'Male', value: genderSplit.male },
              { label: 'Other', value: genderSplit.other },
            ].map((g) => (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">{g.label}</span>
                  <span className="text-sm font-bold text-gray-900">{g.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-brand-navy"
                    style={{ width: `${g.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
      </div>
    );
  }

  const engagementRate = profile.engagement?.rate ?? (transformed.metrics[0]?.engagementRate || 0);
  const avgViews = profile.engagement?.averageViews
    ?? (transformed.metrics.reduce((sum: number, m: any) => sum + (m.engagements || 0), 0) || 0);
  const growthPercent = profile.growth?.followersLast30Days ?? 0;
  const authenticityScore = profile.authenticity?.score ?? null;
  const authenticityQuality = profile.authenticity?.quality ?? null;

  const maxEngagement = Math.max(
    ...transformed.metrics.map((m: any) => m.engagementRate || 0),
    1
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>

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
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        )}
                        {p === 'tiktok' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                        )}
                        {p === 'youtube' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                        {p === 'twitter' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        )}
                        {p === 'facebook' && (
                          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
                      className="h-full rounded-full transition-all duration-500 bg-brand-navy"
                      style={{ width: `${barWidth}%` }}
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
