# Marketplace & My Campaigns — Functionality Tracker

> **Purpose**: Preserve every piece of existing functionality (API connections, data flows, business logic, guards) so nothing is lost during the UI redesign. New routes (`/influencers/marketplace`, `/influencers/campaigns`) will be built referencing this document.

---

## 1. Existing Routes (DO NOT MODIFY — kept as fallback)

| Route | File | Purpose |
|---|---|---|
| `/influencers/campaign-marketplace` | `app/influencers/campaign-marketplace/page.tsx` | Browse campaigns |
| `/influencers/campaign-marketplace/[id]` | `app/influencers/campaign-marketplace/[id]/page.tsx` | Campaign brief / detail |
| `/influencers/campaign-applications` | `app/influencers/campaign-applications/page.tsx` | My applications list |

## 2. New Routes (to be built)

| Route | Purpose | Maps to existing |
|---|---|---|
| `/influencers/marketplace` | Redesigned marketplace (card + list views, search, filters) | `campaign-marketplace/page.tsx` |
| `/influencers/marketplace/[id]` | Redesigned campaign brief | `campaign-marketplace/[id]/page.tsx` |
| `/influencers/marketplace/search` | Search results with filter sidebar | New page |
| `/influencers/campaigns` | Redesigned My Campaigns / applications | `campaign-applications/page.tsx` |

---

## 3. API Endpoints (MUST be preserved)

### 3.1 GET `/api/influencers/campaigns/marketplace`

**File**: `app/api/influencers/campaigns/marketplace/route.ts`

**Auth**: Firebase Bearer token (`Authorization: Bearer {token}`)

**Query Params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | — | Filter by campaign category |
| `budgetMin` | number | — | Minimum budget filter |
| `budgetMax` | number | — | Maximum budget filter |
| `platform` | string | — | Platform filter |
| `search` | string | — | Keyword search (title, description) |
| `sortBy` | `'latest'` \| `'budget'` \| `'deadline'` | `'latest'` | Sort order |
| `page` | number | 1 | Pagination page |
| `limit` | number | 12 | Items per page |

**Response shape**:
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "productCategory": "string",
        "budget": { "compensationModel", "currency", "fixedAmount", "minRangeAmount", "maxRangeAmount", "paymentTerms", "applicationDeadline", "contentCreationStart", "contentCreationEnd" },
        "budgetAmount": "number",
        "timeline": { "applicationDeadline", "startDate", "endDate" },
        "tasks": {},
        "audience": {},
        "stats": { "views", "applications" },
        "brandInfo": { "name", "logo", "verified" },
        "qualifies": "boolean",
        "hasApplied": "boolean",
        "createdAt": "ISO string"
      }
    ],
    "pagination": { "page", "limit", "total", "totalPages" },
    "filters": {
      "categories": ["string"],
      "budgetRange": { "min": "number", "max": "number" }
    }
  }
}
```

**Business logic**:
- Fetches PUBLISHED campaigns (public)
- Also fetches user's accepted private campaign invitations
- Checks influencer qualification (followers vs `audience.minFollowers`, engagement vs `audience.minEngagements`)
- Client-side filtering by budget, category, search term
- Returns unique categories + budget range for filter dropdowns

---

### 3.2 GET `/api/influencers/campaigns/[id]`

**File**: `app/api/influencers/campaigns/[id]/route.ts`

**Auth**: Firebase Bearer token

**Response shape**:
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "string",
      "title": "string",
      "description": "string",
      "objectives": ["string"],
      "kpi": "string",
      "categories": ["string"],
      "budget": {
        "compensationModel": "string",
        "currency": "string",
        "fixedAmount": "number",
        "minRangeAmount": "number",
        "maxRangeAmount": "number",
        "paymentTerms": "string",
        "applicationDeadline": "string | null",
        "contentCreationStart": "string | null",
        "contentCreationEnd": "string | null"
      },
      "timeline": {
        "campaignStart": "string | null",
        "campaignEnd": "string | null",
        "applicationDeadline": "string | null"
      },
      "product": {
        "productType": "string",
        "productName": "string",
        "productValue": "number",
        "productLink": "string",
        "productImagesUrls": ["string"],
        "keepsProduct": "boolean",
        "willReimburse_or_productShipped": "boolean",
        "reimburseAmount": "number"
      },
      "audience": {
        "ageMin": "number",
        "ageMax": "number",
        "gender": "string",
        "targetLocation": "string",
        "minFollowers": "number",
        "minEngagements": "number"
      },
      "tasks": {
        "requiredDeliverables": [{ "platform", "contentType", "quantity", "description" }],
        "dos": ["string"],
        "donts": ["string"],
        "metaData": { "requiredHashTags": ["string"], "mentions_or_tags": ["string"] },
        "questions": [{ "question": "string", "answers": [{ "text": "string" }] }]
      },
      "brandInfo": { "id", "name", "logo", "verified" },
      "stats": { "views": "number", "applications": "number" }
    },
    "userQualification": {
      "qualifies": "boolean",
      "checks": [{ "requirement", "met", "userValue", "requiredValue" }],
      "score": "number (0-100)"
    },
    "applicationStatus": {
      "id": "string",
      "status": "'pending' | 'accepted' | 'rejected' | 'withdrawn'",
      "appliedAt": "ISO string",
      "reviewedAt": "ISO string | undefined"
    }
  }
}
```

**Side effects**: Increments `stats.views` by 1 on every fetch.

---

### 3.3 POST `/api/influencers/campaigns/[id]/apply`

**File**: `app/api/influencers/campaigns/[id]/apply/route.ts`

**Auth**: Firebase Bearer token

**Request body**:
```json
{
  "pitchMessage": "string (required, min 50 chars)",
  "proposedRate": "number (optional)",
  "questionAnswers": [{ "question": "string", "answer": "string" }]
}
```

**Validations**:
1. Campaign exists and not deleted
2. Campaign status is PUBLISHED or 'active'
3. Application deadline not passed (checks end-of-day 23:59:59)
4. User is not the brand owner
5. User has not already applied

**Side effects**:
1. Creates `campaign_applications` document (with denormalized influencer data)
2. Updates campaign `stats.applications` +1, `stats.pendingApplications` +1
3. Sends notification to brand via `notifyUser()` (fire-and-forget)

**Response**:
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "string",
      "campaignId": "string",
      "status": "pending",
      "qualificationMet": "boolean",
      "appliedAt": "ISO string"
    }
  },
  "message": "Application submitted successfully"
}
```

---

### 3.4 GET `/api/influencers/applications`

**File**: `app/api/influencers/applications/route.ts`

**Auth**: Firebase Bearer token

**Query Params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `status` | string | `'all'` | Filter: all, pending, accepted, rejected |
| `sortBy` | string | `'latest'` | Sort: latest, oldest, status |
| `page` | number | 1 | Pagination page |
| `limit` | number | 10 | Items per page |

**Response shape**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "string",
        "status": "string",
        "appliedAt": "ISO string",
        "reviewedAt": "ISO string | undefined",
        "reviewNotes": "string | undefined",
        "rejectionReason": "string | undefined",
        "qualificationMet": "boolean",
        "pitchMessage": "string",
        "proposedRate": "number | undefined",
        "campaign": {
          "id": "string",
          "title": "string",
          "categories": ["string"],
          "brandName": "string",
          "brandLogo": "string",
          "budget": { "compensationModel", "currency", "fixedAmount", "minRangeAmount", "maxRangeAmount", "applicationDeadline" },
          "timeline": { "campaignStart", "campaignEnd" },
          "status": "string"
        }
      }
    ],
    "stats": {
      "total": "number",
      "pending": "number",
      "accepted": "number",
      "rejected": "number",
      "withdrawn": "number"
    },
    "pagination": { "page", "limit", "total", "totalPages" }
  }
}
```

**Data fetching pipeline**:
1. Query `campaign_applications` where `influencerId == userId`
2. For each application → fetch campaign doc from `campaigns`
3. For each campaign → fetch brand info from `users`
4. Convert Firestore Timestamps → ISO strings
5. Sort + paginate

---

## 4. Auth & Guards (MUST be preserved)

### 4.1 Authentication
- **Method**: Firebase Bearer token in `Authorization` header
- **Middleware**: `requireAuth()` from `lib/middleware/campaign-auth.ts`
- **Dev fallback**: `x-user-id` header (creates mock DecodedIdToken)
- **Role check**: `requireCreatorRole()` verifies `user.role === 'influencer'`

### 4.2 Page Guards
Both pages wrap content in these guards (in order):
1. **`ProfileCompletionGuard`** — Requires complete influencer profile
2. **`EmailVerificationGuard`** — Requires verified email

### 4.3 Auth Hook
- `useAuth()` from `@/lib/context/AuthContext`
- Provides: `user`, `userProfile`, `loading`, `signOut`, `getIdToken()`

---

## 5. State Management (per page)

### 5.1 Marketplace Page (`campaign-marketplace/page.tsx`)

| State | Type | Purpose |
|---|---|---|
| `isLoading` | boolean | Loading spinner |
| `campaigns` | `MarketPlaceCampaignData[]` | Campaign list |
| `searchQuery` | string | Search input |
| `activeTab` | `'recommended' \| 'new' \| 'saved'` | Tab filter |
| `error` | string \| null | Error banner |

**Caching**: SessionStorage with 5-min TTL (only when no search active).

**Client-side filtering** (useMemo): Filters `campaigns` by `searchQuery` matching title, brandName, category, platforms.

### 5.2 Campaign Brief Page (`campaign-marketplace/[id]/page.tsx`)

| State | Type | Purpose |
|---|---|---|
| `isLoading` | boolean | Loading spinner |
| `campaign` | `CampaignDetail \| null` | Campaign data |
| `error` | string \| null | Error banner |
| `applicationStatus` | any | Existing application check |
| `showApplyModal` | boolean | Modal visibility |
| `applySuccess` | boolean | Success modal visibility |

**Business logic helpers**:
- `getDaysRemaining(dateStr)` — days until deadline
- `isPastDate(dateStr)` — timeline dot coloring (purple=past, blue=current, gray=future)
- `getDuration(start, end)` — "X days/weeks/months"
- `formatCurrency(amount)` — "R X"
- `formatDate(dateStr)` — locale date string
- `formatProductType(type)` — snake_case → Title Case

### 5.3 My Applications Page (`campaign-applications/page.tsx`)

| State | Type | Purpose |
|---|---|---|
| `isLoading` | boolean | Loading spinner |
| `applications` | `CampaignApplicationData[]` | Application list |
| `stats` | `{total, pending, accepted, rejected}` | Summary stats |
| `statusFilter` | `'all' \| 'pending' \| 'accepted' \| 'declined'` | Filter |
| `sortBy` | `'latest' \| 'oldest'` | Sort order |
| `searchQuery` | string | Search input |
| `showSuccess` | boolean | Post-apply success banner |

**Success banner**: Shows when URL has `?success=true` param (set after application submission). Auto-dismisses after 5s.

**Navigation on card click**:
- Accepted → `/influencers/campaigns/{campaignId}` (manage page)
- Other → `/influencers/campaign-marketplace/{campaignId}` (brief page)

---

## 6. Component Dependencies

### 6.1 Existing Components (used by current pages)

| Component | File | Used In | Props |
|---|---|---|---|
| `MarketPlaceCampaignCard` | `components/ui/MarketPlaceCampaignCard.tsx` | Marketplace | `campaign: MarketPlaceCampaignData`, `onViewBrief()` |
| `CampaignApplicationCard` | `components/ui/CampaignApplicationCard.tsx` | My Applications | `application: CampaignApplicationData`, `onView()`, `onDecline()`, `onAccept()` |
| `ApplicationModal` | `components/influencers/ApplicationModal.tsx` | Campaign Brief | `isOpen`, `onClose`, `onSubmit()`, `campaignTitle`, `campaignBudget`, `screeningQuestions` |
| `ProfileCompletionGuard` | `components/influencers/ProfileCompletionGuard.tsx` | Both pages | `children` |
| `EmailVerificationGuard` | `components/influencers/EmailVerificationGuard.tsx` | Both pages | `children` |
| `InfluencerSidebar` | `components/influencers/InfluencerSidebar.tsx` | Layout | — |

### 6.2 Shared UI Components

| Component | File | Description |
|---|---|---|
| `CampaignPrimaryButton` | `components/ui/CampaignPrimaryButton.tsx` | Dark blue filled button |
| `SecondaryOutlinedButton` | `components/ui/SecondaryOutlinedButton.tsx` | Outlined button variant |

### 6.3 Lucide Icons Used
Marketplace: `Search`, `Clock`, `Calendar`, `SlidersHorizontal`, `Grid3X3`, `List`, `ChevronDown`, `X`
Brief: `ArrowLeft`, `MapPin`, `Calendar`, `DollarSign`, `Clock`, `ExternalLink`, `CheckCircle2`, `Users`, `Eye`, `Share2`, `Bookmark`, `Package`
Applications: `Loader2`, `Clipboard`, `Clock`, `CheckCircle2`, `TrendingUp`, `Search`, `ChevronDown`, `AlertCircle`, `X`
Modal: `MessageSquare`, `DollarSign`, `HelpCircle`, `AlertCircle`, `Loader2`, `CheckCircle2`, `X`

---

## 7. Type Definitions (MUST be preserved)

### 7.1 UI Types (from `types/campaign.ts`)

```typescript
// Marketplace card data
interface MarketPlaceCampaignData {
  id: string
  brandName: string
  brandLogo: string
  title: string
  category: string
  platforms: string[]
  budgetMin: number
  budgetMax: number
  daysRemaining: number
  status: BiddingStatus  // 'open' | 'closed' | 'ending-soon'
}

// Application card data
interface CampaignApplicationData {
  id: string
  campaignId: string
  title: string
  brandName: string
  brandLogo: string
  category: string
  tags: string[]
  yourBid: number
  budgetMin: number
  budgetMax: number
  status: ApplicationStatus  // 'pending' | 'counter-offer' | 'accepted' | 'declined' | 'expired'
  counterOffer?: number
  daysRemaining: number
  startDate: string
  endDate: string
}
```

### 7.2 Core Domain Types (from `types/campaign.ts`)

```typescript
enum CampaignStatus { DRAFT, PUBLISHED, ACTIVE, IN_PROGRESS, COMPLETED, CLOSED, CANCELLED, ARCHIVED }
enum ApplicationStatus { pending, under_review, accepted, rejected, withdrawn, completed }

interface Campaign { /* full schema — see types/campaign.ts */ }
interface Application { /* full schema — see types/campaign.ts */ }
interface CampaignProduct { /* product details */ }
interface CampaignAudience { /* targeting criteria */ }
interface CampaignBudget { /* compensation config */ }
interface CampaignTasks { /* deliverables, dos/donts, questions */ }
interface CampaignStats { /* views, applications counts */ }
```

---

## 8. Data Transformations (MUST be preserved)

### 8.1 API → MarketPlaceCampaignData (`mapApiCampaign`)

```
API response campaign → {
  id: campaign.id
  brandName: campaign.brandInfo?.name
  brandLogo: campaign.brandInfo?.logo || first-initial fallback
  title: campaign.title
  category: campaign.productCategory || campaign.categories?.[0]
  platforms: campaign.tasks?.requiredDeliverables?.map(d => d.platform) || []
  budgetMin: budget.compensationModel === 'range' ? budget.minRangeAmount : budget.fixedAmount
  budgetMax: budget.compensationModel === 'range' ? budget.maxRangeAmount : budget.fixedAmount
  daysRemaining: diffDays(now, applicationDeadline || budget.applicationDeadline)
  status: daysRemaining <= 0 ? 'closed' : daysRemaining <= 3 ? 'ending-soon' : 'open'
}
```

### 8.2 API → CampaignApplicationData (My Applications page)

```
API application → {
  id: app.id
  campaignId: app.campaign?.id || app.campaignId
  title: app.campaign?.title
  brandName: app.campaign?.brandName
  brandLogo: app.campaign?.brandLogo
  category: app.campaign?.categories?.[0]
  tags: app.campaign?.categories?.slice(1, 3)
  yourBid: app.proposedRate || 0
  budgetMin/Max: from campaign.budget (range or fixed)
  status: mapped from API status → UI status
  daysRemaining: from applicationDeadline
  startDate/endDate: formatted from campaign.timeline
}
```

---

## 9. Firestore Collections Referenced

| Collection | Used For | Read/Write |
|---|---|---|
| `campaigns` | Campaign data | Read (marketplace, detail) |
| `campaign_applications` | Application submissions | Read + Write |
| `users` | Brand info (name, logo) | Read |
| `campaign_notifications` | Push notifications on apply | Write (fire-and-forget) |

---

## 10. Service Layer

**File**: `lib/firebase/campaigns.ts` (793 lines)

| Function | Used By | Purpose |
|---|---|---|
| `getMarketplaceCampaigns(filters)` | Marketplace API | Fetch public PUBLISHED campaigns |
| `getCampaignById(id)` | Detail API | Fetch single campaign |
| `createApplication(data)` | Apply API | Create application + update stats |
| `getCreatorApplications(creatorId, filters)` | Applications API | Fetch creator's applications |
| `isAcceptingApplications(campaign)` | Apply API | Check deadline + status |
| `convertTimestamps(data)` | All APIs | Firestore Timestamp → JS Date |

---

## 11. Notification System

**Trigger**: Application submission (`POST /api/influencers/campaigns/[id]/apply`)

**Service**: `notifyUser()` — fire-and-forget (doesn't block API response)

**Notification created**:
- Type: `application_received`
- Recipient: Brand owner (campaign.brandId)
- Message: `"{creatorName} applied to "{campaignTitle}""`
- Action URL: `/brands/campaigns/{id}/dashboard`

---

## 12. Caching Strategy

| Cache | Type | TTL | Scope | Invalidation |
|---|---|---|---|---|
| Marketplace campaigns | SessionStorage | 5 min | Per-session | New search clears cache |

---

## 13. Error Handling Patterns

**API errors returned**:
- `404`: Campaign not found
- `403`: Already applied / own campaign / not eligible
- `400`: Deadline passed / campaign closed / validation failure
- `500`: Server error (with `details` in dev)

**Frontend handling**:
- `try/catch` around all API calls
- Error state displayed as banner (red background)
- Loading spinners during async operations
- Fallback UI for missing data (brand initials if no logo)
- Success modals for confirmations

---

## 14. New Design Requirements (from Figma mockups)

### 14.1 Marketplace Main Page
- **Tabs**: All campaigns, Invites, Recommended, Saved (4 tabs — "Invites" uses existing private invitation data from marketplace API)
- **Search bar**: Full-width with placeholder "e.g. Food, Lifestyle, Menswear"
- **Top topics**: Icon row — Fashion, Lifestyle, Travel, Beauty, Food + "View all"
- **Latest Campaigns** section: Sort dropdown (Relevance) + View all + Grid/List toggle
- **Recommended for me** section: Same layout as Latest
- **Card view**: Image thumbnail, title, multi-line description, category tags, budget range, duration, date, deliverable badges, "Show more" button
- **List view**: Horizontal layout — image left, details right

### 14.2 Search Results Pages
- **Left sidebar**: PROFILE filters panel (adapted from Brand Discover `FilterSidebar`)
  - Platform checkboxes (Instagram, TikTok, YouTube, X, Facebook)
  - Follower Count ranges (radio buttons)
  - Engagement Rate ranges (radio buttons)
  - True Reach ranges (radio buttons)
  - Location (search + city checkboxes)
  - Language (checkboxes — 10+ languages)
  - Verified (Yes/No radio)
- **Right content**: "{N} Campaigns Found" + sort + grid/list toggle + campaign cards
- Both card and list views available

---

## 15. Shared Components to Reuse (from Brand Discover / Discovery)

### 15.1 FilterSidebar
- **File**: `components/discovery/filters/FilterSidebar.tsx`
- **Props**: `{ filters: DiscoveryFilters, onChange, onApply?, isLoading?, hidePlatformFilter?, initialPlatforms? }`
- **Adaptation needed**: Context is campaign filtering by target audience (not creator search)
- **Sections**: Profile (Platform, Follower Count, Engagement Rate, True Reach), Audience (Location, Age, Gender, Brand Affinity), Content (placeholder)

### 15.2 ResultsHeader (View Toggle + Sort)
- **File**: `components/discovery/results/ResultsHeader.tsx`
- **Props**: `{ title?, count, viewMode?, onViewModeChange?, sortBy?, onSortChange?, searchSource? }`
- **Provides**: Grid/List toggle buttons, sort dropdown, result count display
- **ViewMode type**: `'grid' | 'list'`

### 15.3 TopTopicsSection + TopicCard
- **File**: `components/discovery/topics/TopTopicsSection.tsx`
- **Props**: `{ selectedTopics?, onTopicSelect? }`
- **Data source**: `data/discoveryTopics.ts` (24 categories with icons, colors, suggestions)
- **Adaptation needed**: Clicking a topic should filter campaigns by category (not trigger creator search)

### 15.4 SearchBar
- **File**: `components/discovery/layout/SearchBar.tsx`
- **Props**: `{ onSearch, isLoading?, initialQuery?, initialLocation?, initialVetted?, selectedTopics? }`
- **Returns**: `{ query, location, vetted }` on submit
- **Adaptation needed**: Search triggers campaign search, not creator discovery

### 15.5 Types
- **File**: `types/discovery.ts`
- **Key types**: `DiscoveryFilters`, `Platform`, `FollowerRange`, `PercentageRange`, `ViewMode`

---

## 15. Checklist — What MUST work in the new pages

- [ ] Firebase auth token sent with all API calls
- [ ] `ProfileCompletionGuard` wraps page content
- [ ] `EmailVerificationGuard` wraps page content
- [ ] Marketplace loads campaigns from `GET /api/influencers/campaigns/marketplace`
- [ ] Campaign detail loads from `GET /api/influencers/campaigns/[id]`
- [ ] Application submission via `POST /api/influencers/campaigns/[id]/apply`
- [ ] My Applications loads from `GET /api/influencers/applications`
- [ ] `mapApiCampaign()` transformation preserved
- [ ] Application data mapping preserved
- [ ] SessionStorage caching (5-min TTL)
- [ ] Status badge logic (open/ending-soon/closed)
- [ ] Days remaining calculation
- [ ] Budget display (range vs fixed)
- [ ] Timeline milestone building
- [ ] Success banner from `?success=true` URL param
- [ ] Navigation: card click → brief page
- [ ] Navigation: accepted application → manage page
- [ ] Notification sent on application submit
- [ ] Error handling with user-friendly messages
