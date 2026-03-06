/**
 * Campaign Recommendation Scoring Service
 *
 * Computes a relevanceScore (0-100) for each campaign relative to an influencer's profile.
 * Six weighted factors: category (30), platform (25), qualification (20),
 * location (10), engagement (10), urgency (5).
 */

export interface InfluencerMatchData {
  categories: string[];
  platforms: string[];           // lowercase: 'instagram', 'tiktok', etc.
  location: string;              // e.g. 'Cape Town, South Africa'
  totalFollowers: number;
  averageEngagementRate: number;
  qualifies: boolean;            // pre-computed by checkQualification()
}

export interface CampaignMatchData {
  categories: string[];
  platforms: string[];           // from deliverables
  targetLocation: string;
  minFollowers: number;
  minEngagements: number;        // engagement rate requirement
  applicationDeadline: string | null;
  qualifies: boolean;
}

/**
 * Build match data from an influencer's global_influencers + influencer_profiles docs.
 * Tolerates null/missing data gracefully.
 */
export function buildInfluencerMatchData(
  globalProfile: Record<string, any> | null,
  influencerProfile: Record<string, any> | null
): InfluencerMatchData {
  const gp = globalProfile || {};
  const ip = influencerProfile || {};

  // Merge categories from both sources
  const categories: string[] = [
    ...(gp.categories || []),
    ...(ip.categories || []),
    ...(ip.niches || []),
  ].map((c: string) => c.toLowerCase());

  // Extract linked platforms
  const platforms: string[] = [];
  const linkedAccounts = gp.linkedAccounts || gp.socialAccounts || {};
  if (typeof linkedAccounts === 'object') {
    for (const [platform, data] of Object.entries(linkedAccounts)) {
      if (data && typeof data === 'object' && (data as any).username) {
        platforms.push(platform.toLowerCase());
      }
    }
  }
  // Also check influencer_profiles for platform data
  if (ip.platforms && Array.isArray(ip.platforms)) {
    for (const p of ip.platforms) {
      const name = (typeof p === 'string' ? p : p?.platform || '').toLowerCase();
      if (name && !platforms.includes(name)) platforms.push(name);
    }
  }

  const metrics = gp.metrics || {};
  const location = gp.location || ip.location || ip.city || '';

  return {
    categories: [...new Set(categories)],
    platforms: [...new Set(platforms)],
    location: typeof location === 'string' ? location.toLowerCase() : '',
    totalFollowers: metrics.totalFollowers || 0,
    averageEngagementRate: metrics.averageEngagementRate || 0,
    qualifies: false, // will be set per-campaign
  };
}

// ── Scoring Factors ──

/** Category overlap: 30 points */
function scoreCategory(influencer: InfluencerMatchData, campaign: CampaignMatchData): number {
  if (influencer.categories.length === 0 || campaign.categories.length === 0) return 0.3;
  const campaignCats = campaign.categories.map(c => c.toLowerCase());
  const matches = influencer.categories.filter(c => campaignCats.includes(c)).length;
  if (matches === 0) return 0.1;
  return Math.min(1, matches / Math.min(campaignCats.length, 3));
}

/** Platform match: 25 points */
function scorePlatform(influencer: InfluencerMatchData, campaign: CampaignMatchData): number {
  if (influencer.platforms.length === 0 || campaign.platforms.length === 0) return 0.3;
  const campaignPlats = campaign.platforms.map(p => p.toLowerCase());
  const matches = influencer.platforms.filter(p => campaignPlats.includes(p)).length;
  if (matches === 0) return 0.05;
  return matches / campaignPlats.length;
}

/** Qualification: 20 points — binary qualify + partial credit */
function scoreQualification(influencer: InfluencerMatchData, campaign: CampaignMatchData): number {
  if (campaign.qualifies) return 1;

  // Partial credit: how close is the influencer to meeting requirements?
  let partial = 0.2; // base for not qualifying
  if (campaign.minFollowers > 0 && influencer.totalFollowers > 0) {
    const ratio = influencer.totalFollowers / campaign.minFollowers;
    partial = Math.max(partial, Math.min(0.8, ratio));
  }
  if (campaign.minEngagements > 0 && influencer.averageEngagementRate > 0) {
    const ratio = influencer.averageEngagementRate / campaign.minEngagements;
    partial = Math.max(partial, Math.min(0.8, ratio));
  }
  return partial;
}

/** Location match: 10 points */
function scoreLocation(influencer: InfluencerMatchData, campaign: CampaignMatchData): number {
  if (!influencer.location || !campaign.targetLocation) return 0.3;
  const infLoc = influencer.location.toLowerCase();
  const campLoc = campaign.targetLocation.toLowerCase();

  // Exact or substring match
  if (infLoc.includes(campLoc) || campLoc.includes(infLoc)) return 1;

  // Word overlap (e.g. 'South Africa' matches 'Cape Town, South Africa')
  const campWords = campLoc.split(/[\s,]+/).filter(w => w.length > 2);
  const infWords = infLoc.split(/[\s,]+/).filter(w => w.length > 2);
  const overlap = campWords.filter(w => infWords.includes(w)).length;
  if (overlap > 0) return Math.min(1, 0.5 + (overlap / campWords.length) * 0.5);

  return 0.1;
}

/** Engagement fit: 10 points */
function scoreEngagement(influencer: InfluencerMatchData, campaign: CampaignMatchData): number {
  if (influencer.averageEngagementRate <= 0) return 0.3;
  if (campaign.minEngagements <= 0) return 0.5;
  const ratio = influencer.averageEngagementRate / campaign.minEngagements;
  if (ratio >= 1) return 1;
  return Math.max(0.1, ratio);
}

/** Urgency bonus: 5 points — campaigns ending soon get a small boost */
function scoreUrgency(campaign: CampaignMatchData): number {
  if (!campaign.applicationDeadline) return 0.2;
  const deadline = new Date(campaign.applicationDeadline);
  if (isNaN(deadline.getTime())) return 0.2;
  const daysLeft = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysLeft <= 0) return 0;     // expired
  if (daysLeft <= 3) return 1;     // ending very soon
  if (daysLeft <= 7) return 0.7;
  if (daysLeft <= 14) return 0.4;
  return 0.2;
}

// ── Main Scoring Function ──

const WEIGHTS = {
  category: 30,
  platform: 25,
  qualification: 20,
  location: 10,
  engagement: 10,
  urgency: 5,
} as const;

/**
 * Compute a relevance score (0-100) for a campaign relative to an influencer.
 */
export function computeRelevanceScore(
  influencer: InfluencerMatchData,
  campaign: CampaignMatchData
): number {
  const scores = {
    category: scoreCategory(influencer, campaign),
    platform: scorePlatform(influencer, campaign),
    qualification: scoreQualification(influencer, campaign),
    location: scoreLocation(influencer, campaign),
    engagement: scoreEngagement(influencer, campaign),
    urgency: scoreUrgency(campaign),
  };

  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    total += scores[key as keyof typeof scores] * weight;
  }

  return Math.round(Math.max(0, Math.min(100, total)));
}
