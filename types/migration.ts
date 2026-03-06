// ===== MIGRATION STEP =====

export type MigrationStep = 'review' | 'workspace' | 'confirm' | 'migrating' | 'complete';

// ===== MIGRATION STATE =====

export interface MigrationState {
  id: string;
  userId: string;
  currentStep: MigrationStep;
  /** Data discovered from legacy account */
  legacyData: {
    campaigns: number;
    creators: number;
    notes: number;
    lists: number;
    searchHistory: number;
  };
  /** User's choices for the new workspace */
  workspaceConfig: {
    name: string;
    industry: string;
    plan: 'discovery' | 'growth' | 'scale';
    teamMembers: string[]; // email addresses to invite
  };
  /** Progress tracking during migration */
  progress: {
    totalItems: number;
    migratedItems: number;
    currentEntity: string; // "campaigns", "creators", etc.
    errors: string[];
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// ===== MIGRATION SUMMARY =====

export interface MigrationSummaryData {
  campaignsMigrated: number;
  creatorsMigrated: number;
  notesMigrated: number;
  listsMigrated: number;
  searchHistoryMigrated: number;
  errorsEncountered: number;
  duration: string; // e.g. "2 minutes 34 seconds"
  newWorkspaceId: string;
  newWorkspaceName: string;
}

// ===== MIGRATION SUGGESTION =====

export interface MigrationSuggestion {
  suggestedName: string;
  suggestedIndustry: string;
  suggestedPlan: 'discovery' | 'growth' | 'scale';
  reasoning: string;
  confidence: number;
}
