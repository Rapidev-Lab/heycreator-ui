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

export interface RoleSuggestion {
  suggestedRole: 'admin' | 'editor' | 'viewer';
  reason: string;
  confidence: number;
}

/**
 * Suggest a role for a new team member based on email and context.
 * AI Feature: Smart Role Suggestion
 */
export async function suggestRole(email: string): Promise<RoleSuggestion> {
  await aiDelay();

  const lowerEmail = email.toLowerCase();

  // CEO/executive patterns → Admin
  if (/\b(ceo|cto|cfo|coo|founder|director|head|vp|chief)\b/.test(lowerEmail)) {
    return {
      suggestedRole: 'admin',
      reason: 'Executive role detected — full workspace management access recommended.',
      confidence: 0.85,
    };
  }

  // Marketing/content patterns → Editor
  if (/\b(marketing|content|creative|social|brand|campaign|media)\b/.test(lowerEmail)) {
    return {
      suggestedRole: 'editor',
      reason: 'Marketing role detected — campaign creation and influencer search access recommended.',
      confidence: 0.80,
    };
  }

  // External/client patterns → Viewer
  if (/\b(client|external|partner|agency|brand-manager|review)\b/.test(lowerEmail)) {
    return {
      suggestedRole: 'viewer',
      reason: 'External stakeholder detected — read-only access recommended.',
      confidence: 0.78,
    };
  }

  // Default: Editor
  return {
    suggestedRole: 'editor',
    reason: 'Standard team member — campaign and search access.',
    confidence: 0.55,
  };
}

// ===== SPRINT 4: USAGE =====

export interface UsagePrediction {
  predictedExhaustionDate: string | null;  // ISO date
  daysUntilExhaustion: number | null;
  currentRate: number;  // per day
  recommendation: string;
}

/**
 * Predict when usage limits will be exhausted.
 * AI Feature: Usage Prediction
 */
export async function predictUsage(
  used: number,
  limit: number,
  billingCycleStart: string
): Promise<UsagePrediction> {
  await aiDelay(400, 1000);

  if (limit === -1) {
    return {
      predictedExhaustionDate: null,
      daysUntilExhaustion: null,
      currentRate: used / Math.max(1, daysSince(billingCycleStart)),
      recommendation: 'You have unlimited usage — no limits to worry about!',
    };
  }

  const daysPassed = Math.max(1, daysSince(billingCycleStart));
  const dailyRate = used / daysPassed;
  const remaining = limit - used;

  if (dailyRate === 0) {
    return {
      predictedExhaustionDate: null,
      daysUntilExhaustion: null,
      currentRate: 0,
      recommendation: 'No usage detected yet this cycle.',
    };
  }

  const daysUntilExhaustion = Math.ceil(remaining / dailyRate);
  const exhaustionDate = new Date(Date.now() + daysUntilExhaustion * 24 * 60 * 60 * 1000);

  return {
    predictedExhaustionDate: exhaustionDate.toISOString(),
    daysUntilExhaustion,
    currentRate: Math.round(dailyRate * 10) / 10,
    recommendation:
      daysUntilExhaustion <= 5
        ? `At your current pace of ${dailyRate.toFixed(1)}/day, you'll hit your limit in ${daysUntilExhaustion} days. Consider upgrading.`
        : `You're using about ${dailyRate.toFixed(1)} per day. You have roughly ${daysUntilExhaustion} days before reaching your limit.`,
  };
}

/**
 * Compare performance across agency workspaces.
 * AI Feature: Agency Cross-Workspace Insights
 */
export async function compareWorkspaces(
  workspaces: Array<{ name: string; engagement: number; searches: number; campaigns: number }>
): Promise<string[]> {
  await aiDelay(600, 1200);

  const insights: string[] = [];

  if (workspaces.length < 2) {
    return ['Add more workspaces to see cross-brand insights.'];
  }

  // Sort by engagement
  const sorted = [...workspaces].sort((a, b) => b.engagement - a.engagement);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  if (top.engagement > bottom.engagement * 1.2) {
    const pct = Math.round(((top.engagement - bottom.engagement) / bottom.engagement) * 100);
    insights.push(
      `${top.name}'s engagement rate is ${pct}% higher than ${bottom.name}. Consider applying ${top.name}'s creator selection strategy to other brands.`
    );
  }

  // Search efficiency
  const mostSearches = sorted.reduce((max, ws) => (ws.searches > max.searches ? ws : max));
  if (mostSearches.searches > 30) {
    insights.push(
      `${mostSearches.name} has used ${mostSearches.searches} searches this month. Review search patterns to see if saved creator lists could reduce search volume.`
    );
  }

  // Campaign activity
  const totalCampaigns = workspaces.reduce((sum, ws) => sum + ws.campaigns, 0);
  insights.push(
    `Across all brands, you're running ${totalCampaigns} active campaigns. Peak performance is typically 3-5 campaigns per brand.`
  );

  return insights;
}

// ===== SPRINT 5: MIGRATION =====

export interface MigrationSuggestion {
  suggestedWorkspaces: Array<{
    name: string;
    campaignCount: number;
    creatorCount: number;
  }>;
  reasoning: string;
}

/**
 * Suggest workspace structure from existing data.
 * AI Feature: Smart Migration Assistant
 */
export async function suggestMigrationStructure(data: {
  campaigns: Array<{ title: string; brandName?: string }>;
  creatorCount: number;
}): Promise<MigrationSuggestion> {
  await aiDelay(800, 1500);

  const { campaigns, creatorCount } = data;

  // Group campaigns by brand name (or infer from title)
  const brandGroups = new Map<string, number>();

  for (const campaign of campaigns) {
    const brand = campaign.brandName || extractBrandFromTitle(campaign.title);
    brandGroups.set(brand, (brandGroups.get(brand) || 0) + 1);
  }

  if (brandGroups.size <= 1) {
    const brandName = brandGroups.keys().next().value || 'My Brand';
    return {
      suggestedWorkspaces: [
        {
          name: `${brandName} Workspace`,
          campaignCount: campaigns.length,
          creatorCount,
        },
      ],
      reasoning: `All ${campaigns.length} campaigns appear to be for a single brand. We recommend creating one workspace.`,
    };
  }

  const workspaces = Array.from(brandGroups.entries()).map(([brand, count]) => ({
    name: `${brand} Workspace`,
    campaignCount: count,
    creatorCount: Math.ceil(creatorCount / brandGroups.size),
  }));

  return {
    suggestedWorkspaces: workspaces,
    reasoning: `We detected ${brandGroups.size} distinct brands across ${campaigns.length} campaigns. We suggest creating a separate workspace for each brand.`,
  };
}

// ===== INTERNAL HELPERS =====

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

function extractBrandFromTitle(title: string): string {
  // Simple heuristic: first 1-2 words often contain brand
  const words = title.split(/\s+/);
  if (words.length >= 2 && words[0].length <= 12) {
    return words.slice(0, 2).join(' ');
  }
  return words[0] || 'Unknown';
}
