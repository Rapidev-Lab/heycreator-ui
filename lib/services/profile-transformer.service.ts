/**
 * Profile Transformer Service
 * Transforms raw Apify data into UI-ready format
 */

import {
  ApifyEnrichmentData,
  ApifyProfileDetails,
  ApifyPost,
  ApifyRelatedProfile,
  Platform,
} from '@/types/apify';
import {
  TransformedProfile,
  ProfileHeader,
  ProfileSnapshot,
  ProfileInsights,
  PlatformMetric,
  ContentPost,
  Demographics,
  SimilarCreator,
  PlatformInfo,
  ExternalLink,
} from '@/types/profile';

export class ProfileTransformer {
  // Constants
  private static readonly CPM_RATE = 2.5; // Cost per thousand impressions
  private static readonly BRAND_VALUE_MULTIPLIER = 0.4;

  /**
   * Main transformation method
   * Converts complete Apify enrichment data to UI-ready format
   */
  static transformEnrichmentData(data: ApifyEnrichmentData): TransformedProfile {
    const method1 = data.rawMethodData.method1_profileDetails;
    const method2 = data.rawMethodData.method2_directPosts || [];
    const method8 = data.rawMethodData.method8_relatedProfiles || method1?.relatedProfiles || [];
    const method9 = data.rawMethodData.method9_enrichedSimilarProfiles || [];

    if (!method1) {
      throw new Error('Profile details (method1) are required');
    }

    return {
      header: this.transformHeader(method1),
      snapshot: this.transformSnapshot(method1, method2),
      insights: this.transformInsights(method1, method2),
      metrics: this.transformMetrics(method1, method2),
      content: this.transformContent(method2),
      demographics: this.transformDemographics(),
      similar: this.transformSimilarCreators(method8, method9),
    };
  }

  /**
   * Transform profile header data
   */
  private static transformHeader(profile: ApifyProfileDetails): ProfileHeader {
    return {
      avatar: profile.profilePicUrl || '',
      avatarHD: profile.profilePicUrlHD || profile.profilePicUrl || '',
      fullName: profile.fullName || profile.username,
      username: profile.username,
      verified: profile.verified,
      bio: profile.biography || '',
      location: this.extractLocation(profile),
      externalLinks: this.transformExternalLinks(profile.externalUrls || []),
      category: profile.facebookPage?.category || profile.businessCategoryName || undefined,
    };
  }

  /**
   * Transform snapshot metrics
   */
  private static transformSnapshot(
    profile: ApifyProfileDetails,
    posts: ApifyPost[]
  ): ProfileSnapshot {
    const avgEngagement = this.calculateAvgEngagement(posts);
    const engagementRate = this.calculateEngagementRate(avgEngagement, profile.followersCount);

    return {
      followersCount: profile.followersCount || 0,
      followersGrowth: this.calculateFollowersGrowth(posts), // Estimated from post frequency
      avgEngagement: Math.round(avgEngagement || 0),
      engagementRate: parseFloat((engagementRate || 0).toFixed(2)),
      totalFollowing: profile.followsCount || 0,
      postsCount: posts?.length || 0,
    };
  }

  /**
   * Transform insights data
   */
  private static transformInsights(
    profile: ApifyProfileDetails,
    posts: ApifyPost[]
  ): ProfileInsights {
    return {
      locations: this.extractLocations(profile, posts),
      languages: this.extractLanguages(profile, posts),
      topics: this.extractTopics(posts),
      socialPlatforms: this.extractSocialPlatforms(profile.externalUrls || []),
    };
  }

  /**
   * Transform metrics for table
   */
  private static transformMetrics(
    profile: ApifyProfileDetails,
    posts: ApifyPost[]
  ): PlatformMetric[] {
    const followers = profile.followersCount;
    const avgEngagements = this.calculateAvgEngagement(posts);
    const engagementRate = this.calculateEngagementRate(avgEngagements, followers);
    const emv = this.calculateEMV(followers, engagementRate);
    const brandValue = emv * this.BRAND_VALUE_MULTIPLIER;

    return [
      {
        network: 'Instagram',
        platform: 'instagram',
        followers,
        engagements: Math.round(avgEngagements),
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        emv: parseFloat(emv.toFixed(2)),
        brand: parseFloat(brandValue.toFixed(2)),
      },
    ];
  }

  /**
   * Transform content posts
   */
  private static transformContent(posts: ApifyPost[]): ContentPost[] {
    return posts
      .sort((a, b) => b.likesCount - a.likesCount) // Sort by likes descending
      .slice(0, 12) // Take top 12
      .map((post) => ({
        id: post.id,
        platform: 'instagram',
        thumbnail: post.displayUrl,
        type: post.type === 'Video' ? 'video' : 'image',
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        viewsCount: post.videoViewCount || post.videoPlayCount,
        url: post.url,
        timestamp: post.timestamp,
        caption: post.caption,
        hashtags: post.hashtags,
      }));
  }

  /**
   * Transform demographics (with defaults)
   */
  private static transformDemographics(): Demographics {
    // Note: This data is not available from Apify yet
    // Using industry defaults for beauty/lifestyle influencers
    return {
      averageAge: 28,
      ageRanges: [
        { range: '13-17', percentage: 8 },
        { range: '18-24', percentage: 32 },
        { range: '25-34', percentage: 38 },
        { range: '35-44', percentage: 15 },
        { range: '45+', percentage: 7 },
      ],
      genderSplit: {
        female: 65,
        male: 33,
        other: 2,
      },
      topCountries: [
        { country: 'United States', flag: '🇺🇸', percentage: 45.2 },
        { country: 'United Kingdom', flag: '🇬🇧', percentage: 18.5 },
        { country: 'Canada', flag: '🇨🇦', percentage: 12.3 },
      ],
      interests: ['Lifestyle', 'Fashion', 'Beauty'],
      brandAffinity: [
        { brand: 'Nike', percentage: 85 },
        { brand: 'Adidas', percentage: 72 },
        { brand: 'Zara', percentage: 68 },
      ],
    };
  }

  /**
   * Transform similar creators — prefers enriched data (Method 9) over lightweight (Method 8)
   */
  private static transformSimilarCreators(
    related: ApifyRelatedProfile[],
    enriched: any[] = []
  ): SimilarCreator[] {
    // Build lookup from enriched data (Method 9) by username
    const enrichedMap = new Map<string, any>();
    for (const item of enriched) {
      if (item.username) {
        enrichedMap.set(item.username.toLowerCase(), item);
      }
    }

    return related.slice(0, 6).map((profile) => {
      const enrichedData = enrichedMap.get(profile.username?.toLowerCase());

      if (enrichedData) {
        // Use real data from Method 9
        return {
          id: profile.id,
          fullName: enrichedData.fullName || profile.full_name,
          username: profile.username,
          avatar: enrichedData.avatar || profile.profile_pic_url,
          verified: enrichedData.verified || profile.is_verified,
          influenceScore: this.calculateInfluenceScore(profile),
          categories: [],
          followers: enrichedData.followers || 0,
          engagement: enrichedData.engagement || 0,
          platforms: ['instagram'] as any[],
        };
      }

      // Fallback to lightweight Method 8 data
      return {
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        avatar: profile.profile_pic_url,
        verified: profile.is_verified,
        influenceScore: this.calculateInfluenceScore(profile),
        categories: [],
        platforms: ['instagram'] as any[],
      };
    });
  }

  // ============================================================================
  // Calculation Methods
  // ============================================================================

  /**
   * Calculate average engagement from posts
   */
  private static calculateAvgEngagement(posts: ApifyPost[]): number {
    if (!posts || posts.length === 0) return 0;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    return totalLikes / posts.length;
  }

  /**
   * Calculate engagement rate
   */
  private static calculateEngagementRate(avgLikes: number | undefined, followers: number | undefined): number {
    if (!followers || followers === 0 || avgLikes === undefined) return 0;
    return (avgLikes / followers) * 100;
  }

  /**
   * Calculate Estimated Media Value (EMV)
   */
  private static calculateEMV(followers: number | undefined, engagementRate: number | undefined): number {
    if (!followers || !engagementRate) return 0;
    return followers * (engagementRate / 100) * this.CPM_RATE;
  }

  /**
   * Calculate follower growth (estimated from post frequency)
   */
  private static calculateFollowersGrowth(posts: ApifyPost[]): number {
    // Since we don't have historical data, estimate from post engagement trends
    if (!posts || posts.length < 2) return 5.0; // Default 5%

    // Calculate engagement trend from recent vs older posts
    const recentPosts = posts.slice(0, Math.floor(posts.length / 3));
    const olderPosts = posts.slice(-Math.floor(posts.length / 3));

    if (recentPosts.length === 0 || olderPosts.length === 0) return 5.0;

    const recentAvg =
      recentPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0) / recentPosts.length;
    const olderAvg =
      olderPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0) / olderPosts.length;

    if (olderAvg === 0) return 5.0; // Avoid division by zero

    const growthRate = ((recentAvg - olderAvg) / olderAvg) * 100;
    return parseFloat(Math.min(Math.max(growthRate, -10), 50).toFixed(1)); // Cap between -10% and 50%
  }

  /**
   * Calculate influence score for similar creators
   */
  private static calculateInfluenceScore(profile: ApifyRelatedProfile): number {
    // Base score on verification and other factors
    let score = 4.0; // Base score
    if (profile.is_verified) score += 0.5;
    if (!profile.is_private) score += 0.3;

    return parseFloat(Math.min(score, 5.0).toFixed(1));
  }

  // ============================================================================
  // Extraction Methods
  // ============================================================================

  /**
   * Extract location from profile
   */
  private static extractLocation(profile: ApifyProfileDetails): string {
    if (profile.facebookPage?.country) {
      return profile.facebookPage.country;
    }

    // Try to extract from bio
    const bio = profile.biography?.toLowerCase() || '';
    const locationKeywords = ['from', 'based in', 'living in', '📍'];
    // Simple location extraction logic
    return ''; // Return empty for now, can be enhanced
  }

  /**
   * Extract locations from profile and posts
   */
  private static extractLocations(
    profile: ApifyProfileDetails,
    posts: ApifyPost[]
  ): string[] {
    const locations = new Set<string>();

    if (profile.facebookPage?.country) {
      locations.add(profile.facebookPage.country);
    }

    // Could extract from post locations if available
    // For now, return default
    return Array.from(locations).length > 0
      ? Array.from(locations)
      : ['United States', 'United Kingdom'];
  }

  /**
   * Extract languages from bio and captions
   */
  private static extractLanguages(
    profile: ApifyProfileDetails,
    posts: ApifyPost[]
  ): string[] {
    // Default to English for now
    // Could implement language detection on bio/captions
    return ['English'];
  }

  /**
   * Extract topics from hashtags
   */
  private static extractTopics(posts: ApifyPost[]): string[] {
    const hashtagCounts = new Map<string, number>();

    posts.forEach((post) => {
      post.hashtags?.forEach((tag) => {
        const cleanTag = tag.replace('#', '').toLowerCase();
        hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
      });
    });

    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => this.capitalizeFirst(tag));
  }

  /**
   * Extract social platforms from external URLs
   */
  private static extractSocialPlatforms(urls: any[]): PlatformInfo[] {
    const platforms: PlatformInfo[] = [];

    urls.forEach((urlObj) => {
      const url = urlObj.url.toLowerCase();
      let platform: Platform | null = null;

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube';
      } else if (url.includes('tiktok.com')) {
        platform = 'tiktok';
      } else if (url.includes('twitter.com') || url.includes('x.com')) {
        platform = 'twitter';
      } else if (url.includes('facebook.com')) {
        platform = 'facebook';
      }

      if (platform) {
        platforms.push({
          platform,
          url: urlObj.url,
        });
      }
    });

    // Always include Instagram since this is Instagram data
    platforms.unshift({
      platform: 'instagram',
      url: `https://www.instagram.com/${urls[0]?.url || ''}`,
    });

    return platforms;
  }

  /**
   * Transform external URLs to ExternalLink format
   */
  private static transformExternalLinks(urls: any[]): ExternalLink[] {
    return urls.map((urlObj) => ({
      title: urlObj.title || 'External Link',
      url: urlObj.url,
      platform: this.detectPlatform(urlObj.url),
    }));
  }

  /**
   * Detect platform from URL
   */
  private static detectPlatform(url: string): Platform | undefined {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('youtube')) return 'youtube';
    if (lowerUrl.includes('tiktok')) return 'tiktok';
    if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('facebook')) return 'facebook';
    if (lowerUrl.includes('instagram')) return 'instagram';
    return undefined;
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Capitalize first letter
   */
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Format number with K/M/B suffix
   */
  static formatNumber(num: number | undefined | null): string {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  /**
   * Format percentage
   */
  static formatPercentage(num: number | undefined | null): string {
    if (num === undefined || num === null || isNaN(num)) {
      return '0.0%';
    }
    return `${num.toFixed(1)}%`;
  }
}
