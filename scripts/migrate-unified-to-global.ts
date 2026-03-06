/**
 * One-time migration script: Copy unified_profiles data into global_influencers.
 *
 * After this migration, global_influencers becomes the single source of truth.
 * unified_profiles is no longer written to or read from.
 *
 * Steps per unified_profiles doc:
 *   1. Merge fields (influenceScore, estimatedPrice, linkedAccounts, combinedMetrics,
 *      enrichmentSummary, enrichmentDataUrl, userId, primaryAccountKey) into global_influencers
 *   2. Ensure user_collections entry exists with profileStatus from unified_profiles.status
 *   3. Handle orphaned docs (unified_profiles without matching global_influencers)
 *
 * Usage:
 *   npx tsx scripts/migrate-unified-to-global.ts
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// ---------- Load .env file ----------
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  for (const p of [envLocalPath, envPath]) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      }
    }
  }
}
loadEnv();

// ---------- Firebase Admin Init ----------
function initFirebase(): admin.firestore.Firestore {
  if (admin.apps.length > 0) {
    return admin.firestore(admin.apps[0]!);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const sa = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
  }

  const saPath = path.join(__dirname, 'heycreator-service-account.json');
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
  }

  throw new Error(
    'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or place heycreator-service-account.json in scripts/'
  );
}

// ---------- Main ----------
async function main() {
  const db = initFirebase();
  db.settings({ ignoreUndefinedProperties: true });

  console.log('=== Migrate unified_profiles → global_influencers ===\n');

  // Step 1: Fetch all unified_profiles
  console.log('Fetching all unified_profiles...');
  const unifiedSnap = await db.collection('unified_profiles').get();
  console.log(`Found ${unifiedSnap.size} unified_profiles docs.\n`);

  if (unifiedSnap.empty) {
    console.log('Nothing to migrate.');
    return;
  }

  let merged = 0;
  let orphansCreated = 0;
  let ucCreated = 0;
  let ucUpdated = 0;
  let skipped = 0;

  // Process in batches of 500 (Firestore batch limit)
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const unifiedDoc of unifiedSnap.docs) {
    const data = unifiedDoc.data();
    const profileId = unifiedDoc.id;

    // Fields to merge into global_influencers
    const mergePayload: Record<string, any> = {};

    if (data.influenceScore !== undefined) mergePayload.influenceScore = data.influenceScore;
    if (data.estimatedPrice !== undefined) mergePayload.estimatedPrice = data.estimatedPrice;
    if (data.linkedAccounts) mergePayload.linkedAccounts = data.linkedAccounts;
    if (data.combinedMetrics) mergePayload.combinedMetrics = data.combinedMetrics;
    if (data.enrichmentSummary) mergePayload.enrichmentSummary = data.enrichmentSummary;
    if (data.enrichmentDataUrl) mergePayload.enrichmentDataUrl = data.enrichmentDataUrl;
    if (data.userId) mergePayload.userId = data.userId;
    if (data.createdBy) mergePayload.userId = mergePayload.userId || data.createdBy;
    if (data.primaryAccountKey) mergePayload.primaryAccountKey = data.primaryAccountKey;
    if (data.mainTopics) mergePayload.mainTopics = data.mainTopics;
    if (data.brandSafety) mergePayload.brandSafety = data.brandSafety;
    if (data.audienceAgeGroup) mergePayload.audienceAgeGroup = data.audienceAgeGroup;
    if (data.audienceAuthenticity) mergePayload.audienceAuthenticity = data.audienceAuthenticity;
    if (data.audienceLocation) mergePayload.audienceLocation = data.audienceLocation;
    if (data.flag) mergePayload.flag = data.flag;

    // Copy enrichment data if present
    for (const key of ['instagramEnrichment', 'tiktokEnrichment', 'youtubeEnrichment', 'twitterEnrichment']) {
      if (data[key] && !mergePayload[key]) {
        mergePayload[key] = data[key];
      }
    }

    if (Object.keys(mergePayload).length === 0) {
      console.log(`  [SKIP] ${profileId} — no extra fields to merge`);
      skipped++;
      continue;
    }

    // Check if global_influencers doc exists
    const globalRef = db.collection('global_influencers').doc(profileId);
    const globalDoc = await globalRef.get();

    if (globalDoc.exists) {
      // Merge — preserves existing global_influencers fields
      batch.set(globalRef, mergePayload, { merge: true });
      merged++;
      console.log(`  [MERGE] ${profileId} — ${Object.keys(mergePayload).length} fields`);
    } else {
      // Orphan — create global_influencers doc from unified_profiles data
      const fullDoc: Record<string, any> = {
        displayName: data.displayName || '',
        primaryUsername: data.linkedAccounts?.[0]?.username || '',
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || '',
        verified: data.linkedAccounts?.[0]?.verified || false,
        platforms: (data.linkedAccounts || []).map((acc: any) => ({
          platform: acc.platform,
          username: acc.username,
          followerCount: acc.followerCount || 0,
          followingCount: 0,
          verified: acc.verified || false,
          profileUrl: acc.profileUrl || `https://${acc.platform}.com/${acc.username}`,
          lastUpdated: admin.firestore.Timestamp.now(),
        })),
        totalFollowers: data.combinedMetrics?.totalFollowers || 0,
        averageEngagementRate: data.combinedMetrics?.averageEngagementRate || 0,
        totalReach: data.combinedMetrics?.totalReach || 0,
        primaryPlatform: data.linkedAccounts?.[0]?.platform || 'instagram',
        location: { country: '', city: '' },
        categories: data.categories || [],
        topics: data.categories || [],
        searchKeywords: [
          data.displayName?.toLowerCase(),
          data.linkedAccounts?.[0]?.username?.toLowerCase(),
          ...(data.categories || []).map((c: string) => c.toLowerCase()),
        ].filter(Boolean),
        addedToCollectionCount: 1,
        viewCount: 0,
        createdAt: data.createdAt || admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        ...mergePayload,
      };
      batch.set(globalRef, fullDoc);
      orphansCreated++;
      console.log(`  [CREATE] ${profileId} — orphan, created global_influencers doc`);
    }

    // Ensure user_collections entry exists with profileStatus
    const userId = data.userId || data.createdBy;
    if (userId) {
      const ucSnap = await db.collection('user_collections')
        .where('userId', '==', userId)
        .where('globalInfluencerId', '==', profileId)
        .limit(1)
        .get();

      if (ucSnap.empty) {
        const ucRef = db.collection('user_collections').doc();
        batch.set(ucRef, {
          userId,
          globalInfluencerId: profileId,
          profileStatus: data.status || 'active',
          customCategories: [],
          notes: '',
          lists: [],
          starred: false,
          collaborationStatus: 'none',
          enrichmentStatus: 'none',
          addedAt: data.createdAt || admin.firestore.Timestamp.now(),
          lastViewedAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
        ucCreated++;
        console.log(`  [UC-CREATE] user_collections entry for ${userId} → ${profileId}`);
      } else {
        // Update existing entry with profileStatus
        const existingUc = ucSnap.docs[0];
        const existingData = existingUc.data();
        if (!existingData.profileStatus) {
          batch.update(existingUc.ref, {
            profileStatus: data.status || 'active',
          });
          ucUpdated++;
          console.log(`  [UC-UPDATE] Added profileStatus to existing entry`);
        }
      }
    }

    batchCount++;
    if (batchCount >= BATCH_SIZE) {
      console.log(`\n  Committing batch of ${batchCount} operations...`);
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining
  if (batchCount > 0) {
    console.log(`\n  Committing final batch of ${batchCount} operations...`);
    await batch.commit();
  }

  console.log('\n=== Migration Complete ===');
  console.log(`  Merged:           ${merged}`);
  console.log(`  Orphans created:  ${orphansCreated}`);
  console.log(`  UC created:       ${ucCreated}`);
  console.log(`  UC updated:       ${ucUpdated}`);
  console.log(`  Skipped:          ${skipped}`);
  console.log(`  Total processed:  ${unifiedSnap.size}`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
