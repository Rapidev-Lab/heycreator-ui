# GEMINI.md - Project Context & Documentation

> **Purpose**: This document provides comprehensive context for AI assistants to understand and work on this project effectively at any time.

## Project Overview

**Project Name**: Hey Creator - Influencer Discovery Platform
**Type**: Next.js Web Application
**Status**: Hybrid Search Complete | Streaming Discovery with Enrichment Pipeline | Demographics Enrichment & Data Sync | Firestore Consolidated (global_influencers) | Profile Page Redesigned (Figma Match) | Avatar Proxy Fixed | Firebase Auth Integrated (Email/Password, Google, Facebook, Apple) | API Routes Complete | API Documentation Complete (Scalar + OpenAPI) | Campaign Management (Creation, Marketplace, Applications, Notifications)
**Created**: November 2025
**Last Updated**: February 18, 2026
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Lucide React, Axios, Apify Client, Firebase (Auth & Firestore), Scalar (API Docs)

### What This Project Does
Hey Creator is an influencer discovery and management platform that allows users to:
- Search for influencers across multiple social media platforms using a live API with an intelligent per-platform waterfall strategy.
- View detailed influencer profiles with comprehensive analytics (real data from Apify enrichment).
- Analyze audience demographics, engagement metrics, and content performance.
- Discover similar influencers and manage campaigns.

## Project Architecture

### Tech Stack Details
```
Framework:     Next.js 14 (App Router)
Language:      TypeScript (Strict Mode)
Styling:       Tailwind CSS
Icons:         Lucide React
HTTP Client:   Axios, Apify Client
State:         React Hooks (useState, useMemo), Auth Context
Database:      Firebase Firestore (production-ready)
Auth:          Firebase Authentication (Email/Password, Google, Facebook, Apple)
Admin SDK:     Firebase Admin SDK (for migrations and server-side operations)
Data:          Live API Search Results & Firestore Database
Migration:     Complete system to migrate mock data to Firestore
```

### Directory Structure
```
discovery-influencers/
├── app/
│   ├── api/
│   │   ├── auth/                # ✅ Authentication API routes
│   │   │   ├── check-email-status/route.ts    # Check if email exists and is verified
│   │   │   ├── check-email-verified/route.ts  # Verify email verification status
│   │   │   ├── get-user-role-by-email/route.ts # Get user role for password reset
│   │   │   └── resend-verification/route.ts   # Resend verification email
│   │   ├── image-proxy/
│   │   │   └── route.ts         # Image proxy API route to bypass CORS
│   │   ├── discover/
│   │   │   └── search/
│   │   │       └── stream/
│   │   │           └── route.ts     # SSE streaming discovery search with enrichment
│   │   ├── search/
│   │   │   └── route.ts         # API route for influencer search
│   │   ├── influencer/
│   │   │   └── profiles/
│   │   │       ├── route.ts     # ✅ Fetch all influencer profiles from Firestore
│   │   │       └── [id]/route.ts # ✅ Fetch single profile with full details
│   │   └── profiles/
│   │       └── route.ts         # ✅ UPDATED: Create/get unified profiles (Firestore-backed)
│   ├── api-docs/
│   │   └── route.ts             # ✅ Interactive API reference (Scalar + OpenAPI 3.0.3)
│   ├── auth/                    # Authentication pages
│   │   ├── action/page.tsx      # ✅ Firebase email verification & password reset handler (role-aware)
│   │   ├── reset-password/page.tsx  # ✅ Unified password reset entry (detects role, redirects)
│   │   ├── influencer/          # Influencer auth flow (7 pages)
│   │   │   ├── welcome/page.tsx     # Welcome/onboarding screen
│   │   │   ├── login/page.tsx       # Login and signup screen (✅ contextual errors)
│   │   │   ├── signup/
│   │   │   │   ├── email/page.tsx   # Email signup form
│   │   │   │   └── success/page.tsx # Signup success screen
│   │   │   ├── verify/
│   │   │   │   ├── social/page.tsx  # Social verification screen
│   │   │   │   └── success/page.tsx # Verification success screen
│   │   │   ├── external-auth/page.tsx # External auth prompt
│   │   │   ├── forgot-password/page.tsx  # Request password reset
│   │   │   ├── reset-password/page.tsx   # Set new password
│   │   │   └── reset-success/page.tsx    # Password reset confirmation
│   │   └── brand/               # Brand auth flow (10 pages) ✅ COMPLETE
│   │       ├── welcome/page.tsx      # Welcome with feature highlights
│   │       ├── login/page.tsx        # Login with social auth (✅ contextual errors)
│   │       ├── signup/
│   │       │   ├── account/page.tsx  # Step 1: Account details
│   │       │   ├── company/page.tsx  # Step 2: Company info
│   │       │   ├── social/page.tsx   # Step 3: Social media links
│   │       │   └── success/page.tsx  # Signup success
│   │       ├── forgot-password/page.tsx  # Request password reset
│   │       ├── verify-code/page.tsx      # Enter 6-digit OTP
│   │       ├── reset-password/page.tsx   # Set new password
│   │       └── reset-success/page.tsx    # Password reset confirmation
│   ├── influencers/
│   │   ├── [id]/
│   │   │   └── page.tsx         # Dynamic profile page (main feature)
│   │   └── page.tsx             # Influencer list page
│   ├── layout.tsx
│   ├── page.tsx                 # REFACTORED: Role selection (Influencer vs Brand)
│   └── globals.css
├── components/
│   ├── auth/                    # Authentication UI components (22 components)
│   │   ├── index.ts             # Component exports
│   │   ├── AuthLayout.tsx       # Page wrapper
│   │   ├── AuthCard.tsx         # Content container
│   │   ├── Logo.tsx             # Branding (supports custom SVG via 'src' prop, defaults to /logo.svg)
│   │   ├── InputField.tsx       # Text input with icon
│   │   ├── PasswordInputField.tsx # Password with visibility toggle
│   │   ├── PhoneNumberInput.tsx # Phone with country code
│   │   ├── TabSelector.tsx      # Multi-option toggle
│   │   ├── PrimaryButton.tsx    # Primary action button
│   │   ├── SocialAuthButton.tsx # Social login buttons
│   │   ├── OutlineButton.tsx    # Secondary button
│   │   ├── GoBackButton.tsx     # Back navigation
│   │   ├── ProgressDots.tsx     # Step indicator (for influencers)
│   │   ├── DividerWithText.tsx  # Section divider
│   │   ├── SuccessMessage.tsx   # Success display (for influencers)
│   │   ├── ErrorMessage.tsx     # Error display
│   │   ├── ExternalAuthPrompt.tsx # Auth prompt
│   │   ├── AuthFooter.tsx       # Terms footer
│   │   ├── LinearProgressBar.tsx # Horizontal progress bar (for brands)
│   │   ├── SelectField.tsx      # Dropdown with icon (for brands)
│   │   ├── OTPInput.tsx         # 6-digit verification code input (for brands)
│   │   ├── BrandWelcomeCard.tsx # Feature highlight card (for brands)
│   │   └── BrandSuccessMessage.tsx # Success with "What's Next?" (for brands)
│   ├── Header.tsx
│   ├── InfluencerCard.tsx
│   ├── InfluencersToolbar.tsx
│   ├── RoleCard.tsx             # NEW: Role selection card for homepage
│   ├── SearchBar.tsx            # Search UI, triggers API call
│   ├── SocialIcons.tsx
│   └── Tooltip.tsx
├── data/
│   └── mockInfluencers.ts       # Mock data for profiles & initial view
├── docs/                        # Project documentation
│   ├── AUTH.MD                  # Authentication UI design plan
│   ├── AUTH_IMPLEMENTATION.md   # Auth system implementation details
│   ├── AUTH_QUICKSTART.md       # Auth quick start guide
│   ├── AUTH_SYSTEM_COMPLETE.md  # ✅ Complete auth documentation (18,000+ words, Dec 8, 2025)
│   ├── BRAND_AUTH_PLAN.md       # Brand authentication flow plan
│   ├── ROUTE_RESTRUCTURE_PLAN.md # Route refactor plan
│   ├── FIREBASE_PHASES.MD       # Firebase integration phases plan
│   ├── FIRESTORE_MIGRATION_PLAN.md # Complete Firestore migration guide (1,250+ lines)
│   ├── MIGRATION_QUICKSTART.md  # 30-minute migration setup guide
│   ├── MIGRATION_NEXT_STEPS.md  # Current migration instructions
│   ├── HYBRID_SEARCH.md         # ✅ NEW: Hybrid search implementation guide (Feb 3, 2026)
│   └── SLAB_API_DOCS_PROCESS.md # ✅ NEW: API documentation process (for Slab, Feb 2026)
├── lib/
│   ├── apify/                   # Apify-related configuration and utilities
│   │   ├── config.ts            # Apify client setup, actor IDs, config
│   │   ├── monitoring.ts        # Apify scraping monitoring
│   │   ├── retry.ts             # Apify retry logic and rate limiter
│   │   └── scraper-utils.ts     # Apify input builders and query normalization
│   ├── firebase/                # ✅ NEW: Firebase configuration and utilities
│   │   ├── config.ts            # Firebase client-side configuration
│   │   ├── admin.ts             # Firebase Admin SDK setup (server-side)
│   │   └── auth-actions.ts      # Authentication functions (signIn, signUp, etc.)
│   ├── config.ts                # Loads and structures environment variables
│   ├── utils.ts                 # General utility functions (e.g., proxyImage)
│   └── services/
│       ├── aggregator.service.ts  # Orchestrates platform services
│       ├── search/
│       │   └── stream-normalizers.ts # Normalizers for streaming search (includes normalizeInstagramNativeSearch for native IG search results)
│       └── platforms/           # Platform-specific API clients (RapidAPI & Apify integrated)
│           ├── instagram.service.ts # Implements Instagram waterfall search
│           ├── facebook.service.ts  # Implements Facebook waterfall search
│           ├── youtube.service.ts   # Implements YouTube waterfall search
│           ├── tiktok.service.ts    # Implements TikTok waterfall search
│           └── twitter.service.ts   # Implements Twitter waterfall search
├── scripts/                     # ✅ NEW: Utility scripts
│   ├── migrate-mock-data.ts     # Migration script to move mock data to Firestore
│   ├── test-api-routes.ts       # API route testing script
│   └── README.md                # Scripts documentation
├── types/
│   ├── api.ts                   # Types for API requests and responses
│   ├── influencer.ts            # Core TypeScript interfaces for profiles
│   └── firebase.ts              # ✅ NEW: Firebase-specific types (UserRole, AuthProvider, etc.)
├── public/
│   └── openapi.json             # ✅ OpenAPI 3.0.3 specification (1,657 lines, 38+ endpoints)
├── .env.local                   # API Keys and environment variables
├── .gitignore                   # ✅ UPDATED: Added Firebase service account file protection
├── package.json                 # ✅ UPDATED: Added migration and test scripts
└── ...
```

### Advanced Search Strategy: Per-Platform Waterfall Model

To maximize efficiency, accuracy, and comprehensiveness, each social media platform's search now follows a specific "waterfall" strategy. This means starting with the fastest/most precise method and falling back to broader/more powerful (and potentially slower/costlier) methods if initial attempts yield no results. All this logic is encapsulated within each platform's service file.

**Rationale:**
-   **Efficiency:** Prioritize quick, direct lookups.
-   **Accuracy:** Aim for exact matches first.
-   **Comprehensiveness:** Use broader tools as fallbacks to ensure no relevant results are missed.
-   **Modularity:** Keep platform-specific complexity within its service.

**Per-Platform Strategies (Implemented):**

*   **Instagram:**
    1.  **`[FAST NATIVE SEARCH]` Apify Instagram Native Search:** (`patient_discovery/instagram-search-users`) uses Instagram's real search endpoint, fast ~10s, lightweight results (no follower counts).
    2.  **`[ENRICHMENT]` Apify Instagram Profile Scraper:** (`apify/instagram-profile-scraper`) enriches native search results with full data (follower counts, bios, engagement rates).
    3.  **`[FALLBACK]` Apify Instagram Search Scraper:** (`apify/instagram-scraper`) broad keyword search, used only if native search returns 0 results.

*   **Twitter/X:**
    1.  **`[BROAD SEARCH]` RapidAPI Search:** (`twitter-api45`) for broader name searches.
    2.  **`[FAST & PRECISE]` Apify User Scraper:** (`apidojo/twitter-user-scraper`) for direct handle lookups if RapidAPI fails.
    3.  **`[DEEP DISCOVERY]` Apify Tweet Scraper:** (`apidojo/tweet-scraper`) to search for tweets and extract author profiles as a final fallback.

*   **TikTok:**
    1.  **`[BROAD SEARCH]` RapidAPI Search:** (`tiktok-api6` / `tiktok-scraper7`) for broader name searches.
    2.  **`[FAST & PRECISE]` Apify Scraper (Profile Mode):** (`clockworks/tiktok-scraper` with `profiles` input) for direct username matches if RapidAPI fails.
    3.  **`[DEEP DISCOVERY]` Apify Scraper (Keyword Mode):** (`clockworks/tiktok-scraper` with `searchQueries` or `hashtags` input) to find profiles from video content as a final fallback.

*   **Facebook:**
    1.  **`[BROAD SEARCH]` RapidAPI Search:** (`facebook-scraper3`) for broader name searches.
    2.  **`[DIRECT LOOKUP]` Apify Scraper:** (`apify/facebook-posts-scraper`) by constructing a direct profile URL from the query if RapidAPI fails.

*   **YouTube:**
    1.  **`[BROAD SEARCH]` RapidAPI Search:** (`youtube138`) as the primary and currently only available search method for this platform. Includes robust parsing for subscriber counts (number or string).

**Implementation Status:**
-   All platform services (`instagram.service.ts`, `twitter.service.ts`, `tiktok.service.ts`, `facebook.service.ts`, `youtube.service.ts`) have been refactored to implement their specific multi-step waterfall strategy within their `search(query: string)` method.
-   The `aggregator.service.ts` has been simplified to merely orchestrate parallel calls to each platform's `search(query)` method and then flatten the combined results.
-   An image proxy (`app/api/image-proxy/route.ts`) has been implemented to bypass CORS issues for external images, including retry logic, increased timeouts, and forced IPv4 resolution for resilience.
-   The `InfluencerCard` component now displays a placeholder initial while images load or if they fail, improving UX.
-   The `app/influencers/page.tsx` now displays "Search Results" and "My Influencers" in separate sections, each with its own filtering, sorting, and view mode controls.

---

## Key Features Implemented

### 1. Hybrid Multi-Platform Search ✅ COMPLETE (February 2026)

**Status**: Production-ready hybrid search combining Firestore database and live social media APIs.

**Documentation**: See [`docs/HYBRID_SEARCH.md`](docs/HYBRID_SEARCH.md) for complete implementation guide.

This is a full-stack feature that intelligently combines two data sources for optimal results:

1. **Firestore Database** (fast, filtered, cached profiles)
2. **Live Social Media APIs** (fresh, comprehensive data from Instagram, TikTok, YouTube, Twitter, Facebook)

**Key Features:**
- ⚡ Database-first approach for instant results (< 200ms)
- 🔄 Automatic fallback to live APIs when needed (< 10 results threshold)
- 💰 Cost-efficient - minimizes expensive API calls
- 🎯 Smart deduplication by `platform:username`
- 🟢 **Live toggle** - force fresh data from social media APIs
- 💾 **Auto-save profiles** - saves to Firestore on click
- 🔍 **Automatic enrichment** - background Instagram enrichment on profile view
- 🖼️ **Optimized image loading** - CDN-aware proxy with fallbacks

**Frontend (`components/brands/discover/DiscoveryHeader.tsx`):**
- Multi-platform selector (Instagram, TikTok, YouTube, Twitter, Facebook)
- Keyword search with Enter key support
- Location filter and vetted-only toggle
- **Live search toggle** (green when enabled) - forces external API calls
- Navigates to results page with URL parameters

**Results Page (`app/brands/discover/results/page.tsx`):**
- Loads results from hybrid search API
- Displays search source: 'database', 'live', or 'hybrid'
- Shows result breakdown (database count + live count + duplicates)
- **Auto-saves profiles** to Firestore when clicking cards
- **Triggers enrichment** in background for Instagram profiles
- Navigates to profile page immediately (doesn't wait for enrichment)

**Backend (`app/api/search/route.ts`):**
- Implements 3-step hybrid search strategy:
  1. Search Firestore database (fast, filtered)
  2. Evaluate results against threshold (default: 10)
  3. If needed, search live APIs and merge results
- Smart threshold logic: < 10 results → trigger live search
- Live toggle forces external API calls regardless of database results
- Deduplicates by `platform:username` (lowercase)
- Returns source breakdown for transparency

**Services (`lib/services/`):**
- Each platform (Instagram, TikTok, etc.) has its own service file
- Each service implements a sophisticated waterfall strategy with multiple API fallbacks
- **Normalizes** varied API responses into consistent `SearchResultProfile` format
- Parallel execution for maximum performance

**Auto-Save & Enrichment:**
- Clicking discovery result automatically saves profile to Firestore
- Uses random Firestore IDs with `primaryAccountKey` for deduplication
- Instagram profiles trigger background enrichment (8 concurrent methods)
- Passes cached profile data to enrichment API to skip one call
- Fire-and-forget pattern - doesn't block navigation
- User sees profile page immediately while enrichment runs in background

**Progressive Streaming Discovery (`app/api/discover/search/stream/route.ts`):**
- SSE-based progressive streaming — users see results from the first second
- Phase 1: Database search (~200ms)
- Phase 2: Fast searches — RapidAPI + Instagram native search (~5-10s)
- Phase 3: Apify fallbacks + Instagram profile enrichment (~10-60s)
- Enrichment pipeline: server detects richer data for already-sent profiles, sends as `profile_enrichment` SSE events
- Client merges enrichment data into existing cards (follower counts, bios, engagement rates appear progressively)
- Error recovery with retry-without-rawData for JSON serialization failures
- `toLightProfile()` strips rawData to only client-used fields before sending
- React 18 strict mode compatible deduplication (side effects outside state updaters)

**Results Page UX (`app/brands/discover/results/page.tsx`):**
- Friendly loading state with skeleton cards and progress steps (no technical jargon)
- Streaming banner with bouncing dots while more creators are being found
- Profile enrichment handler merges live data into displayed cards
- CDN-aware avatar handling (Instagram CDN URLs show initials immediately instead of 403 errors)

**Creator Card Redesign (`components/brands/discover/RecommendedCreatorCard.tsx`):**
- Horizontal avatar + name/handle layout
- Stats row in gray-50 background with grid-cols-3 and dividers
- Tags limited to 3 with +N overflow badge
- Action buttons: gray outlined "Chat" + dark blue "Add to Campaign"
- `hasStats` conditional styling for better visual appearance

### 2. Image Proxy (`app/api/image-proxy/route.ts`)
- A server-side API route that fetches external images (e.g., from social media platforms) to bypass client-side CORS restrictions.
- Includes retry mechanisms, increased timeouts, and forces IPv4 connections for enhanced reliability against network issues and platform blocking.
- The `InfluencerCard` component uses this proxy and displays a placeholder initial while images load or if they fail.

### 3. Firebase Authentication ✅ INTEGRATED (December 2025)

**Status**: Firebase Authentication is fully integrated with support for multiple auth providers.

**Supported Auth Methods**:
- ✅ Email/Password authentication
- ✅ Google OAuth (Sign in with Google)
- ✅ Facebook OAuth (Sign in with Facebook)
- ✅ Apple OAuth (Sign in with Apple) - **Latest addition**

**Implementation** (`lib/firebase/auth-actions.ts`):
- `signUpWithEmail()` - Email/password registration
- `signInWithEmail()` - Email/password login
- `signInWithGoogle()` - Google OAuth authentication
- `signInWithFacebook()` - Facebook OAuth authentication
- `signInWithApple()` - Apple OAuth authentication (newest)
- Automatic user document creation in Firestore on first sign-in
- Role-based profile creation (influencer vs brand)
- Support for linking multiple auth providers to one account

**User Document Structure** (Firestore `users` collection):
```typescript
{
  uid: string;
  email: string;
  role: 'influencer' | 'brand';
  displayName: string;
  photoURL?: string;
  authProviders: ('email' | 'google' | 'facebook' | 'apple')[];
  influencerProfileId?: string;  // For influencers
  brandId?: string;              // For brands
  createdAt: Timestamp;
  lastLogin: Timestamp;
}
```

### 4. Firestore Database Integration ✅ READY (December 2025)

**Status**: Complete Firestore schema designed and migration system ready to execute.

**Database Collections**:

1. **`unified_profiles`** - Main influencer profile data
   - Basic info (displayName, bio, location, categories)
   - Linked social accounts (Instagram, TikTok, YouTube, etc.)
   - Combined metrics (total followers, engagement rate)
   - Influence score and pricing estimates
   - User association (userId field)

2. **`influencer_detailed_data`** - Extended analytics
   - Platform-specific metrics
   - Audience demographics (age, gender, location)
   - Similar influencers suggestions
   - Brand safety scores
   - Audience authenticity metrics

3. **`content_posts`** - Social media posts
   - Post content and metadata
   - Engagement metrics (likes, comments, shares)
   - Platform and post type
   - Posted date and creation date

4. **`users`** - User authentication and profiles
   - Firebase UID and email
   - Role (influencer or brand)
   - Auth provider tracking
   - Profile associations

**Migration System** (`scripts/migrate-mock-data.ts`):
- ✅ Complete TypeScript migration script (500+ lines)
- ✅ Creates demo account: `demo.influencer@heycreator.com` / `DemoPass123!`
- ✅ Migrates all 13+ mock influencers to Firestore
- ✅ Batch operations for efficient post migration
- ✅ Proper timestamp handling and data normalization
- ✅ Comprehensive error handling and logging
- Ready to run: `npm run migrate:mock-data`

**Testing Script** (`scripts/test-api-routes.ts`):
- ✅ Automated testing for all API endpoints
- ✅ Tests GET /api/influencer/profiles
- ✅ Tests GET /api/influencer/profiles/[id]
- ✅ Tests POST /api/profiles (create unified profile)
- Ready to run: `npm run test:api-routes`

### 5. Firestore-Backed API Routes ✅ COMPLETE (December 2025)

**Status**: All API routes fully implemented and connected to Firestore.

**Implemented Routes**:

1. **GET `/api/influencer/profiles`** (`app/api/influencer/profiles/route.ts`)
   - Fetches all unified profiles for authenticated user
   - Supports filtering by status (active, archived, deleted)
   - Returns profiles sorted by creation date
   - Requires `x-user-id` header (temporary for development)
   - Converts Firestore Timestamps to ISO strings

2. **GET `/api/influencer/profiles/[id]`** (`app/api/influencer/profiles/[id]/route.ts`)
   - Fetches complete profile with all related data
   - Includes unified profile + detailed analytics + content posts
   - Supports `postsLimit` query parameter (default: 20)
   - Combines data from 3 Firestore collections
   - Comprehensive error handling for missing data

3. **POST `/api/profiles`** (`app/api/profiles/route.ts`)
   - Creates new unified profile from search results
   - Saves directly to Firestore (persistent storage)
   - Calculates combined metrics across platforms
   - Associates profile with authenticated user
   - Returns created profile with Firestore document ID

4. **GET `/api/profiles`** (`app/api/profiles/route.ts`)
   - Fetches all unified profiles for user from Firestore
   - Supports filtering and sorting
   - Replaces in-memory storage with database queries

**API Response Format**:
```typescript
// Successful response
{
  success: true,
  data: { /* profile data */ },
  count?: number
}

// Error response
{
  success: false,
  error: string,
  code?: string
}
```

**Authentication**:
- Currently uses `x-user-id` header for development
- **TODO**: Replace with JWT/session-based auth in production

### 6. Influencer List Page (`app/influencers/page.tsx`)
**Route**: `/influencers`
**Features**:
- Displays "Search Results" and "My Influencers" as two distinct sections.
- Each section has its own independent view mode toggle (grid/list), sort options, and total count.
- The main page title "Influencer Discovery" has been reduced in size.
- A tooltip has been added to the "My Influencers" heading for clarity.
- **TODO**: Update to fetch "My Influencers" from Firestore API instead of mock data

### 7. Comprehensive Profile Pages (`app/influencers/[id]/page.tsx`)
**Route**: `/influencers/[id]` (dynamic)
**Status**: ⚠️ **PENDING UPDATE** - Still uses mock data, not yet connected to Firestore API
**Main Feature**: Shows full profile for a single influencer with comprehensive analytics
**TODO**:
- Update to fetch from GET `/api/influencer/profiles/[id]`
- Connect to Firestore database instead of `mockInfluencers.ts`
- Support profiles from both search results and saved profiles

### 8. Authentication System & Role Selection ✅ COMPLETE (November 28, 2025)

**Status**: Full role-based authentication UI implemented. Both influencer and brand flows are complete with 17 pages and 22 reusable components.

**Documentation**:
- Design plan: `docs/AUTH.MD`
- Implementation details: `docs/AUTH_IMPLEMENTATION.md`
- Quick start: `docs/AUTH_QUICKSTART.md`
- Route refactor plan: `docs/ROUTE_RESTRUCTURE_PLAN.md`
- Brand auth plan: `docs/BRAND_AUTH_PLAN.md`
- Firebase Phases Plan: `docs/FIREBASE_PHASES.MD`
- **Complete System Documentation**: `docs/AUTH_SYSTEM_COMPLETE.md` (18,000+ words) ✅ NEW (Dec 8, 2025)

**Routes (as of Nov 28, 2025)**:
- **`/`** - Role selection page (Influencer vs Brand)
- **`/auth/influencer/*`** - 7 influencer auth pages
- **`/auth/brand/*`** - 10 brand auth pages ✅ COMPLETE

**Components**:
- **Auth Components** (`components/auth/` - 22 components):
  - **Layout**: `AuthLayout`, `AuthCard`, `Logo` (supports heycreator + heycreator brands)
  - **Inputs**: `InputField`, `PasswordInputField`, `PhoneNumberInput`, `TabSelector`, `SelectField`, `OTPInput`
  - **Buttons**: `PrimaryButton`, `SocialAuthButton`, `OutlineButton`, `GoBackButton`
  - **Progress**: `ProgressDots` (influencers), `LinearProgressBar` (brands)
  - **Status**: `DividerWithText`, `ErrorMessage`, `ExternalAuthPrompt`
  - **Success**: `SuccessMessage` (influencers), `BrandSuccessMessage` (brands)
  - **Brand-Specific**: `BrandWelcomeCard` (feature highlights)
  - **Footer**: `AuthFooter`
- **`RoleCard`** (`components/RoleCard.tsx`):
  - Reusable card component for role selection
  - Displays icon, title, description
  - Hover effects and accessibility

**Influencer Auth Pages** (`app/auth/influencer/` - 7 pages):
1. `/auth/influencer/welcome` - Welcome screen with progress dots, updated for mobile responsiveness and logo display
2. `/auth/influencer/login` - Login/signup with email or phone, social auth options, updated for mobile responsiveness and logo display
3. `/auth/influencer/signup/email` - Email/password registration form, updated for mobile responsiveness and logo display
4. `/auth/influencer/signup/success` - Account creation success message, updated for mobile responsiveness and logo display
5. `/auth/influencer/verify/social` - Social account verification, updated for mobile responsiveness and logo display
6. `/auth/influencer/verify/success` - Verification success confirmation, updated for mobile responsiveness and logo display
7. `/auth/influencer/external-auth` - External service authorization prompt, updated for mobile responsiveness and logo display

**Brand Auth Pages** (`app/auth/brand/` - 10 pages) ✅ COMPLETE (Nov 28, 2025):
1. `/auth/brand/welcome` - Welcome with 3 feature highlight cards (Smart Discovery, Real-time Analytics, Secure Platform)
2. `/auth/brand/login` - Login with email/password and social auth options (Facebook, Google, Apple)
3. `/auth/brand/signup/account` - Step 1/3: Full name, email, password, confirm password (33% progress)
4. `/auth/brand/signup/company` - Step 2/3: Company name, website, industry (10 options), company size (5 options), role (67% progress)
5. `/auth/brand/signup/social` - Step 3/3: Social media links (Instagram, TikTok, Facebook, Twitter, LinkedIn - all optional, 100% progress)
6. `/auth/brand/signup/success` - Success screen with "What's Next?" checklist (3 action items)
7. `/auth/brand/forgot-password` - Email input for password reset
8. `/auth/brand/verify-code` - 6-digit OTP input with resend functionality
9. `/auth/brand/reset-password` - New password and confirm password with validation (8+ chars, must match)
10. `/auth/brand/reset-success` - Password reset confirmation with green checkmark

**User Flows**:
- **Role Selection**: Root → Select Role (Influencer vs Brand) → Auth Flow
- **New Influencer**: Role Selection → Influencer Welcome → Login (Register) → Email Signup → Success → Social Verify → Verify Success → Dashboard
- **Existing Influencer**: Sign In Link → Influencer Login → Dashboard
- **New Brand**: Role Selection → Brand Welcome → Login (Sign Up) → Account (Step 1) → Company (Step 2) → Social (Step 3) → Success → Dashboard
- **Existing Brand**: Sign In Link → Brand Login → Dashboard
- **Brand Password Reset**: Brand Login → Forgot Password → Verify Code (6-digit OTP) → Reset Password → Success → Login

**Design System**:
- **Influencer Brand** ("heycreator"): Primary `#001F54` (Dark Blue), Secondary `#00A8CC` (Light Blue)
- **Brand Brand** ("HeyCreator"): Primary `#001F54` (Dark Blue), Accents Cyan/Turquoise, Success Green
- Progress: Dots for influencers, Linear bar for brands
- Fully responsive (mobile-first)
- Accessible (WCAG AA compliant)
- Comprehensive form validation for all inputs

**Email Verification System** ✅ ENHANCED (December 8, 2025):
- ✅ **Role-Based Redirect**: After email verification, users are redirected to their role-specific login page
  - Brands → `/auth/brand/login`
  - Influencers → `/auth/influencer/login`
- ✅ **User Role Detection**: Fetches user role from Firestore after verification
- ✅ **Dynamic Messaging**: Shows role-specific redirect messages during verification
- ✅ **Email Verification Modal**: Displays when unverified email is detected during login
- ✅ **Resend Functionality**: Users can resend verification emails from modal
- Implementation: `app/auth/action/page.tsx` with Firestore integration

**Password Reset System** ✅ COMPLETE (December 8, 2025):
- ✅ **Unified Entry Point**: `/auth/reset-password` handles all password reset links from Firebase
- ✅ **Role Detection**: Determines user role by email via API call
- ✅ **Smart Redirect**: Routes to appropriate reset page based on role
  - `/auth/brand/reset-password?oobCode=...` for brands
  - `/auth/influencer/reset-password?oobCode=...` for influencers
- ✅ **Error Handling**: Displays friendly error messages for invalid/expired links
- API Route: `/api/auth/get-user-role-by-email` (POST)

**Error Handling Strategy** ✅ IMPLEMENTED (December 8, 2025):
- ✅ **Contextual Error Display**: Errors appear in their relevant UI sections following UX best practices
- ✅ **Separated Error States**: Each auth method has its own error state
  - `socialAuthError` - Displays at top of social auth block
  - `emailLoginError` - Displays at top of email form (non-validation errors)
  - `phoneLoginError` - Displays at top of phone form
  - `registerError` - Displays at top of register form
- ✅ **Inline Validation**: Field-specific validation errors remain inline
- ✅ **User-Friendly Messages**: `getFriendlyErrorMessage()` helper converts Firebase errors to readable text
- ✅ **Verification Flow Integration**: Special handling for unverified email errors with resend UI
- Implementation: Both `app/auth/brand/login/page.tsx` and `app/auth/influencer/login/page.tsx`

**Authentication Features Implemented**:
- ✅ All UI pages are complete (17 total pages, 22 components)
- ✅ All influencer auth pages have been updated for mobile responsiveness
- ✅ Email verification with role-based redirects
- ✅ Password reset with role detection
- ✅ Contextual error handling following UX best practices
- ✅ Multi-provider OAuth (Google, Facebook, Apple)
- ✅ Email/password authentication
- ✅ Phone authentication with OTP
- ✅ User document creation in Firestore
- ✅ Role-based profile creation

**Backend Integration Status**:
- ✅ Firebase Authentication fully integrated
- ✅ User documents created in Firestore on signup
- ✅ Email verification emails sent automatically
- ✅ Password reset emails sent via Firebase
- ✅ Role detection API endpoints
- ❌ Session/token management (uses Firebase auth state)
- ❌ Protected route middleware (pending)
- ❌ JWT validation for API routes (currently uses x-user-id header)

**Next Steps**:
1. Implement auth middleware for API routes with Firebase ID tokens
2. Add protected route wrapper for frontend pages
3. Implement global auth context for userId management
4. Add role-based access control (RBAC)

*(Other feature sections like Tooltip System, etc., remain largely relevant and unchanged.)*

### 9. API Documentation ✅ COMPLETE (February 2026)

**Status**: Fully interactive API reference powered by Scalar and OpenAPI 3.0.3.

**Documentation**: See [`docs/SLAB_API_DOCS_PROCESS.md`](docs/SLAB_API_DOCS_PROCESS.md) for complete process documentation.

**Access**: Start the dev server (`npm run dev`) and navigate to `http://localhost:3000/api-docs`

**Implementation**:

- **OpenAPI Spec**: `public/openapi.json` — 1,657 lines covering 38+ endpoints across 12 categories
- **Scalar Route**: `app/api-docs/route.ts` — single-file integration via `@scalar/nextjs-api-reference`
- **Security**: Firebase Bearer token authentication documented in `securitySchemes`

**API Categories Documented**:

| Category | Endpoints | Description |
| --- | --- | --- |
| Authentication | 7 | Sign up, login, email verification, password reset |
| Search & Discovery | 2 | Hybrid search, SSE streaming results |
| Profiles | 7 | Profile CRUD, enrichment, unified profiles |
| Campaigns | 5 | Campaign lifecycle management |
| Applications | 3 | Creator applications to campaigns |
| Invitations | 4 | Brand invitations to creators |
| Documents | 2 | Campaign document management |
| Deliverables | 2 | Content deliverable tracking |
| Creator Lists | 5 | Saved creator collections |
| Users & Creators | 3 | User and creator profiles |
| Enrichment | 1 | Background profile enrichment |
| Utility | 4 | Image proxy, metrics, pricing, dashboard |

**Files**:

- `app/api-docs/route.ts` — Scalar API reference route
- `public/openapi.json` — OpenAPI 3.0.3 specification
- `docs/SLAB_API_DOCS_PROCESS.md` — Documentation process (for Slab)

### 10. Demographics Enrichment & Data Sync ✅ COMPLETE (February 2026)

**Status**: Full demographics inference pipeline with TTL-based staleness detection, in-memory caching, and auto background re-enrichment.

**Phase 1: Demographics Pipeline**

The enrichment system infers audience demographics from public content (no Instagram Creator API access). All demographics are estimated/heuristic and displayed with an "Estimated" badge.

**Demographics Inference Engine** (`lib/services/profile-enricher.service.ts`):
- **`inferLocations(bio, posts?)`** — Scans bio text and post geo-tags for 120+ cities and 80+ countries globally. Includes comprehensive Africa coverage (Zimbabwe, Nigeria, South Africa, Kenya, Ghana, etc.), Asia, Middle East, South America, Caribbean. Bio mentions weighted 3x higher than post geo-tags. Country aliases supported (e.g., 'zim' → Zimbabwe, 'naija' → Nigeria).
- **`inferBrandAffinity(interests, posts?, bio?)`** — Content-aware brand detection. Phase 1: Scans actual post captions, hashtags, and @mentions for 60+ brand regex patterns (fashion, beauty, tech, food, automotive, gaming, telecom including African brands like Econet, MTN, Safaricom). @mentions weighted 2x. Phase 2: Falls back to interest-based defaults only when zero brands detected.
- **`estimateDemographics(platform, interests, bio?, posts?)`** — Platform baselines adjusted by interest niche, bio keyword gender signals (femaleSignals: 'mom', 'mama', 'queen'; maleSignals: 'dad', 'father', 'king'), and content age signals (youngSignals: 'gen z', 'college'; midSignals: 'entrepreneur', 'ceo').
- **`inferInterests(posts, bio)`** — 18 interest categories including News & Politics, Education, Religion & Spirituality. Expanded keyword sets with African/global music genres (amapiano, afrobeats, zimdancehall), sports (cricket, rugby, PSL, AFCON), and fashion terms.
- **`computeAverageAge()`** — Weighted average from age range midpoints, added to GET response.

**GET Response Enhancements** (`app/api/influencer/[id]/enrichment/route.ts`):
- `demographics.averageAge` — computed number from age ranges
- `demographics.brandAffinity` — array of detected brands with percentages
- `isoCodeToFlag()` — converts any 2-letter ISO code to flag emoji via Unicode regional indicators

**UI** (`components/influencer-profile/DemographicsSection.tsx`):
- "Estimated" amber badge next to "Audience Demographics" heading
- Expanded `COUNTRY_FLAGS` map (50+ entries) in `profile-data-transformer.ts`

**Phase 2: Data Sync & Caching**

- **TTL-based staleness** — GET endpoint compares `lastEnriched` against platform-specific TTL (Instagram/TikTok/YouTube/Facebook = 7 days, Twitter = 3 days). Returns `metadata.stale: boolean` and `metadata.enrichmentAgeHours`.
- **In-memory CacheManager** — GET checks cache before Firestore read. POST invalidates cache after write. Uses `profileTTL` from platform config.
- **Stale banner** (`components/influencer-profile/EnrichmentBanner.tsx`) — Amber "Data may be outdated" variant with Clock icon, age display, and Refresh button. Variant prop: `'enriching' | 'stale'`.
- **Auto background re-enrichment** (`app/brands/influencers/[id]/page.tsx`) — When GET returns `metadata.stale: true`, fires background POST with `forceRefresh: true`. Page updates automatically when complete.
- **Polling mechanism** — Independent `useEffect` polls GET endpoint every 10s during enrichment. React 18 strict mode compatible.
- **`enrichmentPromiseRef`** — Deduplication pattern to prevent double-fire enrichment calls.

**Bug Fixes**:
- Apify error objects (`{error: "no_items"}`) filtered before post processing
- Refresh button uses API re-fetch instead of `window.location.reload()`
- Content tab: fixed gray images, 0 likes, Invalid Date from malformed Apify data

### 11. Clickable Post Content ✅ COMPLETE (February 2026)

**Status**: All post thumbnails in Content tab and Top Performing Posts link directly to the original platform post.

**Post URL Construction** (`lib/services/profile-enricher.service.ts`):
- Instagram: `https://www.instagram.com/p/{shortCode}/`
- TikTok: `https://www.tiktok.com/@{username}/video/{id}` (or `v.webVideoUrl`/`v.url`)
- YouTube: `https://www.youtube.com/watch?v={videoId}`
- Twitter/X: `https://x.com/{username}/status/{tweetId}`
- Facebook: `https://www.facebook.com/{username}/posts/{postId}`

**Backward Compatibility** — GET endpoint constructs URLs from shortcodes/IDs for existing Firestore data that was enriched before this feature.

**UI** (`components/influencer-profile/ContentGrid.tsx`, `app/brands/influencers/[id]/page.tsx`):
- Posts with valid URLs open in new tab on click
- External link icon appears on hover (top-right corner)
- Posts without URLs render as non-clickable divs (graceful degradation)

### 12. Influencer Profile Page Redesign ✅ COMPLETE (February 2026)

**Status**: All 4 tabs redesigned to match Figma design. Real data from enrichment pipeline.

**Overview Tab** (`app/brands/influencers/[id]/page.tsx`):
- ProfileHeader: avatar, verified badge, bio, location, category, action buttons
- ProfileSnapshot: 4 stat cards (followers, engagement, influence score, posts)
- InsightsCard: best posting time, top hashtag, audience sentiment
- MetricsTable: platform breakdown (network, followers, engagements, eng. rate, brand, EMV)
- ContentGrid: 4-column thumbnail grid with hover overlay, clickable posts
- DemographicsSection: age bars + gender bars + geographic cards (Estimated badge)
- SimilarCreators: navy-bordered cards with dark circle platform icons, real data from Method 9
- InternalNotes: clipboard icon, note cards with add form

**Content Tab**:
- "All Content" title with platform and type filter dropdowns
- 4-column thumbnail grid with hover stats overlay
- Platform badge (top-left), play button (center for videos)

**Demographics Tab** (`components/influencer-profile/DemographicsSection.tsx`):
- "Audience Demographics" with green "Estimated" badge
- Age Distribution: navy horizontal bars (13-17, 18-24, 25-34, 35-44, 45+)
- Gender Distribution: navy horizontal bars (Female, Male, Other)
- Geographic Distribution: grid cards with flag emoji + country + percentage

**Analytics Tab**:
- "Performance Analytics" heading
- 4 stat cards: Avg Views, Engagement Rate, Growth Rate, Authenticity
- Platform Performance: individual cards per platform with colored circle icons, follower count, navy engagement bar

**Types** (`types/profile.ts`):
- `AgeRange { range: string; percentage: number }`
- `Demographics.ageRanges: AgeRange[]`
- `Demographics.genderSplit: { female: number; male: number; other: number }`

### 13. Avatar Image Proxy Fix ✅ COMPLETE (February 2026)

**Status**: All avatar images now show correctly across the platform.

**Root Cause**: `isBlockedCDN()` in `ResultsGrid.tsx` was blanking Instagram/Facebook CDN URLs (`cdninstagram.com`, `fbcdn.net`, `twimg.com`), setting avatarUrl to empty string and showing initials instead.

**Fix**:
- Removed the CDN blocklist from `ResultsGrid.tsx` — `/api/image-proxy` handles CDN URLs via two-stage fallback (direct fetch with proper headers → weserv.nl proxy)
- `RecommendedCreatorCard` (discover): switched from `next/image` direct URL to `<img>` with `proxyImage()`
- `CreatorCard` (influencers list): switched from `next/image` to `<img>` with proxied URL
- All avatar rendering now uses `proxyImage()` from `lib/utils.ts` which routes through `/api/image-proxy`

**Image Proxy Strategy** (`app/api/image-proxy/route.ts`):
1. Direct fetch with browser UA headers + Instagram/Facebook-specific headers (15s timeout, 2 retries)
2. Fallback to `images.weserv.nl` proxy on 403/404 (20s timeout)
3. Returns image with 24-hour cache headers

### 14. Firestore Architecture Consolidation ✅ COMPLETE (February 2026)

**Status**: Single source of truth established. Deprecated collections eliminated.

**Architecture**:
- `global_influencers` — ALL profile data (discovery fields + enrichment + linked accounts + metrics)
- `user_collections` — per-user metadata (starred, notes, lists, profileStatus, collaborationStatus)
- `profile_dedup_locks` — atomic dedup during profile creation
- `unified_profiles` — **DEPRECATED**, no longer read or written

**Read Pattern**: `user_collections.where('userId', '==', userId)` → batch-fetch `global_influencers` by IDs (chunks of 30 for Firestore `in` limit) → merge user metadata with global profile data

### 15. Campaign Management System ✅ COMPLETE (February 2026)

**Status**: Full campaign lifecycle — creation, marketplace discovery, application flow, and notifications.

#### Campaign Creation (Brand Side)
- Multi-step campaign creation wizard (`app/brands/campaigns/create/`)
- Steps: Basic Info → Target Audience → Budget & Timeline → Deliverables → Review & Publish
- Firestore `campaigns` collection stores all campaign data
- Campaign status lifecycle: draft → active → completed/cancelled

#### Campaign Marketplace (Influencer Side)
- **Discovery page** (`app/influencers/campaign-marketplace/page.tsx`): Browse active campaigns with search, filters (category, budget range, platform), and pagination
- **Campaign Brief page** (`app/influencers/campaign-marketplace/[id]/page.tsx`): Redesigned to match Figma design
  - Page header with "Discovery" title, "Overview" tab, Save + Apply Now buttons
  - Category pills (dark blue) + "Active Campaign" status pill (green)
  - 4 gray stat cards: Compensation, Apply By, Location, Duration
  - Vertical timeline with colored dots (purple=past, blue=current, gray=future)
  - Numbered deliverables list with colored number circles
  - Circular product image with details
  - Do's/Don'ts content guidelines (two-column)
  - Additional Requirements section (hashtags + mentions chips)
  - Screening questions with both chip answers and free-text textarea fallback

#### Application Flow
- **ApplicationModal** (`components/influencers/ApplicationModal.tsx`): Pitch message, proposed rate, screening question answers
- **Apply API** (`app/api/influencers/campaigns/[id]/apply/route.ts`): Validates auth, campaign status, deadline, duplicate check; creates `campaign_applications` doc
- **Success modal**: Centered modal with green checkmark and "Thank you for applying" message
- **Screening questions**: Supports both predefined chip answers and open-ended textarea input

#### My Campaigns (Influencer Side)
- **Applications list** (`app/influencers/campaign-applications/page.tsx`): Clean design with gray stat cards (Total, Pending, Accepted, Success Rate), search bar, status filters, sort options
- **CampaignApplicationCard** component for individual application display
- Sidebar entry "My Campaigns" points to `/influencers/campaign-applications`

#### Campaign Applications API
- **GET `/api/influencers/applications`**: Fetches all applications for authenticated influencer with campaign + brand details, supports status filter, sorting, pagination, returns stats

#### Notification System
- FCM (Firebase Cloud Messaging) + Firestore notifications
- `notifyUser()` service sends push notifications on application events (new application → brand, acceptance/rejection → influencer)
- Fire-and-forget pattern — doesn't block the API response

#### Firestore Collections (Campaign)
- `campaigns` — campaign data (title, budget, timeline, deliverables, requirements, screening questions)
- `campaign_applications` — application data (influencerId, campaignId, status, pitchMessage, proposedRate, questionAnswers)

---

## Data Structure

### Main Influencer Interface (`types/influencer.ts`)
This interface is used for the detailed profile pages and the initial mock data display.
```typescript
export interface Influencer {
  id: string;
  name: string;
  // ... and other detailed fields
}
```

### API Search Result Interface (`types/api.ts`)
This interface defines the standardized, simpler object returned from the `/api/search` endpoint.
```typescript
export interface SearchResultProfile {
  id: string | number;
  platform: Platform;
  username: string;
  display_name: string;
  follower_count: number;
  profile_url: string;
  avatar_url?: string;
  bio?: string;
}
```
A mapping function in `app/influencers/page.tsx` adapts this `SearchResultProfile` to the `Influencer` type for display in the `InfluencerCard` component.

---

## Known Limitations & TODOs

### Current Status (February 2026)

**✅ COMPLETED**:
1. ✅ **Firebase Authentication** - Fully integrated (Email, Google, Facebook, Apple)
2. ✅ **Firestore Consolidated** - `global_influencers` single source of truth, `unified_profiles` deprecated
3. ✅ **API Routes** - All endpoints implemented and Firestore-backed
4. ✅ **Auth UI** - Complete role-based auth flows (17 pages, 22 components)
5. ✅ **Hybrid Search** - Database-first with live API fallback, streaming SSE
6. ✅ **Demographics Enrichment** - Inference engine, TTL staleness, auto re-enrichment
7. ✅ **Profile Page Redesign** - All 4 tabs match Figma (Overview, Content, Demographics, Analytics)
8. ✅ **Similar Influencers Enrichment** - Method 9 batch Apify call for real follower/engagement data
9. ✅ **Avatar Proxy Fix** - All avatars route through image proxy, CDN blocklist removed
10. ✅ **Clickable Posts** - Content links to original platform posts
11. ✅ **Data Sync** - TTL-based staleness, in-memory caching, stale banner with auto refresh
12. ✅ **API Documentation** - Scalar + OpenAPI 3.0.3 (38+ endpoints)

**⚠️ PENDING**:
1. ⚠️ **Frontend Integration** - Pages still use mock data, need to connect to Firestore API
2. ⚠️ **Migration Execution** - Migration script ready but not yet run
3. ⚠️ **Auth Context** - Need global auth state management for userId
4. ⚠️ **Protected Routes** - Need middleware to protect authenticated pages
5. ⚠️ **Session Management** - Replace `x-user-id` header with proper JWT/session tokens

### Current Limitations

1. **Frontend Pages Not Connected to Database**:
   - ❌ `/app/influencers/page.tsx` - "My Influencers" section still uses `mockInfluencers.ts`
   - ❌ `/app/influencers/[id]/page.tsx` - Profile page still uses mock data
   - ✅ API routes are ready and working
   - **Next**: Update frontend to call Firestore API routes

2. **Migration Not Yet Executed**:
   - ✅ Migration script complete: `scripts/migrate-mock-data.ts`
   - ✅ Testing script ready: `scripts/test-api-routes.ts`
   - ❌ Demo data not yet in Firestore
   - **Next**: Run `npm run migrate:mock-data` after setting up service account

3. **Authentication State Management**:
   - ✅ Firebase auth functions implemented
   - ✅ User documents created in Firestore
   - ❌ No global auth context/provider
   - ❌ No automatic userId injection into API calls
   - **Next**: Create AuthContext with useAuth() hook

4. **Temporary Development Authentication**:
   - ⚠️ API routes use `x-user-id` header (not secure for production)
   - ❌ No JWT token validation
   - ❌ No session management
   - **Next**: Implement proper auth middleware with Firebase Auth tokens

5. **UI-Only Features**:
   - ❌ Profile page tabs don't switch (visual only)
   - ❌ Some filters/sorts may not work without backend support

### Next Steps (Phase 3: Frontend Integration)

**Priority 1: Execute Migration**
1. Set up Firebase service account JSON file
2. Run `npm run migrate:mock-data` to populate Firestore
3. Run `npm run test:api-routes` to verify API endpoints
4. Log in with demo account: `demo.influencer@heycreator.com` / `DemoPass123!`

**Priority 2: Frontend Updates**
1. Create `lib/context/AuthContext.tsx` for global auth state
2. Update `app/influencers/page.tsx`:
   - Fetch "My Influencers" from GET `/api/influencer/profiles`
   - Use authenticated userId from auth context
   - Keep search results functionality as-is
3. Update `app/influencers/[id]/page.tsx`:
   - Fetch profile from GET `/api/influencer/profiles/[id]`
   - Remove dependency on `mockInfluencers.ts`
   - Support both saved profiles and search result profiles

**Priority 3: Auth Improvements**
1. Implement auth middleware for API routes
2. Replace `x-user-id` header with Firebase ID tokens
3. Add protected route wrapper for frontend pages
4. Implement proper session management
5. Add role-based access control (RBAC)

**Priority 4: Production Readiness**
1. Update Firestore security rules
2. Create required Firestore indexes
3. Add error boundaries and loading states
4. Implement proper error handling throughout
5. Add analytics and monitoring

---

## Planned Authentication Features

### 1. Route Restructuring ✅ COMPLETED (Nov 28, 2025)

**Status**: ✅ **COMPLETED** - Route refactoring is done!

**What was implemented**:
- ✅ Moved existing auth pages from `/auth/*` to `/auth/influencer/*`
- ✅ Created role selection page at root `/`
- ✅ Users can choose: "I'm an Influencer" or "I'm a Brand"
- ✅ Redirects to appropriate auth flow based on selection
- ✅ Created `RoleCard` component for role selection UI
- ✅ Updated all internal navigation links
- ✅ Build verified and working

**Implemented Route Structure**:
```
app/
├── page.tsx                      # ✅ Role selection (Influencer vs Brand)
├── auth/
│   ├── influencer/               # ✅ Existing auth pages (moved here)
│   │   ├── welcome/page.tsx      # ✅ Complete
│   │   ├── login/page.tsx        # ✅ Complete
│   │   ├── signup/...            # ✅ Complete
│   │   └── verify/...            # ✅ Complete
│   └── brand/                    # ✅ New brand auth flow (COMPLETE)
│       ├── welcome/page.tsx      # ✅ Implemented
│       ├── login/page.tsx        # ✅ Implemented
│       ├── signup/...            # ✅ Implemented (3 steps)
│       └── ...                   # ✅ Implemented (password reset, etc.)
```

**Files Created/Modified in Route Refactor**:
- Created: `components/RoleCard.tsx`
- Modified: `app/page.tsx` (role selection)
- Moved: All pages from `app/auth/*` to `app/auth/influencer/*`
- Updated: 6 auth page files (navigation links)

### 2. Brand Authentication Flow ✅ COMPLETED (Nov 28, 2025)

**Status**: ✅ **FULLY COMPLETE** - All brand auth UI pages and components are implemented!

**Implementation** (per `docs/BRAND_AUTH_PLAN.md`):
- ✅ **Branding**: "HeyCreator" with Users2 icon
- ✅ **Color Scheme**: Cyan/turquoise accents, green success states
- ✅ **Progress Indicator**: Linear horizontal bar with percentage
- ✅ **Data Collection**:
  - Company name and website
  - Industry (10 options: Fashion, Beauty, Food & Beverage, Technology, Travel, Fitness, Gaming, Education, E-commerce, Other)
  - Company size (5 options: 1-10, 11-50, 51-200, 201-1000, 1000+)
  - User's role
  - Brand's social media accounts (Instagram, TikTok, Facebook, Twitter, LinkedIn)
- ✅ **Responsiveness**: All brand flow pages have been updated to be mobile-responsive, with a consistent `max-w-sm` container to ensure a visually appealing experience on all screen sizes.

**New Components** ✅ ALL COMPLETED (Nov 28, 2025):
1. ✅ `LinearProgressBar` - Horizontal progress bar with percentage (33%, 67%, 100%)
2. ✅ `SelectField` - Custom dropdown for industry and company size
3. ✅ `OTPInput` - 6-digit verification code input with auto-focus, paste support, keyboard navigation
4. ✅ `BrandWelcomeCard` - Feature highlight cards (Smart Discovery, Real-time Analytics, Secure Platform) with icon and text in a flex-row layout
5. ✅ `BrandSuccessMessage` - Success screen with "What's Next?" checklist
6. ✅ `Logo` - Updated to support custom SVG via 'src' prop, defaults to '/logo.svg'

**Pages Built** ✅ ALL 10 COMPLETE (Nov 28, 2025):
1. ✅ `/auth/brand/welcome` - Welcome with 3 feature cards
2. ✅ `/auth/brand/login` - Login with social auth
3. ✅ `/auth/brand/signup/account` - Account Creation (Step 1/3) - name, email, passwords
4. ✅ `/auth/brand/signup/company` - Company Information (Step 2/3) - company details, industry, size, role
5. ✅ `/auth/brand/signup/social` - Social Media Connection (Step 3/3) - optional social links with custom TikTok icon
6. ✅ `/auth/brand/signup/success` - Success screen with "What's Next?" checklist (3 action items)
7. ✅ `/auth/brand/forgot-password` - Email input for password reset
8. ✅ `/auth/brand/verify-code` - 6-digit OTP input with resend
9. ✅ `/auth/brand/reset-password` - New password and confirm password with validation (8+ chars, must match)
10. ✅ `/auth/brand/reset-success` - Password reset confirmation with green checkmark

**Files Created/Modified**:
- Created: 10 page files in `app/auth/brand/`
- Created: 5 new components + updated `Logo.tsx`
- Updated: `components/auth/index.ts` with new exports
- Tested: Build passes successfully ✅
- Committed: All changes committed (commit: 846f6ba)

**Backend Requirements** (NOT YET IMPLEMENTED):
- ❌ Separate `brand_users` and `companies` database tables
- ❌ Email verification with 6-digit OTP backend logic
- ❌ Role-based access control (RBAC)
- ❌ Different post-login dashboard for brands
- ❌ API routes for brand registration, login, password reset

### 3. Implementation Timeline

**✅ ALL UI PHASES COMPLETED (Nov 28, 2025)**:
- ~~Phase 3: Refactor routes and add role selection~~ ✅ Completed
- ~~Phase 1: Create new brand components~~ ✅ Completed (5 components + Logo update)
- ~~Phase 2: Build brand auth pages (10 pages)~~ ✅ Completed (all 10 pages built and tested)

**REMAINING** (Backend Work):
1. **Phase 4**: Backend integration
   - Auth API routes (`/api/auth/register`, `/api/auth/login`, etc.)
   - JWT or session-based authentication
   - Database schema and tables (users, brand_users, companies)
   - Social OAuth integration (Facebook, Google, Apple, Instagram, TikTok, Twitter)
   - Protected route middleware
   - Role-based access control (RBAC)
2. **Phase 5**: Testing and documentation
   - End-to-end testing of auth flows
   - Unit tests for auth components
   - API endpoint testing
   - Update documentation with backend integration details

**UI Progress**: 17/17 pages completed (100%) | 22/22 components completed (100%)
**Overall Auth Implementation**: UI Complete ✅ | Backend Pending ❌

---

## Environment & Dependencies

### Node.js Version
- **Required**: Node.js 18.x or higher

### Key Dependencies
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.1",
    "axios": "^1.13.2",
    "apify-client": "^2.19.0",
    "firebase": "^12.6.0",
    "lucide-react": "^0.344.0",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.1"
  },
  "devDependencies": {
    "firebase-admin": "^13.6.0",
    "tsx": "^4.21.0",
    "ts-node": "^10.9.2"
  }
}
```

### Installation Commands
```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Run migration (after setting up Firebase service account)
npm run migrate:mock-data

# Test API routes (after migration)
npm run test:api-routes
```

### Environment Variables
**Required in `.env.local`**:
```bash
# Third-party API keys
RAPIDAPI_KEY=your_rapidapi_key_here
APIFY_API_TOKEN=your_apify_token_here

# Firebase Client Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Required for Migration Script**:
- Download Firebase service account JSON from Firebase Console
- Place in `scripts/` directory
- File will be auto-detected (e.g., `scripts/*-service-account.json`)
- **DO NOT commit this file** (already in `.gitignore`)

---
*(The rest of the document, including Design Decisions, Troubleshooting, etc., remains largely relevant and unchanged.)*