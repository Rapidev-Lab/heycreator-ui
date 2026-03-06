/**
 * Profile Completion Calculator
 *
 * Calculates profile completion percentage based on filled fields.
 * Different weights for required vs optional fields.
 */

import { User, InfluencerProfile, BrandProfile } from '@/types/firebase';

// Field weights for influencer profile completion
const INFLUENCER_FIELD_WEIGHTS = {
  // Required fields (higher weight)
  email: 15,
  displayName: 15,

  // Profile basics (medium weight)
  bio: 10,
  location: 10,
  avatar: 10,

  // Social accounts (high value - at least one required)
  linkedAccounts: 20,

  // Demographics (optional but valuable)
  categories: 10,

  // Additional info (low weight)
  phoneNumber: 5,
  website: 5,
};

// Field weights for brand profile completion
const BRAND_FIELD_WEIGHTS = {
  // Required fields (higher weight)
  email: 10,
  displayName: 10,
  companyName: 15,

  // Company details (high weight)
  industry: 10,
  companySize: 10,
  userRole: 10,

  // Contact info (medium weight)
  website: 10,
  phoneNumber: 5,

  // Social presence (medium weight)
  socialLinks: 15,

  // Additional info (low weight)
  logo: 10,
  description: 5,
};

/**
 * Calculate influencer profile completion percentage
 */
export function calculateInfluencerCompletion(
  user: User,
  profile?: InfluencerProfile | null
): number {
  let totalWeight = 0;
  let completedWeight = 0;

  // Check user fields
  if (user.email) {
    completedWeight += INFLUENCER_FIELD_WEIGHTS.email;
  }
  totalWeight += INFLUENCER_FIELD_WEIGHTS.email;

  if (user.displayName) {
    completedWeight += INFLUENCER_FIELD_WEIGHTS.displayName;
  }
  totalWeight += INFLUENCER_FIELD_WEIGHTS.displayName;

  if (user.phoneNumber) {
    completedWeight += INFLUENCER_FIELD_WEIGHTS.phoneNumber;
  }
  totalWeight += INFLUENCER_FIELD_WEIGHTS.phoneNumber;

  // Check profile fields if profile exists
  if (profile) {
    if (profile.bio && profile.bio.trim().length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.bio;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.bio;

    if (profile.location && profile.location.trim().length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.location;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.location;

    if (profile.avatarUrl && profile.avatarUrl.trim().length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.avatar;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.avatar;

    if (profile.linkedAccounts && profile.linkedAccounts.length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.linkedAccounts;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.linkedAccounts;

    if (profile.categories && profile.categories.length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.categories;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.categories;

    if (profile.website && profile.website.trim().length > 0) {
      completedWeight += INFLUENCER_FIELD_WEIGHTS.website;
    }
    totalWeight += INFLUENCER_FIELD_WEIGHTS.website;
  } else {
    // If no profile, add remaining weights to total
    totalWeight += INFLUENCER_FIELD_WEIGHTS.bio;
    totalWeight += INFLUENCER_FIELD_WEIGHTS.location;
    totalWeight += INFLUENCER_FIELD_WEIGHTS.avatar;
    totalWeight += INFLUENCER_FIELD_WEIGHTS.linkedAccounts;
    totalWeight += INFLUENCER_FIELD_WEIGHTS.categories;
    totalWeight += INFLUENCER_FIELD_WEIGHTS.website;
  }

  // Calculate percentage
  const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Calculate brand profile completion percentage
 */
export function calculateBrandCompletion(
  user: User,
  profile?: BrandProfile | null
): number {
  let totalWeight = 0;
  let completedWeight = 0;

  // Check user fields
  if (user.email) {
    completedWeight += BRAND_FIELD_WEIGHTS.email;
  }
  totalWeight += BRAND_FIELD_WEIGHTS.email;

  if (user.displayName) {
    completedWeight += BRAND_FIELD_WEIGHTS.displayName;
  }
  totalWeight += BRAND_FIELD_WEIGHTS.displayName;

  if (user.phoneNumber) {
    completedWeight += BRAND_FIELD_WEIGHTS.phoneNumber;
  }
  totalWeight += BRAND_FIELD_WEIGHTS.phoneNumber;

  // Check profile fields if profile exists
  if (profile) {
    if (profile.companyName && profile.companyName.trim().length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.companyName;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.companyName;

    if (profile.industry) {
      completedWeight += BRAND_FIELD_WEIGHTS.industry;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.industry;

    if (profile.companySize) {
      completedWeight += BRAND_FIELD_WEIGHTS.companySize;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.companySize;

    if (profile.userRole && profile.userRole.trim().length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.userRole;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.userRole;

    if (profile.website && profile.website.trim().length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.website;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.website;

    if (profile.socialLinks && profile.socialLinks.length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.socialLinks;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.socialLinks;

    if (profile.logoUrl && profile.logoUrl.trim().length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.logo;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.logo;

    if (profile.description && profile.description.trim().length > 0) {
      completedWeight += BRAND_FIELD_WEIGHTS.description;
    }
    totalWeight += BRAND_FIELD_WEIGHTS.description;
  } else {
    // If no profile, add remaining weights to total
    totalWeight += BRAND_FIELD_WEIGHTS.companyName;
    totalWeight += BRAND_FIELD_WEIGHTS.industry;
    totalWeight += BRAND_FIELD_WEIGHTS.companySize;
    totalWeight += BRAND_FIELD_WEIGHTS.userRole;
    totalWeight += BRAND_FIELD_WEIGHTS.website;
    totalWeight += BRAND_FIELD_WEIGHTS.socialLinks;
    totalWeight += BRAND_FIELD_WEIGHTS.logo;
    totalWeight += BRAND_FIELD_WEIGHTS.description;
  }

  // Calculate percentage
  const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Calculate profile completion based on user role
 */
export function calculateProfileCompletion(
  user: User,
  roleProfile?: InfluencerProfile | BrandProfile | null
): number {
  if (user.role === 'influencer') {
    return calculateInfluencerCompletion(user, roleProfile as InfluencerProfile);
  } else if (user.role === 'brand') {
    return calculateBrandCompletion(user, roleProfile as BrandProfile);
  }

  return 0;
}

/**
 * Check if profile meets minimum completion threshold
 */
export function meetsMinimumCompletion(completionPercentage: number): boolean {
  const MINIMUM_THRESHOLD = 50;
  return completionPercentage >= MINIMUM_THRESHOLD;
}

/**
 * Get missing required fields for influencer
 */
export function getInfluencerMissingFields(
  user: User,
  profile?: InfluencerProfile | null
): string[] {
  const missing: string[] = [];

  if (!user.email) missing.push('Email');
  if (!user.displayName) missing.push('Display Name');

  if (!profile) {
    missing.push('Profile Photo', 'Bio', 'Location', 'At least one social account');
  } else {
    if (!profile.avatarUrl) missing.push('Profile Photo');
    if (!profile.bio || profile.bio.trim().length === 0) missing.push('Bio');
    if (!profile.location || profile.location.trim().length === 0) missing.push('Location');
    if (!profile.linkedAccounts || profile.linkedAccounts.length === 0) {
      missing.push('At least one social account');
    }
  }

  return missing;
}

/**
 * Get missing required fields for brand
 */
export function getBrandMissingFields(
  user: User,
  profile?: BrandProfile | null
): string[] {
  const missing: string[] = [];

  if (!user.email) missing.push('Email');
  if (!user.displayName) missing.push('Full Name');

  if (!profile) {
    missing.push('Company Name', 'Industry', 'Company Size', 'Your Role');
  } else {
    if (!profile.companyName || profile.companyName.trim().length === 0) missing.push('Company Name');
    if (!profile.industry) missing.push('Industry');
    if (!profile.companySize) missing.push('Company Size');
    if (!profile.userRole || profile.userRole.trim().length === 0) missing.push('Your Role');
  }

  return missing;
}

/**
 * Get missing fields based on user role
 */
export function getMissingFields(
  user: User,
  roleProfile?: InfluencerProfile | BrandProfile | null
): string[] {
  if (user.role === 'influencer') {
    return getInfluencerMissingFields(user, roleProfile as InfluencerProfile);
  } else if (user.role === 'brand') {
    return getBrandMissingFields(user, roleProfile as BrandProfile);
  }

  return [];
}
