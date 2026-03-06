export type ContentStatus = 'pending' | 'approved' | 'revision_requested' | 'rejected';
export type ContentPlatform = 'instagram_reel' | 'instagram_story' | 'instagram_post' | 'tiktok_video' | 'youtube_short' | 'x_post';

export interface ContentVersion {
  versionNumber: number;
  url: string;
  thumbnailUrl?: string;
  submittedAt: string;
  status: ContentStatus;
  reviewComments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isYou?: boolean;
}

export interface TaskSubmission {
  taskId: string;
  taskName: string;
  status: ContentStatus;
}

export interface ContentSubmission {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar: string;
  platform: ContentPlatform;
  platformLabel: string;
  currentVersion: number;
  versions: ContentVersion[];
  status: ContentStatus;
  caption: string;
  likes?: number;
  views?: number;
  comments?: number;
  dueDate: string;
  submittedAt: string;
  madeWithEverGrow?: boolean;
  allTasks?: TaskSubmission[];
}

export type ContentFilterTab = 'all' | 'pending' | 'approved' | 'revisions';