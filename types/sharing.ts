export type SharedLinkType = 'campaign' | 'creator_profile' | 'creator_list';
export type SharedLinkStatus = 'active' | 'expired' | 'revoked';

export interface SharedLink {
  id: string;
  workspaceId: string;
  type: SharedLinkType;
  resourceId: string; // campaignId or creatorId
  resourceName: string; // "Summer Campaign 2026" or "Sarah Johnson"
  token: string; // unique share token
  createdBy: string; // userId
  createdByName: string;
  status: SharedLinkStatus;
  expiresAt: string | null; // null = never expires
  password?: string; // optional password protection
  allowDownload: boolean;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

export interface ShareAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number; // seconds
  viewsByDay: { date: string; views: number }[];
}
