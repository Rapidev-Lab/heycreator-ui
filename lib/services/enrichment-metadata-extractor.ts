/**
 * Enrichment Metadata Extractor Service
 *
 * Extracts searchable metadata from raw Apify enrichment data for indexing in Firestore.
 * This enables fast filtering and sorting without loading full enrichment data.
 *
 * Key Functions:
 * - Extract aggregated metrics (avg likes, comments, engagement rate)
 * - Extract top hashtags for filtering
 * - Determine posting frequency
 * - Generate search keywords
 * - Calculate data completeness score
 */

import { ApifyEnrichmentData, ApifyPost } from '@/types/apify';
import { InstagramEnrichment, GlobalInfluencer, Location } from '@/types/global-influencer';
import { FilterQueryBuilder } from './filter-query-builder';
import { Timestamp } from 'firebase-admin/firestore';

export class EnrichmentMetadataExtractor {
  /**
   * Extract Instagram enrichment metadata from raw Apify data
   */
  static extractInstagramMetadata(
    enrichmentData: ApifyEnrichmentData
  ): InstagramEnrichment {
    const method1 = enrichmentData.rawMethodData.method1_profileDetails;
    const method2 = enrichmentData.rawMethodData.method2_directPosts || [];
    const method3 = enrichmentData.rawMethodData.method3_directReels || [];

    // Combine posts and reels
    const allPosts = [...method2, ...method3];

    // Calculate metrics
    const avgLikes = this.calculateAverageLikes(allPosts);
    const avgComments = this.calculateAverageComments(allPosts);
    const engagementRate = this.calculateEngagementRate(
      avgLikes,
      avgComments,
      method1?.followersCount || 0
    );

    // Extract top hashtags
    const topHashtags = this.extractTopHashtags(allPosts, 20);

    // Determine posting frequency
    const postingFrequency = this.determinePostingFrequency(allPosts);

    // Calculate data completeness
    const dataCompleteness = this.calculateDataCompleteness(enrichmentData);

    return {
      hasEnrichment: true,
      enrichedAt: Timestamp.now(),
      dataCompleteness,

      // Metrics
      avgLikes,
      avgComments,
      engagementRate,
      postCount: method2.length,
      reelCount: method3.length,
      topHashtags,
      postingFrequency,

      // Demographics (placeholder - Apify doesn't provide this yet)
      audienceCountries: undefined,
      audienceAgeGroup: undefined,
      audienceGenderSplit: undefined,

      // ❌ REMOVED: rawData - it's 7MB+ and exceeds Firestore's 1MB limit
      // Raw enrichment data is stored in unified_profiles.rawEnrichmentData instead
    };
  }

  /**
   * Create or update global influencer entry from enrichment data
   */
  static createGlobalInfluencerFromEnrichment(
    enrichmentData: ApifyEnrichmentData,
    userId?: string
  ): Omit<GlobalInfluencer, 'id'> {
    const method1 = enrichmentData.rawMethodData.method1_profileDetails;
    const method8 = enrichmentData.rawMethodData.method8_relatedProfiles || [];

    if (!method1) {
      throw new Error('Profile details (method1) required to create global influencer');
    }

    // Extract Instagram enrichment metadata
    const instagramEnrichment = this.extractInstagramMetadata(enrichmentData);

    // Extract location from bio or set default
    const location = this.extractLocation(method1.biography || '');

    // Extract categories from bio and hashtags
    const categories = this.extractCategories(
      method1.biography || '',
      instagramEnrichment.topHashtags
    );

    // Extract topics from hashtags
    const topics = instagramEnrichment.topHashtags.slice(0, 10);

    // Generate search keywords
    const searchKeywords = FilterQueryBuilder.generateSearchKeywords({
      displayName: method1.fullName || method1.username,
      primaryUsername: method1.username,
      bio: method1.biography || '',
      categories,
      topics,
      location,
    });

    return {
      // Basic profile info
      displayName: method1.fullName || method1.username,
      primaryUsername: method1.username,
      bio: method1.biography || '',
      avatarUrl: method1.profilePicUrlHD || method1.profilePicUrl || '',
      verified: method1.verified || false,

      // Platform accounts
      platforms: [
        {
          platform: 'instagram',
          username: method1.username,
          followerCount: method1.followersCount || 0,
          followingCount: method1.followsCount || 0,
          verified: method1.verified || false,
          profileUrl: `https://www.instagram.com/${method1.username}`,
          lastUpdated: Timestamp.now(),
        },
      ],

      // Aggregated metrics
      totalFollowers: method1.followersCount || 0,
      averageEngagementRate: instagramEnrichment.engagementRate,
      totalReach: Math.round((method1.followersCount || 0) * (instagramEnrichment.engagementRate / 100)),
      primaryPlatform: 'instagram',

      // Location
      location,

      // Categories & topics
      categories,
      topics,

      // Enrichment data
      instagramEnrichment,

      // Discovery metadata
      addedToCollectionCount: userId ? 1 : 0,
      viewCount: 0,
      lastSearchedAt: Timestamp.now(),

      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      // Search optimization
      searchKeywords,
    };
  }

  /**
   * Calculate average likes from posts
   */
  private static calculateAverageLikes(posts: ApifyPost[]): number {
    if (posts.length === 0) return 0;

    const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
    return Math.round(totalLikes / posts.length);
  }

  /**
   * Calculate average comments from posts
   */
  private static calculateAverageComments(posts: ApifyPost[]): number {
    if (posts.length === 0) return 0;

    const totalComments = posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
    return Math.round(totalComments / posts.length);
  }

  /**
   * Calculate engagement rate
   */
  private static calculateEngagementRate(
    avgLikes: number,
    avgComments: number,
    followerCount: number
  ): number {
    if (followerCount === 0) return 0;

    const totalEngagement = avgLikes + avgComments;
    const rate = (totalEngagement / followerCount) * 100;
    return parseFloat(rate.toFixed(2));
  }

  /**
   * Extract top hashtags from posts
   */
  private static extractTopHashtags(posts: ApifyPost[], limit: number = 20): string[] {
    const hashtagCounts = new Map<string, number>();

    posts.forEach((post) => {
      post.hashtags?.forEach((tag) => {
        const cleanTag = tag.replace('#', '').toLowerCase();
        hashtagCounts.set(cleanTag, (hashtagCounts.get(cleanTag) || 0) + 1);
      });
    });

    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  }

  /**
   * Determine posting frequency based on post timestamps
   */
  private static determinePostingFrequency(posts: ApifyPost[]): 'daily' | 'weekly' | 'monthly' {
    if (posts.length < 2) return 'monthly';

    // Sort by timestamp
    const sortedPosts = posts
      .filter((p) => p.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (sortedPosts.length < 2) return 'monthly';

    // Calculate average days between posts
    let totalDays = 0;
    for (let i = 0; i < sortedPosts.length - 1; i++) {
      const date1 = new Date(sortedPosts[i].timestamp);
      const date2 = new Date(sortedPosts[i + 1].timestamp);
      const daysDiff = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += daysDiff;
    }

    const avgDays = totalDays / (sortedPosts.length - 1);

    if (avgDays <= 2) return 'daily';
    if (avgDays <= 10) return 'weekly';
    return 'monthly';
  }

  /**
   * Calculate data completeness score (0-100)
   */
  private static calculateDataCompleteness(enrichmentData: ApifyEnrichmentData): number {
    let score = 0;
    const weights = {
      method1: 30, // Profile details (most important)
      method2: 20, // Direct posts
      method3: 15, // Direct reels
      method4: 10, // Direct mentions
      method5: 5,  // User search
      method6: 5,  // Hashtag search
      method7: 5,  // Place search
      method8: 10, // Related profiles
    };

    const methods = enrichmentData.rawMethodData;

    if (methods.method1_profileDetails) score += weights.method1;
    if (methods.method2_directPosts && methods.method2_directPosts.length > 0) score += weights.method2;
    if (methods.method3_directReels && methods.method3_directReels.length > 0) score += weights.method3;
    if (methods.method4_directMentions && methods.method4_directMentions.length > 0) score += weights.method4;
    if (methods.method5_userSearch && methods.method5_userSearch.length > 0) score += weights.method5;
    if (methods.method6_hashtagSearch && methods.method6_hashtagSearch.length > 0) score += weights.method6;
    if (methods.method7_placeSearch && methods.method7_placeSearch.length > 0) score += weights.method7;
    if (methods.method8_relatedProfiles && methods.method8_relatedProfiles.length > 0) score += weights.method8;

    return score;
  }

  /**
   * Extract location from bio (basic implementation)
   */
  private static extractLocation(bio: string): Location {
    // Common location patterns
    const locationPatterns = [
      /📍\s*([^•\n]+)/i, // Location emoji
      /based in\s+([^•\n]+)/i,
      /from\s+([^•\n]+)/i,
      /living in\s+([^•\n]+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = bio.match(pattern);
      if (match) {
        const location = match[1].trim();
        // Basic parsing (city, country)
        const parts = location.split(',').map((s) => s.trim());
        if (parts.length >= 2) {
          return {
            country: parts[parts.length - 1],
            city: parts[0],
          };
        }
        return {
          country: location,
          city: location,
        };
      }
    }

    // Default location
    return {
      country: 'Unknown',
      city: 'Unknown',
    };
  }

  /**
   * Extract categories from bio and hashtags
   */
  private static extractCategories(bio: string, topHashtags: string[]): string[] {
    const categories = new Set<string>();

    // Category keywords
    const categoryMap: Record<string, string[]> = {
      Fashion: ['fashion', 'style', 'ootd', 'outfit', 'streetwear', 'designer'],
      Beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'glam'],
      Fitness: ['fitness', 'gym', 'workout', 'health', 'bodybuilding', 'yoga'],
      Food: ['food', 'chef', 'cooking', 'recipe', 'foodie', 'restaurant'],
      Travel: ['travel', 'wanderlust', 'adventure', 'explore', 'traveler'],
      Lifestyle: ['lifestyle', 'daily', 'life', 'vlog'],
      Technology: ['tech', 'technology', 'gadget', 'coding', 'developer'],
      Gaming: ['gaming', 'gamer', 'esports', 'streamer', 'gameplay'],
      Photography: ['photography', 'photographer', 'photo', 'camera'],
      Art: ['art', 'artist', 'creative', 'design', 'illustration'],
      Music: ['music', 'musician', 'singer', 'dj', 'producer'],
      Business: ['entrepreneur', 'business', 'ceo', 'founder', 'startup'],
    };

    const bioLower = bio.toLowerCase();
    const hashtagsLower = topHashtags.map((h) => h.toLowerCase());
    const allText = [bioLower, ...hashtagsLower].join(' ');

    // Check each category
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        categories.add(category);
      }
    }

    // Default to Lifestyle if no categories found
    if (categories.size === 0) {
      categories.add('Lifestyle');
    }

    return Array.from(categories);
  }
}
