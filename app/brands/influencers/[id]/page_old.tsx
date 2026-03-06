'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';

import SocialIcons from '@/components/SocialIcons';
import Tooltip from '@/components/Tooltip';
import { UnifiedProfile, LinkedPlatformAccount } from '@/types/aggregator';
import { Influencer } from '@/types/influencer';
import { Heart, MoreVertical, Bookmark, ChevronLeft, Users, Target, DollarSign, TrendingUp, MapPin, Shield, Award, Briefcase, Zap, HelpCircle, Eye, MessageCircle, Play, ChevronDown, ChevronUp, ExternalLink, Copy, Share2, Download, Link2, Trash2, Plus, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { proxyImage } from '@/lib/utils';
import { useAuth } from '@/lib/firebase/auth-context';

interface PageProps {
  params: { id: string };
}

type TabType = 'overview' | 'content' | 'demographics' | 'analytics' | 'similar' | 'relationship';
type ContentFilter = 'portfolio' | 'topics' | 'top';

// Helper to convert unified profile to influencer format for compatibility
const unifiedProfileToInfluencer = (profile: UnifiedProfile): Influencer => ({
  id: profile.id,
  name: profile.displayName,
  displayName: profile.displayName,
  avatar: profile.avatarUrl,
  influenceScore: profile.influenceScore,
  platforms: profile.linkedAccounts.map(a => a.platform as any),
  location: profile.location,
  flag: profile.flag,
  categories: profile.categories,
  bio: profile.bio,
  totalFollowers: profile.combinedMetrics.totalFollowers,
  engagementRate: profile.combinedMetrics.averageEngagementRate,
  trueReach: profile.combinedMetrics.totalReach,
  estimatedPrice: profile.estimatedPrice,
  mainTopics: profile.mainTopics,
  brandSafety: profile.brandSafety,
  audienceAgeGroup: profile.audienceAgeGroup,
  audienceAuthenticity: profile.audienceAuthenticity,
  audienceLocation: profile.audienceLocation,
  portfolio: profile.portfolio,
  sponsoredContentFrequency: profile.sponsoredContentFrequency,
  platformMetrics: profile.platformMetrics,
  contentPosts: profile.contentPosts,
  demographics: profile.demographics,
  similarInfluencers: profile.similarInfluencers,
});

export default function InfluencerProfilePage({ params }: PageProps) {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();

  // State for async data fetching
  const [influencer, setInfluencer] = useState<Influencer | undefined>(undefined);
  const [unifiedProfile, setUnifiedProfile] = useState<UnifiedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('portfolio');
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBio, setShowMoreBio] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);

  // Fetch unified profile from API or get mock influencer data
  useEffect(() => {
    async function fetchData() {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!firebaseUser) {
        // Not authenticated, redirect to login
        router.push('/auth/brand/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`/api/influencer/profiles/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (!response.ok || !data.profile) {
          setError(data.error || 'Failed to load profile');
          return;
        }

        const profile = data.profile as UnifiedProfile;
        setInfluencer(unifiedProfileToInfluencer(profile));
        setUnifiedProfile(profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id, firebaseUser, authLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
  
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
  
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/brands/influencers"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Influencers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!influencer) {
    notFound();
  }

  const handleContact = () => {
    alert(`Contact ${influencer.displayName} via email or social media`);
  };

  const handleAddToCampaign = () => {
    alert(`Adding ${influencer.displayName} to campaign...`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: influencer.displayName,
        text: `Check out ${influencer.displayName} on Hey Creator`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleDownloadReport = () => {
    alert('Downloading influencer report as PDF...');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied!');
  };

  const displayedCategories = showMoreCategories
    ? influencer.categories
    : influencer.categories?.slice(0, 5);

  const bioText = influencer.bio || 'No bio available for this influencer.';
  const shortBio = bioText.length > 200 ? bioText.substring(0, 200) + '...' : bioText;

  return (
    <div className="min-h-screen bg-background">
      {/* New Profile Search Banner */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/brands/discover"
            className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">New Profile Search</span>
          </Link>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {influencer.avatar ? (
                  <img
                    src={influencer.avatar}
                    alt={influencer.displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                    {influencer.displayName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {influencer.displayName}
                  </h1>
                  {unifiedProfile && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <Link2 className="w-3 h-3" />
                      Unified Profile
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <SocialIcons platforms={influencer.platforms} size="sm" />
                  {influencer.location && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">{influencer.location}</span>
                    </div>
                  )}
                </div>

                {/* Categories - simplified display */}
                {influencer.categories && influencer.categories.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Briefcase className="w-4 h-4" />
                    <span>{influencer.categories.slice(0, 3).join(' - ')}</span>
                  </div>
                )}

                {/* Influencer Category Tags */}
                {influencer.categories && influencer.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {displayedCategories?.map((category) => (
                      <span
                        key={category}
                        className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        {category}
                      </span>
                    ))}
                    {influencer.categories.length > 5 && (
                      <button
                        onClick={() => setShowMoreCategories(!showMoreCategories)}
                        className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20 transition-colors flex items-center space-x-1"
                      >
                        <span>{showMoreCategories ? 'Show Less' : `+${influencer.categories.length - 5} More`}</span>
                        {showMoreCategories ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Tooltip content="Influence Score: A proprietary score calculated based on reach, engagement, and authenticity">
                <div className="flex items-center space-x-1 text-primary">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                  <span className="text-base sm:text-lg font-bold">{influencer.influenceScore}</span>
                </div>
              </Tooltip>

              {/* Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        handleShare();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCopyLink();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadReport();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                    <button
                      onClick={() => {
                        window.open(`https://instagram.com/${influencer.name}`, '_blank');
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Instagram</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bookmark
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-primary text-primary' : 'text-gray-600'}`}
                />
              </button>
              <button
                onClick={handleContact}
                className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-primary border border-primary rounded-lg hover:bg-blue-50 transition-colors items-center space-x-2"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Contact</span>
              </button>
              <button
                onClick={handleAddToCampaign}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Add to Campaign</span>
                <span className="sm:hidden">+ Campaign</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 -mx-4 sm:mx-0">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide px-4 sm:px-0">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'content', label: 'Content' },
                { id: 'demographics', label: 'Demographics' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'similar', label: 'Similar' },
                { id: 'relationship', label: 'Relationship' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Linked Accounts Section (for unified profiles) */}
        {unifiedProfile && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Linked Accounts</h2>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {unifiedProfile.linkedAccounts.length} accounts
                </span>
                <Tooltip content="These are the social media accounts linked to this unified profile">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <button
                onClick={() => setShowLinkedAccounts(!showLinkedAccounts)}
                className="text-sm text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                {showLinkedAccounts ? 'Hide' : 'Show'} Details
                {showLinkedAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Compact view - just platform badges */}
            {!showLinkedAccounts && (
              <div className="flex flex-wrap gap-2">
                {unifiedProfile.linkedAccounts.map((account) => (
                  <a
                    key={account.id}
                    href={account.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <SocialIcons platforms={[account.platform as any]} size="sm" />
                    <span className="text-sm font-medium text-gray-900">@{account.username}</span>
                    <span className="text-xs text-gray-500">
                      {account.followerCount >= 1000
                        ? `${(account.followerCount / 1000).toFixed(1)}K`
                        : account.followerCount}
                    </span>
                    {account.verified && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                ))}
              </div>
            )}

            {/* Expanded view - full details */}
            {showLinkedAccounts && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unifiedProfile.linkedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      {account.avatarUrl ? (
                        <img
                          src={proxyImage(account.avatarUrl)}
                          alt={account.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                          {account.displayName.charAt(0)}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <SocialIcons platforms={[account.platform as any]} size="sm" />
                          <h4 className="font-semibold text-gray-900 truncate">
                            {account.displayName}
                          </h4>
                          {account.verified && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">@{account.username}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-gray-900">
                            {account.followerCount >= 1000000
                              ? `${(account.followerCount / 1000000).toFixed(1)}M`
                              : account.followerCount >= 1000
                              ? `${(account.followerCount / 1000).toFixed(1)}K`
                              : account.followerCount}{' '}
                            <span className="text-gray-500 font-normal">followers</span>
                          </span>
                        </div>
                        {account.bio && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{account.bio}</p>
                        )}
                      </div>

                      {/* Action */}
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View on platform"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Linked {new Date(account.linkedAt).toLocaleDateString()}</span>
                      <span>Synced {new Date(account.lastSyncedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Platform Distribution */}
            {unifiedProfile.combinedMetrics.followersByPlatform.length > 1 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Follower Distribution</h4>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  {unifiedProfile.combinedMetrics.followersByPlatform.map((item, index) => {
                    const colors: Record<string, string> = {
                      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
                      tiktok: 'bg-black',
                      youtube: 'bg-red-500',
                      twitter: 'bg-blue-400',
                      facebook: 'bg-blue-600',
                    };
                    return (
                      <Tooltip
                        key={item.platform}
                        content={`${item.platform}: ${item.percentage.toFixed(1)}% (${
                          item.count >= 1000
                            ? `${(item.count / 1000).toFixed(1)}K`
                            : item.count
                        })`}
                      >
                        <div
                          className={`h-full ${colors[item.platform] || 'bg-gray-400'}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {unifiedProfile.combinedMetrics.followersByPlatform.map((item) => (
                    <div key={item.platform} className="flex items-center gap-1 text-xs text-gray-600">
                      <SocialIcons platforms={[item.platform as any]} size="sm" />
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Snapshot */}
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Profile Snapshot</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Influence Score */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 fill-pink-500" />
              <button
                onClick={() => alert('Adding metric to comparison...')}
                className="hidden sm:block text-xs text-gray-500 hover:text-primary transition-colors"
              >
                Add
              </button>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
              {influencer.influenceScore}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">Influence Score</div>
            <div className="mt-2 sm:mt-4">
              <SocialIcons platforms={influencer.platforms} size="sm" />
            </div>
          </div>

          {/* Engagement Rate */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Tooltip content="Average engagements per post across all platforms">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-help" />
              </Tooltip>
              <Tooltip content="Engagement rate measures how actively the audience interacts with content through likes, comments, and shares">
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
              {influencer.engagementRate || '0'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Engagements / Post</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* True Reach */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Tooltip content="Estimated unique users who see the influencer's content">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-help" />
              </Tooltip>
              <Tooltip content="True Reach is calculated based on follower count, engagement rate, and platform algorithms">
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
              {influencer.trueReach ? `${(influencer.trueReach / 1000).toFixed(1)}K` : '0'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2">True Reach</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          {/* Total Followers */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
              {influencer.totalFollowers ? `${(influencer.totalFollowers / 1000).toFixed(1)}K` : '0'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2">Total Followers</div>
            <Tooltip content="Instagram: 60%, TikTok: 25%, Twitter: 15%">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden cursor-help">
                <div className="flex h-full">
                  <div className="bg-pink-500 h-2" style={{ width: '60%' }}></div>
                  <div className="bg-purple-500 h-2" style={{ width: '25%' }}></div>
                  <div className="bg-black h-2" style={{ width: '15%' }}></div>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Summary and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span>Summary</span>
              </h3>
              <button
                onClick={() => alert('Personalizing summary for your brand...')}
                className="text-xs text-primary hover:text-primary-dark transition-colors"
              >
                Personalize For Your Brand
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {showMoreBio ? bioText : shortBio}
            </p>
            {bioText.length > 200 && (
              <button
                onClick={() => setShowMoreBio(!showMoreBio)}
                className="text-xs text-primary hover:text-primary-dark mt-2 flex items-center space-x-1"
              >
                <span>{showMoreBio ? 'Show Less' : 'Read More'}</span>
                {showMoreBio ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Insights</h3>
            <div className="space-y-4">
              {influencer.mainTopics && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Main Topics</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.mainTopics.join(', ')}</div>
                  </div>
                </div>
              )}

              {influencer.brandSafety && (
                <Tooltip content="Brand safety is determined by content analysis, past partnerships, and audience sentiment">
                  <div className="flex items-start space-x-3 cursor-help">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>Brand Safety</span>
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{influencer.brandSafety}</div>
                    </div>
                  </div>
                </Tooltip>
              )}

              {influencer.audienceAgeGroup && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Audience Age Group</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.audienceAgeGroup}</div>
                  </div>
                </div>
              )}

              {influencer.audienceAuthenticity && (
                <Tooltip content="Authenticity score based on real followers vs fake/bot accounts">
                  <div className="flex items-start space-x-3 cursor-help">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>Audience Authenticity</span>
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{influencer.audienceAuthenticity}</div>
                    </div>
                  </div>
                </Tooltip>
              )}

              {influencer.audienceLocation && influencer.audienceLocation.length > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Audience Location</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.audienceLocation.join(', ')}</div>
                  </div>
                </div>
              )}

              {influencer.estimatedPrice && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Est. Instagram Price</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.estimatedPrice}</div>
                  </div>
                </div>
              )}

              {influencer.portfolio && influencer.portfolio.length > 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Portfolio</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.portfolio.join(', ')}</div>
                  </div>
                </div>
              )}

              {influencer.sponsoredContentFrequency && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500">Sponsored Content</div>
                    <div className="text-sm font-medium text-gray-900">{influencer.sponsoredContentFrequency}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Average Metrics */}
        {influencer.platformMetrics && influencer.platformMetrics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">Average Metrics</h2>
                <Tooltip content="Average performance metrics across all platforms over the last 30 days">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                View Analytics
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Followers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eng. Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-primary">
                      <div className="flex items-center space-x-1">
                        <span>Reach</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Tooltip content="Estimated Media Value - the equivalent advertising cost">
                        <div className="flex items-center space-x-1 cursor-help">
                          <span>EMV</span>
                          <HelpCircle className="w-3 h-3" />
                        </div>
                      </Tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {influencer.platformMetrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.network}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {metric.followers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary underline cursor-pointer hover:text-primary-dark"
                        onClick={() => alert(`Viewing detailed engagement data for ${metric.network}...`)}>
                        {metric.engagements}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {metric.engagementRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {metric.reach}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {metric.emv}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Section */}
        {influencer.contentPosts && influencer.contentPosts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Content</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('content')}
                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                >
                  Show All
                </button>
                <div className="flex items-center space-x-2 text-sm">
                  <button
                    onClick={() => setContentFilter('portfolio')}
                    className={`px-3 py-1 rounded transition-colors ${
                      contentFilter === 'portfolio'
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => setContentFilter('topics')}
                    className={`px-3 py-1 rounded transition-colors ${
                      contentFilter === 'topics'
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Topics
                  </button>
                  <button
                    onClick={() => setContentFilter('top')}
                    className={`px-3 py-1 rounded transition-colors ${
                      contentFilter === 'top'
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Top
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {influencer.contentPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => alert(`Opening post details: ${post.likes} likes, ${post.comments} comments`)}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={post.thumbnail}
                      alt="Content post"
                      className="w-full h-full object-cover"
                    />
                    {/* Video indicator for TikTok */}
                    {post.platform === 'tiktok' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="text-white text-xs space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-300">{post.date}</div>
                      </div>
                    </div>
                    {/* Platform Badge */}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      {post.platform === 'instagram' && (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-sm bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"></div>
                        </div>
                      )}
                      {post.platform === 'tiktok' && (
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-4 h-4 bg-black rounded-sm"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Stats below */}
                  <div className="p-2 text-xs text-gray-600 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments}</span>
                    </div>
                    <span className="text-gray-400">{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audience Demographics */}
        {influencer.demographics && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Audience Demographics</h2>
              <button
                onClick={() => setActiveTab('demographics')}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Show All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Average Age */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Average Age</span>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {influencer.demographics.averageAge}
                  </div>
                  <div className="text-sm text-gray-600">Years Old</div>
                </div>
              </div>

              {/* Top Gender */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Top Gender</span>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {influencer.demographics.topGender.gender}
                  </div>
                  <div className="text-sm text-gray-600">
                    {influencer.demographics.topGender.percentage}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Countries */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Top Countries</span>
                </div>
                <div className="space-y-3">
                  {influencer.demographics.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-sm text-gray-700">{country.country}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{country.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Interests */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Audience Interests</span>
                </div>
                <div className="space-y-3">
                  {influencer.demographics.audienceInterests.map((interest, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer">
                      <span className="text-sm text-gray-700">{interest.interest}</span>
                      <span className="text-sm font-medium text-gray-900">{interest.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Affinity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-medium">Brand Affinity</span>
                </div>
                <div className="space-y-3">
                  {influencer.demographics.brandAffinity.map((brand, index) => (
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-1 rounded transition-colors cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.brand} className="w-5 h-5 rounded" />
                        ) : (
                          <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                            {brand.brand.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{brand.brand}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{brand.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Similar Influencers */}
        {influencer.similarInfluencers && influencer.similarInfluencers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">Similar Influencers</h2>
                <Tooltip content="Influencers with similar audience demographics, content style, and engagement patterns">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <button
                onClick={() => setActiveTab('similar')}
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Show All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {influencer.similarInfluencers.slice(0, 8).map((similar) => (
                <Link
                  key={similar.id}
                  href={`/brands/influencers/${similar.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {similar.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {similar.name}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Heart className="w-3 h-3 text-primary fill-primary" />
                          <span className="text-xs font-medium text-primary">{similar.influenceScore}</span>
                          <SocialIcons platforms={similar.platforms} size="sm" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`More options for ${similar.name}`);
                      }}
                      className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{similar.followers} Followers</span>
                      {similar.location && (
                        <>
                          <span className="mx-1">•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{similar.location}</span>
                        </>
                      )}
                    </div>

                    {(similar.localAudience || similar.engagement || similar.posts) && (
                      <div className="flex items-center space-x-2 text-xs">
                        {similar.flag && <span>{similar.flag}</span>}
                        {similar.localAudience && <span>{similar.localAudience}</span>}
                        {similar.engagement && <span className="text-green-600">↑ {similar.engagement}</span>}
                        {similar.posts && <span>📊 {similar.posts}</span>}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-primary">Hey Creator</span>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-gray-900 transition-colors">Legal</Link>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </main>
    </div>
  );
}
