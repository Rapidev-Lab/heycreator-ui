// Types for the advanced filtering system

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string; // hex color code
  count?: number; // number of influencers with this tag
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
  influencerCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomVariable {
  id: string;
  userId: string;
  influencerId: string;
  key: string; // variable name or URL group
  value: string; // URL or custom value
  createdAt: Date;
}

export interface CustomVariableGroup {
  key: string;
  count: number;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export type ActivityType = 'recently-viewed' | 'in-active-campaigns' | 'accepted-campaign-invite';

export interface ActivityOption {
  type: ActivityType;
  label: string;
  count: number;
}

export interface SavedFilter {
  id: string;
  userId: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: Date;
  lastUsed: Date;
}

export interface FilterCriteria {
  tags?: string[]; // tag IDs
  campaigns?: string[]; // campaign IDs
  customVariables?: Array<{ key: string; value: string }>;
  activity?: ActivityType[];
  search?: string;
  platforms?: string[];
  influenceScoreMin?: number;
  influenceScoreMax?: number;
  followersMin?: number;
  followersMax?: number;
  location?: string[];
  categories?: string[];
}

export interface ActiveFilters {
  tags: string[];
  campaigns: string[];
  customVariables: Array<{ key: string; value: string }>;
  activity: ActivityType[];
  savedFilter?: string; // saved filter ID if one is applied
}

export type FilterSection = 'tags' | 'campaigns' | 'customVariables' | 'activity' | 'savedFilters';

export interface ExpandedSections {
  tags: boolean;
  campaigns: boolean;
  customVariables: boolean;
  activity: boolean;
  savedFilters: boolean;
}

export interface FilterData {
  tags: Tag[];
  campaigns: Campaign[];
  customVariableGroups: CustomVariableGroup[];
  activityOptions: ActivityOption[];
  savedFilters: SavedFilter[];
}

// Bulk action types
export type BulkActionType =
  | 'add-to-campaign'
  | 'add-tag'
  | 'create-pdf-report'
  | 'fetch-emails'
  | 'get-tiktok-demographics'
  | 'send-mass-email'
  | 'remove-tag'
  | 'archive'
  | 'delete';

export interface BulkActionRequest {
  action: BulkActionType;
  influencerIds: string[];
  data?: any; // action-specific data
}

export interface BulkActionResult {
  success: boolean;
  message: string;
  results: {
    successful: number;
    failed: number;
    errors?: Array<{
      id: string;
      error: string;
    }>;
  };
}

// Sort options enhanced
export type SortField = 'dateViewed' | 'dateTagged' | 'name' | 'influence';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
