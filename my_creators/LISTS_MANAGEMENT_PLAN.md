# Lists Management — Expanded Design Context

## Summary

This document expands on `MY_CREATORS_PLAN.md` (Phases 1-4 are already implemented) to define the next iteration of the **My Lists** tab on `/brands/influencers`. The mockups reveal significantly richer functionality than the current implementation provides.

---

## Current State vs Mockup Gap Analysis

### What's Already Built (Phases 1-4)

| Component | Status | Location |
|-----------|--------|----------|
| `types/creator-list.ts` | Done | Types: CreatorList, CRUD requests, export row |
| `app/api/brands/lists/route.ts` | Done | GET all lists, POST create list |
| `app/api/brands/lists/[id]/route.ts` | Done | PATCH update, DELETE cascade |
| `app/api/brands/creators/[id]/lists/route.ts` | Done | PATCH add/remove creator from lists |
| `app/api/brands/creators/export/route.ts` | Done | GET CSV export |
| `app/api/brands/creators/global/route.ts` | Done | GET all global_influencers |
| `MyCreatorsHeader.tsx` | Done | Title + 3 action buttons |
| `MyCreatorsTabs.tsx` | Done | Tab bar with counts |
| `MyCreatorsTab.tsx` | Done | Search + platform pills + FilterSidebar + ResultsGrid |
| `MyListsTab.tsx` | Done | Simple card grid (name, count, color dot, Rename/Delete menu) |
| `SuggestionsTab.tsx` | Done | Coming soon placeholder |
| `CreateListModal.tsx` | Done | Name + description + color picker modal |
| `AddToListModal.tsx` | Done | Checkbox list of all lists |
| `AddCreatorModal.tsx` | Done | Platform + username input |
| `app/brands/influencers/page.tsx` | Done | Page assembly with all tabs + modals |

### What the Mockups Require (Gaps)

Comparing the 5 mockup screenshots against the current code:

#### Gap 1: ListCard Component — Complete Redesign Required
**Current**: Simple card with color dot, name, description, count, 3-dot (Rename/Delete).
**Mockup** (`my_creators_lists_1.png`): Rich card matching RecommendedCreatorCard style:
- Bookmark icon (filled/outline) top-right
- 3-dot menu with: "View / Edit List", "Add Creators", "Delete" (red)
- List name (bold) + creator count
- Horizontal divider
- Tag pills (colored, e.g., "Beauty", "Skincare", "Wellness")
- Two bottom action buttons: "+ Add Creators" (outlined) and "View" (outlined)

#### Gap 2: My Lists Tab — Missing Search/Filter/Sort/ViewMode
**Current**: Only renders a card grid + "Create New List" CTA.
**Mockup** (`my_creators_lists_1.png`): Full toolbar above the grid:
- Search bar with placeholder "e.g. Food, Lifestyle, #newborn"
- Row of 5 filter dropdowns below search + advanced filter icon (sliders)
- Count heading ("4 Lists")
- Relevance sort dropdown
- Grid/List view toggle (list view is active in the mockup)

#### Gap 3: List Detail View — Entirely New Feature
**Current**: Clicking a list just switches to My Creators tab. `onEditList` opens a `window.prompt`.
**Mockup** (`my_creators_lists_2_view_edit.png` and `my_creators_lists_3_add_creators.png`): A full inline detail page:

**Header Area:**
- "Back" arrow button to return to lists grid
- List title / "Create a List" heading
- "Save Changes" button (dark) + "Delete" button (red text)

**Editable Form:**
- **List Name** — text input
- **Saved Tags** — tag chip input with "+" add button, chips show "x" to remove (e.g., #EcoGlowSA, #SustainableBeauty)
- **Mentions / Tags / Brands** — text input for @handles (e.g., @ecoglowsa @sustainablebeautysa)
- **Relevant Locations** — location selector/slider (mockup shows "Minimal" label + control)
- **Size of Influence** — influence size selector/slider
- **Campaign Visibility** — Radio buttons: Public ("Visible to all agency users") / Private ("Only visible to invited agency users")

**Performance Analytics (View/Edit mode only):**
- 4-metric row: Avg Followers, Engagement Rate, Avg Growth (30 days), Authenticity
- Values computed from creators in the list

**My Creators Section (within list detail):**
- Section header: "My Creators (N)" with count
- Action bar: "+ Add a Creator" button + "All Creators" / "Top Only" toggle + "Export" + Relevance sort + Grid/List view toggle
- RecommendedCreatorCard grid with different 3-dot menu:
  - "View Profile"
  - "Add to Another List"
  - "Move" (to another list)
  - "Remove" (red — removes from this list)
- Empty state: "No Creators Added Yet" / "Create your list by adding Creators."

**Smart Suggestions Section:**
- Section header: "Smart Suggestions (N)" with sparkle icon
- Subtitle: "Suggested Creators based on search criteria"
- Relevance sort + Grid/List toggle
- RecommendedCreatorCard grid but with "Add to List" button instead of "Add to Campaign"

#### Gap 4: CreatorList Schema Needs Expansion
**Current**: `{ name, description, color, creatorCount }`
**Mockup requires**: Tags, mentions/brands, relevant locations, influence size, campaign visibility.

#### Gap 5: Create List Flow Change
**Current**: Simple modal popup with name + description + color.
**Mockup** (`my_creators_lists_3_add_creators.png`): Full inline form (same layout as View/Edit) rather than a modal.

---

## Expanded Architecture

```
Page: /brands/influencers
  MyCreatorsHeader       — title + "Add a Creator" | "Create a List" | "Export"
  MyCreatorsTabs         — My Creators | My Lists | Suggestions

  [My Lists tab] — MyListsTab.tsx
    ┌─ DEFAULT VIEW (listDetailId === null)
    │   ListsToolbar       — search bar + filter dropdowns + advanced filter icon
    │   ListsResultsHeader — "N Lists" count + Relevance sort + Grid/List toggle
    │   ListCard grid      — rich cards (bookmark, tags, actions, 3-dot menu)
    │   + "Create New List" CTA card
    │
    └─ DETAIL VIEW (listDetailId !== null)
        ListDetailView.tsx
        ├─ Back button + title + Save/Delete buttons
        ├─ ListDetailForm (name, tags, mentions, locations, influence, visibility)
        ├─ PerformanceAnalytics (computed from list creators)
        ├─ ListCreatorsSection (RecommendedCreatorCard + different 3-dot menu)
        └─ SmartSuggestionsSection (AI-suggested creators + "Add to List")
```

---

## Phase 6: Schema Expansion

### Update `types/creator-list.ts`

Add new fields to both the Firestore document interface and API response:

```typescript
// Additional fields for CreatorList Firestore document
interface CreatorList {
  // ...existing fields (id, userId, name, description, color, creatorCount, timestamps)
  tags?: string[];                // Saved tags (e.g., ["#EcoGlowSA", "#SustainableBeauty"])
  mentions?: string[];            // @mentions / brands (e.g., ["@ecoglowsa", "@sustainablebeautysa"])
  locations?: string[];           // Relevant locations (e.g., ["Cape Town", "Johannesburg"])
  influenceSize?: 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'all';
  visibility: 'public' | 'private';  // Campaign visibility — default "public"
}

// Extended API response
interface CreatorListResponse {
  // ...existing fields (id, name, description, color, creatorCount, timestamps)
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility: 'public' | 'private';
}

// Extended create/update request
interface CreateListRequest {
  name: string;
  description?: string;
  color?: string;
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility?: 'public' | 'private';
}

interface UpdateListRequest {
  name?: string;
  description?: string;
  color?: string;
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility?: 'public' | 'private';
}
```

### Firestore Collection Updates
- `creator_lists` — add new optional fields (backwards-compatible, no migration needed)
- No new indexes required (filter/search happens client-side on already-fetched lists)

---

## Phase 7: New API Endpoints

### 7A. `GET /api/brands/lists/[id]/creators` (NEW)

Fetch all creators that belong to a specific list. Needed for the list detail view.

```
Request:  GET /api/brands/lists/[id]/creators?limit=50&offset=0
Response: {
  success: true,
  data: InfluencerProfile[],   // Same shape as /api/brands/creators/global
  count: number,
  analytics: {                 // Aggregated performance stats
    avgFollowers: number,
    avgEngagementRate: number,
    avgGrowth30d: number,
    avgAuthenticity: number
  }
}
```

**Implementation:**
1. Verify list belongs to requesting user
2. Query `user_collections` where `userId == auth.uid` AND `lists array-contains listId`
3. For each result, join with `global_influencers` by `globalInfluencerId`
4. Compute aggregate analytics from the joined profiles
5. Return paginated results

### 7B. `GET /api/brands/lists/[id]/suggestions` (NEW)

Smart suggestions for creators to add to this list, based on list criteria (tags, locations, influence size, existing creator profiles).

```
Request:  GET /api/brands/lists/[id]/suggestions?limit=6
Response: {
  success: true,
  data: InfluencerProfile[],
  count: number,
  criteria: string[]           // What criteria were used for matching
}
```

**Implementation (Phase 1 — DB-only, no external APIs):**
1. Load list metadata (tags, locations, influenceSize)
2. Load existing creator IDs in the list (to exclude them)
3. Build Firestore query on `global_influencers`:
   - Filter by `categories` array-contains-any list tags (if any)
   - Filter by location if specified
   - Filter by follower range matching influenceSize
   - Exclude IDs already in the list
4. Return top N results by totalFollowers desc
5. If no criteria on the list, fallback to top global_influencers not already in list

### 7C. Update `PATCH /api/brands/lists/[id]` (MODIFY)

Accept the new fields (tags, mentions, locations, influenceSize, visibility) in the update payload. Already handles partial updates via `Object.entries(updates)` pattern.

### 7D. Update `POST /api/brands/lists` (MODIFY)

Accept and store the new fields when creating a list. Default `visibility: 'public'`.

---

## Phase 8: Frontend Components — New & Modified

### 8A. `ListCard.tsx` (NEW — `components/brands/creators/ListCard.tsx`)

Rich list card matching mockup design. Distinct from the existing simple card in MyListsTab.

**Props:**
```typescript
interface ListCardProps {
  list: CreatorListResponse;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onView: () => void;
  onAddCreators: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Visual Structure (matching `my_creators_lists_1.png`):**
```
┌──────────────────────────────────────┐
│                          [🔖] [⋮]   │  ← Bookmark icon + 3-dot menu
│  Top Fashion                         │  ← List name (bold)
│  3 Creators                          │  ← Creator count
│  ──────────────────────────────────  │  ← Divider
│  [Beauty] [Skincare] [Wellness]      │  ← Tag pills (colored)
│                                      │
│  [+ Add Creators]  [View]            │  ← Action buttons (outlined)
└──────────────────────────────────────┘
```

**3-dot menu items:**
- "View / Edit List" → `onEdit()`
- "Add Creators" → `onAddCreators()`
- "Delete" (red) → `onDelete()`

**Styling notes (from mockup):**
- `bg-white rounded-xl border border-gray-200` (similar to RecommendedCreatorCard)
- Bookmark: filled navy when active, outline when inactive (same as RecommendedCreatorCard)
- Tags: `text-xs px-3 py-1 rounded-full bg-[#F8F9FD] text-[#FF385C] font-medium` (same as RecommendedCreatorCard)
- Action buttons: `border-2 border-[#E0E0E0] rounded-lg text-gray-700` (same pattern as RecommendedCreatorCard Chat/Add buttons)

### 8B. `ListDetailView.tsx` (NEW — `components/brands/creators/ListDetailView.tsx`)

Full inline detail view for a single list. Replaces the modal-based create/edit flow.

**Props:**
```typescript
interface ListDetailViewProps {
  list?: CreatorListResponse;     // null = "Create a List" mode
  onBack: () => void;
  onSave: (data: UpdateListRequest) => Promise<void>;
  onDelete?: () => void;          // Only shown in edit mode
  creators: InfluencerProfile[];
  creatorsLoading: boolean;
  suggestions: InfluencerProfile[];
  suggestionsLoading: boolean;
  analytics?: ListAnalytics;
  onAddCreator: () => void;
  onViewCreatorProfile: (id: string) => void;
  onAddToAnotherList: (creatorId: string) => void;
  onMoveCreator: (creatorId: string) => void;
  onRemoveCreator: (creatorId: string) => void;
  onAddSuggestionToList: (creatorId: string) => void;
}

interface ListAnalytics {
  avgFollowers: number;
  avgEngagementRate: number;
  avgGrowth30d: number;
  avgAuthenticity: number;
}
```

**Layout (matching `my_creators_lists_2_view_edit.png`):**
```
← Back

[Title: "Top Fashion" or "Create a List"]        [Save Changes] [Delete]

┌─ Form Card ──────────────────────────────────────────────────────┐
│  List Name:         [___________________________]                │
│                                                                  │
│  Saved Tags:        [#summer #brand #ad        ] [+]             │
│                     [#EcoGlowSA ×] [#SustainableBeauty ×]       │
│                     [#ReefSafeSunscreen ×] [#NaturalSkincare ×]  │
│                     [#SummerGlow2026 ×]                          │
│                                                                  │
│  Mentions/Tags/     [@ecoglowsa @sustainablebeautysa]            │
│  Brands:                                                         │
│                                                                  │
│  Relevant           [Location selector/slider]                   │
│  Locations:                                                      │
│                                                                  │
│  Size of            [Influence size slider/selector]              │
│  Influence:                                                      │
│                                                                  │
│  Campaign           ● Public  ○ Private                          │
│  Visibility:        "Visible to all agency users"                │
└──────────────────────────────────────────────────────────────────┘

Performance Analytics (edit mode only)
┌──────────────────────────────────────────────────────────────────┐
│  👥 Avg Followers  📈 Engagement  📊 Avg Growth  🔒 Authenticity│
│     50.0K             6.2%          +12.5%          94%          │
│     ▲ 5.3k mo        ▲ 0.5% in wk  (30 days)     High quality  │
└──────────────────────────────────────────────────────────────────┘

My Creators (6)                   [+ Add a Creator] [Relevance ▾] [▦][≡]
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ RecommendedCard │  │ RecommendedCard │  │ RecommendedCard │
│ 3-dot: View,    │  │ 3-dot: View,    │  │                 │
│ Move, Remove    │  │ Move, Remove    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

Smart Suggestions (2) ✨             [Relevance ▾] [▦][≡]
"Suggested Creators based on search criteria"
┌─────────────────┐  ┌─────────────────┐
│ RecommendedCard │  │ RecommendedCard │
│ [Chat] [Add to  │  │ [Chat] [Add to  │
│  List]          │  │  List]          │
└─────────────────┘  └─────────────────┘
```

### 8C. `TagChipInput.tsx` (NEW — `components/brands/creators/TagChipInput.tsx`)

Reusable tag chip input component with add/remove functionality.

**Props:**
```typescript
interface TagChipInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}
```

**Behavior:**
- Text input with "+" button
- Type text, press Enter or click "+" to add as chip
- Each chip shows tag text + "x" close button
- Chips styled: `bg-[#001F54] text-white text-xs px-3 py-1.5 rounded-full font-medium`
- Matches the chip style from mockup (dark navy background, white text, x to remove)

### 8D. `PerformanceAnalytics.tsx` (NEW — `components/brands/creators/PerformanceAnalytics.tsx`)

Displays aggregated list performance metrics.

**Props:**
```typescript
interface PerformanceAnalyticsProps {
  analytics: ListAnalytics;
  isLoading?: boolean;
}
```

**Layout:** 4-metric horizontal row matching mockup:
- Avg Followers (Users icon, value + trend)
- Engagement Rate (TrendingUp icon, value + trend)
- Avg Growth (BarChart icon, value + period label)
- Authenticity (Shield icon, value + quality label)

### 8E. Modify `MyListsTab.tsx` (MODIFY)

Complete overhaul to support two view states: **default grid** and **detail view**.

**New Props:**
```typescript
interface MyListsTabProps {
  lists: CreatorListResponse[];
  isLoading: boolean;
  onCreateList: () => void;
  onSelectList: (listId: string) => void;  // Opens detail view
  onEditList: (list: CreatorListResponse) => void;
  onDeleteList: (listId: string) => void;
  // NEW
  onAddCreatorsToList: (listId: string) => void;
  onBookmarkList: (listId: string) => void;
}
```

**State additions:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'count' | 'newest'>('relevance');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [selectedListId, setSelectedListId] = useState<string | null>(null);
// Filter dropdowns state (5 filters per mockup)
```

**Default View additions:**
- Search bar at top (same styling as MyCreatorsTab search)
- 5 filter dropdowns (placeholder "Filter name" per mockup) + advanced filter icon
- Count heading ("N Lists")
- Relevance sort dropdown + Grid/List toggle
- Replace current simple cards with new `ListCard` component
- Client-side filtering on search query + sort

**Detail View transition:**
- When `selectedListId` is set, render `ListDetailView` instead of the grid
- Fetch list creators and suggestions via new API endpoints
- "Back" returns to grid (`setSelectedListId(null)`)

### 8F. Modify `CreateListModal.tsx` → `CreateListModal.tsx` (MODIFY)

The mockup shows list creation as an inline form within the My Lists tab (same layout as edit), not a modal. Two approaches:

**Option A (Recommended):** Keep the modal for quick creation from the header "Create a List" button, but also support inline creation via `ListDetailView` when accessed from within the My Lists tab. The `ListDetailView` with `list={undefined}` acts as the create form.

**Option B:** Remove the modal entirely and always use `ListDetailView` for creation.

Recommend **Option A** — the modal is useful for quick list creation from anywhere (header button, "Create New List" link in AddToListModal), while the inline form provides the full-featured creation flow.

### 8G. RecommendedCreatorCard Menu Variants

The mockup uses `RecommendedCreatorCard` in 3 different contexts with different 3-dot menus:

**Context 1: My Creators tab (already implemented)**
- Add to List
- View / Edit Creator
- Delete (red)

**Context 2: List Detail — "My Creators" section**
- View Profile
- Add to Another List
- Move (to another list)
- Remove (red — removes from this list)

**Context 3: List Detail — "Smart Suggestions" section**
No 3-dot menu. Instead:
- Different action buttons: "Chat" + "Add to List" (replaces "Add to Campaign")

The existing `RecommendedCreatorCard` already supports `menuItems?: CardMenuItem[]` prop, so contexts 1 & 2 are handled. For context 3, need to pass custom action button overrides — this requires a small extension to the card or wrapper component.

**Proposed addition to `RecommendedCreatorCard` (brands/discover):**
```typescript
interface RecommendedCreatorCardProps {
  // ...existing props
  actionButtons?: {               // NEW — override default Chat + Add to Campaign
    primary: { label: string; icon: React.ElementType; onClick: () => void };
    secondary: { label: string; icon: React.ElementType; onClick: () => void };
  };
}
```

When `actionButtons` is provided, render those instead of the default Chat + Add to Campaign buttons.

---

## Phase 9: Page State Management Updates

### Update `app/brands/influencers/page.tsx`

New state for list detail view:

```typescript
// List detail state
const [selectedListId, setSelectedListId] = useState<string | null>(null);
const [listCreators, setListCreators] = useState<InfluencerProfile[]>([]);
const [listSuggestions, setListSuggestions] = useState<InfluencerProfile[]>([]);
const [listAnalytics, setListAnalytics] = useState<ListAnalytics | null>(null);
const [isLoadingListDetail, setIsLoadingListDetail] = useState(false);
```

New handlers:

```typescript
// When selecting a list from the grid
const handleSelectList = async (listId: string) => {
  setSelectedListId(listId);
  setIsLoadingListDetail(true);
  try {
    const [creatorsRes, suggestionsRes] = await Promise.all([
      get(`/api/brands/lists/${listId}/creators`),
      get(`/api/brands/lists/${listId}/suggestions?limit=6`),
    ]);
    if (creatorsRes.data?.success) {
      setListCreators(creatorsRes.data.data);
      setListAnalytics(creatorsRes.data.analytics);
    }
    if (suggestionsRes.data?.success) {
      setListSuggestions(suggestionsRes.data.data);
    }
  } finally {
    setIsLoadingListDetail(false);
  }
};

// Save list changes (inline form)
const handleSaveListDetail = async (data: UpdateListRequest) => {
  if (!selectedListId) return;
  await patch(`/api/brands/lists/${selectedListId}`, data);
  await fetchLists(); // Refresh list data
};

// Remove creator from list
const handleRemoveFromList = async (creatorId: string) => {
  if (!selectedListId) return;
  await patch(`/api/brands/creators/${creatorId}/lists`, {
    removeFromLists: [selectedListId],
  });
  setListCreators(prev => prev.filter(c => c.id !== creatorId));
};

// Add suggestion to this list
const handleAddSuggestionToList = async (creatorId: string) => {
  if (!selectedListId) return;
  await patch(`/api/brands/creators/${creatorId}/lists`, {
    addToLists: [selectedListId],
  });
  // Move from suggestions to creators
  const suggestion = listSuggestions.find(s => s.id === creatorId);
  if (suggestion) {
    setListSuggestions(prev => prev.filter(s => s.id !== creatorId));
    setListCreators(prev => [...prev, suggestion]);
  }
};
```

### "Create a List" from My Lists tab

When "Create a List" is triggered from within the My Lists tab (not the header button):
1. Set `selectedListId = 'new'` (special sentinel value)
2. Render `ListDetailView` with `list={undefined}` (create mode)
3. On save: POST to `/api/brands/lists` with full form data, then navigate to the new list's detail view

---

## Files Summary — New Phase

| File | Action | ~Lines | Description |
|------|--------|--------|-------------|
| `types/creator-list.ts` | MODIFY | +20 | Add tags, mentions, locations, influenceSize, visibility fields |
| `app/api/brands/lists/route.ts` | MODIFY | +10 | Accept new fields in POST |
| `app/api/brands/lists/[id]/route.ts` | MODIFY | +10 | Accept new fields in PATCH |
| `app/api/brands/lists/[id]/creators/route.ts` | CREATE | ~100 | GET creators in a list + aggregated analytics |
| `app/api/brands/lists/[id]/suggestions/route.ts` | CREATE | ~120 | GET smart suggestions for a list |
| `components/brands/creators/ListCard.tsx` | CREATE | ~160 | Rich list card with bookmark, tags, actions, 3-dot menu |
| `components/brands/creators/ListDetailView.tsx` | CREATE | ~350 | Full inline detail view (form + creators + suggestions) |
| `components/brands/creators/TagChipInput.tsx` | CREATE | ~80 | Reusable tag chip input with add/remove |
| `components/brands/creators/PerformanceAnalytics.tsx` | CREATE | ~80 | 4-metric analytics row |
| `components/brands/creators/MyListsTab.tsx` | REWRITE | ~200 | Add search, sort, view toggle, ListCard grid, detail routing |
| `components/brands/creators/index.ts` | MODIFY | +5 | Export new components |
| `components/brands/discover/RecommendedCreatorCard.tsx` | MODIFY | +20 | Add optional `actionButtons` prop for custom actions |
| `app/brands/influencers/page.tsx` | MODIFY | +80 | List detail state, new handlers, create-in-tab flow |

**Total new work**: 5 new files + 6 modifications = ~1,235 lines

---

## Implementation Order

```
1. types/creator-list.ts           — Add new fields (tags, mentions, locations, etc.)
2. API modifications               — Update POST/PATCH to accept new fields
3. GET /lists/[id]/creators        — New endpoint for list detail creators + analytics
4. GET /lists/[id]/suggestions     — New endpoint for smart suggestions
5. TagChipInput.tsx                — Reusable input component (no API deps)
6. PerformanceAnalytics.tsx        — Reusable analytics display (no API deps)
7. ListCard.tsx                    — Rich list card component
8. ListDetailView.tsx              — Full detail view (depends on 5, 6, RecommendedCreatorCard)
9. RecommendedCreatorCard          — Add actionButtons prop for suggestion cards
10. MyListsTab.tsx                 — Rewrite with search/sort/view/detail routing
11. page.tsx                       — Wire up list detail state + handlers
12. index.ts                       — Export new components
```

---

## Component-to-Mockup Mapping

| Mockup | Component(s) | Notes |
|--------|-------------|-------|
| `my_creators_lists_1.png` | MyListsTab (default view) + ListCard | Lists grid with search, sort, view toggle |
| `my_creators_lists_2_view_edit.png` | ListDetailView (edit mode) | Full form + My Creators + Smart Suggestions |
| `my_creators_lists_3_add_creators.png` | ListDetailView (create mode) | Same form layout, empty "My Creators" section |
| `my_creators_lists_4_add_more_creators.png` | MyCreatorsTab (existing) | Already built — RecommendedCreatorCard + 3-dot menu |
| `my_creators_default_view.png` | MyCreatorsTab (existing) | Already built — full search/filter/sort |

---

## Key Design Decisions

### 1. Inline Detail vs Modal for List Creation
The mockup clearly shows an inline form for both create and edit flows (not a modal). The `CreateListModal` will be kept for quick-create from the header button, but the primary creation flow within My Lists tab will use `ListDetailView`.

### 2. Smart Suggestions — DB-Only First
Phase 1 of Smart Suggestions uses Firestore queries (matching tags, locations, influence size) to find relevant creators not yet in the list. No external API calls. Future phases could incorporate ML-based recommendations.

### 3. ListCard vs RecommendedCreatorCard
Though visually similar (borders, buttons, tags), the ListCard and RecommendedCreatorCard serve fundamentally different data shapes (lists vs creators). A separate `ListCard` component is cleaner than trying to abstract a shared card component.

### 4. Performance Analytics
Computed server-side when fetching list creators (aggregated from `global_influencers` data). Not stored on the list document — always fresh.

### 5. Grid/List View Toggle
Reuse the same `ResultsHeader` component from `components/discovery/results/ResultsHeader.tsx` for both My Lists and list detail views. It already handles count, sort dropdown, and grid/list toggle.

---

## Verification

### API Testing
```bash
# Expanded list creation with new fields
curl -X POST /api/brands/lists \
  -d '{"name":"Top Fashion","tags":["#Beauty","#Skincare"],"visibility":"public"}'

# Fetch list creators with analytics
curl GET /api/brands/lists/{id}/creators

# Fetch smart suggestions
curl GET /api/brands/lists/{id}/suggestions?limit=6

# Update list with tags and visibility
curl -X PATCH /api/brands/lists/{id} \
  -d '{"tags":["#NewTag"],"visibility":"private"}'
```

### UI Testing
1. Navigate to `/brands/influencers` → My Lists tab
2. Verify ListCard grid renders with tags, bookmark, action buttons
3. Search, sort, and toggle grid/list view work
4. Click "View" on a ListCard → detail view loads with form + creators + suggestions
5. Edit form fields → "Save Changes" persists
6. "Delete" removes list and returns to grid
7. "Back" button returns to grid
8. 3-dot menu on list creators: View Profile, Move, Remove all work
9. "Add to List" on suggestions adds creator to the list
10. "Create a List" from within tab opens inline create form
11. Performance analytics show aggregated values
12. Empty states work: no creators in list, no suggestions, no lists at all
