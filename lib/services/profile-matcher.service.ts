/**
 * Profile Matcher Service
 * Links and matches influencer profiles across different social media platforms
 */

import { Platform } from '../../types/api';
import {
  ProfileMatchResult,
  RawPlatformProfile,
} from '../../types/unified-profile';
import { getAdminDb } from '../firebase/admin';

export class ProfileMatcher {
  private db = getAdminDb();

  /**
   * Find if a new platform profile matches an existing unified profile
   */
  async findMatchingProfile(newProfile: {
    platform: Platform;
    username: string;
    fullName: string;
    bio?: string;
    website?: string;
    email?: string;
  }): Promise<ProfileMatchResult> {
    // Strategy 1: Exact username match across platforms
    const usernameMatch = await this.findByUsername(
      newProfile.username,
      newProfile.platform
    );
    if (usernameMatch) {
      return {
        matched: true,
        confidence: 0.95,
        matchedProfileId: usernameMatch,
        matchStrategy: 'username',
      };
    }

    // Strategy 2: External URL match (e.g., same linktree/website)
    if (newProfile.website) {
      const urlMatch = await this.findProfileByExternalUrl(newProfile.website);
      if (urlMatch) {
        return {
          matched: true,
          confidence: 0.9,
          matchedProfileId: urlMatch,
          matchStrategy: 'url',
        };
      }
    }

    // Strategy 3: Email match
    if (newProfile.email) {
      const emailMatch = await this.findProfileByEmail(newProfile.email);
      if (emailMatch) {
        return {
          matched: true,
          confidence: 0.85,
          matchedProfileId: emailMatch,
          matchStrategy: 'url',
        };
      }
    }

    // Strategy 4: Fuzzy name/bio matching
    const similarProfiles = await this.findSimilarProfiles(
      newProfile.fullName,
      newProfile.bio || ''
    );

    if (similarProfiles.length > 0) {
      const topMatch = similarProfiles[0];

      // High confidence threshold for auto-matching
      if (topMatch.confidence > 0.9) {
        return {
          matched: true,
          confidence: topMatch.confidence,
          matchedProfileId: topMatch.profileId,
          matchStrategy: 'fuzzy',
          suggestions: similarProfiles.slice(1, 4),
        };
      }

      // Medium confidence - suggest to user
      return {
        matched: false,
        confidence: topMatch.confidence,
        matchStrategy: 'fuzzy',
        suggestions: similarProfiles.slice(0, 5),
      };
    }

    // No match found
    return {
      matched: false,
      confidence: 0,
      matchStrategy: 'username',
    };
  }

  /**
   * Find profile by exact username match on a different platform
   */
  private async findByUsername(
    username: string,
    excludePlatform: Platform
  ): Promise<string | null> {
    const normalizedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

    try {
      // Query all global influencer profiles
      const profilesSnapshot = await this.db
        .collection('global_influencers')
        .get();

      for (const profileDoc of profilesSnapshot.docs) {
        const profile = profileDoc.data();

        // Check all platform usernames except the one we're adding
        for (const platformAccount of (profile.platforms || [])) {
          if (platformAccount.platform === excludePlatform) continue;

          const platformUsername = platformAccount?.username;
          if (!platformUsername) continue;

          const normalizedPlatformUsername = platformUsername
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');

          if (normalizedPlatformUsername === normalizedUsername) {
            return profileDoc.id;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding profile by username:', error);
      return null;
    }
  }

  /**
   * Find profile by external URL (website, linktree, etc.)
   */
  private async findProfileByExternalUrl(url: string): Promise<string | null> {
    const normalizedUrl = this.normalizeUrl(url);

    try {
      const profilesSnapshot = await this.db
        .collection('global_influencers')
        .get();

      for (const profileDoc of profilesSnapshot.docs) {
        const profile = profileDoc.data();

        // Check each platform's website
        for (const platformAccount of (profile.platforms || [])) {
          const platformWebsite = platformAccount?.website;
          if (platformWebsite) {
            const normalizedPlatformWebsite = this.normalizeUrl(platformWebsite);
            if (normalizedPlatformWebsite === normalizedUrl) {
              return profileDoc.id;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding profile by URL:', error);
      return null;
    }
  }

  /**
   * Find profile by email address
   */
  private async findProfileByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const profilesSnapshot = await this.db
        .collection('global_influencers')
        .where('contactInfo.email', '==', normalizedEmail)
        .limit(1)
        .get();

      if (!profilesSnapshot.empty) {
        return profilesSnapshot.docs[0].id;
      }

      // Also check businessEmail
      const businessEmailSnapshot = await this.db
        .collection('global_influencers')
        .where('contactInfo.businessEmail', '==', normalizedEmail)
        .limit(1)
        .get();

      if (!businessEmailSnapshot.empty) {
        return businessEmailSnapshot.docs[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error finding profile by email:', error);
      return null;
    }
  }

  /**
   * Find similar profiles using fuzzy name and bio matching
   */
  private async findSimilarProfiles(
    fullName: string,
    bio: string
  ): Promise<Array<{ profileId: string; confidence: number; reason: string }>> {
    try {
      const profilesSnapshot = await this.db
        .collection('global_influencers')
        .limit(100) // Limit for performance
        .get();

      const matches: Array<{
        profileId: string;
        confidence: number;
        reason: string;
      }> = [];

      for (const profileDoc of profilesSnapshot.docs) {
        const profile = profileDoc.data();

        // Calculate name similarity
        const nameSimilarity = this.calculateStringSimilarity(
          fullName,
          profile.displayName
        );

        // Calculate bio similarity
        const bioSimilarity = bio && profile.bio
          ? this.calculateStringSimilarity(bio, profile.bio)
          : 0;

        // Combined score (name weighted 70%, bio 30%)
        const confidence = nameSimilarity * 0.7 + bioSimilarity * 0.3;

        if (confidence > 0.5) {
          // Only include reasonably similar profiles
          matches.push({
            profileId: profileDoc.id,
            confidence,
            reason: nameSimilarity > 0.8
              ? 'Very similar name'
              : bioSimilarity > 0.8
              ? 'Very similar bio'
              : 'Similar profile',
          });
        }
      }

      // Sort by confidence descending
      return matches.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error finding similar profiles:', error);
      return [];
    }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * Returns value between 0 (no similarity) and 1 (identical)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const distance = this.levenshteinDistance(s1, s2);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();
  }

  /**
   * Manual profile linking (when user confirms a match)
   */
  async linkProfiles(
    mainProfileId: string,
    platform: Platform,
    platformData: RawPlatformProfile
  ): Promise<void> {
    try {
      // Normalize raw platform data using our internal method
      const normalizedData = this.normalizePlatformData(platformData);

      // Save to platform_profiles sub-collection
      await this.db
        .collection('global_influencers')
        .doc(mainProfileId)
        .collection('platform_profiles')
        .doc(platform)
        .set(normalizedData, { merge: true });

      // Update main global influencer profile platform info
      await this.db
        .collection('global_influencers')
        .doc(mainProfileId)
        .update({
          [`platforms.${platform}`]: {
            connected: true,
            profileId: normalizedData.profileId,
            username: normalizedData.username,
            followers: normalizedData.followers,
            verified: normalizedData.verified,
            avatar: normalizedData.avatar,
            lastSynced: normalizedData.lastSynced,
          },
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        });
    } catch (error) {
      console.error('Error linking profiles:', error);
      throw error;
    }
  }

  /**
   * Suggest potential matches for a platform profile
   */
  async suggestMatches(newProfile: {
    platform: Platform;
    username: string;
    fullName: string;
    bio?: string;
    website?: string;
  }): Promise<Array<{ profileId: string; confidence: number; reason: string }>> {
    const matchResult = await this.findMatchingProfile(newProfile);

    if (matchResult.matched && matchResult.matchedProfileId) {
      return [
        {
          profileId: matchResult.matchedProfileId,
          confidence: matchResult.confidence,
          reason: `Matched via ${matchResult.matchStrategy}`,
        },
        ...(matchResult.suggestions || []),
      ];
    }

    return matchResult.suggestions || [];
  }

  /**
   * Normalize platform-specific data to standard PlatformProfileData format
   */
  private normalizePlatformData(
    rawProfile: RawPlatformProfile
  ): import('../../types/unified-profile').PlatformProfileData {
    const now = new Date();

    const baseData = {
      connected: true,
      lastSynced: now,
      lastUpdated: now,
    };

    switch (rawProfile.platform) {
      case 'instagram':
        return {
          ...baseData,
          profileId: rawProfile.userId || '',
          username: rawProfile.username || '',
          fullName: rawProfile.fullName || '',
          followers: rawProfile.followersCount || 0,
          following: rawProfile.followsCount || 0,
          verified: rawProfile.verified || false,
          avatar: rawProfile.profilePicUrl || '',
          bio: rawProfile.biography,
          website: rawProfile.externalUrl,
          email: rawProfile.publicEmail,
          phone: rawProfile.contactPhoneNumber,
          posts: rawProfile.postsCount,
        };

      case 'tiktok':
        return {
          ...baseData,
          profileId: rawProfile.userId || '',
          username: rawProfile.username || '',
          fullName: rawProfile.fullName || '',
          followers: rawProfile.followersCount || 0,
          following: rawProfile.followsCount || 0,
          verified: rawProfile.verified || false,
          avatar: rawProfile.profilePicUrl || '',
          bio: rawProfile.biography,
          posts: rawProfile.postsCount,
        };

      case 'youtube':
        return {
          ...baseData,
          profileId: rawProfile.channelId || '',
          username: rawProfile.username || '',
          fullName: rawProfile.title || '',
          followers: rawProfile.subscriberCount || 0,
          following: 0,
          verified: rawProfile.verified || false,
          avatar: rawProfile.thumbnails?.[0]?.url || '',
          bio: rawProfile.description,
          posts: rawProfile.videoCount,
        };

      case 'twitter':
        return {
          ...baseData,
          profileId: rawProfile.userId || '',
          username: rawProfile.username || '',
          fullName: rawProfile.fullName || '',
          followers: rawProfile.followersCount || 0,
          following: rawProfile.followsCount || 0,
          verified: rawProfile.verified || false,
          avatar: rawProfile.profilePicUrl || '',
          bio: rawProfile.biography,
          website: rawProfile.externalUrl,
          posts: rawProfile.postsCount,
        };

      case 'facebook':
        return {
          ...baseData,
          profileId: rawProfile.pageId || '',
          username: rawProfile.username || '',
          fullName: rawProfile.name || '',
          followers: rawProfile.fanCount || 0,
          following: 0,
          verified: rawProfile.verified || false,
          avatar: rawProfile.picture?.url || '',
          bio: rawProfile.about,
        };

      default:
        throw new Error(`Unsupported platform: ${rawProfile.platform}`);
    }
  }
}

export default ProfileMatcher;
