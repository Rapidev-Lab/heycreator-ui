# Hey Creator Platform — User Stories & Feature Inventory

**Last Updated**: March 4, 2026
**Platform**: Hey Creator — Influencer Discovery & Campaign Management
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Firebase (Auth + Firestore), Apify

---

## Platform Summary

| Metric | Count |
|--------|-------|
| Frontend Pages | 71 |
| UI Components | ~221 |
| API Routes | 70 |
| Firestore Collections | 14 |
| Services | 12 |
| Custom Hooks | 6 |
| Auth Providers | 4 (Email, Google, Facebook, Apple) |

### Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Fully Functional — frontend + backend wired and working |
| ⚠️ | Partial — UI exists, backend incomplete or data limited |
| 🔲 | Placeholder — page exists but shows "Coming Soon" or minimal content |

---

## 1. BRAND FEATURES

### 1.1 Authentication & Onboarding

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-AUTH-1 | As a brand, I can view a welcome page with feature highlights so that I understand the platform's value | ✅ | `/auth/brand/welcome` | — |
| B-AUTH-2 | As a brand, I can log in with email/password so that I can access my account | ✅ | `/auth/brand/login` | Firebase Auth SDK |
| B-AUTH-3 | As a brand, I can log in with Google, Facebook, or Apple so that I have quick access | ✅ | `/auth/brand/login` | Firebase Auth SDK (OAuth) |
| B-AUTH-4 | As a brand, I can sign up with a 3-step wizard (Account, Company, Social) so that my brand profile is complete | ✅ | `/auth/brand/signup/account`, `/auth/brand/signup/company`, `/auth/brand/signup/social`, `/auth/brand/signup/success` | Firebase Auth SDK, Firestore `users` + `brand_profiles` |
| B-AUTH-5 | As a brand, I can verify my email after signup so that my account is secured | ✅ | `/auth/brand/signup/verify-email`, `/auth/brand/signup/email-verified` | `POST /api/auth/resend-verification`, `POST /api/auth/check-email-verified` |
| B-AUTH-6 | As a brand, I can reset my password via email so that I can recover access | ✅ | `/auth/brand/forgot-password`, `/auth/brand/verify-code`, `/auth/brand/reset-password`, `/auth/brand/reset-success` | Firebase Auth SDK, `POST /api/auth/get-user-role-by-email` |
| B-AUTH-7 | As a brand, I am redirected to my role-specific login after email verification so that the experience is seamless | ✅ | `/auth/action` | `POST /api/auth/get-user-role-by-email` |
| B-AUTH-8 | As a brand, I must complete my profile before accessing the platform so that data quality is maintained | ✅ | `/auth/brand/complete-profile` | Firestore `users` + `brand_profiles` |

**Components**: `AuthLayout`, `AuthCard`, `Logo`, `InputField`, `PasswordInputField`, `PrimaryButton`, `SocialAuthButton`, `LinearProgressBar`, `SelectField`, `OTPInput`, `BrandWelcomeCard`, `BrandSuccessMessage`, `ErrorMessage`, `GoBackButton`, `AuthFooter`

---

### 1.2 Dashboard

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-DASH-1 | As a brand, I can see an overview with stats cards (active campaigns, total influencers, budget spent, total reach) so that I have a quick pulse on my activity | ✅ | `/brands/dashboard` | `GET /api/campaigns`, `GET /api/dashboard/stats` |
| B-DASH-2 | As a brand, I can see my top 4 campaigns with progress bars so that I can quickly navigate to active work | ✅ | `/brands/dashboard` | `GET /api/campaigns` |
| B-DASH-3 | As a brand, I can see pending actions (applications to review, content to approve) so that nothing falls through the cracks | ✅ | `/brands/dashboard` | `GET /api/notifications` |
| B-DASH-4 | As a brand, I can see recommended creators and bookmark or invite them to campaigns so that I discover talent passively | ✅ | `/brands/dashboard` | `GET /api/dashboard/recommended?limit=12`, `PATCH /api/profiles/{id}/star`, `POST /api/campaigns/{id}/invitations` |

**Components**: `CampaignListCard`, `RecommendedCreatorCard`, `CampaignSelectionModal`, `Sidebar`, `UserProfileHeader`

---

### 1.3 Discovery & Search

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-DISC-1 | As a brand, I can search for creators by keyword or topic so that I find relevant influencers | ✅ | `/brands/discover` | `GET /api/dashboard/recommended?limit=12` |
| B-DISC-2 | As a brand, I can toggle between Topic and Keyword search modes so that I can browse or search precisely | ✅ | `/brands/discover` | — |
| B-DISC-3 | As a brand, I can filter by platform (Instagram, TikTok, YouTube, Twitter, Facebook) so that I find creators on my target channels | ✅ | `/brands/discover/results` | `POST /api/discover/search/stream` |
| B-DISC-4 | As a brand, I can see streaming progressive results via SSE so that I get results immediately while more load | ✅ | `/brands/discover/results` | `POST /api/discover/search/stream` (SSE) |
| B-DISC-5 | As a brand, I can apply secondary filters (followers, engagement, true reach, location, verified) so that I narrow results to my criteria | ✅ | `/brands/discover/results` | `POST /api/discover/search/stream` |
| B-DISC-6 | As a brand, I can switch between grid and list views and sort by followers, engagement, name, cost, or relevance | ✅ | `/brands/discover/results` | — (client-side) |
| B-DISC-7 | As a brand, I can select multiple creators and coalate them into a unified profile so that I can save them | ✅ | `/brands/discover/results` | `POST /api/profiles` |
| B-DISC-8 | As a brand, I can toggle "Live Search" to force fresh data from social media APIs instead of cached database results | ✅ | `/brands/discover/results` | `POST /api/discover/search/stream` (with `live: true`) |
| B-DISC-9 | As a brand, I can browse top topics to discover creators in trending categories | ✅ | `/brands/discover` | — |
| B-DISC-10 | As a brand, creator profiles auto-save to Firestore when I click on them so that I build my database passively | ✅ | `/brands/discover/results` | `POST /api/profiles`, `POST /api/influencer/{id}/enrichment` |

**Components**: `DiscoveryHeader`, `SecondaryFilterBar`, `TopTopicsSection`, `RecommendedCreatorCard`, `FilterSidebar`, `ResultsHeader`, `ResultsGrid`

---

### 1.4 Campaign Management

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-CAMP-1 | As a brand, I can view all my campaigns with search, status/date filters, and pagination | ✅ | `/brands/campaigns` | `GET /api/campaigns` |
| B-CAMP-2 | As a brand, I can create a campaign via a 6-step wizard (Details, Product, Audience, Budget, Tasks, Review) | ✅ | `/brands/campaigns/create` | `POST /api/campaigns` |
| B-CAMP-3 | As a brand, I can upload media/documents to a campaign (PDF, DOC, images) | ✅ | `/brands/campaigns/create`, `/brands/campaigns/[id]/edit` | `POST /api/campaigns/{id}/documents`, Firebase Storage |
| B-CAMP-4 | As a brand, I can view my campaign dashboard with 4 tabs (Overview, Creators, Content, Analytics) | ✅ | `/brands/campaigns/[id]/dashboard` | `GET /api/campaigns/{id}`, `GET /api/deliverables?campaignId={id}` |
| B-CAMP-5 | As a brand, I can publish a draft campaign to make it visible in the marketplace | ✅ | `/brands/campaigns/[id]/dashboard` | `POST /api/campaigns/{id}/publish` |
| B-CAMP-6 | As a brand, I can edit an active campaign's details, budget, timeline, and targeting | ✅ | `/brands/campaigns/[id]/edit` | `PATCH /api/campaigns/{id}` |
| B-CAMP-7 | As a brand, I can review creator applications and accept or reject them | ✅ | `/brands/campaigns/[id]/dashboard` (Creators tab) | `GET /api/campaigns/{id}/applications`, `PATCH /api/campaigns/{id}/applications/{appId}` |
| B-CAMP-8 | As a brand, I can invite specific creators to my campaign | ✅ | `/brands/campaigns/[id]/dashboard` | `POST /api/campaigns/{id}/invitations` |
| B-CAMP-9 | As a brand, I can share a campaign link externally | ✅ | `/brands/campaigns/[id]/dashboard` | — (client-side copy) |
| B-CAMP-10 | As a brand, I can add screening questions (chip answers + open text) to filter applicants | ✅ | `/brands/campaigns/create` (Step 5) | `POST /api/campaigns` |

**Components**: `CampaignListTable`, `ProgressStepper`, `CampaignSelectionModal`, `TabsNavigation`, `OverviewTabContent`, `InfluencersTabContent`, `ContentTabContent`, `ReportTabContent`, `CampaignBriefModal`, `InviteCreatorsModal`, `ShareCampaignModal`, `DocumentUploadZone`, `DocumentList`, `Step1`–`Step6`

---

### 1.5 My Creators (Influencer Management)

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-CREAT-1 | As a brand, I can view all my saved creators in a searchable grid with filters | ✅ | `/brands/influencers` (My Creators tab) | `GET /api/brands/creators/global?limit=200` |
| B-CREAT-2 | As a brand, I can create custom lists to organize creators (e.g., "Beauty Influencers", "Q2 Campaign") | ✅ | `/brands/influencers` (My Lists tab) | `POST /api/brands/lists` |
| B-CREAT-3 | As a brand, I can add/remove creators from lists | ✅ | `/brands/influencers` (List Detail) | `POST /api/brands/creators/{id}/lists`, `DELETE /api/brands/lists/{id}/creators/{creatorId}` |
| B-CREAT-4 | As a brand, I can view AI-suggested creators based on my brand profile | ✅ | `/brands/influencers` (Suggestions tab) | `GET /api/brands/lists/{id}/suggestions` |
| B-CREAT-5 | As a brand, I can view list-level analytics for each creator collection | ✅ | `/brands/influencers` (List Detail) | `GET /api/brands/lists/{id}` |
| B-CREAT-6 | As a brand, I can export my creators as CSV | ✅ | `/brands/influencers` | `POST /api/brands/creators/export` |
| B-CREAT-7 | As a brand, I can bookmark/star individual creators from any page | ✅ | Multiple pages | `PATCH /api/profiles/{id}/star` |

**Components**: `MyCreatorsHeader`, `MyCreatorsTabs`, `MyCreatorsTab`, `MyListsTab`, `SuggestionsTab`, `ListDetailView`, `CreateListModal`, `AddToListModal`, `AddCreatorModal`, `CreatorCard`, `ListCard`

---

### 1.6 Influencer Profile (Brand View)

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-PROF-1 | As a brand, I can view a creator's Overview tab with avatar, bio, stats, insights, metrics table, and content grid | ✅ | `/brands/influencers/[id]` | `GET /api/influencer/{id}/enrichment` |
| B-PROF-2 | As a brand, I can view a creator's Content tab with filterable 4-column thumbnail grid and clickable links to original posts | ✅ | `/brands/influencers/[id]` (Content tab) | `GET /api/influencer/{id}/enrichment` |
| B-PROF-3 | As a brand, I can view estimated audience demographics (age, gender, geography) with an "Estimated" badge | ✅ | `/brands/influencers/[id]` (Demographics tab) | `GET /api/influencer/{id}/enrichment` |
| B-PROF-4 | As a brand, I can view per-platform analytics with engagement rates and follower counts | ✅ | `/brands/influencers/[id]` (Analytics tab) | `GET /api/influencer/{id}/enrichment` |
| B-PROF-5 | As a brand, I see real-time enrichment with stale data detection and auto background refresh | ✅ | `/brands/influencers/[id]` | `GET /api/influencer/{id}/enrichment` (TTL check), `POST /api/influencer/{id}/enrichment` (refresh) |
| B-PROF-6 | As a brand, I can view similar creators with real data from batch enrichment | ✅ | `/brands/influencers/[id]` (Overview tab) | `GET /api/influencer/{id}/enrichment` |
| B-PROF-7 | As a brand, I can add internal notes to a creator's profile for my team | ✅ | `/brands/influencers/[id]` (Overview tab) | Firestore `user_collections` |
| B-PROF-8 | As a brand, I can add a creator to a campaign or send them a message directly from their profile | ✅ | `/brands/influencers/[id]` | `POST /api/campaigns/{id}/invitations` |

**Components**: `ProfileHeader`, `ProfileSnapshot`, `InsightsCard`, `MetricsTable`, `ContentGrid`, `DemographicsSection`, `SimilarCreators`, `EnrichmentBanner`, `InternalNotes`

---

### 1.7 Brand Profile & Settings

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-SETT-1 | As a brand, I can view my company profile information in a read-only overview | ✅ | `/brands/profile` (Overview tab) | Firestore `brand_profiles` |
| B-SETT-2 | As a brand, I can edit my company info (name, website, industry, size, role, social links, photo) | ✅ | `/brands/profile` (Settings tab) | Firestore `users` + `brand_profiles` (direct SDK) |
| B-SETT-3 | As a brand, I can see my profile completion percentage | ✅ | `/brands/profile` | — (client-side calculation) |

**Components**: `ProtectedRoute`, `EmailVerificationGuard`, `ProfileCompletionGuard`

---

### 1.8 Notifications

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-NOTIF-1 | As a brand, I can view all my notifications with type-specific icons and colors | ✅ | `/brands/notifications` | `GET /api/notifications?limit=50` |
| B-NOTIF-2 | As a brand, I can filter between All and Unread notifications | ✅ | `/brands/notifications` | `GET /api/notifications` |
| B-NOTIF-3 | As a brand, I can mark individual notifications as read | ✅ | `/brands/notifications` | `PATCH /api/notifications/{id}` |
| B-NOTIF-4 | As a brand, I can bulk "Mark all as read" | ✅ | `/brands/notifications` | `POST /api/notifications/mark-all-read` |
| B-NOTIF-5 | As a brand, I can dismiss individual notifications | ✅ | `/brands/notifications` | `DELETE /api/notifications/{id}` |

---

### 1.9 Analytics

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| B-ANAL-1 | As a brand, I can view campaign analytics with recent campaign data | ⚠️ | `/brands/analytics` (Analytics tab) | `GET /api/campaigns`, `GET /api/brands/analytics/top-content` |
| B-ANAL-2 | As a brand, I can view and manage saved reports | ⚠️ | `/brands/analytics` (Saved Reports tab) | — |

**Note**: UI framework exists with `AnalyticsMainContent` and `SavedReportsTabContent` components. Fetches campaign data but chart visualizations are incomplete.

---

### 1.10 Placeholder Pages

| Page | Route | Current State |
|------|-------|---------------|
| Chats / Messages | `/brands/chats` | 🔲 "Coming Soon" placeholder |
| Monitor | `/brands/monitor` | 🔲 Feature preview placeholder |
| Recruit | `/brands/recruit` | 🔲 Feature preview placeholder |
| Pending Actions | `/brands/actions` | ⚠️ UI table exists, API partially wired |

---

## 2. INFLUENCER FEATURES

### 2.1 Authentication & Onboarding

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-AUTH-1 | As an influencer, I can view a welcome/onboarding screen so that I understand the platform | ✅ | `/auth/influencer/welcome` | — |
| I-AUTH-2 | As an influencer, I can log in with email/password | ✅ | `/auth/influencer/login` | Firebase Auth SDK |
| I-AUTH-3 | As an influencer, I can log in with Google, Facebook, or Apple | ✅ | `/auth/influencer/login` | Firebase Auth SDK (OAuth) |
| I-AUTH-4 | As an influencer, I can sign up with email and create my account | ✅ | `/auth/influencer/signup/email` | Firebase Auth SDK, Firestore `users` |
| I-AUTH-5 | As an influencer, I can verify my email to activate my account | ✅ | `/auth/influencer/signup/verify-email`, `/auth/influencer/signup/email-verified` | `POST /api/auth/resend-verification` |
| I-AUTH-6 | As an influencer, I can verify my social media accounts (Instagram, TikTok, etc.) | ✅ | `/auth/influencer/verify/social`, `/auth/influencer/verify/success` | — |
| I-AUTH-7 | As an influencer, I can reset my password if I forget it | ✅ | `/auth/influencer/forgot-password`, `/auth/influencer/reset-password`, `/auth/influencer/reset-success` | Firebase Auth SDK |
| I-AUTH-8 | As an influencer, I must complete my profile before accessing the platform | ✅ | `/auth/influencer/complete-profile` | Firestore `users` + `influencer_profiles` |

**Components**: `AuthLayout`, `AuthCard`, `Logo`, `InputField`, `PasswordInputField`, `PrimaryButton`, `SocialAuthButton`, `ProgressDots`, `SuccessMessage`, `ErrorMessage`, `GoBackButton`

---

### 2.2 Dashboard

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-DASH-1 | As an influencer, I can see a welcome greeting with 4 stats (Active Campaigns, Pending Bids, Total Earnings, Success Rate) | ✅ | `/influencers` | `GET /api/influencers/applications` |
| I-DASH-2 | As an influencer, I can see my active campaigns (limit 3) so that I track current work | ✅ | `/influencers` | `GET /api/influencers/applications` (status: accepted) |
| I-DASH-3 | As an influencer, I can see pending applications (limit 3) so that I follow up | ✅ | `/influencers` | `GET /api/influencers/applications` (status: pending) |
| I-DASH-4 | As an influencer, I can see recommended campaigns matched to my profile | ✅ | `/influencers` | `GET /api/influencers/campaigns/marketplace?limit=4&sortBy=latest` |

**Components**: `InfluencerStatsCard`, `RecommendedCardSkeleton`, `StatsCardSkeleton`, `CampaignCardSkeleton`

---

### 2.3 Campaign Marketplace

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-MKTPL-1 | As an influencer, I can browse available campaigns in grid or list view | ✅ | `/influencers/marketplace` | `GET /api/influencers/campaigns/marketplace` |
| I-MKTPL-2 | As an influencer, I can filter campaigns by platform, category, and budget range | ✅ | `/influencers/marketplace` | `GET /api/influencers/campaigns/marketplace` (query params) |
| I-MKTPL-3 | As an influencer, I can search and sort campaigns (Relevance, Latest, Budget, Ending Soon) | ✅ | `/influencers/marketplace`, `/influencers/marketplace/search` | `GET /api/influencers/campaigns/marketplace` |
| I-MKTPL-4 | As an influencer, I can save campaigns to view later | ✅ | `/influencers/marketplace` | `POST /api/influencers/campaigns/saved` |
| I-MKTPL-5 | As an influencer, I can view a full campaign brief (timeline, deliverables, guidelines, do's/don'ts, screening questions) | ✅ | `/influencers/marketplace/[id]` | `GET /api/influencers/campaigns/[id]` |
| I-MKTPL-6 | As an influencer, I can apply to a campaign with a pitch message, proposed rate, and screening question answers | ✅ | `/influencers/marketplace/[id]` | `POST /api/influencers/campaigns/[id]/apply` |
| I-MKTPL-7 | As an influencer, I see a success confirmation after applying | ✅ | `/influencers/marketplace/[id]` (modal) | — |

**Components**: `MarketplaceCampaignCard`, `CampaignFilterSidebar`, `ApplicationModal`

---

### 2.4 My Campaigns

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-CAMP-1 | As an influencer, I can view my campaigns organized by tabs (Active, Applications, Saved, Completed) | ✅ | `/influencers/campaigns` | `GET /api/influencers/applications` |
| I-CAMP-2 | As an influencer, I can view campaign details with 5 tabs (Overview, Content, Brief, Payments, Analytics) | ✅ | `/influencers/campaigns/[id]` | `GET /api/influencers/campaigns/[id]`, `GET /api/influencers/campaigns/[id]/deliverables` |
| I-CAMP-3 | As an influencer, I can submit content for a campaign deliverable (URL, caption, hashtags, screenshot) | ✅ | `/influencers/campaigns/[id]/submit-content` | `POST /api/influencers/campaigns/[id]/submit-content` |
| I-CAMP-4 | As an influencer, I can search and filter within my campaigns | ✅ | `/influencers/campaigns` | — (client-side) |
| I-CAMP-5 | As an influencer, I can view my saved campaigns from the marketplace | ✅ | `/influencers/campaigns` (Saved tab) | `GET /api/influencers/campaigns/saved` |

**Components**: `ActiveCampaignsTab`, `ApplicationsTableTab`, `SavedCampaignsTab`, `CompletedCampaignsTab`, `CampaignOverviewTab`, `CampaignContentTab`, `CampaignBriefTab`, `CampaignPaymentsTab`, `CampaignAnalyticsTab`, `TasksDeliverablesModal`, `ReviewCampaignDeliverableModal`

---

### 2.5 Applications

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-APP-1 | As an influencer, I can see application stats (Total, Pending, Accepted, Success Rate) | ✅ | `/influencers/campaign-applications` | `GET /api/influencers/applications?limit=50` |
| I-APP-2 | As an influencer, I can search and filter applications by status (All, Pending, Accepted, Withdrawn, Declined) | ✅ | `/influencers/campaign-applications` | `GET /api/influencers/applications` |
| I-APP-3 | As an influencer, I can sort applications (Latest, Oldest, Budget) | ✅ | `/influencers/campaign-applications` | — (client-side) |
| I-APP-4 | As an influencer, I can withdraw a pending application | ✅ | `/influencers/campaign-applications` | `DELETE /api/influencers/applications/[id]` |

**Components**: `CampaignApplicationCard`, `WithdrawalModal`

---

### 2.6 Invitations

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-INV-1 | As an influencer, I can view campaign invitations from brands | ✅ | `/influencers/invitations` | `GET /api/influencers/invitations` |
| I-INV-2 | As an influencer, I can accept or decline an invitation | ✅ | `/influencers/invitations` | `PATCH /api/influencers/invitations/[id]` |
| I-INV-3 | As an influencer, I can preview campaign details from the invitation | ✅ | `/influencers/invitations` | — (denormalized data in invitation doc) |

---

### 2.7 Notifications

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-NOTIF-1 | As an influencer, I can view all notifications with type-specific icons (application updates, messages, deadlines, approvals, payments) | ✅ | `/influencers/notifications` | `GET /api/notifications?limit=50` |
| I-NOTIF-2 | As an influencer, I can filter between All and Unread notifications | ✅ | `/influencers/notifications` | `GET /api/notifications` |
| I-NOTIF-3 | As an influencer, I can mark individual notifications as read | ✅ | `/influencers/notifications` | `PATCH /api/notifications/{id}` |
| I-NOTIF-4 | As an influencer, I can bulk "Mark all as read" | ✅ | `/influencers/notifications` | `POST /api/notifications/mark-all-read` |
| I-NOTIF-5 | As an influencer, I can click a notification to navigate to the relevant page | ✅ | `/influencers/notifications` | — (client-side navigation) |

---

### 2.8 My Profile

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-PROF-1 | As an influencer, I can view my profile overview with enriched data (stats, insights, metrics, demographics, similar creators) | ✅ | `/influencers/profile` (Overview tab) | `GET /api/influencer/my-profile`, `GET /api/influencer/profiles/[id]/enrichment` |
| I-PROF-2 | As an influencer, I can edit my profile settings (bio, location, categories, social accounts, rates) | ✅ | `/influencers/profile` (Settings tab) | `POST /api/influencer/my-profile`, `POST /api/influencer/my-profile/link-account` |
| I-PROF-3 | As an influencer, stale profile data is auto-refreshed in the background so my stats stay current | ✅ | `/influencers/profile` | `GET /api/influencer/profiles/[id]/enrichment` (TTL), `POST /api/influencer/profiles/[id]/enrichment` |
| I-PROF-4 | As an influencer, I can see clickable links to my original posts on each platform | ✅ | `/influencers/profile` (Content section) | `GET /api/influencer/profiles/[id]/enrichment` |

**Components**: `CreatorProfileCard`, `ProfileSnapshot`, `InsightsCard`, `MetricsTable`, `ContentGrid`, `DemographicsSection`, `SimilarCreators`, `SettingsTab`, `EnrichmentBanner`

---

### 2.9 Calendar

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-CAL-1 | As an influencer, I can view a calendar with month/week/day views to see my schedule | ⚠️ | `/influencers/calendar` | — (mock data only) |
| I-CAL-2 | As an influencer, I can see upcoming events in a sidebar with type-coded indicators (Campaign, Meeting, Deadline, Post) | ⚠️ | `/influencers/calendar` | — (mock data only) |

**Note**: Full calendar UI implemented (362 lines, month/week/day views, color-coded events). No API integration yet — uses hardcoded mock events.

---

### 2.10 Content Submission

| # | User Story | Status | Pages | API Endpoints |
|---|-----------|--------|-------|---------------|
| I-CONT-1 | As an influencer, I can select a deliverable type and platform when submitting content | ✅ | `/influencers/campaigns/[id]/submit-content` | `POST /api/influencers/campaigns/[id]/submit-content` |
| I-CONT-2 | As an influencer, I can provide a content URL, caption, and hashtags for my submission | ✅ | `/influencers/campaigns/[id]/submit-content` | `POST /api/influencers/campaigns/[id]/submit-content` |
| I-CONT-3 | As an influencer, I can upload a screenshot of my posted content | ✅ | `/influencers/campaigns/[id]/submit-content` | Firebase Storage |

---

### 2.11 Placeholder Pages

| Page | Route | Current State |
|------|-------|---------------|
| Analytics | `/influencers/analytics` | 🔲 "Coming Soon" — performance analytics planned |
| Chats | `/influencers/chats` | 🔲 "Coming Soon" — direct messaging with brands planned |

---

## 3. SHARED / INFRASTRUCTURE FEATURES

### 3.1 Authentication System

| Feature | Status | Details |
|---------|--------|---------|
| Firebase Auth (Email/Password) | ✅ | Full signup, login, verification |
| Google OAuth | ✅ | Sign in with Google |
| Facebook OAuth | ✅ | Sign in with Facebook |
| Apple OAuth | ✅ | Sign in with Apple |
| Instagram OAuth | ✅ | Callback at `/auth/instagram/callback` |
| Role-based routing | ✅ | Brand vs Influencer with separate layouts |
| Auth guards | ✅ | `EmailVerificationGuard`, `ProfileCompletionGuard` |
| Auth middleware (API) | ✅ | `requireAuth()`, `requireBrandRole()`, `requireCreatorRole()` |
| Mock mode auth | ✅ | Full mock auth context with auto-login |

### 3.2 Data Pipeline

| Feature | Status | Details |
|---------|--------|---------|
| Hybrid search (DB + live APIs) | ✅ | Firestore first, then live social media APIs if < 10 results |
| Per-platform waterfall search | ✅ | Instagram (3 steps), Twitter (3), TikTok (3), Facebook (2), YouTube (1) |
| SSE streaming results | ✅ | Progressive phases: DB → Fast APIs → Apify fallbacks → Enrichment |
| Profile enrichment (8+ methods) | ✅ | Demographics, brand affinity, interests, locations, similar creators |
| Demographics inference | ✅ | Age, gender, geography from bio/posts (heuristic, marked "Estimated") |
| TTL-based staleness | ✅ | Platform-specific TTLs (7 days IG/TikTok/YT/FB, 3 days Twitter) |
| In-memory caching | ✅ | Cache manager with TTL for enrichment data |
| Image proxy | ✅ | 2-stage fallback: direct fetch → weserv.nl proxy, 24h cache |

### 3.3 Mock Mode Infrastructure

| Feature | Status | Details |
|---------|--------|---------|
| Mock Firestore | ✅ | In-memory with full query support (where, orderBy, limit, offset) |
| Mock Auth | ✅ | 2 pre-configured users (brand + influencer) with auto-login |
| Mock seed data | ✅ | 9 collections auto-seeded (users, campaigns, influencers, applications, etc.) |
| JSON persistence | ✅ | Mock data persists to `mock-data/*.json` across hot reloads |
| Mock Admin SDK | ✅ | Token verification parses `mock-token-{uid}` format |

### 3.4 API Documentation

| Feature | Status | Details |
|---------|--------|---------|
| OpenAPI 3.0.3 specification | ✅ | `public/openapi.json` — 1,657 lines, 38+ endpoints |
| Interactive API reference | ✅ | Scalar at `/api-docs` |
| Security schemes documented | ✅ | Firebase Bearer token in `securitySchemes` |

---

## Appendix A: Complete Page Inventory

### Auth Pages (29)

| Route | Role | Status |
|-------|------|--------|
| `/` | Shared | ✅ Role selection |
| `/auth/action` | Shared | ✅ Email verification handler |
| `/auth/reset-password` | Shared | ✅ Universal password reset router |
| `/auth/otp` | Shared | ✅ Phone OTP verification |
| `/auth/complete-profile` | Shared | ✅ Profile completion |
| `/auth/instagram/callback` | Shared | ✅ Instagram OAuth callback |
| `/auth/brand/welcome` | Brand | ✅ |
| `/auth/brand/login` | Brand | ✅ |
| `/auth/brand/signup/account` | Brand | ✅ Step 1/3 |
| `/auth/brand/signup/company` | Brand | ✅ Step 2/3 |
| `/auth/brand/signup/social` | Brand | ✅ Step 3/3 |
| `/auth/brand/signup/email` | Brand | ✅ |
| `/auth/brand/signup/verify-email` | Brand | ✅ |
| `/auth/brand/signup/email-verified` | Brand | ✅ |
| `/auth/brand/signup/success` | Brand | ✅ |
| `/auth/brand/complete-profile` | Brand | ✅ |
| `/auth/brand/forgot-password` | Brand | ✅ |
| `/auth/brand/verify-code` | Brand | ✅ |
| `/auth/brand/reset-password` | Brand | ✅ |
| `/auth/brand/reset-success` | Brand | ✅ |
| `/auth/influencer/login` | Influencer | ✅ |
| `/auth/influencer/signup/email` | Influencer | ✅ |
| `/auth/influencer/signup/verify-email` | Influencer | ✅ |
| `/auth/influencer/signup/email-verified` | Influencer | ✅ |
| `/auth/influencer/verify/social` | Influencer | ✅ |
| `/auth/influencer/verify/success` | Influencer | ✅ |
| `/auth/influencer/complete-profile` | Influencer | ✅ |
| `/auth/influencer/forgot-password` | Influencer | ✅ |
| `/auth/influencer/reset-password` | Influencer | ✅ |

### Brand Pages (15+)

| Route | Status | Description |
|-------|--------|-------------|
| `/brands/dashboard` | ✅ | Main dashboard with stats, campaigns, actions, recommendations |
| `/brands/discover` | ✅ | Discovery search with topic/keyword toggle |
| `/brands/discover/results` | ✅ | SSE streaming results with filters and coalation |
| `/brands/influencers` | ✅ | My Creators (3 tabs: Creators, Lists, Suggestions) |
| `/brands/influencers/[id]` | ✅ | Creator profile (4 tabs) |
| `/brands/campaigns` | ✅ | Campaign list with search/filters |
| `/brands/campaigns/create` | ✅ | 6-step campaign wizard |
| `/brands/campaigns/[id]/dashboard` | ✅ | Campaign dashboard (4 tabs) |
| `/brands/campaigns/[id]/edit` | ✅ | Edit campaign |
| `/brands/profile` | ✅ | Brand profile settings |
| `/brands/notifications` | ✅ | Full notification center |
| `/brands/actions` | ⚠️ | Pending actions (partial) |
| `/brands/analytics` | ⚠️ | Analytics (partial — data fetching but charts incomplete) |
| `/brands/chats` | 🔲 | Coming Soon |
| `/brands/settings` | ✅ | Redirects to profile settings |

### Influencer Pages (15+)

| Route | Status | Description |
|-------|--------|-------------|
| `/influencers` | ✅ | Dashboard with stats, campaigns, applications |
| `/influencers/marketplace` | ✅ | Campaign marketplace browse |
| `/influencers/marketplace/[id]` | ✅ | Campaign brief with apply |
| `/influencers/marketplace/search` | ✅ | Search results page |
| `/influencers/campaigns` | ✅ | My Campaigns (4 tabs) |
| `/influencers/campaigns/[id]` | ✅ | Campaign detail (5 tabs) |
| `/influencers/campaigns/[id]/submit-content` | ✅ | Content submission form |
| `/influencers/campaign-applications` | ✅ | Applications with stats and filters |
| `/influencers/invitations` | ✅ | Brand invitations list |
| `/influencers/notifications` | ✅ | Full notification center |
| `/influencers/profile` | ✅ | Profile with overview and settings |
| `/influencers/calendar` | ⚠️ | Calendar UI (mock data) |
| `/influencers/analytics` | 🔲 | Coming Soon |
| `/influencers/chats` | 🔲 | Coming Soon |
| `/influencers/settings` | ✅ | Redirects to profile settings |

### Utility Pages

| Route | Status | Description |
|-------|--------|-------------|
| `/apply/[campaignId]` | ✅ | External campaign application link |
| `/privacy` | ✅ | Privacy policy |
| `/terms` | ✅ | Terms of service |
| `/data-deletion` | ✅ | Data deletion request |
| `/unauthorized` | ✅ | 403 error page |
| `/api-docs` | ✅ | Scalar API documentation |

---

## Appendix B: Complete API Route Inventory

### Authentication (7 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/check-email-status` | No | Check if email exists and is verified |
| POST | `/api/auth/check-email-verified` | No | Verify email verification status |
| POST | `/api/auth/resend-verification` | No | Resend verification email |
| POST | `/api/auth/get-user-role-by-email` | No | Get user role for password reset routing |
| POST | `/api/auth/update-email` | Yes | Update user email |
| POST | `/api/auth/instagram/callback` | Yes | Instagram OAuth callback |
| POST | `/api/auth/instagram/refresh-token` | Yes | Refresh Instagram token |

### Campaigns (14 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/campaigns` | Brand | List brand's campaigns |
| POST | `/api/campaigns` | Brand | Create new campaign |
| GET | `/api/campaigns/[id]` | Brand | Get campaign details |
| PATCH | `/api/campaigns/[id]` | Brand | Update campaign |
| DELETE | `/api/campaigns/[id]` | Brand | Delete campaign |
| POST | `/api/campaigns/[id]/publish` | Brand | Publish draft campaign |
| GET | `/api/campaigns/[id]/applications` | Brand | List applications |
| PATCH | `/api/campaigns/[id]/applications/[appId]` | Brand | Review application |
| POST | `/api/campaigns/[id]/invitations` | Brand | Send invitation |
| GET | `/api/campaigns/[id]/invitations` | Brand | List invitations |
| GET | `/api/campaigns/[id]/documents` | Brand | List documents |
| POST | `/api/campaigns/[id]/documents` | Brand | Upload document |
| DELETE | `/api/campaigns/[id]/documents/[docId]` | Brand | Delete document |
| GET | `/api/deliverables` | Brand | List deliverables |

### Discovery & Search (4 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/discover/search/stream` | Yes | SSE streaming search |
| POST | `/api/search` | Yes | Direct search (legacy) |
| GET | `/api/search/realtime` | Yes | Real-time search |
| GET | `/api/search/realtime-stream` | Yes | Real-time stream |

### Profiles & Enrichment (9 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/influencer/profiles` | Yes | List all profiles |
| GET | `/api/influencer/profiles/[id]` | Yes | Get profile details |
| GET | `/api/influencer/profiles/[id]/enrichment` | Yes | Get enriched data |
| POST | `/api/influencer/profiles/[id]/enrichment` | Yes | Trigger enrichment |
| GET | `/api/influencer/my-profile` | Influencer | Get own profile |
| POST | `/api/influencer/my-profile` | Influencer | Update own profile |
| POST | `/api/influencer/my-profile/link-account` | Influencer | Link social account |
| GET | `/api/profiles` | Yes | Get unified profiles |
| POST | `/api/profiles` | Yes | Create unified profile |

### Influencer Marketplace (8 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/influencers/campaigns/marketplace` | Yes | Browse public campaigns |
| GET | `/api/influencers/campaigns/[id]` | Yes | Campaign details |
| POST | `/api/influencers/campaigns/[id]/apply` | Influencer | Apply to campaign |
| POST | `/api/influencers/campaigns/[id]/submit-content` | Influencer | Submit deliverable |
| GET | `/api/influencers/applications` | Influencer | List applications |
| DELETE | `/api/influencers/applications/[id]` | Influencer | Withdraw application |
| GET | `/api/influencers/campaigns/saved` | Influencer | List saved campaigns |
| POST | `/api/influencers/campaigns/saved` | Influencer | Save campaign |

### Brand Creators (8 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/brands/creators/global` | Brand | List all global influencers |
| GET | `/api/brands/creators/[id]` | Brand | Get single creator |
| POST | `/api/brands/creators/export` | Brand | Export creators CSV |
| GET | `/api/brands/lists` | Brand | List creator lists |
| POST | `/api/brands/lists` | Brand | Create list |
| PATCH | `/api/brands/lists/[id]` | Brand | Update list |
| DELETE | `/api/brands/lists/[id]` | Brand | Delete list |
| GET | `/api/brands/lists/[id]/suggestions` | Brand | Get list suggestions |

### Invitations & Notifications (5 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/influencers/invitations` | Influencer | List invitations |
| PATCH | `/api/influencers/invitations/[id]` | Influencer | Respond to invitation |
| GET | `/api/notifications` | Yes | List notifications |
| PATCH | `/api/notifications/[id]` | Yes | Mark as read |
| POST | `/api/notifications/mark-all-read` | Yes | Bulk mark read |

### Dashboard & Analytics (4 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard/stats` | Brand | Dashboard statistics |
| GET | `/api/dashboard/recommended` | Brand | Recommended creators |
| GET | `/api/brands/analytics/top-content` | Brand | Top performing content |
| PATCH | `/api/profiles/[id]/star` | Brand | Toggle bookmark |

### Utility (4 routes)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/image-proxy` | No | Proxy external images |
| POST | `/api/metrics` | Yes | Calculate metrics |
| POST | `/api/pricing` | Yes | Pricing calculator |
| POST | `/api/save-apify-data` | Yes | Save Apify enrichment data |

---

## Appendix C: Firestore Collection Map

| Collection | Purpose | Mock Seed Count | Used By |
|------------|---------|-----------------|---------|
| `users` | Auth profiles (UID, email, role) | 2 | Auth, all pages |
| `brand_profiles` | Brand company info | 2 | Brand profile, signup |
| `influencer_profiles` | Creator profile data | 2 | Influencer profile |
| `campaigns` | Campaign definitions | 3 | Campaign CRUD, marketplace |
| `campaign_applications` | Creator applications | 4 | Applications, reviews |
| `campaign_invitations` | Brand invitations | 0 | Invitations |
| `campaign_documents` | Campaign files | 0 | Document management |
| `deliverables` | Content submissions | 0 | Content tab, submissions |
| `global_influencers` | Unified creator database | 10+ | Discovery, search, profiles |
| `user_collections` | Per-user saved/starred | 3 | Bookmarks, lists |
| `creator_lists` | Custom creator lists | 0 | My Creators, lists |
| `notifications` | Push notification queue | 5 | Notification center |
| `profile_dedup_locks` | Atomic dedup mechanism | 0 | Profile creation |
| `content_posts` | Scraped social media posts | 0 | Content grid |
