/**
 * Type definitions for Apify Instagram API responses
 * Based on real data structure from APIFY.json
 */

// ============================================================================
// METHOD 1: Profile Details
// ============================================================================

export interface ApifyExternalUrl {
  title: string;
  url: string;
  lynx_url?: string;
  link_type: string;
}

export interface ApifyFacebookPage {
  page_id: string;
  category: string;
  image_uri: string;
  likes: number;
  verification: string;
  name: string;
  country: string | null;
  entity_type: string;
  ig_username: string;
  ig_followers: number;
  ig_verification: boolean;
  page_alias: string;
  page_is_deleted: boolean;
}

export interface ApifyRelatedProfile {
  id: string;
  full_name: string;
  is_private: boolean;
  is_verified: boolean;
  profile_pic_url: string;
  username: string;
}

export interface ApifyProfileDetails {
  searchTerm?: string;
  searchSource?: string;
  inputUrl?: string;
  id: string;
  username: string;
  url: string;
  fullName: string;
  biography: string;
  externalUrls: ApifyExternalUrl[];
  externalUrl?: string;
  externalUrlShimmed?: string;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  businessCategoryName: string | null;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  facebookPage?: ApifyFacebookPage;
  igtvVideoCount: number;
  relatedProfiles: ApifyRelatedProfile[];
}

// ============================================================================
// METHOD 2: Posts Data
// ============================================================================

export interface ApifyCommentOwner {
  id: string;
  is_verified: boolean;
  profile_pic_url: string;
  username: string;
}

export interface ApifyComment {
  id: string;
  text: string;
  ownerUsername: string;
  ownerProfilePicUrl: string;
  timestamp: string;
  repliesCount: number;
  replies: any[];
  likesCount: number;
  owner: ApifyCommentOwner;
}

export interface ApifyTaggedUser {
  full_name: string;
  id: string;
  is_verified: boolean;
  profile_pic_url: string;
  username: string;
}

export interface ApifyPost {
  id: string;
  type: 'Image' | 'Video' | 'Sidecar';
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  firstComment: string;
  latestComments: ApifyComment[];
  dimensionsHeight: number;
  dimensionsWidth: number;
  displayUrl: string;
  images?: string[];
  alt: string;
  likesCount: number;
  timestamp: string;
  childPosts?: any[];
  ownerFullName: string;
  ownerUsername: string;
  ownerId: string;
  taggedUsers: ApifyTaggedUser[];
  isCommentsDisabled: boolean;
  inputUrl?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
}

// ============================================================================
// METHOD 8: Related Profiles (same as ApifyRelatedProfile)
// ============================================================================

// Already defined above as ApifyRelatedProfile

// ============================================================================
// Complete Enrichment Data Structure
// ============================================================================

export interface ApifyEnrichmentData {
  savedAt: string;
  username: string;
  rawMethodData: {
    method1_profileDetails?: ApifyProfileDetails;
    method2_directPosts?: ApifyPost[];
    method3_directReels?: ApifyPost[];
    method4_directMentions?: ApifyPost[];
    method5_userSearch?: any[];
    method6_hashtagSearch?: any[];
    method7_placeSearch?: any[];
    method8_relatedProfiles?: ApifyRelatedProfile[];
    method9_enrichedSimilarProfiles?: any[];
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

export interface PlatformInfo {
  platform: Platform;
  url: string;
  title?: string;
}
