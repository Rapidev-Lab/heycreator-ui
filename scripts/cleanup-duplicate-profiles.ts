/**
 * One-time cleanup script to find and merge duplicate influencer profiles.
 *
 * Duplicates are identified by having the same (userId, primaryAccountKey)
 * across multiple documents in the `unified_profiles` collection.
 *
 * For each duplicate group:
 *   1. Keep the oldest document (canonical)
 *   2. Repoint user_collections entries to the canonical
 *   3. Delete duplicate unified_profiles docs
 *   4. Delete duplicate global_influencers docs
 *   5. Create a profile_dedup_locks entry for the canonical
 *
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-profiles.ts
 *   -- or --
 *   npm run cleanup:duplicates
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

  // Try env var first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const sa = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
  }

  // Fall back to local file
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

  console.log('Fetching all unified_profiles...');
  const allProfiles = await db.collection('unified_profiles').get();
  console.log(`Found ${allProfiles.size} total profiles.`);

  // Group by userId + primaryAccountKey
  const groups = new Map<string, Array<{ id: string; createdAt: any }>>();

  for (const doc of allProfiles.docs) {
    const data = doc.data();
    const userId = data.userId;
    const pak = data.primaryAccountKey;

    if (!userId || !pak) continue;

    const key = `${userId}__${pak}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ id: doc.id, createdAt: data.createdAt });
  }

  // Filter to groups with duplicates
  const duplicateGroups = [...groups.entries()].filter(([, profiles]) => profiles.length > 1);

  if (duplicateGroups.length === 0) {
    console.log('No unified_profiles duplicates found.');
  } else {
    console.log(`\nFound ${duplicateGroups.length} duplicate group(s):\n`);
  }

  let totalRemoved = 0;

  for (const [key, profiles] of duplicateGroups) {
    // Sort by createdAt ascending — keep the oldest
    profiles.sort((a, b) => {
      const aSeconds = a.createdAt?._seconds ?? 0;
      const bSeconds = b.createdAt?._seconds ?? 0;
      return aSeconds - bSeconds;
    });

    const canonical = profiles[0];
    const duplicates = profiles.slice(1);
    const [userId, primaryAccountKey] = key.split('__');

    console.log(`  Group: ${key}`);
    console.log(`    Canonical: ${canonical.id}`);
    console.log(`    Duplicates to remove: ${duplicates.map(d => d.id).join(', ')}`);

    for (const dup of duplicates) {
      // Repoint user_collections entries
      const collections = await db
        .collection('user_collections')
        .where('globalInfluencerId', '==', dup.id)
        .get();

      for (const colDoc of collections.docs) {
        await colDoc.ref.update({ globalInfluencerId: canonical.id });
        console.log(`    Repointed user_collections/${colDoc.id} → ${canonical.id}`);
      }

      // Delete duplicate from unified_profiles
      await db.collection('unified_profiles').doc(dup.id).delete();
      console.log(`    Deleted unified_profiles/${dup.id}`);

      // Delete duplicate from global_influencers
      const globalDoc = await db.collection('global_influencers').doc(dup.id).get();
      if (globalDoc.exists) {
        await globalDoc.ref.delete();
        console.log(`    Deleted global_influencers/${dup.id}`);
      }

      totalRemoved++;
    }

    // Create dedup lock for canonical profile
    const dedupDocId = key.replace(/[\/\\]/g, '_');
    await db.collection('profile_dedup_locks').doc(dedupDocId).set({
      profileId: canonical.id,
      userId,
      primaryAccountKey,
      createdAt: admin.firestore.Timestamp.now(),
    });
    console.log(`    Created dedup lock: profile_dedup_locks/${dedupDocId}\n`);
  }

  console.log(`Done. Removed ${totalRemoved} duplicate profile(s) across ${duplicateGroups.length} group(s).`);

  // =========================================================================
  // Phase 2: Dedup user_collections — after repointing, multiple entries
  // for the same (userId, globalInfluencerId) may exist. Keep the oldest.
  // =========================================================================
  console.log('\n--- Phase 2: Dedup user_collections ---');
  const allCollections = await db.collection('user_collections').get();
  console.log(`Found ${allCollections.size} user_collections entries.`);

  const ucGroups = new Map<string, Array<{ id: string; addedAt: any }>>();
  for (const doc of allCollections.docs) {
    const data = doc.data();
    if (!data.userId || !data.globalInfluencerId) continue;
    const key = `${data.userId}__${data.globalInfluencerId}`;
    if (!ucGroups.has(key)) ucGroups.set(key, []);
    ucGroups.get(key)!.push({ id: doc.id, addedAt: data.addedAt });
  }

  let ucRemoved = 0;
  for (const [key, entries] of ucGroups) {
    if (entries.length <= 1) continue;
    entries.sort((a, b) => (a.addedAt?._seconds ?? 0) - (b.addedAt?._seconds ?? 0));
    const dupes = entries.slice(1);
    for (const dup of dupes) {
      await db.collection('user_collections').doc(dup.id).delete();
      console.log(`  Deleted duplicate user_collections/${dup.id} (key: ${key})`);
      ucRemoved++;
    }
  }
  console.log(`Removed ${ucRemoved} duplicate user_collections entry(ies).`);

  // =========================================================================
  // Phase 3: Dedup global_influencers — across users, the same influencer
  // (same primaryUsername + platform) may have multiple docs. Keep the one
  // with the most data (longest bio).
  // =========================================================================
  console.log('\n--- Phase 3: Dedup global_influencers (cross-user) ---');
  const allGlobal = await db.collection('global_influencers').get();
  console.log(`Found ${allGlobal.size} global_influencers entries.`);

  const giGroups = new Map<string, Array<{ id: string; bio: string; totalFollowers: number; hasAvatar: boolean; hasEnrichment: boolean }>>();
  for (const doc of allGlobal.docs) {
    const data = doc.data();
    const username = (data.primaryUsername || '').toLowerCase();
    const platform = (data.primaryPlatform || (data.platforms?.[0]?.platform) || '').toLowerCase();
    if (!username) continue;
    const key = `${platform}:${username}`;
    if (!giGroups.has(key)) giGroups.set(key, []);
    giGroups.get(key)!.push({
      id: doc.id,
      bio: data.bio || '',
      totalFollowers: data.totalFollowers || 0,
      hasAvatar: !!(data.avatarUrl && data.avatarUrl.length > 0),
      hasEnrichment: !!(data.instagramEnrichment || data.tiktokEnrichment || data.youtubeEnrichment),
    });
  }

  let giRemoved = 0;
  for (const [key, entries] of giGroups) {
    if (entries.length <= 1) continue;
    // Score each entry: avatar(10) + enrichment(10) + bio length + followers
    entries.sort((a, b) => {
      const scoreA = (a.hasAvatar ? 10 : 0) + (a.hasEnrichment ? 10 : 0) + a.bio.length;
      const scoreB = (b.hasAvatar ? 10 : 0) + (b.hasEnrichment ? 10 : 0) + b.bio.length;
      return scoreB - scoreA || b.totalFollowers - a.totalFollowers;
    });
    const canonical = entries[0];
    const dupes = entries.slice(1);
    console.log(`  ${key}: keeping ${canonical.id}, removing ${dupes.map(d => d.id).join(', ')}`);

    for (const dup of dupes) {
      // Repoint any user_collections referencing the duplicate
      const refs = await db.collection('user_collections')
        .where('globalInfluencerId', '==', dup.id)
        .get();
      for (const ref of refs.docs) {
        await ref.ref.update({ globalInfluencerId: canonical.id });
        console.log(`    Repointed user_collections/${ref.id} → ${canonical.id}`);
      }
      await db.collection('global_influencers').doc(dup.id).delete();
      giRemoved++;
    }
  }
  console.log(`Removed ${giRemoved} duplicate global_influencers entry(ies).`);

  console.log('\n=== Cleanup complete ===');
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
