import { CampaignReport } from '@/types/campaign-report';

export const mockCampaignReport: CampaignReport = {
  metrics: {
    totalReach: 2400000,
    reachChange: 12,
    totalEngagement: 186000,
    engagementChange: 6,
    engagementRate: 7.8,
    engagementRateChange: 1,
    totalClicks: 24300,
    clicksChange: 14
  },
  performanceData: [
    { date: 'Jan 9', reach: 520000, engagement: 38000, clicks: 2800 },
    { date: 'Jan 10', reach: 580000, engagement: 42000, clicks: 3200 },
    { date: 'Jan 11', reach: 650000, engagement: 48000, clicks: 3500 },
    { date: 'Jan 12', reach: 720000, engagement: 54000, clicks: 3900 },
    { date: 'Jan 13', reach: 810000, engagement: 61000, clicks: 4400 },
    { date: 'Jan 14', reach: 920000, engagement: 70000, clicks: 5100 },
    { date: 'Jan 15', reach: 1100000, engagement: 84000, clicks: 6200 },
    { date: 'Jan 16', reach: 1280000, engagement: 98000, clicks: 7300 }
  ],
  roiMetrics: {
    totalSpend: 125000,
    costPerEngagement: 0.67,
    costPerClick: 5.14,
    estimatedRevenue: 487500,
    roi: 390
  },
  influencerPerformance: [
    {
      id: 'inf-1',
      name: 'Sarah Chen',
      handle: '@sarahchen',
      avatar: 'https://i.pravatar.cc/150?img=10',
      posts: 3,
      reach: 850000,
      engagement: 68200,
      engagementRate: 8.1,
      clicks: 5200
    },
    {
      id: 'inf-2',
      name: 'Marcus Powell',
      handle: '@marcuspowell',
      avatar: 'https://i.pravatar.cc/150?img=11',
      posts: 2,
      reach: 512000,
      engagement: 41500,
      engagementRate: 8.1,
      clicks: 5800
    },
    {
      id: 'inf-3',
      name: 'Aisha Rahman',
      handle: '@aisharahman',
      avatar: 'https://i.pravatar.cc/150?img=12',
      posts: 4,
      reach: 623000,
      engagement: 43900,
      engagementRate: 7.0,
      clicks: 5100
    },
    {
      id: 'inf-4',
      name: 'Lisa Kim',
      handle: '@lisakim',
      avatar: 'https://i.pravatar.cc/150?img=13',
      posts: 3,
      reach: 287000,
      engagement: 22100,
      engagementRate: 7.7,
      clicks: 3100
    },
    {
      id: 'inf-5',
      name: 'David Johnson',
      handle: '@davidjohnson',
      avatar: 'https://i.pravatar.cc/150?img=14',
      posts: 2,
      reach: 194000,
      engagement: 10600,
      engagementRate: 5.5,
      clicks: 1100
    }
  ],
  topContent: [
    {
      id: 'content-1',
      influencerName: 'Sarah Chen',
      platform: 'instagram', // Added for UI icons
      contentType: 'Post',
      thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
      caption: 'Obsessed with this outfit! Which color is your fav season...',
      reach: 175300,
      likes: 128, // Matched to design
      comments: 3, // Matched to design
      engagementRate: 8.5
    },
    {
      id: 'content-2',
      influencerName: 'Aisha Rahman',
      platform: 'instagram',
      contentType: 'Video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
      caption: 'This is amazing product! #HomeCooking #Foodie',
      reach: 196100,
      likes: 588,
      comments: 12,
      engagementRate: 8.3
    },
    {
      id: 'content-3',
      influencerName: 'Marcus Powell',
      platform: 'tiktok',
      contentType: 'Video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      caption: 'Complete review and demo - is it worth the hype?',
      reach: 140800,
      likes: 2459,
      comments: 143,
      engagementRate: 8.1
    },
    // Additional items to ensure the "View All" grid wraps correctly
    {
      id: 'content-4',
      influencerName: 'Lisa Kim',
      platform: 'instagram',
      contentType: 'Post',
      thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      caption: 'Testing out the new tech setup! 💻 #WorkspaceGoals',
      reach: 98000,
      likes: 742,
      comments: 21,
      engagementRate: 7.2
    },
    {
      id: 'content-5',
      influencerName: 'David Johnson',
      platform: 'facebook',
      contentType: 'Post',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400',
      caption: 'A peaceful weekend at the mountains. #Adventure',
      reach: 112000,
      likes: 312,
      comments: 9,
      engagementRate: 6.4
    },
    {
      id: 'content-6',
      influencerName: 'Sarah Chen',
      platform: 'instagram',
      contentType: 'Video',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      caption: 'Morning routine ☕️✨ #Vlog #Daily',
      reach: 210000,
      likes: 1120,
      comments: 54,
      engagementRate: 9.1
    }
  ],
  audienceDemographics: [
    { ageGroup: '18-24 years', percentage: 28 },
    { ageGroup: '25-34 years', percentage: 42 },
    { ageGroup: '35-44 years', percentage: 21 },
    { ageGroup: '45+ years', percentage: 9 }
  ],
  genderSplit: {
    female: 64,
    male: 36
  },
  topLocations: [
    { rank: 1, city: 'Johannesburg', percentage: 32 },
    { rank: 2, city: 'Cape Town', percentage: 24 },
    { rank: 3, city: 'Durban', percentage: 18 },
    { rank: 4, city: 'Pretoria', percentage: 14 },
    { rank: 5, city: 'Port Elizabeth', percentage: 7 },
    { rank: 6, city: 'Other Cities', percentage: 5 }
  ]
};