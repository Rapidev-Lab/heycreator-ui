# Hey Creator Platform Audit

**Date**: March 4, 2026
**Scope**: Full frontend + backend feature map, UI test results, mock mode fixes, and recommendations

---

## Executive Summary

The Hey Creator platform is a comprehensive influencer discovery and campaign management tool built with Next.js 14, TypeScript, Tailwind CSS, and Firebase. The codebase contains **~68 pages**, **~221 components**, **~70 API routes**, **12 services**, and **6 custom hooks**.

**Key Findings:**
- All pages now render in mock mode after auth fix (1 code change)
- 15+ pages are placeholder/not implemented (mostly notifications, chats, analytics, settings)
- Core flows work: auth, campaign CRUD, marketplace, discovery, applications
- 14 Firestore collections in use
- Backend is mature with proper auth middleware, role-based access, and mock infrastructure

---

## 1. Bug Fix Applied

### Campaign Dashboard 401 Auth Error (FIXED)

**File**: `app/brands/campaigns/[id]/dashboard/page.tsx`

**Root Cause**: `getCampaignById()` from `lib/services/campaign.service.ts` uses `auth.currentUser` from `lib/firebase/config.ts` to get the auth token. In mock mode, `auth.currentUser` is hardcoded to `null` (line 39 of config.ts), so no Bearer token was sent to the API, causing a 401 loop.

**Fix Applied**:
- Modified `fetchCampaign` in the dashboard page to use `firebaseUser.getIdToken()` from the React auth context (same pattern as the campaigns list page)
- Updated `getCampaignById` service to accept an optional `token` parameter for future callers
- Removed unused `getCampaignById` import from dashboard page

**Files Changed**:
- `app/brands/campaigns/[id]/dashboard/page.tsx` (fetchCampaign rewritten)
- `lib/services/campaign.service.ts` (added optional token param)

---

## 2. Page-by-Page Test Results

### Legend
- ✅ = Works correctly in mock mode
- ⚠️ = Works but has minor issues
- 🔲 = Placeholder / Not implemented
- ❌ = Broken (before fix)  →  ✅ (after fix)

### A. Role Selection & Auth

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Role selection (auto-redirects to dashboard if auth'd in mock) |
| `/auth/influencer/login` | ⚠️ | Works but Login with empty creds shows Firebase error in mock mode |
| `/auth/influencer/signup/email` | ✅ | Form renders correctly |
| `/auth/influencer/forgot-password` | ✅ | Email input renders |
| `/auth/influencer/reset-password` | ✅ | Shows "No reset code" (expected without oobCode) |
| `/auth/influencer/reset-success` | ✅ | Success message renders |
| `/auth/brand/login` | ⚠️ | Same empty creds issue as influencer |
| `/auth/brand/signup/email` | ✅ | Form renders |
| `/auth/brand/signup/account` | ✅ | Step 1/3 with progress bar (needs sessionStorage) |
| `/auth/brand/signup/company` | ✅ | Step 2/3 with industry/size dropdowns |
| `/auth/brand/signup/social` | ✅ | Step 3/3 with social links |
| `/auth/brand/forgot-password` | ✅ | Email input renders |
| `/auth/brand/reset-password` | ✅ | Shows "No reset code" (expected) |
| `/auth/brand/reset-success` | ✅ | Success message renders |

### B. Brand Pages

| Route | Status | Notes |
|-------|--------|-------|
| `/brands/dashboard` | ✅ | Stats, campaigns, recommended creators |
| `/brands/discover` | ✅ | Search bar, platform filters, recommended section |
| `/brands/discover/results` | ✅ | SSE streaming search results |
| `/brands/influencers` | ✅ | My Creators with 12 mock creators (3 tabs) |
| `/brands/influencers/[id]` | ✅ | 4-tab profile (Overview, Content, Demographics, Analytics) |
| `/brands/campaigns` | ✅ | Campaign list with 5 mock campaigns, search, filters |
| `/brands/campaigns/create` | ✅ | 6-step wizard renders correctly |
| `/brands/campaigns/[id]/dashboard` | ✅ | **FIXED** - Was 401, now loads with full data |
| `/brands/campaigns/[id]/edit` | ✅ | Edit form renders |
| `/brands/profile` | ✅ | Profile editor with Overview & Settings tabs |
| `/brands/analytics` | 🔲 | Placeholder page |
| `/brands/chats` | 🔲 | Placeholder page |
| `/brands/notifications` | 🔲 | Placeholder page |
| `/brands/settings` | 🔲 | Placeholder page |

### C. Influencer Pages

| Route | Status | Notes |
|-------|--------|-------|
| `/influencers` | ✅ | Dashboard with stats, campaigns, applications |
| `/influencers/marketplace` | ✅ | 3 published campaigns, filters, search, sort |
| `/influencers/marketplace/[id]` | ✅ | Full campaign brief (timeline, deliverables, guidelines, apply) |
| `/influencers/campaigns` | ✅ | My campaigns list |
| `/influencers/campaigns/[id]` | ✅ | Campaign details |
| `/influencers/campaign-applications` | ✅ | 4 stat cards, search, filters |
| `/influencers/profile` | ✅ | Profile editor |
| `/influencers/analytics` | 🔲 | Placeholder |
| `/influencers/chats` | 🔲 | Placeholder |
| `/influencers/notifications` | 🔲 | Placeholder |
| `/influencers/settings` | 🔲 | Placeholder |
| `/influencers/calendar` | 🔲 | Placeholder |
| `/influencers/invitations` | 🔲 | Placeholder |

### D. Responsive Testing

All tested pages showed excellent mobile responsiveness:
- Sidebars collapse to hamburger menu
- Campaign cards stack vertically
- Forms remain usable on narrow screens
- Tables become horizontally scrollable

---

## 3. Full Feature Map: Frontend vs Backend

### FULLY IMPLEMENTED (Frontend + Backend Connected)

| Feature | Frontend | Backend | Collections |
|---------|----------|---------|-------------|
| **Email/Password Auth** | Login, signup, verification, password reset pages | Firebase Auth + Firestore user docs | `users` |
| **Social OAuth** | Google, Facebook, Apple, Instagram buttons | Firebase Auth providers | `users` |
| **Campaign CRUD** | List, create wizard, edit, dashboard | GET/POST/PATCH/DELETE `/api/campaigns/*` | `campaigns` |
| **Campaign Marketplace** | Browse, filter, search, sort | GET `/api/influencers/campaigns/marketplace` | `campaigns` |
| **Campaign Applications** | Apply modal, applications list, stats | POST `/api/influencers/campaigns/[id]/apply`, GET `/api/influencers/applications` | `campaign_applications` |
| **Campaign Invitations** | Invite modal, invite rows | GET/POST `/api/campaigns/[id]/invitations` | `campaign_invitations` |
| **Campaign Documents** | Upload/manage documents | GET/POST `/api/campaigns/[id]/documents` | `campaign_documents` |
| **Deliverables** | Submit content, review flow | GET/POST `/api/deliverables` | `deliverables` |
| **Discovery Search** | Multi-platform search, filters, streaming | POST `/api/discover/search/stream` (SSE) | `global_influencers` |
| **Creator Profiles** | 4-tab profile (Overview, Content, Demographics, Analytics) | GET `/api/influencer/profiles/[id]`, enrichment pipeline | `global_influencers`, `user_collections` |
| **Profile Enrichment** | Background enrichment, staleness banner | GET/POST `/api/influencer/[id]/enrichment` | `global_influencers` |
| **Creator Lists** | Create, manage, add creators | GET/POST `/api/brands/lists` | `creator_lists` |
| **Image Proxy** | Avatar display with fallback | GET `/api/image-proxy` | None |
| **Notifications** | Notification bell, FCM registration | GET `/api/notifications`, POST `/api/notifications/register-token` | `notifications` |
| **Brand Profile** | Profile editor, avatar upload | GET/PATCH brand profile | `users`, Firebase Storage |
| **Influencer Profile** | Profile editor | GET/PATCH influencer profile | `users` |
| **Dashboard Stats** | Brand dashboard with stats | GET `/api/dashboard/stats`, `/api/dashboard/recommended` | Multiple |

### FRONTEND ONLY (No Backend / Placeholder)

| Feature | Frontend Status | Backend Needed |
|---------|----------------|----------------|
| **Brand Analytics** | Placeholder page, skeleton components exist | Analytics aggregation API, chart data endpoints |
| **Brand Chat/Messaging** | Placeholder page | Real-time messaging service (WebSocket/Firestore), message API |
| **Brand Settings** | Placeholder page | Settings CRUD API |
| **Brand Monitor** | Placeholder page | Campaign monitoring/alerting service |
| **Brand Recruit** | Placeholder page | Recruitment workflow API |
| **Influencer Analytics** | Placeholder page | Performance analytics API |
| **Influencer Chat** | Placeholder page | Same messaging service as brand |
| **Influencer Settings** | Placeholder page | Settings CRUD API |
| **Influencer Calendar** | Placeholder page | Calendar/scheduling API |
| **Influencer Invitations Page** | Placeholder (API exists but page not wired) | Wire to existing `/api/influencers/invitations` |
| **Payments Tab** | Disabled tab on campaign dashboard | Payment processing, wallet, withdrawal API |
| **Content Analytics** | Placeholder in campaign dashboard analytics tab | Content performance tracking |

### BACKEND ONLY (API Exists, Not Fully Wired to Frontend)

| API Route | Status | Frontend Needed |
|-----------|--------|-----------------|
| `/api/metrics` | POST - calculation engine | Wire to analytics dashboards |
| `/api/pricing` | POST - pricing calculator | Wire to campaign budget tool |
| `/api/save-apify-data` | Data ingestion endpoint | Admin/background process |
| `/api/brands/analytics/top-content` | Returns top content | Wire to analytics page |
| `/api/brands/creators/export` | CSV export | Add export button to My Creators |
| `/api/brands/actions` | Pending actions | Wire to dashboard action items |

---

## 4. Codebase Statistics

### Pages
| Category | Count |
|----------|-------|
| Auth Pages | 29 |
| Brand Pages | 14+ |
| Influencer Pages | 12+ |
| Shared/Other | 13 |
| **Total** | **~68** |

### Components
| Category | Count |
|----------|-------|
| Auth | 32 |
| Campaigns | 60+ |
| Brands | 30 |
| Influencers | 31 |
| UI/Shared | 24 |
| Influencer Profile | 13 |
| Discovery | 16 |
| Root | 11 |
| Search | 3 |
| **Total** | **~221** |

### API Routes
| Category | Count |
|----------|-------|
| Authentication | 9 |
| Search & Discovery | 7 |
| Profile Management | 15 |
| Campaign Management | 14 |
| Notifications | 6 |
| Applications | 4 |
| Brand & Creator | 9 |
| Invitations | 2 |
| Deliverables | 4 |
| **Total** | **~70** |

### Backend Services & Hooks
| Category | Count |
|----------|-------|
| Services (`lib/services/`) | 12 |
| Custom Hooks (`lib/hooks/`) | 6 |
| Firebase modules | 10 |
| Utility modules | 15 |
| Middleware | 1 |
| Validators | 1 |

### Firestore Collections (14)
`global_influencers`, `users`, `campaigns`, `campaign_applications`, `campaign_invitations`, `campaign_documents`, `notifications`, `deliverables`, `user_collections`, `influencer_profiles`, `influencer_detailed_data`, `content_posts`, `profile_dedup_locks`, `creator_lists`

---

## 5. Architecture Notes for Backend Engineer

### Auth Flow
- **Client**: `MockAuthProvider` / `AuthProvider` (switched via `NEXT_PUBLIC_MOCK_MODE`)
- **Server**: `requireAuth()` middleware verifies Bearer tokens via `getAdminAuth().verifyIdToken()`
- **Mock**: `mock-token-{uid}` format parsed by regex in `mock-admin.ts`
- **Roles**: Brand (`requireBrandRole`) and Influencer (`requireCreatorRole`) checked from Firestore `users.role`
- **Gap**: `auth.currentUser` from `lib/firebase/config.ts` is `null` in mock mode. Service functions that use it (like `getCampaignById`) need the token passed explicitly or should use the auth context.

### Data Flow
```
Frontend Page
  → useAuth() hook (provides firebaseUser.getIdToken())
  → fetch('/api/...', { headers: { Authorization: Bearer ${token} } })
  → API Route (requireAuth middleware)
  → getAdminDb() (MockFirestore or real Firestore)
  → Firestore collection read/write
  → JSON response
```

### Mock Infrastructure
- `lib/mock/mock-firestore.ts` - Full in-memory Firestore with query support
- `lib/mock/seed/` - Seeds campaigns, users, applications, notifications, global_influencers
- `lib/mock/mock-admin.ts` - Server-side mock for admin auth + Firestore
- `lib/mock/mock-auth-context.tsx` - Client-side mock auth provider
- Mock data persists to `mock-data/*.json` files (gitignored)

### Key Design Patterns
1. **Hybrid Search**: Database-first → live API fallback (SSE streaming)
2. **Progressive Enrichment**: Background Apify enrichment with TTL staleness
3. **Campaign Recommendation**: 6-factor weighted scoring (category, platform, qualification, location, engagement, urgency)
4. **Image Proxy**: 2-stage fallback (direct fetch → weserv.nl proxy)
5. **Role-based UI**: Separate sidebars, layouts, and pages for Brand vs Influencer

---

## 6. Recommended Next Steps

### Priority 1: Wire Existing Backend to Frontend
1. **Influencer Invitations page** - API exists (`/api/influencers/invitations`), just needs wiring
2. **Brand Actions dashboard** - API exists (`/api/brands/actions`), wire to dashboard
3. **Export creators** - API exists (`/api/brands/creators/export`), add button
4. **Metrics/Pricing** - APIs exist, wire to relevant UIs

### Priority 2: Build Missing Backend
1. **Payments system** - Campaign payments, influencer wallet, withdrawal
2. **Messaging/Chat** - Real-time messaging between brands and influencers
3. **Analytics dashboards** - Aggregate campaign performance data
4. **Settings pages** - Account settings, notification preferences

### Priority 3: Production Hardening
1. Replace `x-user-id` development fallback with proper JWT everywhere
2. Add Firestore security rules
3. Create required Firestore indexes
4. Add error boundaries and loading states
5. Remove mock data dependencies from any remaining pages
6. Add rate limiting to public API routes

---

## 7. Known Minor Issues

1. **Login with empty credentials** - Shows Firebase error in mock mode (`authInstance._getRecaptchaConfig is not a function`). Low priority since mock users auto-login.
2. **Brand signup multi-step** - Direct navigation to step 2/3 redirects to email step (needs sessionStorage context from step 1). Expected behavior.
3. **`RoleCard copy.tsx`** - Duplicate file in components root, likely unused. Should be deleted.
4. **`data/mockCampaigns.ts`** - Client-side mock data with IDs `1-5` that don't match server seed IDs `mock-campaign-*`. Not currently used by any page but could cause confusion.
