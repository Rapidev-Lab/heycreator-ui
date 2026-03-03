# Hey Creator Platform — How to Use Guide

> **Version**: 1.0
> **Last Updated**: March 2026
> **Stack**: Next.js 14, TypeScript, Tailwind CSS, Mock Firestore with JSON Persistence

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Starting the Development Server](#starting-the-development-server)
   - [Verifying Everything Works](#verifying-everything-works)
2. [Understanding Mock Mode](#2-understanding-mock-mode)
   - [How Mock Mode Works](#how-mock-mode-works)
   - [Data Persistence](#data-persistence)
   - [Resetting Data](#resetting-data)
3. [Navigating the Platform](#3-navigating-the-platform)
   - [Role Selection](#role-selection)
   - [The Mock Dev Toolbar](#the-mock-dev-toolbar)
4. [Brand Features](#4-brand-features)
   - [Brand Dashboard](#brand-dashboard)
   - [Creator Discovery](#creator-discovery)
   - [Viewing Creator Profiles](#viewing-creator-profiles)
   - [My Creators](#my-creators)
   - [Campaign Management](#campaign-management)
   - [Creating a Campaign](#creating-a-campaign)
   - [Managing Applications](#managing-applications)
   - [Campaign Dashboard](#campaign-dashboard)
   - [Notifications](#brand-notifications)
5. [Influencer Features](#5-influencer-features)
   - [Influencer Dashboard](#influencer-dashboard)
   - [My Profile](#my-profile)
   - [Campaign Marketplace](#campaign-marketplace)
   - [Viewing a Campaign Brief](#viewing-a-campaign-brief)
   - [Applying to a Campaign](#applying-to-a-campaign)
   - [My Campaigns](#my-campaigns)
   - [Submitting Content](#submitting-content)
   - [Notifications](#influencer-notifications)
6. [Authentication System](#6-authentication-system)
   - [Brand Registration](#brand-registration)
   - [Influencer Registration](#influencer-registration)
   - [Login](#login)
   - [Password Reset](#password-reset)
7. [Demo Data Reference](#7-demo-data-reference)
   - [Demo Users](#demo-users)
   - [Demo Influencers](#demo-influencers)
   - [Demo Campaigns](#demo-campaigns)
8. [API Routes Reference](#8-api-routes-reference)
9. [Project Structure](#9-project-structure)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | 18.x or higher |
| npm         | 9.x or higher |
| Git         | Any recent version |

No Firebase account, API keys, or external service credentials are needed. The platform runs entirely on local mock data.

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd heycreator
npm install
```

### Starting the Development Server

The `.env.local` file should contain a single line:

```
NEXT_PUBLIC_MOCK_MODE=true
```

If this file is missing, create it:

```bash
echo "NEXT_PUBLIC_MOCK_MODE=true" > .env.local
```

Then start the server:

```bash
npm run dev
```

The server starts at **http://localhost:3000** using Next.js Turbopack for fast hot reloading.

### Verifying Everything Works

1. Open **http://localhost:3000** in your browser.
2. You should see the **role selection page** with two cards: "I'm a Creator" and "I'm a Brand".
3. A **purple MockDevToolbar** should appear in the bottom-right corner — this confirms mock mode is active.
4. A `mock-data/` directory will be created automatically in the project root with JSON files containing the seed data.

To verify the production build compiles cleanly:

```bash
npm run build
```

---

## 2. Understanding Mock Mode

### How Mock Mode Works

When `NEXT_PUBLIC_MOCK_MODE=true`, the entire backend stack is replaced with local equivalents:

| Real Service | Mock Replacement | Description |
|---|---|---|
| Firebase Auth | `MockAuthProvider` | Two pre-configured demo users, instant login, no network calls |
| Firestore Database | `MockFirestore` | Full in-memory Firestore emulator with queries, transactions, and batches |
| Firebase Storage | Mock Storage | No-op stub that accepts uploads without storing them |
| External APIs (Apify, RapidAPI) | Removed | All search and enrichment routes query MockFirestore directly |

All API routes (`/api/*`) work identically in mock mode — they call `db.collection(...)` which resolves to MockFirestore instead of real Firestore.

### Data Persistence

All data created during your session is saved to the `mock-data/` directory as JSON files:

```
mock-data/
├── users.json
├── brand_profiles.json
├── influencer_profiles.json
├── campaigns.json
├── global_influencers.json
├── campaign_applications.json
├── user_collections.json
└── notifications.json
```

**Key behaviors:**

- Every create, update, and delete operation writes to disk immediately.
- Data survives server restarts — when the server starts, it loads from JSON files first.
- If JSON files exist, the seed data is skipped (your edits are preserved).
- The `mock-data/` directory is in `.gitignore` and will not be committed.

### Resetting Data

To reset all data back to the original seed state:

```bash
rm -rf mock-data/
npm run dev
```

The server will detect that no JSON files exist and re-seed with the default demo data.

---

## 3. Navigating the Platform

### Role Selection

The root page (`/`) presents two role options:

- **"I'm a Creator"** — enters the Influencer experience
- **"I'm a Brand"** — enters the Brand experience

In mock mode, selecting a role automatically logs you in as the corresponding demo user. No credentials are needed.

### The Mock Dev Toolbar

A purple collapsible panel in the bottom-right corner of every page:

```
┌─────────────────────────┐
│  Mock Mode              │
│  Current Role: brand    │
│  [ Brand ] [ Influencer]│
└─────────────────────────┘
```

- **Current Role** shows whether you are viewing the platform as a Brand or Influencer.
- Click **Brand** or **Influencer** to instantly switch roles. The page reloads with the new user context.
- Role choice is stored in `localStorage` under the key `mock_user_role` and persists across browser tabs and refreshes.

---

## 4. Brand Features

After selecting "I'm a Brand" (or switching to Brand via the toolbar), you are logged in as **Demo Brand** (`brand@demo.heycreator.com`) and taken to the Brand dashboard.

### Brand Sidebar Navigation

The left sidebar provides access to all brand features:

| Icon | Label | Route | Description |
|------|-------|-------|-------------|
| Layout | Dashboard | `/brands/dashboard` | Overview of campaigns, stats, and actions |
| Search | Discovery | `/brands/discover` | Search and find creators |
| Users | My Creators | `/brands/influencers` | Saved creators and lists |
| Folder | My Campaigns | `/brands/campaigns` | All campaigns (active, draft, completed) |
| Chart | Analytics | `/brands/analytics` | Campaign performance data |

### Brand Dashboard

**Route**: `/brands/dashboard`

The dashboard provides a high-level overview:

- **Stats Cards** — Active campaigns, total creators engaged, applications received, active deliverables.
- **Quick Actions** — Buttons to create a campaign, open discovery, or view all campaigns.
- **My Campaigns** — List of active campaigns with status badges, creator counts, budgets, and progress bars. Click any campaign card to open its dashboard.
- **Pending Actions** — Cards for items requiring attention: new applications, deliverables pending review, invitation responses.
- **Recommended Creators** — A grid of creator cards based on campaign relevance. Each shows avatar, name, handle, follower count, and engagement rate with "Chat" and "Add to Campaign" action buttons.

### Creator Discovery

**Route**: `/brands/discover`

The discovery page is where brands search for creators to collaborate with.

**How to search:**

1. Select one or more **platform tabs** (Instagram, TikTok, YouTube, Twitter, Facebook).
2. Type a **keyword** in the search bar (e.g., "fashion", "fitness", a creator name).
3. Optionally set a **location filter** or enable the **"Vetted Only"** toggle.
4. Press **Enter** or click the search icon.

You will be redirected to the results page (`/brands/discover/results`).

**Results Page Features:**

- **Result count** with source breakdown (all results come from the local database in mock mode).
- **Filter bar** — filter by platform, sort by relevance/followers/engagement, toggle grid or list view.
- **Creator cards** showing:
  - Avatar and name/handle
  - Verified badge (if applicable)
  - Stats row: Followers, Engagement Rate, Reach
  - Category tags (up to 3 visible, with a "+N" overflow badge)
  - Action buttons: "Chat" and "Add to Campaign"
- **Streaming loading state** — skeleton cards and a progress indicator while results load.

Clicking a creator card navigates to their full profile page.

### Viewing Creator Profiles

**Route**: `/brands/influencers/[id]`

The creator profile page shows comprehensive information across **4 tabs**:

**Overview Tab:**
- **Profile Header** — Large avatar, name, handle, verified badge, bio, location, and categories.
- **Profile Snapshot** — 4 stat cards: Followers, Engagement Rate, Influence Score, Total Posts.
- **Insights Card** — Best posting time, top hashtag, audience sentiment.
- **Metrics Table** — Platform-by-platform breakdown of followers, engagements, engagement rate, and estimated media value (EMV).
- **Content Grid** — 4-column grid of recent posts. Posts with valid URLs open in a new tab when clicked. An external link icon appears on hover.
- **Demographics Section** — Age distribution bars, gender distribution bars, and geographic distribution cards with flag emojis. Marked with an "Estimated" badge.
- **Similar Creators** — Cards of related creators with platform icons and follower counts.
- **Internal Notes** — A text area to add private notes about this creator (persisted to MockFirestore).

**Content Tab:**
- Full grid of all content with platform and content-type filters.
- Each post shows a thumbnail, platform badge (top-left corner), play button for videos, and engagement stats on hover.

**Demographics Tab:**
- Age distribution (13-17, 18-24, 25-34, 35-44, 45+) with navy horizontal bars.
- Gender distribution (Female, Male, Other).
- Geographic distribution as cards with country flags and percentages.

**Analytics Tab:**
- 4 stat cards: Average Views, Engagement Rate, Growth Rate, Authenticity Score.
- Per-platform performance cards with follower counts and engagement bars.

**Action buttons on the profile:**
- **Message** — Open a message dialog.
- **Add to Campaign** — Select a campaign to add this creator to.

### My Creators

**Route**: `/brands/influencers`

A page to browse and manage saved creators:

- **Search and filter** saved creators by name, platform, or category.
- **Grid or list view** toggle.
- **Creator lists** — Organize creators into named collections.
- Click any creator card to navigate to their full profile.

### Campaign Management

**Route**: `/brands/campaigns`

Displays all campaigns organized by status:

- **Tabs**: All Campaigns, Active, Draft, Completed.
- Each campaign card shows: title, status badge, number of creators applied, budget, deadline, and a progress bar.
- **Sort options**: Newest, Oldest, Deadline, Budget.
- **Search bar** to filter by campaign name.
- Click **"+ Create New Campaign"** to start the creation wizard.
- Click any campaign card to open its dashboard.

### Creating a Campaign

**Route**: `/brands/campaigns/create`

A 6-step wizard with a progress bar at the top:

**Step 1 — Campaign Details (16%)**
- Campaign title (required)
- Description
- Campaign objectives (multi-select: Drive sales, Brand awareness, etc.)
- KPIs
- Categories (multi-select)
- **Save as Draft** button available at any step

**Step 2 — Product (33%)**
- Product name, type, value, and link
- Product images (upload multiple)
- Access instructions
- "Keep as gift" and "Reimburse with voucher" options

**Step 3 — Target Audience (50%)**
- Platform selection
- Audience size range (min/max followers)
- Audience interests
- Age range
- Geographic location

**Step 4 — Budget (66%)**
- Compensation model: Fixed, Range, or Revenue share
- Amount or min/max range
- Currency selector
- Payment terms

**Step 5 — Deliverables (83%)**
- Add deliverables one at a time:
  - Platform (Instagram, TikTok, etc.)
  - Content type (Post, Story, Reel, Video, etc.)
  - Quantity
  - Description
- List of added deliverables with delete option

**Step 6 — Review & Publish (100%)**
- Full summary of all campaign details
- Edit buttons for each section
- **Publish** button with a confirmation dialog

Campaigns are auto-saved to MockFirestore as drafts. Published campaigns appear in the influencer marketplace.

### Managing Applications

**Route**: `/brands/applications`

Lists all applications received across all campaigns:

- Filter by campaign, status, or date range.
- Each application card shows: creator avatar, name, pitch message, proposed rate, and timestamp.
- Action buttons: **Accept**, **Reject**, **Message**, **View Profile**.

### Campaign Dashboard

**Route**: `/brands/campaigns/[id]/dashboard`

A detailed view of a single campaign:

- **Stats Cards** — Applications received, accepted, pending, completed deliverables.
- **Timeline** — Visual milestones and deadlines.
- **Applications Section** — List of creator applications with accept/reject controls.
- **Deliverables Section** — Status of each deliverable (Pending, Submitted, Approved). Download content, approve, or request changes.
- **Creator Performance** — Metrics for accepted creators (views, engagement, shares).

### Brand Notifications

**Route**: `/brands/notifications`

Chronological list of notifications:
- New applications received
- Deliverables submitted for review
- Invitation responses from creators
- Each notification has: icon, message, timestamp, and action button
- Mark as read/unread, or delete

---

## 5. Influencer Features

After selecting "I'm a Creator" (or switching to Influencer via the toolbar), you are logged in as **Demo Creator** (`creator@demo.heycreator.com`) and taken to the Influencer dashboard.

### Influencer Sidebar Navigation

| Icon | Label | Route | Description |
|------|-------|-------|-------------|
| Home | Dashboard | `/influencers` | Overview and recommended campaigns |
| User | My Profile | `/influencers/profile` | View and edit your profile |
| Search | Marketplace | `/influencers/marketplace` | Browse and apply to campaigns |
| Clipboard | My Campaigns | `/influencers/campaigns` | Track applications and active campaigns |

### Influencer Dashboard

**Route**: `/influencers`

- **Stats Cards** — Total applications, pending campaigns, completed campaigns, earnings.
- **My Campaigns** — Active campaigns with title, brand logo, budget, deadline, and status.
- **Recommended Campaigns** — Grid of marketplace campaigns matching your profile.

### My Profile

**Route**: `/influencers/profile`

Two main tabs: **Overview** and **Settings**.

**Overview tab** contains 4 sub-tabs:

- **Overview** — Full profile card with avatar, bio, follower counts, categories, and similar creators.
- **Content** — Grid of your social media posts with thumbnails.
- **Demographics** — Audience age, gender, and geographic distribution.
- **Analytics** — Stats cards (average views, engagement rate, growth rate, authenticity score) and per-platform performance.

**Settings tab:**
- Edit social media account links (Instagram, TikTok, YouTube, etc.)
- Update bio/description
- Manage content categories
- Upload profile picture

### Campaign Marketplace

**Route**: `/influencers/marketplace`

The marketplace is where influencers discover and apply to brand campaigns.

**Layout:**
- **Search bar** to search by keyword.
- **Platform filter** buttons.
- **Filter sidebar** with: budget range, deliverable type, status.
- **Tabs**: Browse Campaigns | My Invitations | Saved Campaigns.
- **View modes**: Grid or List.
- **Sort options**: Relevance, Latest, Budget (high/low), Deadline.
- **Trending Topics** section with popular keywords.

**Campaign cards** display:
- Brand logo and name
- Campaign title
- Category pills
- Budget (fixed or range)
- Deadline
- Platform badges
- **Apply** and **Save** buttons

### Viewing a Campaign Brief

**Route**: `/influencers/marketplace/[id]`

A full campaign brief page:

- **Header** — "Discovery" title, "Overview" tab, Save and Apply Now buttons.
- **Category pills** (dark blue) and **"Active Campaign"** status pill (green).
- **4 stat cards**: Compensation, Apply By date, Location, Duration.
- **Timeline** — Vertical timeline with colored dots showing campaign milestones.
- **Deliverables** — Numbered list with colored number circles.
- **Product** — Circular product image with details.
- **Content Guidelines** — Do's and Don'ts in a two-column layout.
- **Additional Requirements** — Hashtags and mentions displayed as chips.
- **Screening Questions** — Questions from the brand with chip answers or free-text textarea.

### Applying to a Campaign

From any campaign brief page, click **"Apply Now"** to open the Application Modal:

1. **Pitch message** — Write why you are a good fit for this campaign.
2. **Proposed rate** — Enter your price for the deliverables.
3. **Screening questions** — Answer any questions the brand has included.
4. Click **Submit**.
5. A **success modal** appears with a green checkmark and "Thank you for applying" message.

The application is saved to MockFirestore and appears in your "My Campaigns" section.

### My Campaigns

**Route**: `/influencers/campaigns`

Track all your campaign applications and active collaborations:

- **Stats cards**: Total, Pending, Accepted, Success Rate.
- **Search bar** and **filter buttons**: All, Pending, Accepted, Rejected, Completed.
- **Campaign cards** with:
  - Campaign title and brand name
  - Status badge (Pending, Accepted, Completed, etc.)
  - Deadline and budget
  - Action buttons: View Details, Submit Content, Message Brand

Click a campaign card to see its detail page with 5 tabs: Overview, Content, Brief, Payments, Analytics.

### Submitting Content

**Route**: `/influencers/campaigns/[id]/submit-content`

When a campaign is accepted:

1. Navigate to the campaign detail page.
2. Click **"Submit Content"**.
3. View the list of required deliverables.
4. For each deliverable: check the box, upload your content, add notes.
5. Click **Submit**.

### Influencer Notifications

**Route**: `/influencers/notifications`

Chronological list of notifications:
- Application status updates (accepted, rejected)
- New campaign invitations
- Deliverable feedback from brands
- Payment confirmations
- Each notification has an icon, message, timestamp, and action button

---

## 6. Authentication System

The authentication UI is fully built with 17 pages and 22 reusable components. In mock mode, authentication is simulated — no real Firebase calls are made.

### Brand Registration

**Flow**: `/auth/brand/login` → `/auth/brand/signup/account` → `/auth/brand/signup/verify-email` → `/auth/brand/signup/email-verified` → `/auth/brand/signup/company` → `/auth/brand/signup/social` → `/auth/brand/signup/success`

1. **Account** (Step 1/3, 33% progress) — Full name, email, password, confirm password.
2. **Email Verification** — Check inbox and click verification link.
3. **Company** (Step 2/3, 67% progress) — Company name, website, industry (10 options), company size (5 options), your role.
4. **Social** (Step 3/3, 100% progress) — Optional social media links (Instagram, TikTok, Facebook, Twitter/X, LinkedIn).
5. **Success** — "What's Next?" checklist with action items.

Social auth options: Google, Facebook, Apple.

### Influencer Registration

**Flow**: `/auth/influencer/login` → `/auth/influencer/signup/email` → `/auth/influencer/signup/verify-email` → `/auth/influencer/signup/email-verified` → `/auth/influencer/instagram-welcome` → `/auth/influencer/verify/success`

1. **Email Signup** — Email, password, confirm password.
2. **Email Verification** — Verify via email link.
3. **Instagram Welcome** — Authorize Instagram access via OAuth.
4. **Success** — Confirmation and continue to dashboard.

Social auth options: Google, Facebook, Apple, Instagram.

### Login

Both roles support:
- **Email/password** login
- **Phone number** login with OTP
- **Social auth** (Google, Facebook, Apple)

In mock mode, all login methods succeed immediately with the demo user.

### Password Reset

**Brand flow**: Forgot Password → Enter email → Reset Password → Success → Login.
**Influencer flow**: Same pattern with role-specific pages.

The system detects the user's role by email and redirects to the appropriate reset page.

---

## 7. Demo Data Reference

### Demo Users

| Role | Email | Display Name | Auto-Logged In |
|------|-------|-------------|----------------|
| Brand | `brand@demo.heycreator.com` | Demo Brand | Yes (default) |
| Influencer | `creator@demo.heycreator.com` | Demo Creator | Yes (when role switched) |

### Demo Influencers

The platform is pre-loaded with 12 influencer profiles in `global_influencers`:

| Name | Platform | Followers | Location | Categories |
|------|----------|-----------|----------|------------|
| Emma Chamberlain | Instagram | 18.9M | Los Angeles, US | Lifestyle, Fashion |
| Charli D'Amelio | TikTok | 155M | Norwalk, US | Entertainment, Dance |
| Thando Thabethe | Instagram | 3.2M | Johannesburg, ZA | Entertainment, Fashion |
| Trevor Noah | YouTube | 12.1M | New York, US | Comedy, Entertainment |
| Bonang Matheba | Instagram | 3M | Johannesburg, ZA | Entertainment, Beauty |
| Khaby Lame | TikTok | 162M | Milan, IT | Comedy, Entertainment |
| Siya Kolisi | Instagram | 2.8M | Cape Town, ZA | Sports, Fitness |
| Minnie Dlamini | Instagram | 4.1M | Durban, ZA | Entertainment, Lifestyle |
| Cassper Nyovest | Instagram | 7.2M | Johannesburg, ZA | Music, Entertainment |
| MrBeast | YouTube | 236M | Greenville, US | Entertainment |
| Zozibini Tunzi | Instagram | 1.5M | Cape Town, ZA | Fashion, Beauty |
| Lasizwe Dambuza | TikTok | 2.3M | Johannesburg, ZA | Comedy, Entertainment |

These profiles appear in discovery search results. Searching for keywords like "fashion", "comedy", or specific names will return matching results.

### Demo Campaigns

| Campaign | Budget | Status | Target |
|----------|--------|--------|--------|
| Summer Fashion Collection 2025 | ZAR 50,000 (fixed) | Published | South Africa, 18-35 |
| Holiday Season Fashion Campaign | — | Published | — |
| Spring Wellness Product Launch | — | Published | — |
| Winter Sports Gear Promotion | — | Published | — |
| New Year Fitness Challenge | — | Published | — |

All published campaigns appear in the influencer marketplace and are available for applications.

---

## 8. API Routes Reference

All API routes work in mock mode. The interactive API documentation is available at:

**http://localhost:3000/api-docs** (powered by Scalar + OpenAPI 3.0.3)

Key route groups:

| Category | Endpoint | Method | Description |
|----------|----------|--------|-------------|
| **Search** | `/api/search` | POST | Keyword search across influencers |
| **Discovery** | `/api/discover/search` | POST | Advanced filtered search with relevance scoring |
| **Discovery** | `/api/discover/search` | GET | Database stats (total influencers, verified count) |
| **Streaming** | `/api/discover/search/stream` | POST | SSE streaming search results |
| **Profiles** | `/api/profiles` | GET/POST | List or create unified profiles |
| **Profiles** | `/api/influencer/profiles` | GET | Fetch all influencer profiles |
| **Profiles** | `/api/influencer/profiles/[id]` | GET | Fetch single profile with full details |
| **Enrichment** | `/api/influencer/[id]/enrichment` | GET | Get enriched profile data with metrics |
| **Enrichment** | `/api/influencer/[id]/enrichment` | POST | Returns mock response (enrichment skipped) |
| **Enrichment** | `/api/enrich/instagram` | POST | Returns mock response (enrichment skipped) |
| **Campaigns** | `/api/brands/campaigns` | GET/POST | List or create campaigns |
| **Campaigns** | `/api/brands/campaigns/[id]` | GET/PUT/DELETE | Single campaign CRUD |
| **Applications** | `/api/influencers/campaigns/[id]/apply` | POST | Submit application to campaign |
| **Applications** | `/api/influencers/applications` | GET | List all applications for influencer |
| **Notifications** | `/api/notifications` | GET | Fetch user notifications |
| **Image Proxy** | `/api/image-proxy` | GET | Proxy external images (bypasses CORS) |
| **Auth** | `/api/auth/*` | Various | Authentication-related endpoints |

---

## 9. Project Structure

```
heycreator/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API route handlers
│   ├── auth/                     # Authentication pages
│   │   ├── brand/                # Brand auth flow (10 pages)
│   │   └── influencer/           # Influencer auth flow (7+ pages)
│   ├── brands/                   # Brand-side pages
│   │   ├── dashboard/            # Brand dashboard
│   │   ├── discover/             # Creator discovery + results
│   │   ├── influencers/          # My Creators + profile detail
│   │   ├── campaigns/            # Campaign list, create, dashboard, edit
│   │   ├── analytics/            # Analytics page
│   │   ├── applications/         # Application management
│   │   └── notifications/        # Notifications
│   └── influencers/              # Influencer-side pages
│       ├── profile/              # My Profile
│       ├── marketplace/          # Campaign marketplace + detail
│       ├── campaigns/            # My campaigns + detail + submit content
│       └── notifications/        # Notifications
├── components/                   # Reusable React components
│   ├── auth/                     # 22 auth UI components
│   ├── brands/                   # Brand-specific components
│   ├── influencers/              # Influencer-specific components
│   ├── influencer-profile/       # Profile page sections
│   ├── ui/                       # Shared UI primitives
│   ├── ClientProviders.tsx       # App-wide provider wrapper
│   └── MockDevToolbar.tsx        # Development role switcher
├── lib/                          # Business logic and utilities
│   ├── firebase/                 # Firebase config (with mock fallback)
│   │   ├── admin.ts              # Admin SDK (routes through MockFirestore)
│   │   ├── config.ts             # Client-side Firebase config
│   │   └── auth-context.tsx      # Real auth context
│   ├── mock/                     # Mock mode infrastructure
│   │   ├── mock-firestore.ts     # In-memory Firestore with JSON persistence
│   │   ├── mock-admin.ts         # Mock Admin SDK entry point
│   │   ├── mock-auth-context.tsx  # Mock auth provider
│   │   └── seed/                 # Seed data
│   │       ├── index.ts          # Main seed function
│   │       ├── users.ts          # Demo users
│   │       ├── campaigns.ts      # Demo campaigns
│   │       └── global-influencers.ts  # 12 influencer profiles
│   ├── services/                 # Pure calculation services (no external APIs)
│   │   ├── engagement-calculator.service.ts
│   │   ├── relevance-calculator.service.ts
│   │   ├── pricing-engine.service.ts
│   │   └── ...
│   └── config/                   # Platform configs
├── types/                        # TypeScript interfaces
├── mock-data/                    # Auto-generated JSON persistence (gitignored)
├── public/                       # Static assets
│   └── openapi.json              # OpenAPI 3.0.3 spec (38+ endpoints)
├── docs/                         # Documentation and UI references
├── .env.local                    # NEXT_PUBLIC_MOCK_MODE=true
└── package.json
```

---

## 10. Troubleshooting

### The page shows a Firebase initialization error

Make sure `.env.local` contains `NEXT_PUBLIC_MOCK_MODE=true`. Without this flag, the app will try to connect to real Firebase and fail.

### The Mock Dev Toolbar is not visible

- Verify that `NEXT_PUBLIC_MOCK_MODE=true` is set in `.env.local`.
- Restart the dev server after changing environment variables.
- The toolbar is a small purple button in the bottom-right corner — it may be collapsed. Click it to expand.

### No data appears on dashboard or search

The mock data is seeded on first server start. Check that the `mock-data/` directory was created:

```bash
ls mock-data/
```

If it is empty or missing, restart the dev server:

```bash
npm run dev
```

### Data changes are lost after restart

This should not happen — data is persisted to `mock-data/*.json` files. If it does occur:

1. Check that the `mock-data/` directory is writable.
2. Look for error messages in the server console containing `[MockFirestore] Persist error`.

### Build fails with import errors

Run the build and check for errors:

```bash
npm run build
```

All external API dependencies (Apify, RapidAPI, platform scrapers) have been removed. If you see import errors referencing `lib/apify/`, `lib/services/platforms/`, or `lib/services/search/`, those files no longer exist and the importing file needs to be updated.

### How to check what data is stored

You can inspect the JSON files directly:

```bash
# View all users
cat mock-data/users.json | python3 -m json.tool

# View all campaigns
cat mock-data/campaigns.json | python3 -m json.tool

# View all influencers
cat mock-data/global_influencers.json | python3 -m json.tool
```

### Port 3000 is already in use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

---

## Available npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development server | `npm run dev` | Start with Turbopack hot reload on port 3000 |
| Production build | `npm run build` | Create optimized production build |
| Start production | `npm start` | Serve the production build |
| Lint | `npm run lint` | Run ESLint checks |
