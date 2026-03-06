// data/dummyRecommendedCreators.ts
// NOTE: This file is deprecated and no longer used.
// Discovery pages now load data from the API instead.

type CreatorCard = {
  avatarUrl: string;
  name: string;
  handle: string;
  isVerified: boolean;
  isBookmarked: boolean;
  stats: { followers: string; engagement: string; reach: string };
  socials: string[];
  specialty: string;
  tags: string[];
};

export const dummyRecommendedCreators: CreatorCard[] = [
  {
    avatarUrl: '/images/sarah_johnson.svg',
    name: 'Sarah Johnson',
    handle: '@sarahjbea',
    isVerified: true,
    isBookmarked: false, // Added isBookmarked
    stats: {
      followers: '156K',
      engagement: '6.2%',
      reach: '12K',
    },
    socials: ['instagram', 'tiktok', 'youtube'],
    specialty: 'Beauty & Skincare Expert | Clean Beauty Advocate | Honest Reviews',
    tags: ['Beauty', 'Skincare', 'Wellness'],
  },
  {
    avatarUrl: '/images/alex_lee.svg',
    name: 'Alex Lee',
    handle: '@alex_travels',
    isVerified: false,
    isBookmarked: true, // Added isBookmarked
    stats: {
      followers: '85K',
      engagement: '4.1%',
      reach: '8K',
    },
    socials: ['instagram', 'x', 'facebook'],
    specialty: 'Adventure Traveler | Lifestyle Vlogger | Food Enthusiast',
    tags: ['Travel', 'Food', 'Lifestyle'],
  },
  {
    avatarUrl: '/images/maria_gonzales.svg',
    name: 'Maria Gonzales',
    handle: '@maria.fit',
    isVerified: true,
    isBookmarked: false, // Added isBookmarked
    stats: {
      followers: '210K',
      engagement: '7.5%',
      reach: '18K',
    },
    socials: ['tiktok', 'youtube'],
    specialty: 'Fitness Coach | Healthy Recipes | Motivation & Wellness',
    tags: ['Fitness', 'Health', 'Motivation'],
  },
];
