/**
 * Creator Lists Schema
 *
 * Supports organizing saved creators into named lists/folders.
 * Stored in `creator_lists` Firestore collection.
 * Links to `user_collections.lists[]` field (stores list IDs).
 */

import { Timestamp } from 'firebase-admin/firestore';

// Firestore document shape - stored in `creator_lists` collection
export interface CreatorList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;           // Hex color for UI badge (e.g., '#FF385C')
  creatorCount: number;     // Denormalized count of creators in this list
  tags?: string[];           // Saved tags (e.g., ["#EcoGlowSA", "#SustainableBeauty"])
  mentions?: string[];       // @mentions / brands (e.g., ["@ecoglowsa"])
  locations?: string[];      // Relevant locations (e.g., ["Cape Town"])
  influenceSize?: 'nano' | 'micro' | 'mid' | 'macro' | 'mega' | 'all';
  visibility: 'public' | 'private';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// API request to create a list
export interface CreateListRequest {
  name: string;
  description?: string;
  color?: string;
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility?: 'public' | 'private';
}

// API request to update a list
export interface UpdateListRequest {
  name?: string;
  description?: string;
  color?: string;
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility?: 'public' | 'private';
}

// API request to add/remove a creator to/from lists
export interface UpdateCreatorListsRequest {
  addToLists?: string[];         // List IDs to add the creator to
  removeFromLists?: string[];    // List IDs to remove the creator from
}

// API response shape for a list
export interface CreatorListResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  creatorCount: number;
  tags?: string[];
  mentions?: string[];
  locations?: string[];
  influenceSize?: string;
  visibility: 'public' | 'private';
  createdAt: string;             // ISO string
  updatedAt: string;             // ISO string
}

// Aggregated analytics for a list's creators
export interface ListAnalytics {
  avgFollowers: number;
  avgEngagementRate: number;
  avgGrowth30d: number;
  avgAuthenticity: number;
}

// Export CSV row shape
export interface CreatorExportRow {
  name: string;
  username: string;
  platform: string;
  followers: number;
  engagementRate: number;
  location: string;
  bio: string;
  categories: string;
  lists: string;
  starred: boolean;
  collaborationStatus: string;
  addedAt: string;
}
