export interface CampaignMetrics {
  totalReach: number;
  reachChange: number;
  totalEngagement: number;
  engagementChange: number;
  engagementRate: number;
  engagementRateChange: number;
  totalClicks: number;
  clicksChange: number;
}

export interface PerformanceDataPoint {
  date: string;
  reach: number;
  engagement: number;
  clicks: number;
}

export interface ROIMetrics {
  totalSpend: number;
  costPerEngagement: number;
  costPerClick: number;
  estimatedRevenue: number;
  roi: number;
}

export interface InfluencerPerformance {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  posts: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  clicks: number;
}

export interface TopContent {
  id: string;
  influencerName: string;
  platform?: string;
  contentType: 'Post' | 'Reel' | 'Video';
  thumbnailUrl: string;
  caption: string;
  reach: number;
  likes: number;
  comments?: number;
  clicks?: number;
  engagementRate: number;
}

export interface AudienceDemographic {
  ageGroup: string;
  percentage: number;
}

export interface GenderSplit {
  female: number;
  male: number;
}

export interface TopLocation {
  rank: number;
  city: string;
  percentage: number;
}

export interface CampaignReport {
  metrics: CampaignMetrics;
  performanceData: PerformanceDataPoint[];
  roiMetrics: ROIMetrics;
  influencerPerformance: InfluencerPerformance[];
  topContent: TopContent[];
  audienceDemographics: AudienceDemographic[];
  genderSplit: GenderSplit;
  topLocations: TopLocation[];
}

export type TimeFilter = '7days' | '30days' | 'alltime';