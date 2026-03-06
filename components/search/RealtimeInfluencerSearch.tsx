'use client';

/**
 * Real-time Influencer Search Component
 * Provides instant search results as user types with debouncing
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Platform } from '@/types/api';
import { SearchResult } from '@/types/unified-profile';
import { SearchResultRow } from './SearchResultRow';

const ALL_PLATFORMS: Platform[] = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
];

interface RealtimeInfluencerSearchProps {
  onSelectProfile?: (profile: SearchResult) => void;
  defaultPlatforms?: Platform[];
  maxResults?: number;
}

export function RealtimeInfluencerSearch({
  onSelectProfile,
  defaultPlatforms = ALL_PLATFORMS,
  maxResults = 10,
}: RealtimeInfluencerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(defaultPlatforms);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchSource, setSearchSource] = useState<'local' | 'live' | 'mixed'>('live');
  const [streamingStatus, setStreamingStatus] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Close existing EventSource connection
  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Search function with SSE streaming (triggered by button click or auto-search)
  const performSearch = async () => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Close any existing connection
    closeEventSource();

    setLoading(true);
    setShowDropdown(true);
    setResults([]); // Clear previous results
    setStreamingStatus('Initializing search...');

    try {
      // Create EventSource for SSE streaming
      const searchParams = new URLSearchParams({
        query: query,
        platforms: JSON.stringify(selectedPlatforms),
        limit: maxResults.toString(),
      });

      // Note: EventSource doesn't support POST, so we'll use a workaround
      // We'll make a POST request to start the stream, then receive the ReadableStream
      const response = await fetch('/api/search/realtime-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          platforms: selectedPlatforms,
          limit: maxResults,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start search stream');
      }

      // Process the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[SSE] Stream ended');
              setLoading(false);
              setStreamingStatus('Search complete');
              break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete messages (ending with \n\n)
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete message in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  handleStreamEvent(data);
                } catch (e) {
                  console.error('[SSE] Failed to parse message:', line, e);
                }
              }
            }
          }
        } catch (error) {
          console.error('[SSE] Stream error:', error);
          setLoading(false);
          setStreamingStatus('Search failed');
        }
      };

      processStream();

    } catch (error) {
      console.error('[SSE] Connection error:', error);
      setResults([]);
      setLoading(false);
      setStreamingStatus('Failed to start search');
    }
  };

  // Handle SSE events
  const handleStreamEvent = (data: any) => {
    console.log('[SSE] Event:', data);

    switch (data.type) {
      case 'platform_started':
        setStreamingStatus(`Starting ${data.platform} search...`);
        break;

      case 'results':
        // Add new results progressively
        setResults((prev) => {
          const newResults = [...prev];

          // Add each new item (with deduplication)
          for (const item of data.items) {
            // Simple normalization of raw Apify data
            const normalizedResult: SearchResult = {
              profileId: `temp-${item.username || item.id}`,
              fullName: item.fullName || item.name || item.username || 'Unknown',
              primaryUsername: item.username || '',
              totalFollowers: item.followersCount || item.follower_count || 0,
              totalFollowing: item.followsCount || item.follows_count || 0,
              avatar: item.profilePicUrl || item.profile_pic_url || item.avatar || '/default-avatar.png',
              platforms: [{
                platform: data.platform,
                username: item.username || '',
                followers: item.followersCount || item.follower_count || 0,
                verified: item.isVerified || item.verified || false,
                avatar: item.profilePicUrl || item.profile_pic_url || item.avatar || '',
              }],
              searchScore: 0,
              // rawData: item, // Include full raw data for debugging
            };

            // Check if profile already exists (by username)
            const existingIndex = newResults.findIndex(
              r => r.primaryUsername.toLowerCase() === normalizedResult.primaryUsername.toLowerCase()
            );

            if (existingIndex >= 0) {
              // Merge platforms (avoid duplicates)
              const existing = newResults[existingIndex];

              // Only add platform if it doesn't already exist
              for (const newPlatform of normalizedResult.platforms) {
                const platformExists = existing.platforms.some(
                  p => p.platform === newPlatform.platform
                );
                if (!platformExists) {
                  existing.platforms.push(newPlatform);
                  // Add followers from new platform only
                  existing.totalFollowers += newPlatform.followers;
                  existing.totalFollowing += normalizedResult.totalFollowing;
                }
              }
            } else {
              // Add new profile
              newResults.push(normalizedResult);
            }
          }

          // Sort by followers
          return newResults.sort((a, b) => b.totalFollowers - a.totalFollowers);
        });

        setStreamingStatus(`Found ${data.count} results from ${data.platform}`);
        break;

      case 'platform_completed':
        setStreamingStatus(`${data.platform} search completed`);
        break;

      case 'complete':
        setLoading(false);
        setStreamingStatus(`Search complete! Found ${data.totalResults} results`);
        break;

      case 'error':
        console.error('[SSE] Error:', data.message);
        setLoading(false);
        setStreamingStatus(`Error: ${data.message}`);
        break;

      case 'timeout':
        setLoading(false);
        setStreamingStatus('Search timeout reached');
        break;
    }
  };

  // Auto-search after 3 seconds of typing inactivity
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Set new timeout for 1.5 seconds (optimized for faster response)
    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 1500);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, selectedPlatforms]);

  // Handle Enter key to search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      closeEventSource();
    };
  }, []);

  const handleSelectProfile = (profile: SearchResult) => {
    closeEventSource(); // ✅ Close streaming connection when profile selected
    setShowDropdown(false);
    setQuery('');
    setResults([]);
    setStreamingStatus('');
    onSelectProfile?.(profile);
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const clearSearch = () => {
    closeEventSource(); // Close any active streaming connection
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setStreamingStatus('');
  };

  const getPlatformIcon = (platform: Platform): string => {
    const icons: Record<Platform, string> = {
      instagram: '📷',
      tiktok: '🎵',
      youtube: '▶️',
      twitter: '🐦',
      facebook: '👥',
    };
    return icons[platform] || '🌐';
  };

  return (
    <div className="realtime-search-container" ref={dropdownRef}>
      {/* Search Input */}
      <div className="search-input-wrapper">
        <div className="flex-1 flex items-center relative">
          <Search className="search-icon" size={20} />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search influencers by name or username..."
            className="search-input"
          />

          {loading && <Loader2 className="loading-spinner" size={20} />}

          {query && !loading && (
            <button onClick={clearSearch} className="clear-button">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={performSearch}
          disabled={loading || query.length < 2}
          className="search-button"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Search</span>
            </>
          )}
        </button>
      </div>

      {/* Platform Filter Chips */}
      <div className="platform-filters">
        {ALL_PLATFORMS.map((platform) => (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            className={`platform-chip ${
              selectedPlatforms.includes(platform) ? 'active' : 'inactive'
            }`}
          >
            <span className="platform-icon">{getPlatformIcon(platform)}</span>
            <span className="platform-name">
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          </button>
        ))}
      </div>

      {/* Results Dropdown */}
      {showDropdown && query.length >= 2 && (
        <div className="search-results-dropdown">
          {/* Streaming Status */}
          {loading && streamingStatus && (
            <div className="search-status streaming">
              <Loader2 className="spinner animate-spin" size={20} />
              <span>{streamingStatus}</span>
            </div>
          )}

          {/* Loading State (Initial) */}
          {loading && !streamingStatus && (
            <div className="search-status loading">
              <Loader2 className="spinner" size={20} />
              <span>Starting search across {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}...</span>
            </div>
          )}

          {/* Results (Progressive Display) */}
          {results.length > 0 && (
            <>
              <div className="results-header">
                <span className="results-count">
                  {loading ? 'Streaming: ' : 'Found '}{results.length} influencer{results.length !== 1 ? 's' : ''} {loading && '...'}
                </span>
                <span className="results-source">
                  🌐 Live streaming results
                </span>
              </div>

              <div className="results-list">
                {results.map((result) => (
                  <SearchResultRow
                    key={result.profileId}
                    result={result}
                    query={query}
                    onClick={() => handleSelectProfile(result)}
                  />
                ))}
              </div>
            </>
          )}

          {/* No Results (Only show after loading complete) */}
          {!loading && results.length === 0 && (
            <div className="no-results">
              <Search size={32} />
              <p className="no-results-title">No influencers found</p>
              <p className="no-results-hint">
                Try a different name or username
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
