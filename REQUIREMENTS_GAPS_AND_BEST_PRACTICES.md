# Hey Creator Platform — Gaps Analysis & Best Practice Audit

**Last Updated**: March 4, 2026
**Platform**: Hey Creator — Influencer Discovery & Campaign Management
**Purpose**: Identify all missing requirements, feature gaps, and best practice violations for engineering prioritization

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 7 | Security vulnerabilities or data integrity risks |
| HIGH | 18 | Missing core business features or significant tech debt |
| MEDIUM | 23 | Missing features affecting user experience |
| LOW | 14 | Nice-to-have improvements or minor technical debt |
| **Total** | **62** | |

### Top 5 Priorities

1. **Remove auth dev backdoor** — `x-user-id` header bypasses authentication (CRITICAL)
2. **Complete Firestore security rules** — 8 of 14 collections have NO client-side rules (CRITICAL)
3. **No design system / design tokens** — 6+ navy blue variants, 5 button components, no unified foundation (CRITICAL)
4. **Payment/billing integration** — Core business flow missing for both roles (CRITICAL)
5. **Add request validation** — No schema validation on any API route (CRITICAL)
6. **Chat/messaging system** — Both roles have placeholder pages, no backend (HIGH)

### Severity Legend

| Level | Meaning |
|-------|---------|
| CRITICAL | Security vulnerability or data integrity risk — fix before production |
| HIGH | Missing core business feature or significant tech debt |
| MEDIUM | Missing feature that affects user experience |
| LOW | Nice-to-have improvement or minor technical debt |

---

## 1. MISSING FEATURES

### 1.1 Brand Side Gaps

| # | Feature | Severity | Current State | Impact | Effort |
|---|---------|----------|---------------|--------|--------|
| B-GAP-1 | Payment/billing system | CRITICAL | Not implemented | Brands cannot pay creators; no invoicing, no payment tracking | L (4-6 weeks) |
| B-GAP-2 | Contract management | CRITICAL | Not implemented | No legal agreements between brands and creators; risk exposure | L (3-4 weeks) |
| B-GAP-3 | Chat/messaging system | HIGH | 🔲 Placeholder page at `/brands/chats` | Brands cannot communicate with creators in-platform | L (4-6 weeks) |
| B-GAP-4 | Analytics dashboard charts | HIGH | ⚠️ Partial — fetches data, no visualizations | Brands cannot see ROI, performance trends, or campaign comparisons | M (2-3 weeks) |
| B-GAP-5 | Campaign monitoring | HIGH | 🔲 Placeholder page at `/brands/monitor` | No real-time tracking of campaign deliverables and creator activity | M (2-3 weeks) |
| B-GAP-6 | Recruitment workflow | HIGH | 🔲 Placeholder page at `/brands/recruit` | No structured workflow for outreach and recruitment funnels | M (3-4 weeks) |
| B-GAP-7 | ROI tracking & reporting | MEDIUM | Not implemented | Cannot measure return on influencer marketing spend | M (2-3 weeks) |
| B-GAP-8 | Team/multi-user management | MEDIUM | Not implemented | Only single-user accounts; no team roles or permissions | L (3-4 weeks) |
| B-GAP-9 | Brand verification | MEDIUM | Not implemented | No trust signal for creators evaluating brand legitimacy | S (1 week) |
| B-GAP-10 | Campaign templates | MEDIUM | Not implemented | Must create campaigns from scratch every time | S (1-2 weeks) |
| B-GAP-11 | Bulk campaign operations | MEDIUM | Not implemented | Cannot pause/archive multiple campaigns at once | S (1 week) |
| B-GAP-12 | Saved search functionality | LOW | Firestore indexes exist but UI not wired | Cannot save and reuse discovery search criteria | S (1 week) |
| B-GAP-13 | Campaign duplication | LOW | Not implemented | Cannot clone existing campaigns as starting point | S (< 1 week) |
| B-GAP-14 | A/B testing for campaigns | LOW | Not implemented | Cannot compare campaign variations for optimization | L (4+ weeks) |

### 1.2 Influencer Side Gaps

| # | Feature | Severity | Current State | Impact | Effort |
|---|---------|----------|---------------|--------|--------|
| I-GAP-1 | Earnings & payment tracking | CRITICAL | Not implemented | Influencers cannot track income, pending payments, or payment history | L (3-4 weeks) |
| I-GAP-2 | Invoice generation | CRITICAL | Not implemented | No way to generate or send invoices for completed work | M (2-3 weeks) |
| I-GAP-3 | Analytics dashboard | HIGH | 🔲 Placeholder at `/influencers/analytics` | Cannot track engagement growth, audience insights, content performance | M (2-3 weeks) |
| I-GAP-4 | Chat/messaging | HIGH | 🔲 Placeholder at `/influencers/chats` | Cannot communicate with brands in-platform | L (4-6 weeks, shared with brand) |
| I-GAP-5 | Calendar API integration | HIGH | ⚠️ Full UI (362 lines), mock data only | Calendar shows hardcoded events instead of real campaign deadlines | M (1-2 weeks) |
| I-GAP-6 | Portfolio / media kit builder | MEDIUM | Not implemented | Influencers cannot showcase their best work to brands | M (3-4 weeks) |
| I-GAP-7 | Rate card management | MEDIUM | Not implemented | No way to set and display standard pricing for different content types | S (1-2 weeks) |
| I-GAP-8 | Contract signing | MEDIUM | Not implemented (depends on B-GAP-2) | Cannot digitally sign campaign agreements | M (2-3 weeks) |
| I-GAP-9 | Social account auto-sync | MEDIUM | Manual link only via `/api/influencer/my-profile/link-account` | Stats don't auto-refresh from connected social accounts | M (2-3 weeks) |
| I-GAP-10 | Content scheduling | LOW | Not implemented; "Schedule" tab disabled in My Campaigns | Cannot plan and schedule content delivery dates | M (2-3 weeks) |
| I-GAP-11 | Growth analytics | LOW | Not implemented | Cannot track follower growth trends over time | M (2-3 weeks) |
| I-GAP-12 | Collaboration tools | LOW | Not implemented | No shared content drafts or brand approval workflow before posting | M (3-4 weeks) |

### 1.3 Shared / Platform Gaps

| # | Feature | Severity | Current State | Impact | Effort |
|---|---------|----------|---------------|--------|--------|
| S-GAP-1 | JWT session management | CRITICAL | Uses `x-user-id` header as dev fallback | Auth can be bypassed in development; no proper session tokens | M (2 weeks) |
| S-GAP-2 | Rate limiting | CRITICAL | No rate limiting on any API route | Platform vulnerable to abuse, scraping, and DDoS | S (1 week) |
| S-GAP-3 | Input validation (schema) | CRITICAL | Manual field-exists checks only | No type/format validation; potential injection vectors | M (2-3 weeks) |
| S-GAP-4 | Firestore security rules | CRITICAL | Only 6 of 14 collections have rules | 8 collections (campaigns, applications, notifications, etc.) have no client-side protection | M (1-2 weeks) |
| S-GAP-5 | Global error boundary | HIGH | No React error boundary | Unhandled errors crash entire page instead of showing fallback | S (< 1 week) |
| S-GAP-6 | Automated testing | HIGH | Playwright installed, 0 test files | No safety net for regressions; cannot validate changes | L (ongoing) |
| S-GAP-7 | CI/CD pipeline | HIGH | No pipeline configured | Manual deployments; no automated quality gates | M (1-2 weeks) |
| S-GAP-8 | Monitoring & alerting | HIGH | No APM or error tracking | Cannot detect production issues; no performance baselines | M (1-2 weeks) |
| S-GAP-9 | CSRF protection | MEDIUM | Not implemented | State-changing API routes vulnerable to cross-site request forgery | S (1 week) |
| S-GAP-10 | Audit logging | MEDIUM | Not implemented | No record of who did what and when; compliance risk | M (2-3 weeks) |
| S-GAP-11 | Data export / GDPR compliance | MEDIUM | Data deletion page exists at `/data-deletion` but no backend | Cannot fulfill data export or erasure requests | M (2-3 weeks) |
| S-GAP-12 | Health check endpoint | MEDIUM | Not implemented | No way to verify service health for load balancers or monitoring | S (< 1 day) |
| S-GAP-13 | Environment-specific configs | MEDIUM | All config in `.env.local` | No separate staging/production configs; easy to misconfigure | S (1 week) |
| S-GAP-14 | Caching strategy | MEDIUM | In-memory only (lost on restart) | No Redis or persistent cache; cold starts are slow | M (2-3 weeks) |
| S-GAP-15 | Firestore index deployment | MEDIUM | `firestore.indexes.json` has 30+ indexes but may not be deployed | Queries may fail in production without indexes | S (< 1 day) |
| S-GAP-16 | Service worker / PWA | LOW | Not implemented | No offline capability or app-like experience on mobile | M (2-3 weeks) |
| S-GAP-17 | Localization (i18n) | LOW | English only, no i18n framework | Cannot serve international markets | L (4+ weeks) |
| S-GAP-18 | Feature flags | LOW | Only `NEXT_PUBLIC_MOCK_MODE` exists | Cannot gradually roll out features or A/B test | S (1-2 weeks) |

---

## 2. SECURITY ISSUES

### 2.1 Authentication & Authorization

| # | Issue | Severity | File | Details | Remediation |
|---|-------|----------|------|---------|-------------|
| SEC-1 | `x-user-id` header auth bypass | CRITICAL | `lib/middleware/campaign-auth.ts` | When Bearer token is missing, falls back to `x-user-id` header. Gated behind dev env check but still risky. | Remove entirely or gate behind explicit `ALLOW_DEV_AUTH_BYPASS=true` env var. Never deploy with this enabled. |
| SEC-2 | Firestore rules incomplete | CRITICAL | `firestore.rules` | Only covers: `users`, `unified_profiles`, `influencer_detailed_data`, `content_posts`, `brand_profiles`, `influencer_profiles`. Missing rules for: `campaigns`, `campaign_applications`, `campaign_invitations`, `notifications`, `deliverables`, `user_collections`, `creator_lists`, `profile_dedup_locks`. | Write rules for all 14 collections with proper read/write conditions. |
| SEC-3 | No CORS configuration | HIGH | `next.config.mjs` | API routes accessible from any origin. | Add CORS headers middleware limiting origins to known domains. |
| SEC-4 | No Content Security Policy | HIGH | `next.config.mjs` | No CSP headers to prevent XSS and data injection. | Add CSP headers in Next.js config. |
| SEC-5 | No input validation library | HIGH | All API routes | `validateRequiredFields()` only checks field existence, not type, format, or sanitization. | Adopt Zod for all request/response validation. |
| SEC-6 | Service account file in `scripts/` | MEDIUM | `scripts/heycreator-service-account.json` | Listed in `.gitignore` but exists on disk. If `.gitignore` fails, credentials leak. | Move to environment variable (`FIREBASE_SERVICE_ACCOUNT_BASE64`), delete file from disk. |

### 2.2 Data Protection

| # | Issue | Severity | Details | Remediation |
|---|-------|----------|---------|-------------|
| SEC-7 | `console.log` in production code | MEDIUM | 123 occurrences across 19 source files. May log sensitive data (tokens, user info, API responses). | Strip console.log in production builds or replace with structured logger. |
| SEC-8 | No field-level encryption | LOW | Sensitive data (emails, social tokens) stored as plaintext in Firestore. | Encrypt PII fields at rest; use Firebase Security Rules for access control. |
| SEC-9 | No PII handling policy | LOW | No code-level enforcement of data handling practices. | Document and enforce PII handling in code reviews. |

---

## 3. ARCHITECTURE ISSUES

### 3.1 Code Organization

| # | Issue | Severity | File(s) | Remediation |
|---|-------|----------|---------|-------------|
| ARCH-1 | Monolithic page files | HIGH | `app/brands/campaigns/create/page.tsx` (1,193 lines), `app/brands/influencers/[id]/page.tsx` (1,300+ lines), `app/influencers/marketplace/page.tsx` (1,200+ lines) | Extract into sub-components. Campaign create wizard already has Step1-6 but page still orchestrates too much. |
| ARCH-2 | Duplicate/backup files | LOW | `components/RoleCard copy.tsx`, `app/brands/influencers/[id]/page_backup.tsx` | Delete both. Use git history for backups. |
| ARCH-3 | Mixed auth patterns | HIGH | Various pages | Some use `useAuth()` + `firebaseUser.getIdToken()`, some use `useAuthFetch()` hook, some services use `auth.currentUser` (breaks in mock mode). | Standardize on `useAuthFetch()` for all client-side API calls. |
| ARCH-4 | Dual AuthContext files | MEDIUM | `lib/context/AuthContext.tsx` (compatibility re-export), `lib/firebase/auth-context.tsx` (implementation) | Remove compatibility wrapper. Update all imports to use `lib/firebase/auth-context`. |
| ARCH-5 | Unused client mock data | LOW | `data/mockCampaigns.ts` | Client-side mock with IDs 1-5 that don't match server mock IDs `mock-campaign-*`. Not used by any active page. Delete it. |

### 3.2 Type Safety

| # | Issue | Severity | Details | Remediation |
|---|-------|----------|---------|-------------|
| TYPE-1 | No request/response schema validation | HIGH | API routes use manual `if (!field)` checks. | Adopt Zod schemas for all API request bodies and responses. |
| TYPE-2 | Extensive `any` type usage | MEDIUM | Several pages and services use `any` for API responses. | Replace with proper TypeScript interfaces from `types/`. |
| TYPE-3 | Inconsistent interface usage | MEDIUM | `SearchResultProfile` (api.ts) vs `Influencer` (influencer.ts) vs `GlobalInfluencer` — overlapping data models. | Consolidate into a unified type hierarchy. |
| TYPE-4 | Mock Firestore divergence | LOW | `lib/mock/mock-firestore.ts` approximates SDK behavior but may diverge on edge cases (compound queries, transactions). | Add compatibility tests comparing mock vs real Firestore behavior. |

### 3.3 State Management

| # | Issue | Severity | Details | Remediation |
|---|-------|----------|---------|-------------|
| STATE-1 | No centralized state management | MEDIUM | Each page independently fetches and manages data. No shared cache. | Evaluate SWR (already in deps) or React Query for server state caching. |
| STATE-2 | Prop drilling in component trees | MEDIUM | Campaign dashboard passes data 3-4 levels deep through props. | Use React Context for campaign dashboard state, or component composition. |
| STATE-3 | No cross-page data sharing | MEDIUM | Navigating between discover → profile → back loses search state. | Implement URL-based state persistence or SWR cache. |
| STATE-4 | SSE cleanup inconsistency | LOW | Some pages (discover results) clean up EventSource on unmount, others may not. | Audit all SSE consumers and ensure consistent cleanup in useEffect return. |

---

## 4. PERFORMANCE ISSUES

| # | Issue | Severity | Impact | Remediation |
|---|-------|----------|--------|-------------|
| PERF-1 | No pagination on some endpoints | MEDIUM | `GET /api/brands/creators/global?limit=200` loads all creators at once. | Add cursor-based pagination for large datasets. |
| PERF-2 | All images through proxy | MEDIUM | Every avatar goes through `/api/image-proxy`, adding latency. No CDN or `next/image` optimization. | Use `next/image` with remote patterns for known CDNs. Reserve proxy for CORS-blocked URLs only. |
| PERF-3 | No lazy loading for heavy components | MEDIUM | Campaign create wizard renders all 6 steps. Profile page loads all 4 tabs. | Use `React.lazy()` and `Suspense` for tab content and wizard steps. |
| PERF-4 | No bundle analysis | LOW | No visibility into JavaScript bundle size or code splitting effectiveness. | Add `@next/bundle-analyzer` and review output. |
| PERF-5 | In-memory cache only | MEDIUM | `CacheManager` in enrichment service uses in-memory Map. Lost on every server restart. | Add Redis or Firestore-based caching for production. |
| PERF-6 | No CDN for static assets | LOW | Static files served directly by Next.js. | Configure CDN (Cloudflare, Vercel Edge) for static asset delivery. |
| PERF-7 | Large JSON responses | LOW | Enrichment API returns `rawData` field with full Apify responses. `toLightProfile()` exists but may not be used everywhere. | Ensure all API responses strip `rawData` before sending to client. |

---

## 5. TESTING GAPS

| Category | Current State | Target | Priority | Effort |
|----------|---------------|--------|----------|--------|
| Unit tests | 0 tests | Core services (enrichment, search, auth middleware) | HIGH | M (2-3 weeks) |
| Integration tests | 0 tests | All API routes with mock Firestore | HIGH | M (2-3 weeks) |
| E2E tests | 0 tests (Playwright installed) | Critical user journeys (auth, campaign create, apply, discover) | HIGH | M (3-4 weeks) |
| Component tests | 0 tests | Key interactive components (forms, modals, filters) | MEDIUM | M (2-3 weeks) |
| API contract tests | Manual script only (`scripts/test-api-routes.ts`) | Automated contract tests for all 70 routes | MEDIUM | M (2-3 weeks) |

**Recommended approach**: Start with E2E tests for critical paths (auth flow, campaign creation, marketplace apply), then add API route tests, then unit tests for services.

---

## 6. CODE QUALITY ISSUES

| # | Issue | Severity | Count/Details | Remediation |
|---|-------|----------|---------------|-------------|
| CQ-1 | `console.log` in production | MEDIUM | 123 occurrences across 19 files | Replace with structured logger (e.g., pino) or strip in production build |
| CQ-2 | TODO/FIXME comments | LOW | ~8 in source files | Create backlog tickets, remove comments |
| CQ-3 | No ESLint enforcement | MEDIUM | Config exists but minimal rules | Configure strict ESLint rules (react-hooks, no-unused-vars, no-any) |
| CQ-4 | No Prettier configuration | LOW | No `.prettierrc` | Add Prettier with Tailwind plugin for consistent formatting |
| CQ-5 | Inconsistent file naming | LOW | Mix of camelCase (`AuthContext.tsx`) and kebab-case (`campaign-auth.ts`) | Standardize on kebab-case for files, PascalCase for components |
| CQ-6 | No JSDoc documentation | LOW | No function-level documentation | Add JSDoc to public APIs, services, and complex utilities |
| CQ-7 | No code review guidelines | LOW | No `CONTRIBUTING.md` or PR template | Create contributing guide with review checklist |

---

## 7. DEVOPS GAPS

| # | Issue | Severity | Current State | Remediation | Effort |
|---|-------|----------|---------------|-------------|--------|
| OPS-1 | No Docker configuration | HIGH | No `Dockerfile` or `docker-compose.yml` | Create multi-stage Dockerfile for consistent environments | S (1 week) |
| OPS-2 | No deployment scripts | HIGH | Firebase App Hosting YAML exists but no CI/CD automation | Configure GitHub Actions or similar for automated deployments | M (1-2 weeks) |
| OPS-3 | No env var validation | MEDIUM | App crashes at runtime if env vars missing | Add startup validation with clear error messages (use `envalid` or `t3-env`) | S (< 1 week) |
| OPS-4 | No database migration strategy | MEDIUM | Manual scripts in `scripts/` only | Implement versioned migration system with rollback capability | M (2-3 weeks) |
| OPS-5 | No backup strategy | HIGH | No Firestore backup configuration | Enable Firestore automated exports to Cloud Storage | S (< 1 week) |
| OPS-6 | No staging environment | HIGH | Only production and local development | Create staging Firebase project with identical configuration | M (1-2 weeks) |
| OPS-7 | No feature flags | LOW | Only `NEXT_PUBLIC_MOCK_MODE` | Implement feature flag system (LaunchDarkly, Unleash, or simple config) | S (1-2 weeks) |
| OPS-8 | No secrets rotation | MEDIUM | API keys in `.env.local` with no rotation policy | Implement secrets management (GCP Secret Manager, Doppler) | S (1 week) |

---

## 8. UI COMPONENT LIBRARY AUDIT

### 8.1 Duplicate Components — Same Function, Different Implementation

The codebase has **12+ major component overlaps** where the same functionality is implemented multiple times with inconsistent styling.

#### Buttons (5 components — should be 1)

| Component | File | Padding | Border Radius | Color |
|-----------|------|---------|---------------|-------|
| `PrimaryButton` | `components/auth/PrimaryButton.tsx` | `px-6 py-3` | `rounded-3xl` | `bg-[#000546]` |
| `OutlineButton` | `components/auth/OutlineButton.tsx` | `px-6 py-3` | `rounded-3xl` | `text-[#000546]` border |
| `CampaignPrimaryButton` | `components/ui/CampaignPrimaryButton.tsx` | `px-[25px] py-[11.5px]` | `rounded-full` | `bg-[#000546]` |
| `SecondaryOutlinedButton` | `components/ui/SecondaryOutlinedButton.tsx` | `px-5 py-2.5` | `rounded-full` | outlined w/ variants |
| `TertiaryCampaignButton` | `components/ui/TertiaryCampaignButton.tsx` | `px-4 py-2` | `rounded-lg` | muted |

**Impact**: Inconsistent button sizing, radius, and hover states across auth vs. campaigns vs. dashboard pages. **Fix**: Single `Button` component with `variant`, `size`, `fullWidth`, `loading`, `icon` props.

#### Creator Cards (4 components — should be 1-2)

| Component | File | Avatar | Stats | Actions |
|-----------|------|--------|-------|---------|
| `InfluencerCard` | `components/InfluencerCard.tsx` | 12x12, gradient | Influence score only | None |
| `RecommendedCreatorCard` | `components/brands/discover/RecommendedCreatorCard.tsx` | 14x14, purple border | 3-stat grid | Chat + Add to Campaign |
| `CreatorCard` | `components/brands/creators/CreatorCard.tsx` | 16x16, purple border | 3-stat grid | Chat + Add to Campaign |
| `InfluencerCard` | `components/discovery/results/InfluencerCard.tsx` | lg (Avatar) | No stats, bio | Add, Contact, Tag |

**Impact**: Different avatar sizes, stat layouts, and action buttons for the same type of content. Props are completely different across all 4. **Fix**: One `CreatorCard` with `variant` prop ('minimal', 'detailed', 'compact').

#### Campaign Cards (4 components)

| Component | File | Layout | Style |
|-----------|------|--------|-------|
| `CampaignCard` | `components/ui/CampaignCard.tsx` | Horizontal | `p-[21px] rounded-2xl` |
| `CampaignCard` | `components/campaigns/CampaignCard.tsx` | Vertical | `p-6 border-b` |
| `CampaignListCard` | `components/campaigns/CampaignListCard.tsx` | Row | `px-8 py-6 border-b` |
| `CampaignApplicationCard` | `components/ui/CampaignApplicationCard.tsx` | Horizontal | `p-[21px] rounded-2xl` |

#### Select/Dropdown (5 implementations!)

| Component | File | Type | Icon Support |
|-----------|------|------|-------------|
| `SelectField` | `components/auth/SelectField.tsx` | Native `<select>` | Yes |
| `CustomSelectField` | `components/auth/CustomSelectField.tsx` | Custom dropdown | Yes |
| `StyledSelect` | `components/auth/StyledSelect.tsx` | Styled native | Unknown |
| `CampaignSelectField` | `components/campaigns/CampaignSelectField.tsx` | Custom dropdown | No |
| Filter dropdowns | `components/brands/discover/` | Various custom | Varies |

Each has its own click-outside logic, keyboard handling, and state management.

#### Loading/Spinner (3 components)

| Component | File | Size | Border |
|-----------|------|------|--------|
| `PageLoader` | `components/ui/PageLoader.tsx` | w-10 h-10 | `border-b-2`, min-h-screen |
| `SectionLoader` | `components/ui/SectionLoader.tsx` | w-7 h-7 | `border-b-2`, py-20 |
| `LoadingSpinner` | `components/auth/LoadingSpinner.tsx` | h-12 w-12 | `border-t-2 border-b-2` |

---

### 8.2 Color Inconsistencies — No Design Tokens

**No centralized design tokens file exists.** Colors are hardcoded as hex values in 50+ files.

#### Navy Blue — 6+ variants used (should be 1 primary + 1 hover)

| Hex | Occurrences | Usage |
|-----|-------------|-------|
| `#001F54` | 200+ | Primary brand color (most common) |
| `#000546` | 40+ | Buttons, headings (slightly different) |
| `#001a44` | 14 | Hover states |
| `#0A1F44` | 10 | Text color |
| `#003d8f` | 2 | Hover variant |
| `#002868` | 2 | Alternate shade |

#### Other Inconsistent Colors

| Color Purpose | Variants Found |
|---------------|---------------|
| Cyan/Secondary | `#00A8CC`, `#0090B0`, `#002868` |
| Error/Red | `#FF385C` (21 uses), `#FF4D4F` (3 uses) |
| Success/Green | `#00A63E` (10), `#4ADE80` (3), `#4CAF50` (2), `#10B981` (5) |
| Blue accent | `#4A90E2` (8), `#6366F1` (5), `#3B82F6` (2) |

**Impact**: Visual inconsistency across pages. Impossible to do a global theme change. **Fix**: Create `lib/design-tokens.ts` and extend `tailwind.config.ts` with semantic color names.

---

### 8.3 Missing Foundation Components

| Category | Status | What Exists | What's Missing |
|----------|--------|-------------|----------------|
| **Design tokens** | CRITICAL: Missing | Minimal Tailwind config | `lib/design-tokens.ts` with colors, spacing, typography, shadows |
| **Unified Button** | CRITICAL: Missing | 5 overlapping buttons | Single `Button` with variant/size/loading/icon props |
| **Modal system** | HIGH: Fragmented | 10+ custom modals, each with own overlay/close logic | `Modal` + `Modal.Header/Body/Footer` composition |
| **Form system** | HIGH: Fragmented | Auth `InputField`, Campaign `CampaignInputField` (different styling) | `FormField`, `FormGrid`, validation context |
| **Empty states** | HIGH: Missing | Reimplemented inline on 8+ pages | Reusable `EmptyState` with icon/title/description/action |
| **Typography** | HIGH: Missing | Raw Tailwind classes (inconsistent sizes) | `Heading`, `Text`, `Label`, `Caption` |
| **Card composition** | MEDIUM: Fragmented | 4+ card types, all specialized | `Card` + `Card.Header/Body/Footer` |
| **Badge/Status** | MEDIUM: Missing | Hardcoded status pills on 15+ pages | `Badge` with variant (success, warning, error, info) |
| **Error boundary** | HIGH: Missing | None | React error boundary component |
| **Toast/Notification** | MEDIUM: Partial | `Toast.tsx` and `ToastContainer.tsx` exist | `useToast()` hook, `ToastProvider` context |
| **Layout primitives** | MEDIUM: Missing | Raw CSS grid/flexbox | `Container`, `Grid`, `Stack` components |
| **Avatar** | MEDIUM: Fragmented | `components/discovery/Avatar.tsx` + inline implementations | Single `Avatar` with size/fallback/proxy props |

---

### 8.4 Accessibility Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| Custom dropdowns lack ARIA | HIGH | No `role="listbox"`, `role="option"`, `aria-expanded` |
| Modals lack focus management | HIGH | No `role="dialog"`, `aria-modal`, focus trapping |
| Icon-only buttons missing labels | MEDIUM | No `aria-label` on icon buttons |
| No keyboard navigation in custom selects | MEDIUM | Custom dropdowns only work with mouse |
| Missing `aria-describedby` for errors | LOW | Form errors not linked to inputs |

---

### 8.5 Recommended Design System Sprint (4 weeks)

| Week | Focus | Deliverables | Files Impacted |
|------|-------|-------------|----------------|
| **1** | Design tokens + config | `lib/design-tokens.ts`, extend `tailwind.config.ts`, add `cn()` merge utility | All files with hardcoded hex colors |
| **2** | Core primitives | Unified `Button`, `Input`, `Select`, `Modal`, `Avatar` in `components/ui/` | ~25 existing components replaced |
| **3** | Content components | `Card` system, `EmptyState`, `Badge`, `Typography`, `ErrorBoundary` | ~15 inline implementations extracted |
| **4** | Migration + cleanup | Replace all duplicate imports, delete ~40-50 redundant files | ~3,000-5,000 lines eliminated |

---

## 9. PRIORITIZED ROADMAP

### Phase 0: Design System Foundation (Week 1-2)

| Task | Reference | Effort |
|------|-----------|--------|
| Create `lib/design-tokens.ts` with all color, spacing, typography tokens | 8.2, 8.3 | 2 days |
| Extend `tailwind.config.ts` with semantic colors from tokens | 8.2 | 1 day |
| Build unified `Button` component (replaces 5 duplicates) | 8.1 | 3 days |
| Build unified `Modal` composition system (replaces 10+ custom modals) | 8.3 | 3 days |
| Build unified `Input`, `Select`, `Avatar` primitives | 8.1, 8.3 | 3 days |
| Add `EmptyState`, `Badge`, `ErrorBoundary` | 8.3 | 2 days |

### Phase 1: Critical Security (Week 3-4)

| Task | Reference | Effort |
|------|-----------|--------|
| Remove or gate `x-user-id` auth bypass | SEC-1 | 1 day |
| Complete Firestore security rules for all 14 collections | SEC-2, S-GAP-4 | 3 days |
| Deploy Firestore indexes from `firestore.indexes.json` | S-GAP-15 | < 1 day |
| Add rate limiting middleware (express-rate-limit or similar) | S-GAP-2 | 2 days |
| Add Zod request validation to top 10 critical API routes | SEC-5, TYPE-1 | 5 days |
| Strip `console.log` from production paths | SEC-7 | 1 day |
| Add CORS and CSP headers | SEC-3, SEC-4 | 1 day |

### Phase 2: Core Missing Features (Week 3-8)

| Task | Reference | Effort |
|------|-----------|--------|
| Payment integration (Stripe or similar) — brand pays creator | B-GAP-1, I-GAP-1 | 4-6 weeks |
| Chat/messaging system (WebSocket or Firestore real-time) | B-GAP-3, I-GAP-4 | 4-6 weeks |
| Analytics dashboard with chart visualizations (Recharts already in deps) | B-GAP-4, I-GAP-3 | 2-3 weeks |
| Contract management (e-signatures, templates) | B-GAP-2, I-GAP-8 | 3-4 weeks |
| Calendar API integration (wire to campaign deadlines) | I-GAP-5 | 1-2 weeks |
| Invoice generation for influencers | I-GAP-2 | 2-3 weeks |

### Phase 3: Testing & Quality (Week 9-12)

| Task | Reference | Effort |
|------|-----------|--------|
| Set up CI/CD pipeline (GitHub Actions) | S-GAP-7, OPS-2 | 1-2 weeks |
| Add E2E tests for critical paths (Playwright) | Testing gaps | 3-4 weeks |
| Add API route integration tests | Testing gaps | 2-3 weeks |
| Add error monitoring (Sentry or similar) | S-GAP-8 | 1 week |
| Add global React error boundary | S-GAP-5 | < 1 week |
| Standardize auth pattern (useAuthFetch everywhere) | ARCH-3 | 1 week |
| Configure strict ESLint + Prettier | CQ-3, CQ-4 | 2 days |

### Phase 4: Platform Maturity (Week 13-20)

| Task | Reference | Effort |
|------|-----------|--------|
| Team/multi-user management for brands | B-GAP-8 | 3-4 weeks |
| Campaign templates | B-GAP-10 | 1-2 weeks |
| Campaign monitoring dashboard | B-GAP-5 | 2-3 weeks |
| Portfolio/media kit builder for influencers | I-GAP-6 | 3-4 weeks |
| Social account auto-sync | I-GAP-9 | 2-3 weeks |
| GDPR compliance tools (data export + erasure) | S-GAP-11 | 2-3 weeks |
| Staging environment setup | OPS-6 | 1-2 weeks |
| Docker containerization | OPS-1 | 1 week |
| Audit logging | S-GAP-10 | 2-3 weeks |

---

## Appendix A: Firestore Security Rules Gap

### Collections WITH Rules (6)

| Collection | Read Rule | Write Rule |
|------------|-----------|------------|
| `users` | Own document only | Own document only |
| `unified_profiles` | Authenticated | Own user's profiles |
| `influencer_detailed_data` | Authenticated | Deny |
| `content_posts` | Authenticated | Deny |
| `brand_profiles` | Own document | Own document |
| `influencer_profiles` | Own document | Own document |

### Collections WITHOUT Rules (8) — Need Immediate Attention

| Collection | Recommended Read Rule | Recommended Write Rule |
|------------|----------------------|------------------------|
| `campaigns` | Authenticated (public campaigns); Own campaigns (drafts) | Brand owner only |
| `campaign_applications` | Campaign brand owner OR applicant | Applicant (create); Brand owner (update status) |
| `campaign_invitations` | Campaign brand owner OR invitee | Brand owner (create); Invitee (update status) |
| `campaign_documents` | Campaign brand owner OR approved creators | Brand owner only |
| `deliverables` | Campaign brand owner OR creator | Creator (create/update); Brand (update status) |
| `notifications` | Own notifications only | System only (admin SDK) |
| `user_collections` | Own collections only | Own collections only |
| `creator_lists` | Own lists only | Own lists only |

---

## Appendix B: API Routes Missing Proper Validation

These routes accept request bodies but have no schema validation (only field existence checks):

| Route | Method | Fields Needing Validation |
|-------|--------|--------------------------|
| `POST /api/campaigns` | POST | campaignTitle, description, budget (min/max/currency), timeline dates, deliverables array |
| `PATCH /api/campaigns/[id]` | PATCH | Same as above (partial) |
| `POST /api/influencers/campaigns/[id]/apply` | POST | pitchMessage (string length), proposedRate (number), questionAnswers (array) |
| `POST /api/profiles` | POST | Platform, username, display_name, follower_count (number) |
| `POST /api/influencer/my-profile` | POST | Bio (length), location (string), categories (array), social links (URL format) |
| `POST /api/brands/lists` | POST | name (string), description (string), creatorIds (array of strings) |
| `POST /api/campaigns/[id]/documents` | POST | File type validation, size limits |
| `POST /api/discover/search/stream` | POST | query (string), platforms (enum array), filters (nested object) |

**Recommendation**: Use Zod schemas co-located with route handlers. Example pattern:

```typescript
// In route.ts
import { z } from 'zod';

const CreateCampaignSchema = z.object({
  campaignTitle: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  budget: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
  }),
  // ...
});
```

---

## Appendix C: Effort Estimation Key

| Size | Duration | Description |
|------|----------|-------------|
| S | < 1 week | Small, well-defined task |
| M | 1-3 weeks | Moderate scope, may need design decisions |
| L | 4+ weeks | Large feature, needs architecture planning |
