# Firestore Collections Reference

> **Last Updated**: February 16, 2026
> **Status**: Comprehensive audit of all Firestore collections in the HeyCreator codebase

---

## Overview

The HeyCreator platform uses **24 Firestore collections** across authentication, influencer discovery, campaign management, and caching. Of these, **16 are actively used** and **4 are legacy/deprecated**.

### Collection Relationship Diagram

```
users (auth)
  |
  +-- brand_profiles (brand role data)
  +-- user_collections (links user -> global_influencers)
  |     +-- creator_lists (user-curated lists)
  +-- influencer_profiles (influencer role data)
  +-- campaigns (brand-owned)
  |     +-- campaign_applications (creator -> campaign)
  |     +-- campaign_invitations (brand -> creator)
  |     +-- deliverable_submissions
  |     +-- campaign_notifications
  +-- brand_wallets
        +-- wallet_transactions
        +-- creator_earnings
        +-- creator_withdrawals

global_influencers (single source of truth for all profiles)
  ^
  |-- profile_dedup_locks (atomic dedup on write)
  |-- username_resolution_cache (performance cache)

[DEPRECATED] unified_profiles, influencer_detailed_data, content_posts, platform_profiles
```

---

## Active Collections

### 1. `users`

**Purpose**: Core authentication and role assignment for all platform users.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID (document ID) |
| `email` | string | User email |
| `role` | `'influencer' \| 'brand'` | Determines dashboard and permissions |
| `displayName` | string | Display name |
| `photoURL` | string? | Avatar URL |
| `authProviders` | string[] | `['email', 'google', 'facebook', 'apple']` |
| `influencerProfileId` | string? | Link to `influencer_profiles` doc |
| `brandId` | string? | Link to `brand_profiles` doc |
| `createdAt` | Timestamp | Account creation |
| `lastLogin` | Timestamp | Last login time |

**Used by**: Auth actions, API middleware, campaign auth, dashboard stats
**Key files**: `lib/firebase/auth-actions.ts`, `app/api/auth/*`, `lib/middleware/campaign-auth.ts`

---

### 2. `global_influencers`

**Purpose**: Single source of truth for all influencer/creator profile data. Stores both discovery-phase fields and enrichment data.

| Field | Type | Description |
|-------|------|-------------|
| `primaryAccountKey` | string | Dedup key: `platform:username` (lowercase) |
| `displayName` | string | Creator name |
| `bio` | string? | Bio text |
| `location` | string? | Inferred or stated location |
| `categories` | string[] | Content categories / niches |
| `linkedAccounts` | object[] | Array of `{ platform, username, url, metrics }` |
| `combinedMetrics` | object | `{ totalFollowers, avgEngagementRate }` |
| `influenceScore` | number | Computed influence score |
| `demographics` | object | `{ ageRanges, genderSplit, topCountries, brandAffinity }` |
| `posts` | object[] | Embedded content posts with engagement data |
| `enrichmentData` | object | Raw enrichment results per method |
| `lastEnriched` | Timestamp | TTL staleness check |
| `createdAt` | Timestamp | First discovery date |
| `updatedAt` | Timestamp | Last update |

**Operations**: Full CRUD, batch reads (chunked by 30 for Firestore `in` limit), filtered queries via `filter-query-builder.ts`
**Key files**: `app/api/profiles/route.ts`, `app/api/discover/search/stream/route.ts`, `app/api/influencer/[id]/enrichment/route.ts`, `lib/services/filter-query-builder.ts`

---

### 3. `user_collections`

**Purpose**: Per-user metadata linking a user to profiles in `global_influencers`. Tracks starred creators, notes, list membership, and collaboration status.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Owning user's UID |
| `globalInfluencerId` | string | Reference to `global_influencers` doc |
| `profileStatus` | `'active' \| 'archived' \| 'deleted'` | User's status for this profile |
| `collaborationStatus` | string? | Outreach/collab state |
| `addedAt` | Timestamp | When user saved this creator |
| `notes` | string? | User notes |
| `tags` | string[] | User-applied tags |
| `listIds` | string[] | Which `creator_lists` this creator belongs to |

**Read pattern**: Query `user_collections` by `userId` -> batch-fetch `global_influencers` by IDs -> merge metadata
**Key files**: `app/api/profiles/[id]/star/route.ts`, `app/api/brands/creators/[id]/lists/route.ts`, `app/api/influencer/profiles/route.ts`

---

### 4. `creator_lists`

**Purpose**: User-curated lists of creators (e.g., "Fashion Micro-Influencers", "Tech Reviewers Q1").

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | List owner |
| `name` | string | List name |
| `description` | string? | List description |
| `tags` | string[] | Category tags for smart suggestions |
| `visibility` | `'public' \| 'private'` | Sharing setting |
| `influenceSize` | string? | Target influence tier |
| `locations` | string[] | Target locations |
| `creatorCount` | number | Cached count of creators in list |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last modification |

**Key files**: `app/api/brands/lists/route.ts`, `app/api/brands/lists/[id]/route.ts`, `app/api/brands/lists/[id]/creators/route.ts`, `app/api/brands/lists/[id]/suggestions/route.ts`

---

### 5. `campaigns`

**Purpose**: Campaign lifecycle management. A brand creates campaigns that creators can apply to or be invited to.

| Field | Type | Description |
|-------|------|-------------|
| `brandId` | string | Owning brand's UID |
| `title` | string | Campaign name |
| `description` | string | Campaign brief |
| `budget` | number | Total budget |
| `timeline` | object | `{ startDate, endDate }` |
| `deliverables` | object[] | Required content deliverables |
| `status` | string | `draft \| active \| paused \| completed \| cancelled` |
| `stats` | object | `{ views, applications, accepted }` |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last update |

**Key files**: `lib/firebase/campaigns.ts`, `app/api/campaigns/route.ts`, `app/api/campaigns/[id]/route.ts`

---

### 6. `campaign_applications`

**Purpose**: Tracks creator applications to campaigns.

| Field | Type | Description |
|-------|------|-------------|
| `campaignId` | string | Target campaign |
| `influencerId` | string | Applying creator |
| `status` | `'pending' \| 'accepted' \| 'rejected'` | Review status |
| `message` | string? | Application message |
| `appliedAt` | Timestamp | Application date |
| `reviewedAt` | Timestamp? | When brand reviewed |

**Key files**: `app/api/influencers/campaigns/[id]/apply/route.ts`, `app/api/brands/campaigns/[id]/applications/route.ts`

---

### 7. `campaign_invitations`

**Purpose**: Brand-initiated invitations to creators for campaign participation.

| Field | Type | Description |
|-------|------|-------------|
| `campaignId` | string | Campaign reference |
| `influencerId` | string | Invited creator |
| `brandId` | string | Inviting brand |
| `status` | string | `pending \| accepted \| declined \| expired` |
| `message` | string? | Invitation message |
| `createdAt` | Timestamp | Sent date |
| `expiresAt` | Timestamp? | Expiry date |

**Key files**: `app/api/campaigns/[id]/invitations/route.ts`, `app/api/influencers/invitations/route.ts`

---

### 8. `deliverable_submissions`

**Purpose**: Tracks content deliverables submitted by creators for campaigns.

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.DELIVERABLES`
**Operations**: CREATE, READ, UPDATE

---

### 9. `campaign_notifications`

**Purpose**: Campaign-related notifications (new applications, status changes, deadlines).

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.CAMPAIGN_NOTIFICATIONS`
**Operations**: CREATE, READ

---

### 10. `brand_wallets`

**Purpose**: Brand payment wallets for campaign funding.

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.BRAND_WALLETS`

---

### 11. `wallet_transactions`

**Purpose**: Payment transaction records between brands and creators.

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.WALLET_TRANSACTIONS`

---

### 12. `creator_earnings`

**Purpose**: Tracks creator earnings across campaigns.

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.CREATOR_EARNINGS`

---

### 13. `creator_withdrawals`

**Purpose**: Creator withdrawal requests from earned funds.

**Defined in**: `lib/firebase/campaigns.ts` as `COLLECTIONS.CREATOR_WITHDRAWALS`

---

### 14. `influencer_profiles`

**Purpose**: Role-specific profile data for users who signed up as influencers. Created during onboarding.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Reference to `users` collection |
| `profileData` | object | Influencer-specific onboarding data |
| `preferences` | object? | Notification/collab preferences |

**Key files**: `lib/firebase/auth-actions.ts`, `app/auth/influencer/complete-profile/page.tsx`

---

### 15. `brand_profiles`

**Purpose**: Role-specific profile data for users who signed up as brands. Stores company info and social links collected during signup.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Reference to `users` collection |
| `companyName` | string | Company name |
| `website` | string? | Company website |
| `industry` | string | Selected industry |
| `companySize` | string | Employee count range |
| `role` | string | User's role at company |
| `socialLinks` | object | `{ instagram?, tiktok?, facebook?, twitter?, linkedin? }` |

**Key files**: `lib/firebase/auth-actions.ts`, `app/auth/brand/complete-profile/page.tsx`

---

### 16. `profile_dedup_locks`

**Purpose**: Atomic deduplication during concurrent profile creation. Uses Firestore transactions to prevent duplicate `global_influencers` entries.

| Field | Type | Description |
|-------|------|-------------|
| `profileId` | string | Reserved `global_influencers` doc ID |
| `userId` | string | Creating user |
| `primaryAccountKey` | string | `platform:username` key |
| `createdAt` | Timestamp | Lock creation time |

**Key files**: `app/api/profiles/route.ts`, `scripts/cleanup-duplicate-profiles.ts`

---

## Cache / Utility Collections

### 17. `username_resolution_cache`

**Purpose**: Performance cache for resolved usernames across platforms. Avoids redundant API calls when the same username is looked up repeatedly.

**Key files**: `lib/services/username-resolver.service.ts`

---

### 18. `influencer_profiles_complete`

**Purpose**: Complete profile data cache used by the enrichment pipeline. Stores fully-enriched profile snapshots.

**Key files**: `lib/services/profile-enricher.service.ts`, `lib/services/username-resolver.service.ts`

---

### 19. `saved_searches`

**Purpose**: Stores user's saved search queries for quick re-execution.

**Key files**: `docs/scripts/test-database-architecture.ts` (test/docs only - may not be in production use)

---

## Deprecated Collections

### 20. `unified_profiles` (DEPRECATED)

**Superseded by**: `global_influencers`
**Status**: No longer written to in active code paths. Still referenced in migration scripts and some enrichment routes.
**Action**: Safe to stop reading. Migrate any remaining references.

---

### 21. `influencer_detailed_data` (DEPRECATED)

**Superseded by**: Enrichment data embedded in `global_influencers`
**Status**: Only referenced in migration scripts and legacy profile detail route.

---

### 22. `content_posts` (DEPRECATED)

**Superseded by**: Posts array embedded in `global_influencers`
**Status**: Only referenced in migration scripts and legacy profile detail route.

---

### 23. `platform_profiles` (DEPRECATED)

**Status**: Minimal usage in `profile-matcher.service.ts`. Likely superseded by `global_influencers.linkedAccounts`.

---

### 24. `applications` (NAMING OVERLAP)

**Note**: Some routes use `applications` while others use `campaign_applications`. These may reference the same collection or represent a naming inconsistency that should be audited.
**Key files**: `app/api/campaigns/[id]/applications/route.ts`

---

## Summary

| Category | Collections | Status |
|----------|-------------|--------|
| **Auth & Users** | `users`, `influencer_profiles`, `brand_profiles` | Active |
| **Influencer Data** | `global_influencers`, `user_collections`, `creator_lists` | Active (primary) |
| **Campaigns** | `campaigns`, `campaign_applications`, `campaign_invitations`, `deliverable_submissions`, `campaign_notifications` | Active |
| **Payments** | `brand_wallets`, `wallet_transactions`, `creator_earnings`, `creator_withdrawals` | Active |
| **Infrastructure** | `profile_dedup_locks`, `username_resolution_cache`, `influencer_profiles_complete`, `saved_searches` | Active (utility) |
| **Deprecated** | `unified_profiles`, `influencer_detailed_data`, `content_posts`, `platform_profiles` | Deprecated |
| **Naming Overlap** | `applications` vs `campaign_applications` | Needs audit |

### Collection Count

- **Active**: 16 collections
- **Utility/Cache**: 4 collections
- **Deprecated**: 4 collections
- **Total**: 24 collections
