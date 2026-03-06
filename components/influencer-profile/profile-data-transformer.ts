/**
 * Profile Data Transformer
 * Maps enrichment API response shape to the prop types expected by profile components
 */

import {
  ProfileHeader,
  ProfileSnapshot,
  ProfileInsights,
  PlatformMetric,
  ContentPost,
  Demographics,
  SimilarCreator,
  TransformedProfile,
  PlatformInfo,
} from '@/types/profile';
import { Platform } from '@/types/apify';

/**
 * Transform the enrichment API response into the TransformedProfile shape
 * consumed by ProfileHeader, ProfileSnapshot, InsightsCard, MetricsTable,
 * ContentGrid, DemographicsSection, and SimilarCreators components.
 */
export function transformEnrichmentToProfile(data: any): TransformedProfile {
  return {
    header: transformHeader(data),
    snapshot: transformSnapshot(data),
    insights: transformInsights(data),
    metrics: transformMetrics(data),
    content: transformContent(data),
    demographics: transformDemographics(data),
    similar: transformSimilarCreators(data),
  };
}

function transformHeader(data: any): ProfileHeader {
  const locationStr =
    typeof data.location === 'string'
      ? data.location
      : [data.location?.city, data.location?.country].filter(Boolean).join(', ');

  return {
    avatar: data.avatarUrl || '',
    avatarHD: data.avatarUrl || '',
    fullName: data.displayName || data.primaryUsername || '',
    username: data.primaryUsername || '',
    verified: data.verified ?? false,
    bio: data.bio || '',
    location: locationStr || '',
    externalLinks:
      data.linkedPlatforms?.map((p: any) => ({
        title: capitalize(p.platform),
        url: p.profileUrl || '',
        platform: p.platform as Platform,
      })) || [],
    category:
      data.categories?.[0] ||
      data.tier?.displayName ||
      undefined,
  };
}

function transformSnapshot(data: any): ProfileSnapshot {
  const engagementRate =
    data.engagement?.rate ??
    (data.engagement?.formatted?.rate
      ? parseFloat(data.engagement.formatted.rate)
      : 0);

  const avgEngagement =
    (data.engagement?.averageLikes || 0) +
    (data.engagement?.averageComments || 0) +
    (data.engagement?.averageShares || 0);

  return {
    followersCount: data.totalFollowers || 0,
    followersGrowth: data.growth?.followersLast7Days ?? 0,
    avgEngagement: avgEngagement || 0,
    engagementRate: engagementRate || 0,
    totalFollowing: data.totalFollowing || 0,
    postsCount: data.content?.totalPosts || 0,
  };
}

function transformInsights(data: any): ProfileInsights {
  const locations: string[] = [];
  if (typeof data.location === 'string' && data.location) {
    locations.push(data.location);
  } else if (data.location) {
    const loc = [data.location.city, data.location.country].filter(Boolean).join(', ');
    if (loc) locations.push(loc);
  }
  if (data.demographics?.topCountries) {
    data.demographics.topCountries.forEach((c: any) => {
      if (c.country && !locations.includes(c.country)) {
        locations.push(c.country);
      }
    });
  }

  const languages: string[] = data.demographics?.languages || ['English'];

  const topics: string[] = data.categories || [];

  const socialPlatforms: PlatformInfo[] =
    data.linkedPlatforms?.map((p: any) => ({
      platform: p.platform as Platform,
      url: p.profileUrl || '',
    })) || [];

  return { locations, languages, topics, socialPlatforms };
}

function transformMetrics(data: any): PlatformMetric[] {
  if (!data.linkedPlatforms || data.linkedPlatforms.length === 0) {
    return [];
  }

  return data.linkedPlatforms.map((p: any) => {
    const followers = p.followerCount || 0;
    const engRate =
      data.engagement?.rate ??
      (data.engagement?.formatted?.rate
        ? parseFloat(data.engagement.formatted.rate)
        : 0);
    const engagements =
      (data.engagement?.averageLikes || 0) +
      (data.engagement?.averageComments || 0);
    const emv = followers * (engRate / 100) * 2.5;
    const brand = emv * 0.4;

    return {
      network: capitalize(p.platform),
      platform: p.platform as Platform,
      followers,
      engagements,
      engagementRate: engRate,
      emv,
      brand,
    };
  });
}

function transformContent(data: any): ContentPost[] {
  const posts = data.content?.topPerformingPosts;
  if (!posts || posts.length === 0) return [];

  return posts.slice(0, 12).map((post: any, index: number) => ({
    id: post.id || `post-${index}`,
    platform: (post.platform || data.primaryPlatform || 'instagram') as Platform,
    thumbnail: post.thumbnail || post.displayUrl || '',
    type: post.type === 'Video' || post.type === 'video' ? 'video' : 'image',
    likesCount: post.likes || post.likesCount || 0,
    commentsCount: post.comments || post.commentsCount || 0,
    viewsCount: post.views || post.videoViewCount || post.videoPlayCount,
    url: post.url || '#',
    timestamp: post.timestamp || post.postedAt || '',
    caption: post.caption,
    hashtags: post.hashtags,
  }));
}

function transformDemographics(data: any): Demographics {
  const d = data.demographics;
  if (!d) {
    return {
      averageAge: 0,
      ageRanges: [],
      genderSplit: { female: 0, male: 0, other: 0 },
      topCountries: [],
      interests: data.categories || [],
      brandAffinity: [],
    };
  }

  // Convert 2-letter ISO country code to flag emoji via Unicode regional indicators
  const isoCodeToFlag = (code: string): string | null => {
    if (!code || code.length !== 2) return null;
    const upper = code.toUpperCase();
    const offset = 0x1F1E6 - 'A'.charCodeAt(0);
    return String.fromCodePoint(upper.charCodeAt(0) + offset, upper.charCodeAt(1) + offset);
  };

  const COUNTRY_FLAGS: Record<string, string> = {
    // Americas
    'United States': '\u{1F1FA}\u{1F1F8}', 'USA': '\u{1F1FA}\u{1F1F8}',
    'Canada': '\u{1F1E8}\u{1F1E6}', 'Mexico': '\u{1F1F2}\u{1F1FD}',
    'Brazil': '\u{1F1E7}\u{1F1F7}', 'Argentina': '\u{1F1E6}\u{1F1F7}',
    'Colombia': '\u{1F1E8}\u{1F1F4}', 'Chile': '\u{1F1E8}\u{1F1F1}',
    'Peru': '\u{1F1F5}\u{1F1EA}', 'Jamaica': '\u{1F1EF}\u{1F1F2}',
    // Europe
    'United Kingdom': '\u{1F1EC}\u{1F1E7}', 'UK': '\u{1F1EC}\u{1F1E7}',
    'Germany': '\u{1F1E9}\u{1F1EA}', 'France': '\u{1F1EB}\u{1F1F7}',
    'Spain': '\u{1F1EA}\u{1F1F8}', 'Italy': '\u{1F1EE}\u{1F1F9}',
    'Netherlands': '\u{1F1F3}\u{1F1F1}', 'Portugal': '\u{1F1F5}\u{1F1F9}',
    'Sweden': '\u{1F1F8}\u{1F1EA}', 'Switzerland': '\u{1F1E8}\u{1F1ED}',
    'Poland': '\u{1F1F5}\u{1F1F1}', 'Turkey': '\u{1F1F9}\u{1F1F7}',
    'Russia': '\u{1F1F7}\u{1F1FA}', 'Ukraine': '\u{1F1FA}\u{1F1E6}',
    // Africa
    'Zimbabwe': '\u{1F1FF}\u{1F1FC}', 'South Africa': '\u{1F1FF}\u{1F1E6}',
    'Nigeria': '\u{1F1F3}\u{1F1EC}', 'Kenya': '\u{1F1F0}\u{1F1EA}',
    'Ghana': '\u{1F1EC}\u{1F1ED}', 'Ethiopia': '\u{1F1EA}\u{1F1F9}',
    'Tanzania': '\u{1F1F9}\u{1F1FF}', 'Uganda': '\u{1F1FA}\u{1F1EC}',
    'Zambia': '\u{1F1FF}\u{1F1F2}', 'Mozambique': '\u{1F1F2}\u{1F1FF}',
    'Botswana': '\u{1F1E7}\u{1F1FC}', 'Namibia': '\u{1F1F3}\u{1F1E6}',
    'Rwanda': '\u{1F1F7}\u{1F1FC}', 'Cameroon': '\u{1F1E8}\u{1F1F2}',
    'Senegal': '\u{1F1F8}\u{1F1F3}', 'Morocco': '\u{1F1F2}\u{1F1E6}',
    'Egypt': '\u{1F1EA}\u{1F1EC}', 'DR Congo': '\u{1F1E8}\u{1F1E9}',
    'Angola': '\u{1F1E6}\u{1F1F4}', 'Malawi': '\u{1F1F2}\u{1F1FC}',
    // Asia & Middle East
    'India': '\u{1F1EE}\u{1F1F3}', 'Japan': '\u{1F1EF}\u{1F1F5}',
    'China': '\u{1F1E8}\u{1F1F3}', 'South Korea': '\u{1F1F0}\u{1F1F7}',
    'Indonesia': '\u{1F1EE}\u{1F1E9}', 'Thailand': '\u{1F1F9}\u{1F1ED}',
    'Philippines': '\u{1F1F5}\u{1F1ED}', 'Malaysia': '\u{1F1F2}\u{1F1FE}',
    'Vietnam': '\u{1F1FB}\u{1F1F3}', 'Singapore': '\u{1F1F8}\u{1F1EC}',
    'Pakistan': '\u{1F1F5}\u{1F1F0}', 'Bangladesh': '\u{1F1E7}\u{1F1E9}',
    'United Arab Emirates': '\u{1F1E6}\u{1F1EA}', 'Saudi Arabia': '\u{1F1F8}\u{1F1E6}',
    'Israel': '\u{1F1EE}\u{1F1F1}', 'Qatar': '\u{1F1F6}\u{1F1E6}',
    // Oceania
    'Australia': '\u{1F1E6}\u{1F1FA}', 'New Zealand': '\u{1F1F3}\u{1F1FF}',
  };

  const topCountries =
    d.topCountries?.map((c: any) => ({
      country: c.country,
      flag: c.flag || COUNTRY_FLAGS[c.country] || isoCodeToFlag(c.countryCode) || '\u{1F30D}',
      percentage: c.percentage,
    })) || [];

  const genderSplit = d.genderSplit || {};
  const female = genderSplit.female ?? genderSplit.women ?? 65;
  const male = genderSplit.male ?? genderSplit.men ?? 33;
  const other = genderSplit.other ?? Math.max(0, 100 - female - male);

  const ageRanges = d.ageRanges || [
    { range: '13-17', percentage: 8 },
    { range: '18-24', percentage: 32 },
    { range: '25-34', percentage: 38 },
    { range: '35-44', percentage: 15 },
    { range: '45+', percentage: 7 },
  ];

  return {
    averageAge: d.averageAge || 28,
    ageRanges,
    genderSplit: { female, male, other },
    topCountries,
    interests: d.interests || data.categories || ['Lifestyle'],
    brandAffinity:
      data.brandAffinity?.map((b: any) => ({
        brand: b.brand,
        percentage: b.percentage,
      })) ||
      d.brandAffinity?.map((b: any) => ({
        brand: b.brand,
        percentage: b.percentage,
      })) ||
      [],
  };
}

function transformSimilarCreators(data: any): SimilarCreator[] {
  // Prefer enriched similar creators (Method 9) — have real follower counts & engagement
  const enriched: any[] = data.enrichedSimilarCreators || [];
  const lightweight: any[] = data.similarCreators || [];

  if (enriched.length === 0 && lightweight.length === 0) return [];

  // Build enriched lookup by username
  const enrichedMap = new Map<string, any>();
  for (const e of enriched) {
    if (e.username) enrichedMap.set(e.username.toLowerCase(), e);
  }

  // Use lightweight list as the base, merge enriched data where available
  const source = lightweight.length > 0 ? lightweight : enriched;

  return source.slice(0, 6).map((c: any) => {
    const username = (c.username || '').toLowerCase();
    const e = enrichedMap.get(username);

    return {
      id: c.id || c.username || '',
      fullName: e?.fullName || c.name || c.fullName || c.displayName || c.full_name || '',
      username: c.username || '',
      avatar: e?.avatar || c.avatar || c.avatarUrl || c.profile_pic_url || '',
      verified: e?.verified ?? c.verified ?? c.is_verified ?? false,
      influenceScore: c.influenceScore || 4.0,
      categories: c.categories || [],
      followers: e?.followers ?? c.followers ?? c.followerCount ?? undefined,
      engagement: e?.engagement ?? c.engagement ?? c.engagementRate ?? undefined,
      campaigns: c.campaigns ?? 0,
      platforms: e?.platforms || c.platforms || [data.primaryPlatform || 'instagram'],
    };
  });
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Check if the profile data has sufficient enrichment
 * (i.e., more than just basic profile info)
 */
export function isProfileEnriched(data: any): boolean {
  if (!data) return false;
  if (data.metadata?.dataQuality === 'minimal') return false;
  if (data.metadata?.source === 'basic') return false;
  // Has at least engagement or content data
  return !!(data.engagement || data.content?.topPerformingPosts?.length);
}
