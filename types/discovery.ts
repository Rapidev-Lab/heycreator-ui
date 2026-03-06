// Discovery Feature Type Definitions
import { LucideIcon } from 'lucide-react';

export type Platform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'snapchat' | 'facebook';

export type InfluenceLevel = 'all' | 'mega' | 'macro' | 'micro' | 'nano' | 'custom';

export type LocationType = 'influencer' | 'audience';

export type Gender = 'all' | 'female' | 'male';

export type AgeRange = 'all' | '12-17' | '18-24' | '25-34' | '35-49' | '50+';

export type SortBy = 'influence' | 'followers' | 'engagement' | 'relevance';

export type SortOrder = 'asc' | 'desc';

// Influencer Profile (Enhanced)
export interface InfluencerProfile {
  // Basic Info
  id: string;
  name: string;
  username: string;
  display_name: string;
  bio: string;
  profile_image_url: string;

  // Platform & Links
  platforms: Platform[];
  primary_platform: Platform;
  profile_urls: Record<Platform, string>;

  // Metrics
  follower_count: number;
  engagement_rate: number; // Percentage
  influence_score: number; // 0-100
  avg_likes: number;
  avg_comments: number;
  avg_shares: number;

  // Demographics
  location: {
    country: string;
    country_code: string;
    state?: string;
    city?: string;
  };
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  age?: number;
  languages: string[];

  // Audience Demographics
  audience: {
    total_followers: number;
    gender_split: {
      male: number; // Percentage
      female: number;
      other: number;
    };
    age_split: {
      '12-17': number;
      '18-24': number;
      '25-34': number;
      '35-49': number;
      '50+': number;
    };
    top_locations: {
      country: string;
      percentage: number;
    }[];
    authenticity_score: number; // 0-100
  };

  // Topics & Categories
  topics: string[];
  primary_topic: string;
  hashtags: string[];

  // Enrichment-derived audience demographics
  audience_demographics?: {
    age_ranges: { range: string; percentage: number }[];
    gender_split: { male: number; female: number };
    top_countries: { country: string; countryCode: string; percentage: number }[];
    top_cities: { city: string; country: string; percentage: number }[];
    interests: string[];
  };

  // Brand affinity from enrichment
  brand_affinity?: { brand: string; percentage: number }[];

  // True Reach (computed from followers + engagement rate)
  true_reach_percentage?: number;

  // Brand Collaborations
  brand_mentions: {
    brand_name: string;
    brand_handle: string;
    brand_logo_url: string;
    mention_count: number;
    last_mention_date: string;
  }[];

  // Content
  has_sponsored_posts: boolean;
  sponsored_post_count: number;
  post_frequency: number; // Posts per week

  // Contact & Verification
  email?: string;
  has_email: boolean;
  phone?: string;
  accepts_messages: boolean;
  is_vetted: boolean;
  verification_badges: {
    platform: Platform;
    verified: boolean;
  }[];

  // Metadata
  created_at: string;
  updated_at: string;
  last_scraped_at: string;
}

// Discovery Filters
export interface DiscoveryFilters {
  // Influence
  influence_level?: InfluenceLevel;

  // Social Stats
  min_followers?: number;
  max_followers?: number;
  min_engagement_rate?: number;

  // Verification
  vetted_only?: boolean;

  // Topics
  topics?: string[];

  // Brands
  brand_mentions?: string[];

  // Location
  location_type?: LocationType;
  location?: string;

  // Show Only
  show_people_only?: boolean;
  has_email?: boolean;
  has_sponsored_posts?: boolean;
  accepts_messages?: boolean;

  // Exclude
  exclude_tag_id?: string;
  exclude_campaign_id?: string;

  // Demographics
  gender?: Gender;
  audience_gender?: Gender;
  audience_age_range?: AgeRange;
}

// Search Request
export interface DiscoverySearchRequest {
  // Search Query
  query?: string;
  platforms: Platform[];

  // Filters
  filters: DiscoveryFilters;

  // Sorting & Pagination
  sort_by?: SortBy;
  sort_order?: SortOrder;
  page?: number;
  limit?: number;
}

// Search Response
export interface DiscoverySearchResponse {
  results: InfluencerProfile[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;

  // Metadata
  search_metadata: {
    query: string;
    platforms: Platform[];
    result_description: string;
    related_topics: string[];
    sort_info: string;
  };

  // Performance
  search_time_ms: number;
}

// Topic Category
export interface TopicCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  suggestions: TopicSuggestion[];
}

// Topic Suggestion
export interface TopicSuggestion {
  type: 'topic' | 'subtopic' | 'brand' | 'hashtag';
  label: string;
  query: string;
  icon?: string;
}

// Visual Prompt
export interface VisualPrompt {
  id: string;
  prompt: string;
  image_url?: string;
}

// AI Visual Search Request
export interface AIVisualSearchRequest {
  prompt: string;
  platforms: Platform[];
  limit?: number;
}

// AI Visual Search Response
export interface AIVisualSearchResponse {
  results: InfluencerProfile[];
  confidence_scores: number[];
  count: number;
}

// Saved Search
export interface SavedSearch {
  id: string;
  name: string;
  search_params: DiscoverySearchRequest;
  result_count: number;
  created_at: string;
}
