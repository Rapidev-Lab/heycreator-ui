import { Timestamp } from 'firebase/firestore';

// ===== TIMESTAMP TYPE =====

/**
 * Firestore Timestamp type that's compatible with both
 * firebase/firestore (client) and firebase-admin/firestore (server)
 */
export type FirestoreTimestamp = {
  toDate(): Date;
  toMillis(): number;
  seconds: number;
  nanoseconds: number;
};

// ===== ENUMS & TYPES =====

export type UserRole = 'influencer' | 'brand';

export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple' | 'phone' | 'instagram';

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'facebook' | 'youtube' | 'linkedin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type IndustryType =
  | 'Fashion'
  | 'Beauty'
  | 'Food & Beverage'
  | 'Technology'
  | 'Travel'
  | 'Fitness'
  | 'Gaming'
  | 'Education'
  | 'E-commerce'
  | 'Other';

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';

// ===== USER DOCUMENT =====

/**
 * Main user document stored in Firestore 'users' collection
 * This is the central auth record for both influencers and brands
 */
export interface User {
  // Core Identity
  uid: string;                          // Firebase Auth UID
  email: string;                        // Primary email
  role: UserRole;                       // 'influencer' or 'brand'

  // Profile Data
  displayName?: string;                 // User's display name
  photoURL?: string;                    // Profile photo URL
  phoneNumber?: string;                 // Phone number (if provided)

  // Auth Metadata
  emailVerified: boolean;               // Email verification status
  authProviders: AuthProvider[];        // List of auth methods used ['email', 'google', etc.]

  // Profile Completion
  profileCompleted?: number;            // Profile completion percentage (0-100)

  // Role-Specific References
  influencerProfileId?: string;         // Reference to influencer_profiles doc (if influencer)
  brandProfileId?: string;              // Reference to brand_profiles doc (if brand)

  // Workspace References (Phase 2)
  workspaceIds?: string[];              // IDs of workspaces this user belongs to
  activeWorkspaceId?: string;           // Currently selected workspace ID

  // Instagram OAuth Data (for influencers who connect with Instagram)
  instagramTokenData?: InstagramTokenData;  // Instagram access token and metadata

  // Timestamps
  createdAt: Timestamp;                 // Account creation date
  lastLoginAt: Timestamp;               // Last login timestamp
  updatedAt: Timestamp;                 // Last profile update

  // Settings & Preferences
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };

  // Signup Status
  signupComplete?: boolean;             // Whether the signup flow was completed

  // Account Status
  isActive: boolean;                    // Account active status
  isSuspended: boolean;                 // Account suspension status
  suspensionReason?: string;            // Reason for suspension (if applicable)
}

// ===== INFLUENCER PROFILE =====

/**
 * Social media account linked to an influencer
 */
export interface LinkedAccount {
  platform: SocialPlatform;
  username: string;
  profileUrl: string;
  followerCount?: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  connectedAt: Timestamp;
  lastSyncedAt?: Timestamp;
}

/**
 * Influencer-specific profile data stored in 'influencer_profiles' collection
 */
export interface InfluencerProfile {
  // Identity
  id: string;                           // Document ID (matches user.influencerProfileId)
  userId: string;                       // Reference to users.uid

  // Basic Info
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;                     // Personal website or portfolio
  categories?: string[];                // Content categories/niches

  // Social Accounts
  linkedAccounts: LinkedAccount[];      // Connected social media accounts
  primaryPlatform?: SocialPlatform;     // Main platform for this influencer

  // Profile Assets
  avatarUrl?: string;
  bannerUrl?: string;

  // Metrics (aggregated from linked accounts)
  totalFollowers: number;
  averageEngagementRate?: number;
  influenceScore?: number;              // Calculated score

  // Tags & Metadata
  relevantTags?: string[];              // e.g. ["#EcoGlowSA", "#SustainableBeauty"]
  mentionsBrands?: string[];            // e.g. ["@ecoglowsa", "@sustainablebeautysa"]
  relevantLocations?: string[];         // e.g. ["National", "Gauteng"]
  influenceSize?: string[];             // e.g. ["Macro"]

  // Payment Details
  paymentDetails?: {
    bank?: string;
    accountType?: string;
    paymentMethod?: string;
    paymentReference?: string;
    accountNumber?: string;
    branchCode?: string;
  };

  // Link to global_influencers (for enrichment)
  globalInfluencerIds?: string[];

  // Verification
  isVerified: boolean;                  // HeyCreator verification badge
  verifiedAt?: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Status
  isPublic: boolean;                    // Profile visibility
  isActive: boolean;
}

// ===== BRAND PROFILE =====

/**
 * Social media presence for a brand
 */
export interface BrandSocialLink {
  platform: SocialPlatform;
  url: string;
  handle?: string;
}

/**
 * Brand/Company-specific profile data stored in 'brand_profiles' collection
 */
export interface BrandProfile {
  // Identity
  id: string;                           // Document ID (matches user.brandProfileId)
  userId: string;                       // Reference to users.uid

  // Company Info
  companyName: string;
  website?: string;
  industry: IndustryType;
  companySize: CompanySize;
  userRole: string;                     // User's role in the company

  // Contact & Profile
  displayName: string;                  // Contact person's name
  bio?: string;
  description?: string;                 // Company description
  location?: string;

  // Social Media
  socialLinks: BrandSocialLink[];       // Brand's social media accounts

  // Profile Assets
  logoUrl?: string;
  bannerUrl?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Status
  isActive: boolean;
  isVerified: boolean;                  // Business verification status
  verifiedAt?: Timestamp;
}

// ===== UNIFIED PROFILE DOCUMENT =====

/**
 * Unified profile document stored in 'unified_profiles' collection
 * This is created when an influencer aggregates multiple social accounts
 */
export interface UnifiedProfileDocument {
  // Identity
  id: string;                           // Document ID
  userId: string;                       // Reference to users.uid
  influencerProfileId: string;          // Reference to influencer_profiles.id

  // Display Info
  displayName: string;
  bio?: string;
  location?: string;
  flag?: string;
  categories: string[];

  // Assets
  avatarUrl: string;

  // Linked Accounts (from aggregation)
  linkedAccounts: {
    platform: SocialPlatform;
    username: string;
    profileUrl: string;
    avatarUrl?: string;
    followerCount: number;
    isVerified: boolean;
  }[];

  // Combined Metrics
  combinedMetrics: {
    totalFollowers: number;
    averageEngagementRate: number;
    totalPosts?: number;
  };

  // Calculated Scores
  influenceScore: number;
  estimatedPrice?: string;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Status
  isActive: boolean;
}

// ===== AUTH STATE TYPES =====

/**
 * Authentication context state
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * User profile data based on role
 */
export type RoleProfile = InfluencerProfile | BrandProfile;

// ===== FORM DATA TYPES =====

/**
 * Influencer signup form data
 */
export interface InfluencerSignupData {
  email: string;
  password?: string;
  displayName?: string;
  phoneNumber?: string;
  verifiedPlatforms?: string[];
}

/**
 * Brand signup form data (3-step process)
 */
export interface BrandSignupData {
  // Step 1: Account
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;

  // Step 2: Company
  companyName: string;
  website?: string;
  industry: IndustryType;
  companySize: CompanySize;
  role?: string;

  // Step 3: Social (optional)
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

// ===== HELPER TYPES =====

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'facebook' | 'apple' | 'instagram';

// ===== INSTAGRAM OAUTH TYPES =====

/**
 * Instagram Business Account data returned from Graph API
 */
export interface InstagramBusinessAccount {
  id: string;                           // Instagram Business Account ID
  username: string;                     // Instagram username
  name?: string;                        // Display name
  profile_picture_url?: string;         // Profile picture URL
  followers_count?: number;             // Follower count
  follows_count?: number;               // Following count
  media_count?: number;                 // Total posts
  biography?: string;                   // Bio text
  website?: string;                     // Website URL
}

/**
 * Instagram access token data stored in Firestore
 */
export interface InstagramTokenData {
  accessToken: string;                  // Long-lived access token (60 days)
  tokenType: 'bearer';                  // Token type
  expiresAt: FirestoreTimestamp;        // Token expiration timestamp
  instagramUserId: string;              // Instagram Business Account ID
  username: string;                     // Instagram username
  scopes: string[];                     // Granted permissions
  createdAt: FirestoreTimestamp;        // When token was created
  lastRefreshedAt?: FirestoreTimestamp; // Last refresh timestamp
}

/**
 * Instagram OAuth callback response
 */
export interface InstagramOAuthResponse {
  customToken: string;                  // Firebase custom token
  instagramData: InstagramBusinessAccount;  // Instagram profile data
  isNewUser: boolean;                   // Whether this is a new signup
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  email: string;
  code: string;
  newPassword: string;
}
