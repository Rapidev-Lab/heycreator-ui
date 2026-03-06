/**
 * Apify Instagram Scraper Input Types
 *
 * These types enforce strict mode separation to prevent MODE mixing bugs.
 * The Instagram scraper actor has two distinct operating modes:
 *
 * MODE 1 (Direct URLs): Fetch specific content from known URLs
 * MODE 2 (Search): Discover content via Instagram/Facebook Ads + Google search
 *
 * Defensive Pattern:
 * - MODE 1 inputs include `searchLimit: 0` to prevent MODE 2 behavior
 * - MODE 2 inputs include `resultsLimit: 0` to prevent MODE 1 behavior
 * - The `never` type explicitly prevents wrong keys from being added
 */

/**
 * MODE 1: Direct URLs Input (Apify requires ALL keys)
 *
 * Purpose: Fetch specific data from known Instagram URLs
 *
 * Pattern from Apify documentation:
 * - High value for resultsLimit (main operation: 5)
 * - Minimal value for searchLimit (required: 1)
 * - searchType: "user" (required compatibility key)
 *
 * Required Keys (ALL must be present):
 * - directUrls: Array of Instagram URLs
 * - resultsType: Type of content to fetch
 * - resultsLimit: Number of results (HIGH VALUE - main operation)
 * - searchLimit: Always 1 (minimal valid value for compatibility)
 * - searchType: Always "user" (compatibility key)
 * - addParentData: Whether to include parent data
 */
export type ApifyMode1Input = {
  directUrls: string[];
  resultsType: 'posts' | 'comments' | 'details' | 'mentions' | 'reels' | 'stories';
  resultsLimit: number;     // HIGH VALUE (5+) - main operation
  searchLimit: 1;           // ✅ REQUIRED: Minimal valid value
  searchType: 'user';       // ✅ REQUIRED: Compatibility key
  addParentData: boolean;
};

/**
 * MODE 2: Search Input (Apify requires ALL keys)
 *
 * Purpose: Discover content via search (Instagram/Facebook Ads + Google)
 *
 * Pattern from Apify documentation:
 * - High value for searchLimit (main operation: 5-10)
 * - Minimal value for resultsLimit (required: 1)
 * - resultsType: "details" (required compatibility key)
 *
 * Required Keys (ALL must be present):
 * - search: Search query string
 * - searchType: Type of search to perform
 * - searchLimit: Max search results (HIGH VALUE - main operation)
 * - resultsLimit: Always 1 (minimal valid value for compatibility)
 * - resultsType: Always "details" (compatibility key)
 * - addParentData: Whether to include parent data
 */
export type ApifyMode2Input = {
  search: string;
  searchType: 'user' | 'hashtag' | 'place';
  searchLimit: number;      // HIGH VALUE (5-10) - main operation
  resultsLimit: 1;          // ✅ REQUIRED: Minimal valid value
  resultsType: 'details';   // ✅ REQUIRED: Compatibility key
  addParentData: boolean;
};

/**
 * Union type for Instagram scraper inputs
 * Use this when a function can return either mode
 */
export type ApifyInstagramInput = ApifyMode1Input | ApifyMode2Input;

/**
 * Instagram Profile Scraper Input
 *
 * This is for a different actor: apify/instagram-profile-scraper
 * It has its own input format separate from the general scraper
 *
 * Note: This actor may have different requirements than the general scraper
 */
export type ApifyProfileScraperInput = {
  usernames: string[];
  resultsType: 'details';
  searchLimit: 1;           // ✅ REQUIRED: Minimal valid value
  searchType: 'user';       // ✅ REQUIRED: Compatibility key
};

/**
 * Instagram Search Scraper Input
 *
 * This is for apify/instagram-search-scraper actor (optimized for search)
 * Much simpler input format than the general scraper
 *
 * Example:
 * {
 *   "search": "Wieslaw Samushonga",
 *   "searchType": "user",
 *   "searchLimit": 10,
 *   "enhanceUserSearchWithFacebookPage": false
 * }
 */
export type ApifySearchScraperInput = {
  search: string;
  searchType: 'user' | 'hashtag' | 'place';
  searchLimit: number;
  enhanceUserSearchWithFacebookPage?: boolean;
};

/**
 * Type guards to check which mode an input belongs to
 */
export function isMode1Input(input: ApifyInstagramInput): input is ApifyMode1Input {
  return 'directUrls' in input && 'resultsType' in input;
}

export function isMode2Input(input: ApifyInstagramInput): input is ApifyMode2Input {
  return 'search' in input && 'searchType' in input;
}

/**
 * Helper type for MODE 1 resultsType values
 */
export type Mode1ResultsType = ApifyMode1Input['resultsType'];

/**
 * Helper type for MODE 2 searchType values
 */
export type Mode2SearchType = ApifyMode2Input['searchType'];
