export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';

export interface PlatformMetrics {
  network: string;
  followers: string;
  engagements: number;
  engagementRate: string;
  reach: string;
  emv: string;
}

export interface ContentPost {
  id: string;
  thumbnail: string;
  platform: SocialPlatform;
  likes: string;
  comments: string;
  date: string;
  caption?: string;
}

export interface DemographicData {
  averageAge: number;
  topGender: {
    gender: string;
    percentage: string;
  };
  topCountries: Array<{
    country: string;
    flag: string;
    percentage: string;
  }>;
  audienceInterests: Array<{
    interest: string;
    percentage: string;
  }>;
  brandAffinity: Array<{
    brand: string;
    logo?: string;
    percentage: string;
  }>;
}

export interface SimilarInfluencer {
  id?: string;
  name: string;
  avatar?: string;
  influenceScore: number;
  platforms: SocialPlatform[];
  followers: string;
  location?: string;
  flag?: string;
  localAudience?: string;
  engagement?: string;
  posts?: number;
}

export interface Influencer {
  id?:  string ;
  name: string;
  displayName: string;
  avatar?: string;
  influenceScore: number;
  platforms: SocialPlatform[];
  location?: string;
  flag?: string;
  categories?: string[];

  // Profile details
  bio?: string;
  engagementRate?: number;
  trueReach?: number;
  totalFollowers?: number;
  estimatedPrice?: string;

  // Insights
  mainTopics?: string[];
  brandSafety?: 'Safe' | 'Moderate' | 'Risky';
  audienceAgeGroup?: string;
  audienceAuthenticity?: 'Great' | 'Good' | 'Fair' | 'Poor';
  audienceLocation?: string[];
  portfolio?: string[];
  sponsoredContentFrequency?: string;

  // Extended data for profile page
  platformMetrics?: PlatformMetrics[];
  contentPosts?: ContentPost[];
  demographics?: DemographicData;
  similarInfluencers?: SimilarInfluencer[];
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'dateViewed' | 'dateTagged' | 'influenceScore' | 'name' | 'followers';
