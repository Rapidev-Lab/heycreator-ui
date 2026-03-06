'use client';

/**
 * Mock AI Suggestions Service
 *
 * Simulates AI-powered features with deterministic responses and delays.
 * In production, these would call real AI/ML endpoints.
 *
 * Used across all Phase 2 sprints:
 * - Sprint 1: Workspace name suggestions, industry detection
 * - Sprint 2: Plan recommendations, churn prediction
 * - Sprint 3: Role suggestions
 * - Sprint 4: Usage prediction, agency insights
 * - Sprint 5: Migration structure, onboarding personalization
 */

import { PlanTier } from '@/types/workspace';
import { IndustryType } from '@/types/firebase';
import { UsageRecord, UsageMetricType, UsagePrediction } from '@/types/usage';
import { AgencyWorkspaceSummary } from '@/types/agency';
import { MigrationSuggestion } from '@/types/migration';

// ===== HELPERS =====

/** Simulate AI processing delay (300-800ms) */
function aiDelay(minMs = 300, maxMs = 800): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// ===== SPRINT 1: WORKSPACE =====

export interface WorkspaceNameSuggestion {
  name: string;
  slug: string;
  reason: string;
}

/**
 * Generate workspace name suggestions from a company name.
 * AI Feature: Smart Workspace Name Suggestions
 */
export async function suggestWorkspaceNames(
  companyName: string
): Promise<WorkspaceNameSuggestion[]> {
  await aiDelay();

  if (!companyName.trim()) return [];

  const clean = companyName.trim();
  const words = clean.split(/\s+/);
  const first = words[0];
  const slugBase = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return [
    {
      name: `${clean} Hub`,
      slug: `${slugBase}-hub`,
      reason: 'Professional workspace for your team',
    },
    {
      name: `${clean} Creator Studio`,
      slug: `${slugBase}-creator-studio`,
      reason: 'Emphasizes creator collaboration',
    },
    {
      name: `${first} SA`,
      slug: `${first.toLowerCase()}-sa`,
      reason: 'Short and region-specific',
    },
    {
      name: `${clean} Marketing`,
      slug: `${slugBase}-marketing`,
      reason: 'Clear marketing focus',
    },
  ];
}

/**
 * Detect industry from a website URL.
 * AI Feature: Industry Auto-Detection
 */
export async function detectIndustry(
  websiteUrl: string
): Promise<{ industry: IndustryType; confidence: number } | null> {
  await aiDelay(500, 1200);

  if (!websiteUrl.trim()) return null;

  const url = websiteUrl.toLowerCase();

  const domainIndustryMap: Record<string, { industry: IndustryType; confidence: number }> = {
    'nike': { industry: 'Fashion', confidence: 0.95 },
    'adidas': { industry: 'Fashion', confidence: 0.95 },
    'zara': { industry: 'Fashion', confidence: 0.92 },
    'loreal': { industry: 'Beauty', confidence: 0.93 },
    'sephora': { industry: 'Beauty', confidence: 0.91 },
    'uber': { industry: 'Technology', confidence: 0.88 },
    'apple': { industry: 'Technology', confidence: 0.96 },
    'booking': { industry: 'Travel', confidence: 0.90 },
    'airbnb': { industry: 'Travel', confidence: 0.92 },
    'mcdonalds': { industry: 'Food & Beverage', confidence: 0.94 },
    'starbucks': { industry: 'Food & Beverage', confidence: 0.93 },
    'gym': { industry: 'Fitness', confidence: 0.85 },
    'fit': { industry: 'Fitness', confidence: 0.72 },
    'game': { industry: 'Gaming', confidence: 0.78 },
    'edu': { industry: 'Education', confidence: 0.80 },
    'shop': { industry: 'E-commerce', confidence: 0.75 },
    'store': { industry: 'E-commerce', confidence: 0.72 },
    'fashion': { industry: 'Fashion', confidence: 0.88 },
    'beauty': { industry: 'Beauty', confidence: 0.86 },
    'food': { industry: 'Food & Beverage', confidence: 0.84 },
    'tech': { industry: 'Technology', confidence: 0.82 },
    'travel': { industry: 'Travel', confidence: 0.82 },
    'bake': { industry: 'Food & Beverage', confidence: 0.80 },
    'restaurant': { industry: 'Food & Beverage', confidence: 0.90 },
  };

  for (const [keyword, result] of Object.entries(domainIndustryMap)) {
    if (url.includes(keyword)) {
      return result;
    }
  }

  // Fallback: slight confidence in "Other"
  return { industry: 'Other', confidence: 0.35 };
}

// ===== SPRINT 2: BILLING =====

export interface PlanRecommendation {
  recommendedPlan: PlanTier;
  reason: string;
  savingsNote: string | null;
  confidence: number;
}

/**
 * Recommend a subscription plan based on usage patterns.
 * AI Feature: Plan Recommendation Engine
 */
export async function recommendPlan(usage: {
  monthlySearches: number;
  activeCampaigns: number;
  teamSize: number;
}): Promise<PlanRecommendation> {
  await aiDelay(400, 900);

  const { monthlySearches, activeCampaigns, teamSize } = usage;

  // Scale tier triggers
  if (monthlySearches > 45 || activeCampaigns > 20 || teamSize > 5) {
    return {
      recommendedPlan: 'scale',
      reason: `With ${monthlySearches} searches and ${activeCampaigns} active campaigns, the Scale plan gives you unlimited access to grow without limits.`,
      savingsNote: monthlySearches > 50
        ? 'You would exceed Growth limits — Scale saves you from overage fees.'
        : null,
      confidence: 0.88,
    };
  }

  // Growth tier triggers
  if (monthlySearches > 15 || activeCampaigns > 4 || teamSize > 1) {
    return {
      recommendedPlan: 'growth',
      reason: `Based on your ${monthlySearches} monthly searches and ${teamSize} team members, Growth provides the right balance of capacity and value.`,
      savingsNote: monthlySearches > 18
        ? `At ${monthlySearches} searches/month, Discovery's 20 limit would be too tight.`
        : null,
      confidence: 0.82,
    };
  }

  return {
    recommendedPlan: 'discovery',
    reason: `For your current usage (${monthlySearches} searches, ${activeCampaigns} campaigns), Discovery gives you everything you need at the best price.`,
    savingsNote: null,
    confidence: 0.75,
  };
}

export interface ChurnAlert {
  riskLevel: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  daysSinceActivity: number;
}

/**
 * Predict churn risk based on workspace activity.
 * AI Feature: Churn Prediction Alert
 */
export async function predictChurn(lastActivityDate: string): Promise<ChurnAlert | null> {
  await aiDelay();

  const daysSince = Math.floor(
    (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince < 5) return null;

  if (daysSince >= 14) {
    return {
      riskLevel: 'high',
      message: `Your team hasn't been active for ${daysSince} days. We'd love to help you get back on track.`,
      suggestion: 'Schedule a quick walkthrough with our team to explore new features.',
      daysSinceActivity: daysSince,
    };
  }

  if (daysSince >= 7) {
    return {
      riskLevel: 'medium',
      message: `It's been ${daysSince} days since your last search. Need help finding the right creators?`,
      suggestion: 'Try our trending creators feature for fresh inspiration.',
      daysSinceActivity: daysSince,
    };
  }

  return {
    riskLevel: 'low',
    message: `Your team hasn't run a search in ${daysSince} days — everything OK?`,
    suggestion: 'Check out new creators in your niche.',
    daysSinceActivity: daysSince,
  };
}

// ===== SPRINT 3: TEAM =====

/** Return type for suggestRole — exported for consumers. */
export interface RoleSuggestion {
  suggestedRole: 'admin' | 'editor' | 'viewer';
  confidence: number;
  reasoning: string;
  /** Alias for `reasoning` — kept for backward compatibility */
  reason: string;
}

/**
 * Smart Role Suggestion — suggests a workspace role based on email and job title patterns.
 * B-TEAM feature: AI suggests role when inviting a team member.
 */
export async function suggestRole(email: string, jobTitle?: string): Promise<RoleSuggestion> {
  await new Promise(resolve => setTimeout(resolve, 400)); // simulate API delay

  const emailLower = email.toLowerCase();
  const titleLower = (jobTitle || '').toLowerCase();

  // CEO, founder, director → Admin
  if (/ceo|founder|director|cto|coo|vp|head|chief/.test(titleLower) ||
      /ceo@|founder@|director@/.test(emailLower)) {
    return {
      suggestedRole: 'admin',
      confidence: 0.85,
      reasoning: 'Senior leadership roles typically need full workspace access',
      reason: 'Senior leadership roles typically need full workspace access',
    };
  }

  // Marketing, content, creative → Editor
  if (/marketing|content|creative|social|brand|campaign|manager|coordinator/.test(titleLower) ||
      /marketing@|content@|creative@|social@/.test(emailLower)) {
    return {
      suggestedRole: 'editor',
      confidence: 0.78,
      reasoning: 'Marketing and content roles typically need campaign editing access',
      reason: 'Marketing and content roles typically need campaign editing access',
    };
  }

  // Analytics, data, report → Viewer
  if (/analytics|data|report|intern|assistant|finance|legal/.test(titleLower) ||
      /analytics@|data@|report@|intern@/.test(emailLower)) {
    return {
      suggestedRole: 'viewer',
      confidence: 0.72,
      reasoning: 'Analytics and support roles typically need view-only access',
      reason: 'Analytics and support roles typically need view-only access',
    };
  }

  // Default: Editor (most common role for team members)
  return {
    suggestedRole: 'editor',
    confidence: 0.5,
    reasoning: 'Default suggestion — most team members need editing access',
    reason: 'Default suggestion — most team members need editing access',
  };
}

// ===== SPRINT 4: USAGE =====

/**
 * Predict when a workspace will exhaust a usage quota based on the last 7 days of records.
 *
 * Algorithm:
 * 1. Filter the provided records to the last 7 calendar days and to the given metricType.
 * 2. Sum total units consumed across those 7 days.
 * 3. Compute a daily average rate.
 * 4. Project forward: daysUntilLimit = ceil((limit - currentUsage) / dailyRate).
 * 5. Classify trend by comparing the last 3 days vs the prior 4 days.
 * 6. Generate a plain-English recommendation.
 *
 * AI Feature: Usage Prediction Engine
 */
export async function predictUsage(
  records: UsageRecord[],
  limit: number,
  metricType: UsageMetricType
): Promise<UsagePrediction> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  // Compute current total usage from all provided records for this metric
  const allForMetric = records.filter((r) => r.metricType === metricType);
  const currentUsage = allForMetric.reduce((sum, r) => sum + r.count, 0);

  // Filter to last 7 days for rate calculation
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentRecords = allForMetric.filter(
    (r) => new Date(r.date).getTime() >= sevenDaysAgoMs
  );

  // Daily rate from the past 7 days (use 7 as denominator even if fewer days have records)
  const recentTotal = recentRecords.reduce((sum, r) => sum + r.count, 0);
  const dailyRate = recentTotal / 7;

  // Unlimited plan — no projection needed
  if (limit === -1) {
    return {
      metricType,
      currentUsage,
      limit,
      predictedDate: '',
      daysUntilLimit: -1,
      trend: dailyRate > 0 ? 'increasing' : 'stable',
      confidence: 0.95,
      recommendation: `You have unlimited ${metricType} quota on your current plan — no limits to worry about!`,
    };
  }

  const remaining = limit - currentUsage;

  // Already over limit
  if (remaining <= 0) {
    return {
      metricType,
      currentUsage,
      limit,
      predictedDate: new Date().toISOString().slice(0, 10),
      daysUntilLimit: 0,
      trend: 'increasing',
      confidence: 1.0,
      recommendation: `You have reached your ${metricType} limit of ${limit}. Purchase an overage pack or upgrade your plan to continue.`,
    };
  }

  // No consumption yet — can't project
  if (dailyRate === 0) {
    const endOfMonth = new Date();
    endOfMonth.setUTCDate(1);
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);
    endOfMonth.setUTCDate(0); // Last day of current month
    return {
      metricType,
      currentUsage,
      limit,
      predictedDate: endOfMonth.toISOString().slice(0, 10),
      daysUntilLimit: Math.ceil((endOfMonth.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      trend: 'stable',
      confidence: 0.3,
      recommendation: `No ${metricType} activity detected in the last 7 days. Usage appears to be stable.`,
    };
  }

  // Trend: compare last 3 days vs prior 4 days
  const threeDaysAgoMs = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const recentThree = allForMetric
    .filter((r) => new Date(r.date).getTime() >= threeDaysAgoMs)
    .reduce((sum, r) => sum + r.count, 0);
  const priorFour = recentTotal - recentThree;
  const recentDailyAvg = recentThree / 3;
  const priorDailyAvg = priorFour / 4;

  let trend: UsagePrediction['trend'] = 'stable';
  if (recentDailyAvg > priorDailyAvg * 1.15) trend = 'increasing';
  else if (recentDailyAvg < priorDailyAvg * 0.85) trend = 'decreasing';

  const daysUntilLimit = Math.ceil(remaining / dailyRate);
  const predictedDate = new Date(Date.now() + daysUntilLimit * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Confidence: higher when more recent data exists (capped at 0.92 for mock data)
  const confidence = Math.min(0.92, 0.4 + recentRecords.length * 0.08);

  let recommendation: string;
  if (daysUntilLimit <= 3) {
    recommendation = `At your current rate of ${dailyRate.toFixed(1)} ${metricType}s/day, you will reach your limit of ${limit} in approximately ${daysUntilLimit} day${daysUntilLimit === 1 ? '' : 's'}. Upgrade your plan or purchase an overage pack immediately to avoid disruption.`;
  } else if (daysUntilLimit <= 7) {
    recommendation = `You are on track to hit your ${metricType} limit within the week. Consider upgrading to Growth or Scale for additional capacity.`;
  } else if (trend === 'increasing') {
    recommendation = `Your ${metricType} usage is trending upward. At the current rate you have approximately ${daysUntilLimit} days of quota remaining. Monitor closely as usage is accelerating.`;
  } else if (trend === 'decreasing') {
    recommendation = `Your ${metricType} usage has slowed recently. At current pace you have approximately ${daysUntilLimit} days of quota left this cycle — you are on track to stay within limits.`;
  } else {
    recommendation = `Usage is stable at ${dailyRate.toFixed(1)} ${metricType}s/day. You have approximately ${daysUntilLimit} days of ${metricType} quota remaining in this billing cycle.`;
  }

  return {
    metricType,
    currentUsage,
    limit,
    predictedDate,
    daysUntilLimit,
    trend,
    confidence,
    recommendation,
  };
}

/**
 * Compare performance across agency workspaces and return AI insight strings.
 *
 * Generates 3–5 data-driven insight sentences by analysing:
 * - Search efficiency (searches per campaign)
 * - Relative usage intensity across workspaces
 * - Near-limit warnings
 * - Seat utilisation
 * - Recommended actions for the lowest-performing workspace
 *
 * AI Feature: Agency Cross-Workspace Insights
 */
export async function compareWorkspaces(
  workspaces: AgencyWorkspaceSummary[]
): Promise<string[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));

  if (workspaces.length === 0) {
    return ['No workspaces found. Add your first brand workspace to start seeing insights.'];
  }

  if (workspaces.length === 1) {
    return [
      `${workspaces[0].workspaceName} is your only workspace. Add more brand workspaces to unlock cross-brand performance comparisons.`,
    ];
  }

  const insights: string[] = [];

  // Sort descending by searches to find the most and least active
  const bySearches = [...workspaces].sort((a, b) => b.searchesUsed - a.searchesUsed);
  const mostActive = bySearches[0];
  const leastActive = bySearches[bySearches.length - 1];

  // 1. Search volume comparison
  if (mostActive.searchesUsed > 0 && leastActive.searchesUsed > 0) {
    const ratio = (mostActive.searchesUsed / leastActive.searchesUsed).toFixed(1);
    insights.push(
      `${mostActive.workspaceName} runs ${ratio}x more searches than ${leastActive.workspaceName} (${mostActive.searchesUsed} vs ${leastActive.searchesUsed} this month). Consider whether ${leastActive.workspaceName} could benefit from a more active discovery cadence.`
    );
  } else if (mostActive.searchesUsed > 0 && leastActive.searchesUsed === 0) {
    insights.push(
      `${leastActive.workspaceName} has not run any searches this month while ${mostActive.workspaceName} has run ${mostActive.searchesUsed}. This may indicate the team needs a product walkthrough or has not yet launched a creator discovery effort.`
    );
  }

  // 2. Search efficiency: searches per active campaign
  const withCampaigns = workspaces.filter((ws) => ws.campaignsActive > 0);
  if (withCampaigns.length >= 2) {
    const efficiencies = withCampaigns.map((ws) => ({
      name: ws.workspaceName,
      ratio: ws.searchesUsed / ws.campaignsActive,
    }));
    efficiencies.sort((a, b) => a.ratio - b.ratio);
    const mostEfficient = efficiencies[0];
    const leastEfficient = efficiencies[efficiencies.length - 1];
    if (leastEfficient.ratio > mostEfficient.ratio * 1.5) {
      insights.push(
        `${mostEfficient.name} uses ${mostEfficient.ratio.toFixed(1)} searches per active campaign compared to ${leastEfficient.ratio.toFixed(1)} for ${leastEfficient.name}. Sharing vetted creator lists from ${mostEfficient.name} could reduce search overhead for ${leastEfficient.name}.`
      );
    }
  }

  // 3. Near-limit warnings
  const nearLimit = workspaces.filter(
    (ws) =>
      ws.searchesLimit !== -1 &&
      ws.searchesLimit > 0 &&
      ws.searchesUsed / ws.searchesLimit >= 0.8
  );
  for (const ws of nearLimit) {
    const pct = Math.round((ws.searchesUsed / ws.searchesLimit) * 100);
    const remaining = ws.searchesLimit - ws.searchesUsed;
    insights.push(
      `${ws.workspaceName} has used ${pct}% of their monthly search quota (${ws.searchesUsed}/${ws.searchesLimit}) with only ${remaining} search${remaining === 1 ? '' : 'es'} remaining. Upgrading to the next plan tier would remove this constraint.`
    );
  }

  // 4. Campaign load across all workspaces
  const totalCampaigns = workspaces.reduce((sum, ws) => sum + ws.campaignsActive, 0);
  const avgCampaigns = totalCampaigns / workspaces.length;
  if (totalCampaigns > 0) {
    const busiest = [...workspaces].sort((a, b) => b.campaignsActive - a.campaignsActive)[0];
    insights.push(
      `Your agency is managing ${totalCampaigns} active campaigns across ${workspaces.length} workspaces (avg ${avgCampaigns.toFixed(1)} per workspace). ${busiest.workspaceName} leads with ${busiest.campaignsActive} active campaigns.`
    );
  }

  // 5. Seat utilisation across all workspaces
  const underutilisedSeats = workspaces.filter(
    (ws) => ws.seatsLimit > 1 && ws.seatsUsed / ws.seatsLimit < 0.5
  );
  if (underutilisedSeats.length > 0) {
    const names = underutilisedSeats.map((ws) => ws.workspaceName).join(' and ');
    insights.push(
      `${names} ${underutilisedSeats.length === 1 ? 'has' : 'have'} unused seat capacity. Inviting additional team members would improve collaboration and distribute the search workload.`
    );
  }

  // Return at most 5 insights to keep the UI clean
  return insights.slice(0, 5);
}

// ===== SPRINT 5: MIGRATION =====

/**
 * Suggest a workspace configuration based on the user's legacy data profile.
 *
 * Plan selection logic:
 * - > 15 campaigns  → 'scale'  (heavy workload, unlimited capacity needed)
 * - > 5 campaigns   → 'growth' (active team, mid-tier limits sufficient)
 * - ≤ 5 campaigns   → 'discovery' (light usage, entry plan fits)
 *
 * Industry is inferred from the volume of saved creators — fashion/lifestyle
 * brands tend to have larger creator pools, while niche verticals stay lean.
 *
 * AI Feature: Smart Migration Assistant
 */
export async function suggestMigrationStructure(legacyData: {
  campaigns: number;
  creators: number;
  notes: number;
  lists: number;
  searchHistory: number;
}): Promise<MigrationSuggestion> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  const { campaigns, creators, searchHistory } = legacyData;

  // Determine recommended plan tier based on campaign volume
  let suggestedPlan: MigrationSuggestion['suggestedPlan'];
  if (campaigns > 15) {
    suggestedPlan = 'scale';
  } else if (campaigns > 5) {
    suggestedPlan = 'growth';
  } else {
    suggestedPlan = 'discovery';
  }

  // Infer likely industry from creator pool size and search history
  let suggestedIndustry: string;
  if (creators > 80 || searchHistory > 100) {
    // Large pools suggest broad consumer verticals (fashion, lifestyle)
    suggestedIndustry = 'Fashion';
  } else if (creators > 40) {
    // Mid-size pools are common in beauty and lifestyle brands
    suggestedIndustry = 'Beauty';
  } else if (campaigns > 10) {
    // High campaign count with fewer creators → tech or e-commerce
    suggestedIndustry = 'Technology';
  } else {
    // Default fallback for mixed or unclear signals
    suggestedIndustry = 'Other';
  }

  // Build plain-English reasoning sentence
  const planLabel =
    suggestedPlan === 'scale'
      ? 'Scale (unlimited searches and campaigns)'
      : suggestedPlan === 'growth'
      ? 'Growth (50 searches, 25 campaigns)'
      : 'Discovery (20 searches, 5 campaigns)';

  const reasoning =
    `Based on your ${campaigns} campaign${campaigns === 1 ? '' : 's'}, ` +
    `${creators} saved creator${creators === 1 ? '' : 's'}, ` +
    `and ${searchHistory} search${searchHistory === 1 ? '' : 'es'}, ` +
    `we recommend the ${planLabel} plan. ` +
    (suggestedPlan === 'discovery'
      ? 'Your usage fits comfortably within the entry tier.'
      : suggestedPlan === 'growth'
      ? 'The Growth tier gives your team room to scale without hitting limits.'
      : 'The Scale tier removes all caps so your high-volume workflow is never interrupted.');

  // Confidence is higher when campaign count is a clear signal
  const confidence =
    campaigns > 15 || campaigns <= 2
      ? 0.92  // Clear signal at both extremes
      : campaigns > 8
      ? 0.84  // Moderate-high confidence in growth range
      : 0.72; // Ambiguous middle band

  return {
    suggestedName: 'My Brand Hub',
    suggestedIndustry,
    suggestedPlan,
    reasoning,
    confidence,
  };
}

// ===== INTERNAL HELPERS =====

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}
