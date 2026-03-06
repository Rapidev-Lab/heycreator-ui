/**
 * Filter Query Builder Service
 *
 * Converts filter objects into Firestore queries with proper indexing and optimization.
 * Handles both global_influencers (discovery) and user_collections (personal) queries.
 *
 * Key Features:
 * - Supports 15+ filter types
 * - Handles Firestore query limitations (array-contains, OR queries, etc.)
 * - Optimized for performance with composite indexes
 * - Client-side filtering for complex combinations
 */

import { Firestore, Query, FieldPath } from 'firebase-admin/firestore';
import { DiscoverFilters } from '@/types/saved-search';
import { GlobalInfluencer } from '@/types/global-influencer';

export class FilterQueryBuilder {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * Build query for global influencers (discovery search)
   */
  buildDiscoveryQuery(filters: DiscoverFilters): Query<GlobalInfluencer> {
    let query: Query = this.db.collection('global_influencers');

    // Apply filters in order of selectivity (most selective first)

    // 1. Platform filter (if single platform)
    if (filters.primaryPlatform) {
      query = query.where('primaryPlatform', '==', filters.primaryPlatform);
    }

    // 2. Verified status (boolean, very selective)
    if (filters.verified !== undefined) {
      query = query.where('verified', '==', filters.verified);
    }

    // 3. Location filters
    if (filters.countries && filters.countries.length === 1) {
      query = query.where('location.country', '==', filters.countries[0]);
    }

    if (filters.cities && filters.cities.length === 1 && !filters.countries) {
      query = query.where('location.city', '==', filters.cities[0]);
    }

    // 4. Follower range (range queries)
    if (filters.minFollowers !== undefined) {
      query = query.where('totalFollowers', '>=', filters.minFollowers);
    }

    if (filters.maxFollowers !== undefined) {
      query = query.where('totalFollowers', '<=', filters.maxFollowers);
    }

    // 5. Enrichment filter
    if (filters.hasEnrichment) {
      query = query.where('instagramEnrichment.hasEnrichment', '==', true);
    }

    // 6. Engagement rate (requires enrichment)
    if (filters.minEngagementRate !== undefined && filters.hasEnrichment) {
      query = query.where(
        'instagramEnrichment.engagementRate',
        '>=',
        filters.minEngagementRate
      );
    }

    if (filters.maxEngagementRate !== undefined && filters.hasEnrichment) {
      query = query.where(
        'instagramEnrichment.engagementRate',
        '<=',
        filters.maxEngagementRate
      );
    }

    // 7. Categories (array-contains - only ONE value supported by Firestore)
    if (filters.categories && filters.categories.length === 1) {
      query = query.where('categories', 'array-contains', filters.categories[0]);
    }

    // 8. Topics (array-contains - only ONE value supported by Firestore)
    if (filters.topics && filters.topics.length === 1 && !filters.categories) {
      query = query.where('topics', 'array-contains', filters.topics[0]);
    }

    // 9. Hashtags (array-contains - only ONE value supported by Firestore)
    if (filters.hashtags && filters.hashtags.length === 1 && !filters.categories && !filters.topics) {
      query = query.where(
        'instagramEnrichment.topHashtags',
        'array-contains',
        filters.hashtags[0]
      );
    }

    // 10. Keywords (array-contains on searchKeywords)
    if (filters.keywords && !filters.categories && !filters.topics && !filters.hashtags) {
      const keyword = filters.keywords.toLowerCase().split(' ')[0]; // Use first word only
      query = query.where('searchKeywords', 'array-contains', keyword);
    }

    // 11. Sorting
    query = this.applySorting(query, filters);

    // 12. Pagination
    const limit = Math.min(filters.limit || 50, 100); // Max 100 results
    query = query.limit(limit);

    return query as Query<GlobalInfluencer>;
  }

  /**
   * Build query for user's saved profiles (collection search)
   */
  buildCollectionQuery(
    userId: string,
    filters: DiscoverFilters
  ): Query {
    let query: Query = this.db.collection('user_collections');

    // ALWAYS filter by userId first (partition key)
    query = query.where('userId', '==', userId);

    // Apply additional filters (collection-specific properties)
    const collectionFilters = filters as any;

    // Starred status
    if (collectionFilters.starred !== undefined) {
      query = query.where('starred', '==', collectionFilters.starred);
    }

    // Collaboration status
    if (collectionFilters.collaborationStatus) {
      query = query.where('collaborationStatus', '==', collectionFilters.collaborationStatus);
    }

    // Enrichment status
    if (collectionFilters.enrichmentStatus) {
      query = query.where('enrichmentStatus', '==', collectionFilters.enrichmentStatus);
    }

    // Lists (array-contains)
    if (collectionFilters.lists && collectionFilters.lists.length === 1) {
      query = query.where('lists', 'array-contains', collectionFilters.lists[0]);
    }

    // Custom categories (array-contains)
    if (collectionFilters.customCategories && collectionFilters.customCategories.length === 1 && !collectionFilters.lists) {
      query = query.where('customCategories', 'array-contains', collectionFilters.customCategories[0]);
    }

    // Sorting (collection-specific sort options)
    if (collectionFilters.sortBy === 'recent' || !collectionFilters.sortBy) {
      query = query.orderBy('addedAt', 'desc');
    } else if (collectionFilters.sortBy === 'lastViewed') {
      query = query.orderBy('lastViewedAt', 'desc');
    }

    // Pagination
    const limit = Math.min(filters.limit || 50, 100);
    query = query.limit(limit);

    return query;
  }

  /**
   * Apply sorting to query
   */
  private applySorting(query: Query, filters: DiscoverFilters): Query {
    const sortBy = filters.sortBy || 'followers';
    const sortOrder = filters.sortOrder || 'desc';

    switch (sortBy) {
      case 'followers':
        query = query.orderBy('totalFollowers', sortOrder);
        break;

      case 'engagement':
        if (filters.hasEnrichment) {
          query = query.orderBy('instagramEnrichment.engagementRate', sortOrder);
        } else {
          query = query.orderBy('averageEngagementRate', sortOrder);
        }
        break;

      case 'recent':
        query = query.orderBy('createdAt', 'desc');
        break;

      case 'popularity':
        query = query.orderBy('addedToCollectionCount', 'desc');
        break;

      case 'relevance':
        // For keyword search, relevance is default (Firestore doesn't support text scoring)
        query = query.orderBy('totalFollowers', 'desc');
        break;

      default:
        query = query.orderBy('totalFollowers', 'desc');
    }

    return query;
  }

  /**
   * Client-side filtering for complex conditions that Firestore can't handle
   */
  applyClientSideFilters(
    results: GlobalInfluencer[],
    filters: DiscoverFilters
  ): GlobalInfluencer[] {
    return results.filter((profile) => {
      // Multiple platforms filter (Firestore can't do array-contains for objects)
      if (filters.platforms && filters.platforms.length > 0) {
        const hasPlatform = profile.platforms.some((p) =>
          filters.platforms!.includes(p.platform)
        );
        if (!hasPlatform) return false;
      }

      // Multiple categories (Firestore only supports single array-contains)
      if (filters.categories && filters.categories.length > 1) {
        const hasAllCategories = filters.categories.every((cat) =>
          profile.categories.includes(cat)
        );
        if (!hasAllCategories) return false;
      }

      // Multiple topics
      if (filters.topics && filters.topics.length > 1) {
        const hasAllTopics = filters.topics.every((topic) =>
          profile.topics.includes(topic)
        );
        if (!hasAllTopics) return false;
      }

      // Multiple hashtags
      if (filters.hashtags && filters.hashtags.length > 1) {
        const hasAllHashtags = filters.hashtags.every(
          (tag) =>
            profile.instagramEnrichment?.topHashtags.includes(tag)
        );
        if (!hasAllHashtags) return false;
      }

      // Multiple countries
      if (filters.countries && filters.countries.length > 1) {
        if (!filters.countries.includes(profile.location.country)) {
          return false;
        }
      }

      // Multiple cities
      if (filters.cities && filters.cities.length > 1) {
        if (!filters.cities.includes(profile.location.city)) {
          return false;
        }
      }

      // Avg likes filter
      if (filters.minAvgLikes && profile.instagramEnrichment) {
        if (profile.instagramEnrichment.avgLikes < filters.minAvgLikes) {
          return false;
        }
      }

      // Avg comments filter
      if (filters.minAvgComments && profile.instagramEnrichment) {
        if (profile.instagramEnrichment.avgComments < filters.minAvgComments) {
          return false;
        }
      }

      // Post count filter
      if (filters.minPostCount && profile.instagramEnrichment) {
        if (profile.instagramEnrichment.postCount < filters.minPostCount) {
          return false;
        }
      }

      // Posting frequency filter
      if (filters.postingFrequency && profile.instagramEnrichment) {
        if (profile.instagramEnrichment.postingFrequency !== filters.postingFrequency) {
          return false;
        }
      }

      // Audience country filter
      if (filters.audienceCountries && filters.audienceCountries.length > 0) {
        if (!profile.instagramEnrichment?.audienceCountries) return false;
        const hasAudienceCountry = filters.audienceCountries.some((country) =>
          profile.instagramEnrichment!.audienceCountries!.includes(country)
        );
        if (!hasAudienceCountry) return false;
      }

      // Audience age group filter
      if (filters.audienceAgeGroup && profile.instagramEnrichment) {
        if (profile.instagramEnrichment.audienceAgeGroup !== filters.audienceAgeGroup) {
          return false;
        }
      }

      // Audience gender filter
      if (filters.audienceGender && profile.instagramEnrichment?.audienceGenderSplit) {
        const split = profile.instagramEnrichment.audienceGenderSplit;
        switch (filters.audienceGender) {
          case 'male':
            if (split.male < 60) return false;
            break;
          case 'female':
            if (split.female < 60) return false;
            break;
          case 'balanced':
            if (Math.abs(split.male - split.female) > 20) return false;
            break;
        }
      }

      // Keywords (full search across multiple fields)
      if (filters.keywords) {
        const keywords = filters.keywords.toLowerCase().split(' ');
        const searchableText = [
          profile.displayName,
          profile.primaryUsername,
          profile.bio,
          ...profile.categories,
          ...profile.topics,
          ...profile.searchKeywords,
        ]
          .join(' ')
          .toLowerCase();

        const hasAllKeywords = keywords.every((keyword) =>
          searchableText.includes(keyword)
        );
        if (!hasAllKeywords) return false;
      }

      return true;
    });
  }

  /**
   * Validate filters before querying
   */
  validateFilters(filters: DiscoverFilters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for conflicting array-contains queries
    const arrayContainsFields = [
      filters.categories && filters.categories.length > 0,
      filters.topics && filters.topics.length > 0,
      filters.hashtags && filters.hashtags.length > 0,
      filters.keywords,
    ].filter(Boolean);

    if (arrayContainsFields.length > 1) {
      errors.push(
        'Firestore limitation: Can only use one array-contains filter at a time. Other filters will be applied client-side.'
      );
    }

    // Check follower range validity
    if (
      filters.minFollowers !== undefined &&
      filters.maxFollowers !== undefined &&
      filters.minFollowers > filters.maxFollowers
    ) {
      errors.push('minFollowers cannot be greater than maxFollowers');
    }

    // Check engagement range validity
    if (
      filters.minEngagementRate !== undefined &&
      filters.maxEngagementRate !== undefined &&
      filters.minEngagementRate > filters.maxEngagementRate
    ) {
      errors.push('minEngagementRate cannot be greater than maxEngagementRate');
    }

    // Warn if enrichment filters used without hasEnrichment=true
    if (
      !filters.hasEnrichment &&
      (filters.minEngagementRate ||
        filters.hashtags ||
        filters.minAvgLikes ||
        filters.postingFrequency)
    ) {
      errors.push(
        'Warning: Enrichment-based filters may return no results. Consider setting hasEnrichment=true'
      );
    }

    return {
      valid: errors.length === 0 || errors.every((e) => e.startsWith('Warning')),
      errors,
    };
  }

  /**
   * Generate search keywords from profile data (for indexing)
   */
  static generateSearchKeywords(profile: {
    displayName: string;
    primaryUsername: string;
    bio: string;
    categories: string[];
    topics: string[];
    location: { country: string; city: string };
  }): string[] {
    const keywords = new Set<string>();

    // Add name words
    profile.displayName
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => keywords.add(word));

    // Add username
    keywords.add(profile.primaryUsername.toLowerCase());

    // Add username without special chars
    keywords.add(
      profile.primaryUsername
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    );

    // Add bio words (top 20 most common)
    profile.bio
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3) // Ignore short words
      .slice(0, 20)
      .forEach((word) => keywords.add(word));

    // Add categories
    profile.categories.forEach((cat) => keywords.add(cat.toLowerCase()));

    // Add topics
    profile.topics.forEach((topic) => keywords.add(topic.toLowerCase()));

    // Add location
    keywords.add(profile.location.country.toLowerCase());
    keywords.add(profile.location.city.toLowerCase());

    // Remove common stop words
    const stopWords = ['the', 'and', 'or', 'for', 'with', 'from', 'this', 'that'];
    stopWords.forEach((word) => keywords.delete(word));

    return Array.from(keywords);
  }
}

// Export singleton instance
export const filterQueryBuilder = (db: Firestore) => new FilterQueryBuilder(db);
