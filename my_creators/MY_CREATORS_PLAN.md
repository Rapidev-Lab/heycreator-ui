# My Creators Page — Complete Redesign

## Context

**Problem**: The current `/brands/influencers` page is a 650-line monolith that combines two disconnected concerns — live search (Apify) and saved creators — into one page with basic `InfluencerCard` components. There is no list management, no filter sidebar, and no way to organize saved creators. The `lists: string[]` field exists on `user_collections` but is never populated.

**Goal**: Rebuild `/brands/influencers` as a polished creator management hub matching the provided mockup (`my_creators_ui/my_creators_default_view.png`). Three tabs: My Creators (search/filter saved creators), My Lists (organize into named groups), Suggestions (coming soon). New APIs for list CRUD. Rich creator cards with actions.

---

## Architecture

```
Page: /brands/influencers
  MyCreatorsHeader  — title + "Add a Creator" | "Create a List" | "Export" buttons
  MyCreatorsTabs    — My Creators | My Lists | Suggestions

  [My Creators tab]
    PlatformPills   — Instagram | TikTok | YouTube | X | Facebook
    SearchInput     — text input + Search button
    FilterSidebar   — REUSE from components/discovery/filters/FilterSidebar.tsx
    CreatorCard grid — WRAP RecommendedCreatorCard + "Add to List" + "View/Edit" actions

  [My Lists tab]
    ListCard grid   — name, count, color, edit/delete actions + "Create New" CTA

  [Suggestions tab]
    Coming soon placeholder

  Modals: CreateListModal, AddToListModal, AddCreatorModal
```

---

## Phase 1: Types + Firestore Schema

### New File: `types/creator-list.ts`

```typescript
interface CreatorList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;           // Hex color for UI badge
  creatorCount: number;     // Denormalized count
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// API shapes
interface CreateListRequest { name: string; description?: string; color?: string; }
interface UpdateListRequest { name?: string; description?: string; color?: string; }
interface UpdateCreatorListsRequest { addToLists?: string[]; removeFromLists?: string[]; }
interface CreatorListResponse { id, name, description?, color?, creatorCount, createdAt: string, updatedAt: string }
interface CreatorExportRow { name, username, platform, followers, engagementRate, location, bio, categories, lists, starred, collaborationStatus, addedAt }
```

### Firestore Collection: `creator_lists`
- Composite index: `userId ASC` + `createdAt DESC`
- Composite index: `userId ASC` + `name ASC` (for duplicate check)

---

## Phase 2: API Endpoints (5 new routes)

All use `requireBrandRole` from `lib/middleware/campaign-auth.ts`.

### 2A. `app/api/brands/lists/route.ts` (NEW)

| Method | Description | Request | Response |
|--------|-------------|---------|----------|
| GET | Get all lists for brand | — | `{ success, data: CreatorListResponse[], count }` |
| POST | Create a new list | `{ name, description?, color? }` | `{ success, data: CreatorListResponse }` |

- GET: `db.collection('creator_lists').where('userId','==',userId).orderBy('createdAt','desc')`
- POST: Validate name not empty, check duplicate via `where('name','==',name).where('userId','==',userId).limit(1)`, then add doc with `creatorCount: 0`

### 2B. `app/api/brands/lists/[id]/route.ts` (NEW)

| Method | Description | Request | Response |
|--------|-------------|---------|----------|
| PATCH | Update list | `{ name?, description?, color? }` | `{ success, data: CreatorListResponse }` |
| DELETE | Delete list + cascade | — | `{ success, message }` |

- DELETE cascade: Find all `user_collections` where `lists array-contains id` for this user, batch `FieldValue.arrayRemove(id)` on each, then delete the list doc. Process in chunks of 400 if needed.

### 2C. `app/api/brands/creators/[id]/lists/route.ts` (NEW)

| Method | Description | Request | Response |
|--------|-------------|---------|----------|
| PATCH | Add/remove creator from lists | `{ addToLists?, removeFromLists? }` | `{ success, lists: string[] }` |

- `[id]` = `globalInfluencerId`
- Find `user_collections` doc by `userId + globalInfluencerId`
- Batch: `arrayUnion/arrayRemove` on collection doc + `FieldValue.increment(+1/-1)` on each affected `creator_lists` doc

### 2D. `app/api/brands/creators/export/route.ts` (NEW)

| Method | Description | Query Params | Response |
|--------|-------------|--------------|----------|
| GET | Export as CSV | `listId?` | `text/csv` with Content-Disposition header |

- Query `user_collections` (optionally filtered by `lists array-contains listId`)
- Join with `global_influencers` (same pattern as `app/api/influencer/profiles/search/route.ts`)
- Serialize to CSV string, return with headers

### Existing Endpoints Reused (no changes):
- `POST /api/influencer/profiles/search` — Collection search with filters
- `PATCH /api/profiles/[id]/star` — Toggle bookmark
- `POST /api/profiles` — Save new profile to collection

---

## Phase 3: Frontend Components

All new components in `components/brands/creators/`.

### 3A. `MyCreatorsHeader.tsx` (NEW)
- Props: `onAddCreator, onCreateList, onExport, isExporting?`
- Title "My Creators" + subtitle + 3 action buttons (UserPlus, FolderPlus, Download icons)

### 3B. `MyCreatorsTabs.tsx` (NEW)
- Props: `activeTab: 'creators'|'lists'|'suggestions', onTabChange, creatorsCount?, listsCount?`
- Underline tab bar: active = `border-b-2 border-[#001F54] text-[#001F54] font-semibold`

### 3C. `CreatorCard.tsx` (NEW — wraps RecommendedCreatorCard)
- Props: `creator: UserCollectionWithProfile, onAddToList, onViewEdit, onStarToggle`
- Maps `UserCollectionWithProfile` → RecommendedCreatorCard's `creator` prop shape
- Adds hover overlay with "Add to List" and "View / Edit Creator" actions
- Wires bookmark toggle to `onStarToggle`
- Mapping function:
  ```
  avatarUrl → proxyImage(globalProfile.avatarUrl)
  name → customDisplayName || globalProfile.displayName
  handle → '@' + globalProfile.primaryUsername
  stats.followers → formatFollowerCount(globalProfile.totalFollowers)
  stats.engagement → globalProfile.averageEngagementRate.toFixed(1) + '%'
  socials → globalProfile.platforms.map(p => p.platform)
  tags → globalProfile.categories
  isBookmarked → starred
  ```

### 3D. `MyCreatorsTab.tsx` (NEW — main content area)
- Props: `creators, lists, isLoading, onRefresh, onAddToList, onViewCreator, onStarToggle`
- State: `selectedPlatforms, searchQuery, filters (from FilterSidebar), sortBy`
- Layout: Platform pills + search bar → two-column (FilterSidebar left, results right)
- Client-side filtering via `useMemo` on creators array
- Reuses `FilterSidebar` from `components/discovery/filters/FilterSidebar.tsx` (add `hidePlatformFilter` prop)
- Results header shows count + Relevance/Followers/Engagement sort dropdown
- 2-col grid (`grid grid-cols-1 md:grid-cols-2 gap-6`) of CreatorCard

### 3E. `MyListsTab.tsx` (NEW)
- Props: `lists, isLoading, onCreateList, onSelectList, onEditList, onDeleteList`
- 3-col grid of list cards (name, description, count, color dot, edit/delete icons)
- Dashed-border "Create New List" CTA card
- Clicking a list navigates to My Creators tab filtered by that list

### 3F. `SuggestionsTab.tsx` (NEW)
- Coming soon placeholder with Sparkles icon

### 3G. Modals (3 new components)

**`CreateListModal.tsx`**: Name input + optional description + color picker (8 preset circles) → POST /api/brands/lists

**`AddToListModal.tsx`**: Checkbox list of all lists (pre-checked for current membership) + "Create New List" link → PATCH /api/brands/creators/[id]/lists

**`AddCreatorModal.tsx`**: Platform dropdown + username/URL input → POST /api/profiles (existing) + optional enrichment trigger

### 3H. `index.ts` (NEW)
- Barrel exports for all components

---

## Phase 4: Page Assembly

### Rewrite `app/brands/influencers/page.tsx`
- Wrapped in `ProfileCompletionGuard` + `EmailVerificationGuard`
- State: `activeTab, lists, creators, isLoading, modal states`
- On mount: Fetch lists (GET /api/brands/lists) + creators (POST /api/influencer/profiles/search)
- Uses `useAuthFetch` hook for all API calls
- Renders: MyCreatorsHeader → MyCreatorsTabs → conditional tab content → modals

### Minor Modification: `components/discovery/filters/FilterSidebar.tsx`
- Add optional prop `hidePlatformFilter?: boolean` (default false)
- When true, skip rendering the Platform checkbox section
- Backwards-compatible — no changes for existing discovery pages

---

## Phase 5: FilterSidebar Modification

Single-prop addition to `components/discovery/filters/FilterSidebar.tsx`:
```typescript
interface FilterSidebarProps {
  // ...existing props
  hidePlatformFilter?: boolean;  // NEW — hides platform checkboxes when pills are used instead
}
```
Wrap the Platform sub-section in `{!hidePlatformFilter && (...)}`.

---

## Files Summary

| File | Action | ~Lines |
|------|--------|--------|
| `types/creator-list.ts` | CREATE | ~60 |
| `app/api/brands/lists/route.ts` | CREATE | ~120 |
| `app/api/brands/lists/[id]/route.ts` | CREATE | ~130 |
| `app/api/brands/creators/[id]/lists/route.ts` | CREATE | ~100 |
| `app/api/brands/creators/export/route.ts` | CREATE | ~100 |
| `components/brands/creators/MyCreatorsHeader.tsx` | CREATE | ~50 |
| `components/brands/creators/MyCreatorsTabs.tsx` | CREATE | ~50 |
| `components/brands/creators/CreatorCard.tsx` | CREATE | ~120 |
| `components/brands/creators/MyCreatorsTab.tsx` | CREATE | ~250 |
| `components/brands/creators/MyListsTab.tsx` | CREATE | ~120 |
| `components/brands/creators/SuggestionsTab.tsx` | CREATE | ~30 |
| `components/brands/creators/CreateListModal.tsx` | CREATE | ~100 |
| `components/brands/creators/AddToListModal.tsx` | CREATE | ~120 |
| `components/brands/creators/AddCreatorModal.tsx` | CREATE | ~120 |
| `components/brands/creators/index.ts` | CREATE | ~15 |
| `app/brands/influencers/page.tsx` | REWRITE | ~200 |
| `components/discovery/filters/FilterSidebar.tsx` | MODIFY | +3 lines |

**Total**: 16 new files + 1 modification + 1 rewrite = ~1,685 lines

## Key Reuse Points

| Need | Reuse From |
|------|------------|
| Creator card UI | `components/brands/discover/RecommendedCreatorCard.tsx` (wrap) |
| Filter sidebar | `components/discovery/filters/FilterSidebar.tsx` (reuse directly) |
| Campaign invite modal | `components/brands/discover/InviteToCampaignModal.tsx` |
| Chat modal | `components/brands/discover/SendMessageModal.tsx` |
| Auth middleware | `lib/middleware/campaign-auth.ts` → `requireBrandRole` |
| API fetch hook | `lib/hooks/useAuthFetch.ts` |
| Image proxy | `lib/utils.ts` → `proxyImage()` |
| Collection search | `app/api/influencer/profiles/search/route.ts` (existing endpoint) |
| Star toggle | `app/api/profiles/[id]/star/route.ts` (existing endpoint) |

---

## Implementation Order

1. `types/creator-list.ts` (no deps)
2. API routes: lists CRUD → creators/lists → export (backend-first)
3. Static components: Header, Tabs, SuggestionsTab, CreatorCard (no API calls)
4. Modal components: CreateListModal, AddToListModal, AddCreatorModal
5. Tab content: MyListsTab, MyCreatorsTab (depends on modals + cards)
6. FilterSidebar modification (add `hidePlatformFilter` prop)
7. Page assembly: Rewrite `app/brands/influencers/page.tsx`

---

## Verification

1. **Build check**: `npx next build` passes with no type errors
2. **API testing** (curl/Postman with Bearer token):
   - POST /api/brands/lists → creates list
   - GET /api/brands/lists → returns list
   - PATCH /api/brands/creators/[id]/lists → adds creator to list
   - DELETE /api/brands/lists/[id] → cascades removal
   - GET /api/brands/creators/export → downloads CSV
3. **UI testing**: Navigate to /brands/influencers:
   - My Creators tab shows saved creators with search/filter/sort
   - Platform pills filter results client-side
   - FilterSidebar sections toggle and filter
   - "Add to List" opens modal with checkbox list
   - "Create a List" modal creates and refreshes
   - My Lists tab shows list cards with counts
   - Clicking a list shows filtered creators
   - Export downloads a CSV file
4. **Edge cases**: Empty state (no creators), no lists yet, search with no results
