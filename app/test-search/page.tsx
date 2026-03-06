'use client';

/**
 * Test Page for Real-Time Influencer Search + Profile Enrichment
 * Navigate to: http://localhost:3000/test-search
 */

import { useState } from 'react';
import { RealtimeInfluencerSearch } from '@/components/search';
import { SearchResult } from '@/types/unified-profile';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface EnrichmentResult {
  profile: any;
  dataCompleteness: number;
  sourcesUsed: string[];
  fetchTime: number;
  errors: string[];
  rawMethodData?: {
    method1_profileDetails?: any;
    method2_directPosts?: any[];
    method3_directReels?: any[];
    method4_directMentions?: any[];
    method5_userSearch?: any[];
    method6_hashtagSearch?: any[];
    method7_placeSearch?: any[];
    method8_relatedProfiles?: any[];
  };
  metadata: {
    enrichedAt: string;
    username: string;
    platform: string;
    methodCount: number;
    apiMethodCount: number;
    extractionMethodCount: number;
  };
}

export default function TestSearchPage() {
  const [selectedProfile, setSelectedProfile] = useState<SearchResult | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<SearchResult[]>([]);
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isSavingData, setIsSavingData] = useState(false);
  const [saveDataMessage, setSaveDataMessage] = useState<string | null>(null);

  const handleSelectProfile = (profile: SearchResult) => {
    console.log('Profile selected:', profile);
    setSelectedProfile(profile);
    setEnrichmentResult(null); // Clear previous enrichment
    setEnrichmentError(null);

    // Auto-add to saved list (for testing)
    if (!savedProfiles.find(p => p.profileId === profile.profileId)) {
      setSavedProfiles(prev => [...prev, profile]);
    }

    // Auto-trigger enrichment if profile has Instagram
    const instagramPlatform = profile.platforms.find(p => p.platform === 'instagram');
    if (instagramPlatform) {
      // Trigger enrichment after a short delay to allow state to update
      setTimeout(() => {
        triggerEnrichment(profile);
      }, 100);
    }
  };

  const triggerEnrichment = async (profile: SearchResult) => {
    // Extract Instagram username from the profile
    const instagramPlatform = profile.platforms.find(p => p.platform === 'instagram');

    if (!instagramPlatform) {
      setEnrichmentError('No Instagram account found for this profile');
      return;
    }

    const username = instagramPlatform.username;

    // Extract cached profile data from search results (if available)
    const cachedProfileData = (profile as any).rawData;

    setIsEnriching(true);
    setEnrichmentError(null);
    setEnrichmentResult(null);

    try {
      if (cachedProfileData) {
        console.log(`[Enrichment] Auto-starting enrichment for @${username} (with cached data)`);
        console.log('[Enrichment] Cached data available - METHOD 1 will be skipped!');
      } else {
        console.log(`[Enrichment] Auto-starting enrichment for @${username}`);
      }

      const response = await fetch('/api/enrich/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          cachedProfileData, // ✅ Pass cached data to skip METHOD 1
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Enrichment failed');
      }

      console.log('[Enrichment] Success:', data.data);
      setEnrichmentResult(data.data);

      // Auto-expand the profile overview section
      setExpandedSections({ profileOverview: true });
    } catch (error: any) {
      console.error('[Enrichment] Error:', error);
      setEnrichmentError(error.message || 'Failed to enrich profile');
    } finally {
      setIsEnriching(false);
    }
  };


  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const removeProfile = (profileId: string) => {
    setSavedProfiles(prev => prev.filter(p => p.profileId !== profileId));
    if (selectedProfile?.profileId === profileId) {
      setSelectedProfile(null);
      setEnrichmentResult(null);
      setEnrichmentError(null);
    }
  };

  const clearAll = () => {
    setSavedProfiles([]);
    setSelectedProfile(null);
    setEnrichmentResult(null);
    setEnrichmentError(null);
  };

  const saveApifyDataToFile = async () => {
    if (!enrichmentResult?.rawMethodData) {
      setSaveDataMessage('❌ No raw data available to save');
      setTimeout(() => setSaveDataMessage(null), 3000);
      return;
    }

    setIsSavingData(true);
    setSaveDataMessage(null);

    try {
      const instagramPlatform = selectedProfile?.platforms.find(p => p.platform === 'instagram');
      const username = instagramPlatform?.username || 'unknown';

      const response = await fetch('/api/save-apify-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMethodData: enrichmentResult.rawMethodData,
          username: username,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveDataMessage(`✅ Raw data saved to ${data.filePath} (${(data.dataSize / 1024).toFixed(2)} KB)`);
        console.log('[Save Data] Success:', data);
      } else {
        setSaveDataMessage(`❌ Failed to save: ${data.error}`);
      }
    } catch (error: any) {
      console.error('[Save Data] Error:', error);
      setSaveDataMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSavingData(false);
      setTimeout(() => setSaveDataMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Search + Profile Enrichment Test
          </h1>
          <p className="text-gray-600 mt-2">
            Test the real-time search + 8-method concurrent Instagram enrichment
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How to Test:
          </h2>
          <ol className="text-blue-800 space-y-1 list-decimal list-inside">
            <li>Type a celebrity or influencer name (e.g., &quot;cristiano&quot;, &quot;kylie&quot;, &quot;mrbeast&quot;)</li>
            <li><strong>Click the Search button</strong> or press Enter to trigger search</li>
            <li>Click on a result to select it</li>
            <li><strong>Enrichment starts automatically!</strong> All 8 methods run concurrently</li>
            <li>Expand sections to view raw JSON data for each method</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>

        {/* Search Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 1: Search Influencers
          </h2>

          <RealtimeInfluencerSearch
            onSelectProfile={handleSelectProfile}
            maxResults={10}
          />
        </div>

        {/* Selected Profile Details */}
        {selectedProfile && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 2: Selected Profile
            </h2>

            <div className="flex items-start gap-6 mb-6">
              {/* Avatar */}
              <img
                src={selectedProfile.avatar || '/default-avatar.png'}
                alt={selectedProfile.fullName}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />

              {/* Details */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedProfile.fullName}
                </h3>
                <p className="text-lg text-gray-600 mb-3">
                  @{selectedProfile.primaryUsername}
                </p>

                {/* Metrics */}
                <div className="flex gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Followers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedProfile.totalFollowers.toLocaleString()}
                    </p>
                  </div>
                  {selectedProfile.totalFollowing > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Following</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedProfile.totalFollowing.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Platforms</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedProfile.platforms.length}
                    </p>
                  </div>
                </div>

                {/* Platform Details */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Platform Breakdown:
                  </p>
                  <div className="space-y-2">
                    {selectedProfile.platforms.map(platform => (
                      <div
                        key={platform.platform}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {platform.platform}
                          </span>
                          {platform.verified && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          @{platform.username} • {platform.followers.toLocaleString()} followers
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enrichment Status */}
            <div className="border-t pt-6">
              {isEnriching && (
                <div className="flex items-center justify-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-blue-900 font-medium">
                    Running 8 Concurrent Methods...
                  </span>
                </div>
              )}

              {!isEnriching && !enrichmentResult && !enrichmentError && selectedProfile.platforms.find(p => p.platform === 'instagram') && (
                <div className="flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                  <span className="text-green-900 font-medium">
                    🚀 Auto-enrichment starting...
                  </span>
                </div>
              )}

              {!selectedProfile.platforms.find(p => p.platform === 'instagram') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 text-center">
                    ⚠️ No Instagram account found for this profile - Enrichment not available
                  </p>
                </div>
              )}
            </div>

            {/* Search Profile JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                View Search Result JSON
              </summary>
              <pre className="mt-3 bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(selectedProfile, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Enrichment Error */}
        {enrichmentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Enrichment Error
            </h3>
            <p className="text-red-700">{enrichmentError}</p>
          </div>
        )}

        {/* Enrichment Results */}
        {enrichmentResult && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Enrichment Complete!
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Data Completeness</p>
                  <p className="text-3xl font-bold text-green-600">
                    {enrichmentResult.dataCompleteness}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Fetch Time</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {(enrichmentResult.fetchTime / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Methods Used</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {enrichmentResult.metadata.methodCount}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Sources</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {enrichmentResult.sourcesUsed.length}
                  </p>
                </div>
              </div>

              {/* Sources Used */}
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Sources Used:
                </p>
                <div className="flex flex-wrap gap-2">
                  {enrichmentResult.sourcesUsed.map((source, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {enrichmentResult.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">
                    ⚠️ Partial Failures ({enrichmentResult.errors.length}):
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {enrichmentResult.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Raw JSON Data Sections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 3: Raw JSON Data (All 8 Methods)
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Click on each section to view the raw data from each enrichment method
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {/* Profile Overview */}
                <div>
                  <button
                    onClick={() => toggleSection('profileOverview')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['profileOverview'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Complete Profile Overview
                      </span>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      All Methods Combined
                    </span>
                  </button>
                  {expandedSections['profileOverview'] && (
                    <div className="px-6 pb-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 1: Profile Details */}
                <div>
                  <button
                    onClick={() => toggleSection('method1')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method1'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 1: Profile Details (MODE 1)
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      directUrls + resultsType: &quot;details&quot;
                    </span>
                  </button>
                  {expandedSections['method1'] && (
                    <div className="px-6 pb-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 2: Direct Posts */}
                <div>
                  <button
                    onClick={() => toggleSection('method2')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method2'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 2: Direct Posts (MODE 1)
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      directUrls + resultsType: &quot;posts&quot;
                    </span>
                  </button>
                  {expandedSections['method2'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Posts Count: {enrichmentResult.profile.basicProfile.latestPosts?.length || 0}
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.type === 'post'), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 3: Direct Reels */}
                <div>
                  <button
                    onClick={() => toggleSection('method3')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method3'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 3: Direct Reels (MODE 1)
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      directUrls + resultsType: &quot;reels&quot;
                    </span>
                  </button>
                  {expandedSections['method3'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Reels Count: {enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.type === 'reel').length || 0}
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.type === 'reel'), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 4: Direct Mentions */}
                <div>
                  <button
                    onClick={() => toggleSection('method4')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method4'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 4: Direct Mentions (MODE 1) ✨ NEW
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      directUrls + resultsType: &quot;mentions&quot;
                    </span>
                  </button>
                  {expandedSections['method4'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Mentions Count: {enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.type === 'mention').length || 0}
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.type === 'mention'), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 5: User Search */}
                <div>
                  <button
                    onClick={() => toggleSection('method5')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method5'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 5: User Search (MODE 2)
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      search + searchType: &quot;user&quot;
                    </span>
                  </button>
                  {expandedSections['method5'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        User Search Results
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile.latestPosts?.filter((p: any) => p.source === 'user-search'), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 6: Hashtag Search */}
                <div>
                  <button
                    onClick={() => toggleSection('method6')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method6'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 6: Hashtag Search (MODE 2)
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      search + searchType: &quot;hashtag&quot;
                    </span>
                  </button>
                  {expandedSections['method6'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Hashtag Performance Data
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.contentAnalysis?.topHashtags, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 7: Place Search */}
                <div>
                  <button
                    onClick={() => toggleSection('method7')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method7'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 7: Place Search (MODE 2)
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Currently Disabled
                    </span>
                  </button>
                  {expandedSections['method7'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Place search is currently disabled
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        []
                      </pre>
                    </div>
                  )}
                </div>

                {/* Method 8: Related Profiles */}
                <div>
                  <button
                    onClick={() => toggleSection('method8')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['method8'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Method 8: Related Profiles (Extraction)
                      </span>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Extracted from Method 1
                    </span>
                  </button>
                  {expandedSections['method8'] && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Related Profiles Count: {enrichmentResult.profile.basicProfile.relatedProfiles?.length || 0}
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult.profile.basicProfile.relatedProfiles, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* RAW APIFY DATA - NEW SECTION */}
                {enrichmentResult.rawMethodData && (
                  <>
                    <div className="bg-yellow-50 border-t-2 border-yellow-400">
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-yellow-900">
                              🔍 RAW APIFY RESPONSES (DEBUG MODE)
                            </h3>
                            <p className="text-sm text-yellow-800 mt-1">
                              Unfiltered data returned from each Apify method - expand to see what was actually returned
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={saveApifyDataToFile}
                              disabled={isSavingData}
                              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                              {isSavingData ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  💾 Save to APIFY.json
                                </>
                              )}
                            </button>
                            {saveDataMessage && (
                              <p className={`text-xs font-medium ${
                                saveDataMessage.startsWith('✅')
                                  ? 'text-green-700'
                                  : 'text-red-700'
                              }`}>
                                {saveDataMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Raw Method 1: Profile Details */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method1')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method1'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 1: Profile Details
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method1_profileDetails ? 'Has Data' : 'Empty/Null'}
                        </span>
                      </button>
                      {expandedSections['raw_method1'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method1_profileDetails, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 2: Direct Posts */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method2')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method2'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 2: Direct Posts
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method2_directPosts?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method2'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method2_directPosts, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 3: Direct Reels */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method3')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method3'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 3: Direct Reels
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method3_directReels?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method3'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method3_directReels, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 4: Direct Mentions */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method4')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method4'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 4: Direct Mentions
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method4_directMentions?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method4'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method4_directMentions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 5: User Search */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method5')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method5'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 5: User Search
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method5_userSearch?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method5'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method5_userSearch, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 6: Hashtag Search */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method6')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method6'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 6: Hashtag Search
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method6_hashtagSearch?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method6'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method6_hashtagSearch, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 7: Place Search */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method7')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method7'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 7: Place Search
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method7_placeSearch?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method7'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method7_placeSearch, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Raw Method 8: Related Profiles */}
                    <div>
                      <button
                        onClick={() => toggleSection('raw_method8')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections['raw_method8'] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            RAW METHOD 8: Related Profiles
                          </span>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {enrichmentResult.rawMethodData.method8_relatedProfiles?.length || 0} items
                        </span>
                      </button>
                      {expandedSections['raw_method8'] && (
                        <div className="px-6 pb-4">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {JSON.stringify(enrichmentResult.rawMethodData.method8_relatedProfiles, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Complete Enrichment Result */}
                <div>
                  <button
                    onClick={() => toggleSection('completeResult')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections['completeResult'] ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-900">
                        Complete Enrichment Result (Full API Response)
                      </span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      All Data
                    </span>
                  </button>
                  {expandedSections['completeResult'] && (
                    <div className="px-6 pb-4">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                        {JSON.stringify(enrichmentResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Profiles List */}
        {savedProfiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Saved Profiles ({savedProfiles.length})
              </h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {savedProfiles.map(profile => (
                <div
                  key={profile.profileId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatar || '/default-avatar.png'}
                      alt={profile.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {profile.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        @{profile.primaryUsername} • {profile.totalFollowers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedProfile(profile)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => removeProfile(profile.profileId)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-4">
          <p className="text-xs font-mono">
            <strong>Debug Info:</strong> Check browser console for detailed logs.
            Network tab will show API calls to <code>/api/search/realtime</code> and <code>/api/enrich/instagram</code>
          </p>
        </div>
      </div>
    </div>
  );
}
