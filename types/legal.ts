// ===== TERMS OF SERVICE =====

export interface ToSVersion {
  id: string;
  version: string; // e.g. "2.0.0"
  title: string;
  effectiveDate: string; // ISO date
  content: string; // Markdown or HTML content (abbreviated for mock)
  summary: string; // Plain text summary of changes
  isActive: boolean;
  createdAt: string;
}

export interface ToSAcceptance {
  id: string;
  userId: string;
  tosVersionId: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

// ===== DATA EXPORT =====

export interface DataExportRequest {
  id: string;
  userId: string;
  workspaceId: string;
  status: 'pending' | 'processing' | 'ready' | 'downloaded' | 'expired';
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
  downloadUrl?: string;
  format: 'json' | 'csv';
  includeData: {
    profiles: boolean;
    campaigns: boolean;
    analytics: boolean;
    notes: boolean;
    searchHistory: boolean;
  };
  fileSizeBytes?: number;
}

// ===== ACCOUNT DELETION =====

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  reason: string;
  feedback?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  scheduledDeletionDate: string; // 30 days from request
  requestedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

// ===== AUDIT LOG =====

/**
 * Audit log entry for compliance and security tracking.
 *
 * Note: `types/workspace.ts` defines a stricter `AuditLogEntry` with a
 * discriminated `AuditAction` union for workspace-specific events. This
 * interface provides a broader legal/compliance variant that accepts any
 * string action and uses `details` (human-readable) rather than `description`.
 * Import from this module when working with legal, data-export, or
 * cross-entity audit contexts.
 */
export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string; // e.g. "campaign.created", "member.invited", "settings.updated"
  entityType: string; // e.g. "campaign", "member", "workspace"
  entityId?: string;
  details: string; // Human-readable description
  ipAddress: string;
  timestamp: string;
}
