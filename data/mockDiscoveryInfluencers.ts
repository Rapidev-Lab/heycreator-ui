import { InfluencerProfile } from '@/types/discovery';

// Comprehensive mock database for Discovery feature
export const mockDiscoveryInfluencers: InfluencerProfile[] = [
  {
    id: '1',
    name: 'Emma Chamberlain',
    username: 'emmachamberlain',
    display_name: 'emma chamberlain',
    bio: '@anythinggoes @chamberlaincoffee',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    platforms: ['instagram', 'youtube', 'tiktok'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/emmachamberlain',
      youtube: 'https://youtube.com/@emmachamberlain',
      tiktok: 'https://tiktok.com/@emmachamberlain',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 18900000,
    engagement_rate: 15.5,
    influence_score: 97,
    avg_likes: 850000,
    avg_comments: 12000,
    avg_shares: 5000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'San Francisco'
    },
    gender: 'female',
    age: 22,
    languages: ['en'],
    audience: {
      total_followers: 18900000,
      gender_split: { male: 42, female: 58, other: 0 },
      age_split: { '12-17': 25, '18-24': 45, '25-34': 20, '35-49': 8, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 58 },
        { country: 'United Kingdom', percentage: 12 }
      ],
      authenticity_score: 92
    },
    topics: ['lifestyle', 'fashion', 'beauty'],
    primary_topic: 'lifestyle',
    hashtags: ['lifestyle', 'fashion', 'coffee'],
    brand_mentions: [
      { brand_name: 'YouTube', brand_handle: '@youtube', brand_logo_url: '', mention_count: 15, last_mention_date: '2024-01-20' },
      { brand_name: 'Vogue', brand_handle: '@vogue', brand_logo_url: '', mention_count: 8, last_mention_date: '2024-01-15' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 24,
    post_frequency: 4,
    email: 'contact@emmachamberlain.com',
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true },
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '2',
    name: 'Charli DAmelio',
    username: 'charlidamelio',
    display_name: 'charli',
    bio: '@andjulietbway @bettybuzz @bettybooze',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charli',
    platforms: ['tiktok', 'instagram', 'youtube'],
    primary_platform: 'tiktok',
    profile_urls: {
      tiktok: 'https://tiktok.com/@charlidamelio',
      instagram: 'https://instagram.com/charlidamelio',
      youtube: 'https://youtube.com/@charlidamelio',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 202200000,
    engagement_rate: 10.6,
    influence_score: 99,
    avg_likes: 2500000,
    avg_comments: 45000,
    avg_shares: 120000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'Connecticut',
      city: 'Norwalk'
    },
    gender: 'female',
    age: 19,
    languages: ['en'],
    audience: {
      total_followers: 202200000,
      gender_split: { male: 27, female: 73, other: 0 },
      age_split: { '12-17': 35, '18-24': 40, '25-34': 18, '35-49': 5, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 51 },
        { country: 'Brazil', percentage: 8 }
      ],
      authenticity_score: 88
    },
    topics: ['lifestyle', 'fashion', 'beauty'],
    primary_topic: 'fashion',
    hashtags: ['fashion', 'ootd', 'dance'],
    brand_mentions: [
      { brand_name: 'Prada', brand_handle: '@prada', brand_logo_url: '', mention_count: 12, last_mention_date: '2024-01-22' },
      { brand_name: 'Cera Ve', brand_handle: '@cerave', brand_logo_url: '', mention_count: 6, last_mention_date: '2024-01-18' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 45,
    post_frequency: 7,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'tiktok', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '3',
    name: 'Blake Lively',
    username: 'blakelively',
    display_name: 'Blake Lively',
    bio: 'Founder of @blakebrownbeauty ✨ @bettybuzz & @bettybooze',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Blake',
    platforms: ['instagram', 'twitter'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/blakelively',
      twitter: 'https://twitter.com/blakelively',
      tiktok: '',
      youtube: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 46600000,
    engagement_rate: 25.0,
    influence_score: 98,
    avg_likes: 1200000,
    avg_comments: 28000,
    avg_shares: 8000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'New York',
      city: 'New York'
    },
    gender: 'female',
    age: 36,
    languages: ['en'],
    audience: {
      total_followers: 46600000,
      gender_split: { male: 39, female: 61, other: 0 },
      age_split: { '12-17': 8, '18-24': 22, '25-34': 35, '35-49': 28, '50+': 7 },
      top_locations: [
        { country: 'United States', percentage: 39 },
        { country: 'United Kingdom', percentage: 11 }
      ],
      authenticity_score: 95
    },
    topics: ['fashion', 'beauty', 'lifestyle'],
    primary_topic: 'fashion',
    hashtags: ['fashion', 'beauty', 'entrepreneur'],
    brand_mentions: [
      { brand_name: 'Gucci', brand_handle: '@gucci', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-24' },
      { brand_name: 'Chanel', brand_handle: '@chanel', brand_logo_url: '', mention_count: 14, last_mention_date: '2024-01-20' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 32,
    post_frequency: 3,
    has_email: true,
    accepts_messages: false,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '4',
    name: 'Gordon Ramsay',
    username: 'gordongram',
    display_name: 'Gordon Ramsay',
    bio: 'Chef, Restaurateur, TV Host',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gordon',
    platforms: ['instagram', 'tiktok', 'youtube', 'twitter'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/gordongram',
      tiktok: 'https://tiktok.com/@gordonramsayofficial',
      youtube: 'https://youtube.com/@gordonramsay',
      twitter: 'https://twitter.com/gordonramsay',
      snapchat: '',
      facebook: ''
    },
    follower_count: 14800000,
    engagement_rate: 8.3,
    influence_score: 96,
    avg_likes: 420000,
    avg_comments: 15000,
    avg_shares: 6000,
    location: {
      country: 'United Kingdom',
      country_code: 'GB',
      city: 'London'
    },
    gender: 'male',
    age: 57,
    languages: ['en'],
    audience: {
      total_followers: 14800000,
      gender_split: { male: 62, female: 38, other: 0 },
      age_split: { '12-17': 12, '18-24': 28, '25-34': 32, '35-49': 22, '50+': 6 },
      top_locations: [
        { country: 'United States', percentage: 42 },
        { country: 'United Kingdom', percentage: 25 }
      ],
      authenticity_score: 94
    },
    topics: ['food', 'lifestyle', 'entertainment'],
    primary_topic: 'food',
    hashtags: ['food', 'cooking', 'chef'],
    brand_mentions: [
      { brand_name: 'HexClad', brand_handle: '@hexclad', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-25' },
      { brand_name: 'MasterChef', brand_handle: '@masterchef', brand_logo_url: '', mention_count: 35, last_mention_date: '2024-01-23' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 18,
    post_frequency: 5,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true },
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '5',
    name: 'Kayla Itsines',
    username: 'kayla_itsines',
    display_name: 'KAYLA ITSINES',
    bio: 'Co-Founder of @sweat Creator of BBG & PWR',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kayla',
    platforms: ['instagram', 'youtube'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/kayla_itsines',
      youtube: 'https://youtube.com/@kaylaitsines',
      tiktok: '',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 15700000,
    engagement_rate: 3.2,
    influence_score: 92,
    avg_likes: 185000,
    avg_comments: 5200,
    avg_shares: 1800,
    location: {
      country: 'Australia',
      country_code: 'AU',
      city: 'Adelaide'
    },
    gender: 'female',
    age: 32,
    languages: ['en'],
    audience: {
      total_followers: 15700000,
      gender_split: { male: 15, female: 85, other: 0 },
      age_split: { '12-17': 8, '18-24': 35, '25-34': 38, '35-49': 16, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 32 },
        { country: 'Australia', percentage: 18 }
      ],
      authenticity_score: 96
    },
    topics: ['fitness', 'health', 'lifestyle'],
    primary_topic: 'fitness',
    hashtags: ['fitness', 'workout', 'health'],
    brand_mentions: [
      { brand_name: 'Sweat', brand_handle: '@sweat', brand_logo_url: '', mention_count: 85, last_mention_date: '2024-01-26' },
      { brand_name: 'Lululemon', brand_handle: '@lululemon', brand_logo_url: '', mention_count: 12, last_mention_date: '2024-01-22' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 28,
    post_frequency: 6,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '6',
    name: 'MrBeast',
    username: 'mrbeast',
    display_name: 'MrBeast',
    bio: 'Subscribe or I will take your cookies 🍪',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MrBeast',
    platforms: ['youtube', 'instagram', 'tiktok', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@mrbeast',
      instagram: 'https://instagram.com/mrbeast',
      tiktok: 'https://tiktok.com/@mrbeast',
      twitter: 'https://twitter.com/mrbeast',
      snapchat: '',
      facebook: ''
    },
    follower_count: 231000000,
    engagement_rate: 12.8,
    influence_score: 100,
    avg_likes: 5200000,
    avg_comments: 125000,
    avg_shares: 250000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'North Carolina',
      city: 'Greenville'
    },
    gender: 'male',
    age: 25,
    languages: ['en'],
    audience: {
      total_followers: 231000000,
      gender_split: { male: 68, female: 32, other: 0 },
      age_split: { '12-17': 42, '18-24': 35, '25-34': 15, '35-49': 6, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 38 },
        { country: 'India', percentage: 12 }
      ],
      authenticity_score: 89
    },
    topics: ['entertainment', 'lifestyle', 'business'],
    primary_topic: 'entertainment',
    hashtags: ['mrbeast', 'challenge', 'giveaway'],
    brand_mentions: [
      { brand_name: 'Feastables', brand_handle: '@feastables', brand_logo_url: '', mention_count: 95, last_mention_date: '2024-01-26' },
      { brand_name: 'MrBeast Burger', brand_handle: '@mrbeastburger', brand_logo_url: '', mention_count: 42, last_mention_date: '2024-01-24' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 65,
    post_frequency: 4,
    has_email: true,
    accepts_messages: false,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '7',
    name: 'Huda Kattan',
    username: 'hudabeauty',
    display_name: 'Huda Kattan',
    bio: 'Founder @hudabeauty @wishfulyo @kayali',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huda',
    platforms: ['instagram', 'youtube', 'tiktok'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/hudabeauty',
      youtube: 'https://youtube.com/@hudabeauty',
      tiktok: 'https://tiktok.com/@hudabeauty',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 52700000,
    engagement_rate: 2.8,
    influence_score: 95,
    avg_likes: 425000,
    avg_comments: 12000,
    avg_shares: 3500,
    location: {
      country: 'United Arab Emirates',
      country_code: 'AE',
      city: 'Dubai'
    },
    gender: 'female',
    age: 40,
    languages: ['en', 'ar'],
    audience: {
      total_followers: 52700000,
      gender_split: { male: 8, female: 92, other: 0 },
      age_split: { '12-17': 15, '18-24': 42, '25-34': 28, '35-49': 12, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 22 },
        { country: 'India', percentage: 18 }
      ],
      authenticity_score: 91
    },
    topics: ['beauty', 'makeup', 'business'],
    primary_topic: 'beauty',
    hashtags: ['beauty', 'makeup', 'hudabeauty'],
    brand_mentions: [
      { brand_name: 'Sephora', brand_handle: '@sephora', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-25' },
      { brand_name: 'Revlon', brand_handle: '@revlon', brand_logo_url: '', mention_count: 15, last_mention_date: '2024-01-20' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 42,
    post_frequency: 5,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '8',
    name: 'Jack Harries',
    username: 'jackharries',
    display_name: 'Jack Harries',
    bio: 'Filmmaker & Climate Activist',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    platforms: ['instagram', 'youtube', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@jackharries',
      instagram: 'https://instagram.com/jackharries',
      twitter: 'https://twitter.com/jackharries',
      tiktok: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 4200000,
    engagement_rate: 6.5,
    influence_score: 85,
    avg_likes: 125000,
    avg_comments: 8500,
    avg_shares: 3200,
    location: {
      country: 'United Kingdom',
      country_code: 'GB',
      city: 'London'
    },
    gender: 'male',
    age: 30,
    languages: ['en'],
    audience: {
      total_followers: 4200000,
      gender_split: { male: 52, female: 48, other: 0 },
      age_split: { '12-17': 18, '18-24': 38, '25-34': 28, '35-49': 14, '50+': 2 },
      top_locations: [
        { country: 'United Kingdom', percentage: 32 },
        { country: 'United States', percentage: 28 }
      ],
      authenticity_score: 97
    },
    topics: ['activist', 'travel', 'nature'],
    primary_topic: 'activist',
    hashtags: ['climate', 'activism', 'travel'],
    brand_mentions: [
      { brand_name: 'Patagonia', brand_handle: '@patagonia', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-24' },
      { brand_name: 'Greenpeace', brand_handle: '@greenpeace', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-26' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 12,
    post_frequency: 3,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '9',
    name: 'Rosanna Pansino',
    username: 'rosannapansino',
    display_name: 'Rosanna Pansino',
    bio: 'Baker 🧁 YouTuber 📹 Author 📚 @nerdy.nummies',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rosanna',
    platforms: ['youtube', 'instagram', 'tiktok', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@rosannapansino',
      instagram: 'https://instagram.com/rosannapansino',
      tiktok: 'https://tiktok.com/@rosannapansino',
      twitter: 'https://twitter.com/rosannapansino',
      snapchat: '',
      facebook: ''
    },
    follower_count: 14100000,
    engagement_rate: 5.8,
    influence_score: 90,
    avg_likes: 285000,
    avg_comments: 11000,
    avg_shares: 4500,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'female',
    age: 38,
    languages: ['en'],
    audience: {
      total_followers: 14100000,
      gender_split: { male: 35, female: 65, other: 0 },
      age_split: { '12-17': 32, '18-24': 28, '25-34': 22, '35-49': 15, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 52 },
        { country: 'Canada', percentage: 8 }
      ],
      authenticity_score: 94
    },
    topics: ['food', 'entertainment', 'lifestyle'],
    primary_topic: 'food',
    hashtags: ['baking', 'food', 'nerdynummies'],
    brand_mentions: [
      { brand_name: 'KitchenAid', brand_handle: '@kitchenaidusa', brand_logo_url: '', mention_count: 32, last_mention_date: '2024-01-25' },
      { brand_name: 'Wilton', brand_handle: '@wiltonc cakes', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-22' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 35,
    post_frequency: 4,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '10',
    name: 'David Dobrik',
    username: 'daviddobrik',
    display_name: 'David Dobrik',
    bio: 'I make videos',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    platforms: ['youtube', 'instagram', 'tiktok'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@daviddobrik',
      instagram: 'https://instagram.com/daviddobrik',
      tiktok: 'https://tiktok.com/@daviddobrik',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 18500000,
    engagement_rate: 9.2,
    influence_score: 93,
    avg_likes: 685000,
    avg_comments: 18500,
    avg_shares: 7200,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'male',
    age: 27,
    languages: ['en'],
    audience: {
      total_followers: 18500000,
      gender_split: { male: 58, female: 42, other: 0 },
      age_split: { '12-17': 28, '18-24': 42, '25-34': 20, '35-49': 8, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 55 },
        { country: 'Canada', percentage: 9 }
      ],
      authenticity_score: 87
    },
    topics: ['entertainment', 'lifestyle', 'geek'],
    primary_topic: 'entertainment',
    hashtags: ['vlog', 'entertainment', 'vlogs quad'],
    brand_mentions: [
      { brand_name: 'Tesla', brand_handle: '@tesla', brand_logo_url: '', mention_count: 14, last_mention_date: '2024-01-23' },
      { brand_name: 'SeatGeek', brand_handle: '@seatgeek', brand_logo_url: '', mention_count: 25, last_mention_date: '2024-01-20' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 38,
    post_frequency: 3,
    has_email: true,
    accepts_messages: false,
    is_vetted: false,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '11',
    name: 'Safiya Nygaard',
    username: 'safiyany',
    display_name: 'Safiya Nygaard',
    bio: 'YouTuber, Investigative Beauty Journalist',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Safiya',
    platforms: ['youtube', 'instagram', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@safiya',
      instagram: 'https://instagram.com/safiyany',
      twitter: 'https://twitter.com/safiyany',
      tiktok: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 10200000,
    engagement_rate: 7.8,
    influence_score: 91,
    avg_likes: 312000,
    avg_comments: 14200,
    avg_shares: 5800,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'female',
    age: 36,
    languages: ['en'],
    audience: {
      total_followers: 10200000,
      gender_split: { male: 22, female: 78, other: 0 },
      age_split: { '12-17': 18, '18-24': 42, '25-34': 28, '35-49': 10, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 48 },
        { country: 'United Kingdom', percentage: 12 }
      ],
      authenticity_score: 96
    },
    topics: ['beauty', 'fashion', 'lifestyle'],
    primary_topic: 'beauty',
    hashtags: ['beauty', 'makeup', 'experiment'],
    brand_mentions: [
      { brand_name: 'Sephora', brand_handle: '@sephora', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-24' },
      { brand_name: 'ColourPop', brand_handle: '@colourpopcosmetics', brand_logo_url: '', mention_count: 15, last_mention_date: '2024-01-21' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 18,
    post_frequency: 2,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '12',
    name: 'Casey Neistat',
    username: 'caseyneistat',
    display_name: 'Casey Neistat',
    bio: 'Filmmaker, YouTuber, Entrepreneur',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    platforms: ['youtube', 'instagram', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@casey',
      instagram: 'https://instagram.com/caseyneistat',
      twitter: 'https://twitter.com/casey',
      tiktok: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 12700000,
    engagement_rate: 5.2,
    influence_score: 89,
    avg_likes: 248000,
    avg_comments: 9800,
    avg_shares: 4200,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'New York',
      city: 'New York'
    },
    gender: 'male',
    age: 43,
    languages: ['en'],
    audience: {
      total_followers: 12700000,
      gender_split: { male: 72, female: 28, other: 0 },
      age_split: { '12-17': 12, '18-24': 32, '25-34': 35, '35-49': 18, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 42 },
        { country: 'United Kingdom', percentage: 11 }
      ],
      authenticity_score: 95
    },
    topics: ['lifestyle', 'technology', 'travel'],
    primary_topic: 'lifestyle',
    hashtags: ['vlog', 'filmmaker', 'nyc'],
    brand_mentions: [
      { brand_name: 'Samsung', brand_handle: '@samsung', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-25' },
      { brand_name: 'Nike', brand_handle: '@nike', brand_logo_url: '', mention_count: 12, last_mention_date: '2024-01-22' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 22,
    post_frequency: 3,
    has_email: true,
    accepts_messages: false,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '13',
    name: 'Lele Pons',
    username: 'lelepons',
    display_name: 'Lele Pons',
    bio: 'Singer, Actress, Content Creator',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lele',
    platforms: ['instagram', 'youtube', 'tiktok'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/lelepons',
      youtube: 'https://youtube.com/@lelepons',
      tiktok: 'https://tiktok.com/@lelepons',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 53400000,
    engagement_rate: 3.8,
    influence_score: 94,
    avg_likes: 425000,
    avg_comments: 18500,
    avg_shares: 6200,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'female',
    age: 27,
    languages: ['en', 'es'],
    audience: {
      total_followers: 53400000,
      gender_split: { male: 45, female: 55, other: 0 },
      age_split: { '12-17': 32, '18-24': 38, '25-34': 20, '35-49': 8, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 28 },
        { country: 'Mexico', percentage: 15 }
      ],
      authenticity_score: 85
    },
    topics: ['entertainment', 'music', 'lifestyle'],
    primary_topic: 'entertainment',
    hashtags: ['entertainment', 'music', 'comedy'],
    brand_mentions: [
      { brand_name: 'Universal Music', brand_handle: '@universalmusic', brand_logo_url: '', mention_count: 35, last_mention_date: '2024-01-26' },
      { brand_name: 'YouTube', brand_handle: '@youtube', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-23' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 48,
    post_frequency: 6,
    has_email: true,
    accepts_messages: true,
    is_vetted: false,
    verification_badges: [
      { platform: 'instagram', verified: true },
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '14',
    name: 'Zach King',
    username: 'zachking',
    display_name: 'Zach King',
    bio: 'Filmmaker | Illusionist',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zach',
    platforms: ['tiktok', 'instagram', 'youtube'],
    primary_platform: 'tiktok',
    profile_urls: {
      tiktok: 'https://tiktok.com/@zachking',
      instagram: 'https://instagram.com/zachking',
      youtube: 'https://youtube.com/@zachking',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 81400000,
    engagement_rate: 11.5,
    influence_score: 97,
    avg_likes: 3250000,
    avg_comments: 45000,
    avg_shares: 180000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'male',
    age: 33,
    languages: ['en'],
    audience: {
      total_followers: 81400000,
      gender_split: { male: 55, female: 45, other: 0 },
      age_split: { '12-17': 38, '18-24': 35, '25-34': 18, '35-49': 7, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 32 },
        { country: 'India', percentage: 14 }
      ],
      authenticity_score: 92
    },
    topics: ['entertainment', 'geek', 'art'],
    primary_topic: 'entertainment',
    hashtags: ['magic', 'illusion', 'filmmaking'],
    brand_mentions: [
      { brand_name: 'Adobe', brand_handle: '@adobe', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-24' },
      { brand_name: 'Canon', brand_handle: '@canonusa', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-21' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 32,
    post_frequency: 5,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'tiktok', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '15',
    name: 'Jenna Marbles',
    username: 'jennamarbles',
    display_name: 'Jenna Marbles',
    bio: 'Making people laugh since 2010',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jenna',
    platforms: ['youtube', 'instagram', 'twitter'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@jennamarbles',
      instagram: 'https://instagram.com/jennamarbles',
      twitter: 'https://twitter.com/jennamarbles',
      tiktok: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 20100000,
    engagement_rate: 4.2,
    influence_score: 88,
    avg_likes: 385000,
    avg_comments: 22000,
    avg_shares: 8500,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'female',
    age: 37,
    languages: ['en'],
    audience: {
      total_followers: 20100000,
      gender_split: { male: 38, female: 62, other: 0 },
      age_split: { '12-17': 15, '18-24': 35, '25-34': 32, '35-49': 15, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 58 },
        { country: 'Canada', percentage: 11 }
      ],
      authenticity_score: 98
    },
    topics: ['entertainment', 'lifestyle', 'pets'],
    primary_topic: 'entertainment',
    hashtags: ['comedy', 'vlog', 'pets'],
    brand_mentions: [],
    has_sponsored_posts: false,
    sponsored_post_count: 0,
    post_frequency: 1,
    has_email: false,
    accepts_messages: false,
    is_vetted: false,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  // ADDITIONAL DIVERSE INFLUENCERS (16-40)
  {
    id: '16',
    name: 'Marques Brownlee',
    username: 'mkbhd',
    display_name: 'MKBHD',
    bio: 'Tech Reviews, Unboxings & Studio Tours',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marques',
    platforms: ['youtube', 'twitter', 'instagram'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@mkbhd',
      twitter: 'https://twitter.com/mkbhd',
      instagram: 'https://instagram.com/mkbhd',
      tiktok: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 19200000,
    engagement_rate: 6.8,
    influence_score: 96,
    avg_likes: 485000,
    avg_comments: 18500,
    avg_shares: 9200,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'New Jersey',
      city: 'Kearny'
    },
    gender: 'male',
    age: 30,
    languages: ['en'],
    audience: {
      total_followers: 19200000,
      gender_split: { male: 78, female: 22, other: 0 },
      age_split: { '12-17': 15, '18-24': 38, '25-34': 32, '35-49': 13, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 42 },
        { country: 'India', percentage: 16 }
      ],
      authenticity_score: 97
    },
    topics: ['technology', 'geek', 'business'],
    primary_topic: 'technology',
    hashtags: ['tech', 'smartphones', 'reviews'],
    brand_mentions: [
      { brand_name: 'Apple', brand_handle: '@apple', brand_logo_url: '', mention_count: 45, last_mention_date: '2024-01-26' },
      { brand_name: 'Tesla', brand_handle: '@tesla', brand_logo_url: '', mention_count: 32, last_mention_date: '2024-01-24' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 28,
    post_frequency: 2,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'twitter', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '17',
    name: 'Addison Rae',
    username: 'addisonraee',
    display_name: 'Addison Rae',
    bio: 'AR ♡ @itembeauty founder',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Addison',
    platforms: ['tiktok', 'instagram', 'youtube'],
    primary_platform: 'tiktok',
    profile_urls: {
      tiktok: 'https://tiktok.com/@addisonre',
      instagram: 'https://instagram.com/addisonraee',
      youtube: 'https://youtube.com/@addisonrae',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 88500000,
    engagement_rate: 9.4,
    influence_score: 98,
    avg_likes: 3150000,
    avg_comments: 58000,
    avg_shares: 145000,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'Louisiana',
      city: 'Lafayette'
    },
    gender: 'female',
    age: 23,
    languages: ['en'],
    audience: {
      total_followers: 88500000,
      gender_split: { male: 32, female: 68, other: 0 },
      age_split: { '12-17': 42, '18-24': 38, '25-34': 15, '35-49': 4, '50+': 1 },
      top_locations: [
        { country: 'United States', percentage: 48 },
        { country: 'Brazil', percentage: 9 }
      ],
      authenticity_score: 86
    },
    topics: ['fashion', 'beauty', 'lifestyle'],
    primary_topic: 'fashion',
    hashtags: ['fashion', 'beauty', 'dance'],
    brand_mentions: [
      { brand_name: 'American Eagle', brand_handle: '@americaneagle', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-25' },
      { brand_name: 'Item Beauty', brand_handle: '@itembeauty', brand_logo_url: '', mention_count: 68, last_mention_date: '2024-01-26' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 52,
    post_frequency: 8,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'tiktok', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '18',
    name: 'Lewis Hamilton',
    username: 'lewishamilton',
    display_name: 'Lewis Hamilton',
    bio: '7x F1 World Champion 🏆 @missionfortyour @tommyhilfiger',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lewis',
    platforms: ['instagram', 'twitter', 'facebook'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/lewishamilton',
      twitter: 'https://twitter.com/lewishamilton',
      facebook: 'https://facebook.com/lewishamilton',
      tiktok: '',
      youtube: '',
      snapchat: ''
    },
    follower_count: 36800000,
    engagement_rate: 4.5,
    influence_score: 94,
    avg_likes: 985000,
    avg_comments: 28500,
    avg_shares: 12000,
    location: {
      country: 'United Kingdom',
      country_code: 'GB',
      city: 'London'
    },
    gender: 'male',
    age: 39,
    languages: ['en'],
    audience: {
      total_followers: 36800000,
      gender_split: { male: 72, female: 28, other: 0 },
      age_split: { '12-17': 12, '18-24': 28, '25-34': 35, '35-49': 20, '50+': 5 },
      top_locations: [
        { country: 'United Kingdom', percentage: 22 },
        { country: 'United States', percentage: 18 }
      ],
      authenticity_score: 93
    },
    topics: ['sports', 'racing', 'activist'],
    primary_topic: 'sports',
    hashtags: ['f1', 'racing', 'sports'],
    brand_mentions: [
      { brand_name: 'Mercedes', brand_handle: '@mercedesamgf1', brand_logo_url: '', mention_count: 125, last_mention_date: '2024-01-26' },
      { brand_name: 'Tommy Hilfiger', brand_handle: '@tommyhilfiger', brand_logo_url: '', mention_count: 42, last_mention_date: '2024-01-23' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 38,
    post_frequency: 4,
    has_email: true,
    accepts_messages: false,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true },
      { platform: 'twitter', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '19',
    name: 'Emma Watson',
    username: 'emmawatson',
    display_name: 'Emma Watson',
    bio: 'Actress | Activist | UN Women Goodwill Ambassador',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaW',
    platforms: ['instagram', 'twitter'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/emmawatson',
      twitter: 'https://twitter.com/emmawatson',
      tiktok: '',
      youtube: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 74200000,
    engagement_rate: 8.2,
    influence_score: 96,
    avg_likes: 2850000,
    avg_comments: 52000,
    avg_shares: 18000,
    location: {
      country: 'United Kingdom',
      country_code: 'GB',
      city: 'London'
    },
    gender: 'female',
    age: 33,
    languages: ['en', 'fr'],
    audience: {
      total_followers: 74200000,
      gender_split: { male: 38, female: 62, other: 0 },
      age_split: { '12-17': 18, '18-24': 32, '25-34': 28, '35-49': 18, '50+': 4 },
      top_locations: [
        { country: 'United States', percentage: 32 },
        { country: 'United Kingdom', percentage: 15 }
      ],
      authenticity_score: 96
    },
    topics: ['activist', 'fashion', 'entertainment'],
    primary_topic: 'activist',
    hashtags: ['heforshe', 'feminism', 'sustainability'],
    brand_mentions: [
      { brand_name: 'Dior', brand_handle: '@dior', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-22' },
      { brand_name: 'UN Women', brand_handle: '@unwomen', brand_logo_url: '', mention_count: 45, last_mention_date: '2024-01-25' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 18,
    post_frequency: 2,
    has_email: true,
    accepts_messages: false,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true },
      { platform: 'twitter', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '20',
    name: 'Alex Costa',
    username: 'alexcosta',
    display_name: 'Alex Costa',
    bio: 'Mens Fashion & Grooming 💈 @alexcostagrooming',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    platforms: ['youtube', 'instagram', 'tiktok'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@alexcosta',
      instagram: 'https://instagram.com/alexcosta',
      tiktok: 'https://tiktok.com/@alexcosta',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 3850000,
    engagement_rate: 7.2,
    influence_score: 82,
    avg_likes: 125000,
    avg_comments: 6800,
    avg_shares: 2400,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'male',
    age: 29,
    languages: ['en', 'pt'],
    audience: {
      total_followers: 3850000,
      gender_split: { male: 68, female: 32, other: 0 },
      age_split: { '12-17': 8, '18-24': 42, '25-34': 35, '35-49': 13, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 38 },
        { country: 'Brazil', percentage: 12 }
      ],
      authenticity_score: 94
    },
    topics: ['fashion', 'lifestyle', 'beauty'],
    primary_topic: 'fashion',
    hashtags: ['mensfashion', 'grooming', 'style'],
    brand_mentions: [
      { brand_name: 'Hugo Boss', brand_handle: '@hugoboss', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-24' },
      { brand_name: 'Gillette', brand_handle: '@gillette', brand_logo_url: '', mention_count: 22, last_mention_date: '2024-01-26' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 32,
    post_frequency: 5,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  }
,
  {
    id: '21',
    name: 'Chiara Ferragni',
    username: 'chiaraferragni',
    display_name: 'Chiara Ferragni',
    bio: 'Fashion Entrepreneur | @chiaraferragnicollection @theblondesalad',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chiara',
    platforms: ['instagram', 'tiktok'],
    primary_platform: 'instagram',
    profile_urls: {
      instagram: 'https://instagram.com/chiaraferragni',
      tiktok: 'https://tiktok.com/@chiaraferragni',
      twitter: '',
      youtube: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 29400000,
    engagement_rate: 3.2,
    influence_score: 93,
    avg_likes: 625000,
    avg_comments: 18500,
    avg_shares: 5200,
    location: {
      country: 'Italy',
      country_code: 'IT',
      city: 'Milan'
    },
    gender: 'female',
    age: 36,
    languages: ['it', 'en'],
    audience: {
      total_followers: 29400000,
      gender_split: { male: 18, female: 82, other: 0 },
      age_split: { '12-17': 12, '18-24': 35, '25-34': 32, '35-49': 18, '50+': 3 },
      top_locations: [
        { country: 'Italy', percentage: 28 },
        { country: 'United States', percentage: 22 }
      ],
      authenticity_score: 88
    },
    topics: ['fashion', 'lifestyle', 'business'],
    primary_topic: 'fashion',
    hashtags: ['fashion', 'luxury', 'milano'],
    brand_mentions: [
      { brand_name: 'Dior', brand_handle: '@dior', brand_logo_url: '', mention_count: 42, last_mention_date: '2024-01-26' },
      { brand_name: 'Prada', brand_handle: '@prada', brand_logo_url: '', mention_count: 38, last_mention_date: '2024-01-24' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 58,
    post_frequency: 6,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '22',
    name: 'Yoga With Adriene',
    username: 'adrienelouise',
    display_name: 'Adriene Mishler',
    bio: 'Yoga Teacher | Find What Feels Good 🙏',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adriene',
    platforms: ['youtube', 'instagram'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@yogawithadriene',
      instagram: 'https://instagram.com/adrienelouise',
      tiktok: '',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 12500000,
    engagement_rate: 5.8,
    influence_score: 89,
    avg_likes: 285000,
    avg_comments: 12500,
    avg_shares: 4800,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'Texas',
      city: 'Austin'
    },
    gender: 'female',
    age: 39,
    languages: ['en'],
    audience: {
      total_followers: 12500000,
      gender_split: { male: 22, female: 78, other: 0 },
      age_split: { '12-17': 8, '18-24': 22, '25-34': 35, '35-49': 28, '50+': 7 },
      top_locations: [
        { country: 'United States', percentage: 45 },
        { country: 'United Kingdom', percentage: 12 }
      ],
      authenticity_score: 98
    },
    topics: ['fitness', 'health', 'lifestyle'],
    primary_topic: 'fitness',
    hashtags: ['yoga', 'wellness', 'mindfulness'],
    brand_mentions: [
      { brand_name: 'Manduka', brand_handle: '@mandukayoga', brand_logo_url: '', mention_count: 32, last_mention_date: '2024-01-25' },
      { brand_name: 'Adidas', brand_handle: '@adidas', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-22' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 22,
    post_frequency: 4,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '23',
    name: 'Nas Daily',
    username: 'nasdaily',
    display_name: 'Nas Daily',
    bio: 'I make 1 minute videos about the world 🌍',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nas',
    platforms: ['facebook', 'instagram', 'tiktok', 'youtube'],
    primary_platform: 'facebook',
    profile_urls: {
      facebook: 'https://facebook.com/nasdaily',
      instagram: 'https://instagram.com/nasdaily',
      tiktok: 'https://tiktok.com/@nasdaily',
      youtube: 'https://youtube.com/@nasdaily',
      twitter: '',
      snapchat: ''
    },
    follower_count: 42600000,
    engagement_rate: 6.5,
    influence_score: 91,
    avg_likes: 1250000,
    avg_comments: 35000,
    avg_shares: 85000,
    location: {
      country: 'Singapore',
      country_code: 'SG',
      city: 'Singapore'
    },
    gender: 'male',
    age: 32,
    languages: ['en', 'ar'],
    audience: {
      total_followers: 42600000,
      gender_split: { male: 58, female: 42, other: 0 },
      age_split: { '12-17': 22, '18-24': 35, '25-34': 28, '35-49': 12, '50+': 3 },
      top_locations: [
        { country: 'India', percentage: 18 },
        { country: 'United States', percentage: 15 }
      ],
      authenticity_score: 92
    },
    topics: ['travel', 'education', 'culture'],
    primary_topic: 'travel',
    hashtags: ['travel', 'documentary', 'culture'],
    brand_mentions: [
      { brand_name: 'Google', brand_handle: '@google', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-24' },
      { brand_name: 'Airbnb', brand_handle: '@airbnb', brand_logo_url: '', mention_count: 35, last_mention_date: '2024-01-26' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 42,
    post_frequency: 7,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'facebook', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '24',
    name: 'Binging with Babish',
    username: 'bingingwithbabish',
    display_name: 'Andrew Rea',
    bio: 'Recreating your favorite foods from TV & Film',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Babish',
    platforms: ['youtube', 'instagram'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@babishculinaryuniverse',
      instagram: 'https://instagram.com/bingingwithbabish',
      tiktok: '',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 10800000,
    engagement_rate: 8.5,
    influence_score: 88,
    avg_likes: 425000,
    avg_comments: 18500,
    avg_shares: 9200,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'New York',
      city: 'New York'
    },
    gender: 'male',
    age: 37,
    languages: ['en'],
    audience: {
      total_followers: 10800000,
      gender_split: { male: 65, female: 35, other: 0 },
      age_split: { '12-17': 12, '18-24': 32, '25-34': 35, '35-49': 18, '50+': 3 },
      top_locations: [
        { country: 'United States', percentage: 52 },
        { country: 'United Kingdom', percentage: 14 }
      ],
      authenticity_score: 96
    },
    topics: ['food', 'entertainment', 'lifestyle'],
    primary_topic: 'food',
    hashtags: ['cooking', 'food', 'recipes'],
    brand_mentions: [
      { brand_name: 'Lodge', brand_handle: '@lodgecastiron', brand_logo_url: '', mention_count: 28, last_mention_date: '2024-01-25' },
      { brand_name: 'Made In', brand_handle: '@madeincookware', brand_logo_url: '', mention_count: 35, last_mention_date: '2024-01-26' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 18,
    post_frequency: 3,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  },
  {
    id: '25',
    name: 'Liza Koshy',
    username: 'lizzza',
    display_name: 'Liza Koshy',
    bio: 'Actress | Comedian | Host',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza',
    platforms: ['youtube', 'instagram', 'tiktok'],
    primary_platform: 'youtube',
    profile_urls: {
      youtube: 'https://youtube.com/@liza',
      instagram: 'https://instagram.com/lizzza',
      tiktok: 'https://tiktok.com/@lizzza',
      twitter: '',
      snapchat: '',
      facebook: ''
    },
    follower_count: 18200000,
    engagement_rate: 7.8,
    influence_score: 90,
    avg_likes: 685000,
    avg_comments: 22500,
    avg_shares: 8500,
    location: {
      country: 'United States',
      country_code: 'US',
      state: 'California',
      city: 'Los Angeles'
    },
    gender: 'female',
    age: 27,
    languages: ['en'],
    audience: {
      total_followers: 18200000,
      gender_split: { male: 35, female: 65, other: 0 },
      age_split: { '12-17': 28, '18-24': 42, '25-34': 20, '35-49': 8, '50+': 2 },
      top_locations: [
        { country: 'United States', percentage: 58 },
        { country: 'Philippines', percentage: 8 }
      ],
      authenticity_score: 94
    },
    topics: ['entertainment', 'lifestyle', 'beauty'],
    primary_topic: 'entertainment',
    hashtags: ['comedy', 'entertainment', 'actress'],
    brand_mentions: [
      { brand_name: 'YouTube', brand_handle: '@youtube', brand_logo_url: '', mention_count: 45, last_mention_date: '2024-01-26' },
      { brand_name: 'Beats', brand_handle: '@beatsbydre', brand_logo_url: '', mention_count: 18, last_mention_date: '2024-01-23' }
    ],
    has_sponsored_posts: true,
    sponsored_post_count: 32,
    post_frequency: 4,
    has_email: true,
    accepts_messages: true,
    is_vetted: true,
    verification_badges: [
      { platform: 'youtube', verified: true },
      { platform: 'instagram', verified: true }
    ],
    created_at: '2023-01-01',
    updated_at: '2024-01-26',
    last_scraped_at: '2024-01-26'
  }
];

// Helper function to get influence level
export function getInfluenceLevel(followerCount: number): string {
  if (followerCount >= 1000000) return 'mega';
  if (followerCount >= 100000) return 'macro';
  if (followerCount >= 10000) return 'micro';
  return 'nano';
}

// Helper function to search and filter influencers
export function searchInfluencers(params: {
  query?: string;
  platforms?: string[];
  location?: string;
  vetted?: boolean;
  filters?: {
    influence_level?: string;
    min_followers?: number;
    max_followers?: number;
    min_engagement_rate?: number;
    vetted_only?: boolean;
    topics?: string[];
    gender?: string;
    audience_gender?: string;
  };
}): InfluencerProfile[] {
  let results = [...mockDiscoveryInfluencers];

  // Filter by query (searches in name, username, bio, topics)
  if (params.query) {
    const query = params.query.toLowerCase();
    results = results.filter(inf =>
      inf.name.toLowerCase().includes(query) ||
      inf.username.toLowerCase().includes(query) ||
      inf.bio.toLowerCase().includes(query) ||
      inf.topics.some(t => t.toLowerCase().includes(query)) ||
      inf.hashtags.some(h => h.toLowerCase().includes(query))
    );
  }

  // Filter by platforms
  if (params.platforms && params.platforms.length > 0) {
    results = results.filter(inf =>
      params.platforms!.some(p => inf.platforms.includes(p as any))
    );
  }

  // Filter by location
  if (params.location) {
    const location = params.location.toLowerCase();
    results = results.filter(inf =>
      inf.location.country.toLowerCase().includes(location) ||
      inf.location.state?.toLowerCase().includes(location) ||
      inf.location.city?.toLowerCase().includes(location)
    );
  }

  // Filter by vetted status
  if (params.vetted || params.filters?.vetted_only) {
    results = results.filter(inf => inf.is_vetted);
  }

  // Apply advanced filters
  if (params.filters) {
    const { influence_level, min_followers, max_followers, min_engagement_rate, topics, gender, audience_gender } = params.filters;

    // Influence level
    if (influence_level && influence_level !== 'all') {
      results = results.filter(inf => getInfluenceLevel(inf.follower_count) === influence_level);
    }

    // Follower range
    if (min_followers !== undefined) {
      results = results.filter(inf => inf.follower_count >= min_followers);
    }
    if (max_followers !== undefined) {
      results = results.filter(inf => inf.follower_count <= max_followers);
    }

    // Engagement rate
    if (min_engagement_rate !== undefined) {
      results = results.filter(inf => inf.engagement_rate >= min_engagement_rate);
    }

    // Topics
    if (topics && topics.length > 0) {
      results = results.filter(inf =>
        topics.some(t => inf.topics.includes(t))
      );
    }

    // Gender
    if (gender && gender !== 'all') {
      results = results.filter(inf => inf.gender === gender);
    }

    // Audience Gender
    if (audience_gender && audience_gender !== 'all') {
      results = results.filter(inf => {
        const split = inf.audience.gender_split;
        if (audience_gender === 'female') return split.female > split.male;
        if (audience_gender === 'male') return split.male > split.female;
        return true;
      });
    }
  }

  return results;
}
