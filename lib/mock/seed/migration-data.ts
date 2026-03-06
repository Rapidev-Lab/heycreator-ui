/**
 * Mock migration seed data for Sprint 5.
 *
 * Covers:
 * - One pending migration state for mock-brand-user-1 (Nike SA legacy data)
 * - One completed migration summary showing successful migration results
 *
 * Canonical "today": 2026-03-06
 */

import { MigrationState, MigrationSummaryData } from '@/types/migration';

// ---------------------------------------------------------------------------
// Date helpers — canonical "today": 2026-03-06
// ---------------------------------------------------------------------------

function D(offsetDays: number): string {
  const base = new Date('2026-03-06T12:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
}

// ---------------------------------------------------------------------------
// Pending migration state — mock-brand-user-1 has legacy data ready to migrate
// ---------------------------------------------------------------------------
//
// Scenario: Nike SA brand user has an older HeyCreator v1 account with
// 3 campaigns, 45 saved creators, 12 notes, 2 lists, and 87 search queries.
// They are at the 'review' step, seeing what data will be brought across.

const migrationState: MigrationState = {
  id: 'migration-001',
  userId: 'mock-brand-user-1',
  currentStep: 'review',
  legacyData: {
    campaigns: 3,
    creators: 45,
    notes: 12,
    lists: 2,
    searchHistory: 87,
  },
  workspaceConfig: {
    name: 'Nike SA Hub',
    industry: 'Fashion',
    plan: 'growth',
    teamMembers: [], // No team members added yet — still in review step
  },
  progress: {
    totalItems: 149, // 3 + 45 + 12 + 2 + 87
    migratedItems: 0,
    currentEntity: '',
    errors: [],
  },
  status: 'pending',
  startedAt: undefined,
  completedAt: undefined,
  createdAt: D(-2), // Created 2 days ago when user initiated the wizard
};

// ---------------------------------------------------------------------------
// Completed migration summary — represents a previously finished migration
// for a different user / prior session, used to demonstrate the success state
// ---------------------------------------------------------------------------
//
// Scenario: The Adidas ZA workspace owner completed their migration 7 days ago.
// The migration took just over 2 minutes and all data transferred cleanly.

const migrationSummary: MigrationSummaryData = {
  campaignsMigrated: 3,
  creatorsMigrated: 45,
  notesMigrated: 12,
  listsMigrated: 2,
  searchHistoryMigrated: 87,
  errorsEncountered: 0,
  duration: '2 minutes 18 seconds',
  newWorkspaceId: 'ws-nike-sa',
  newWorkspaceName: 'Nike SA Hub',
};

// ---------------------------------------------------------------------------
// Exports in seed-pattern format: { id, data }
// ---------------------------------------------------------------------------

export const mockMigrationState: { id: string; data: MigrationState } = {
  id: migrationState.id,
  data: migrationState,
};

export const mockMigrationSummary: { id: string; data: MigrationSummaryData } = {
  id: 'migration-summary-001',
  data: migrationSummary,
};
