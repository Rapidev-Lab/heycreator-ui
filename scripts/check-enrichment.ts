/**
 * Quick diagnostic: dump enrichment data for a profile
 * Usage: npx tsx scripts/check-enrichment.ts <profileId>
 */
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const profileId = process.argv[2] || 'CITwBm4S6sR81MuznqOd';

// Init Firebase Admin
const saPath = path.join(__dirname, '..', 'docs', 'scripts', 'heycreator-service-account.json');
if (!fs.existsSync(saPath)) {
  console.error('Service account not found at', saPath);
  process.exit(1);
}
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function main() {
  // Try direct lookup first, then search by username
  let doc = await db.collection('unified_profiles').doc(profileId).get();
  if (!doc.exists) {
    console.log('Direct lookup failed, searching by username "delicacyinfluencer"...');
    const snap = await db.collection('unified_profiles')
      .where('primaryUsername', '==', 'delicacyinfluencer')
      .limit(1)
      .get();
    if (snap.empty) {
      // Try searching all profiles
      const allSnap = await db.collection('unified_profiles').limit(20).get();
      console.log('All profiles:');
      allSnap.forEach(d => {
        const data = d.data();
        console.log(`  ${d.id} — ${data.displayName || data.primaryUsername} (${data.primaryPlatform})`);
      });
      console.error('\nProfile not found for delicacyinfluencer');
      process.exit(1);
    }
    doc = snap.docs[0];
    console.log('Found profile:', doc.id);
  }

  const data = doc.data()!;
  console.log('\n=== PROFILE (top-level fields) ===');
  console.log('displayName:', data.displayName);
  console.log('Top-level keys:', Object.keys(data).join(', '));

  // Enrichment is stored under <platform>Enrichment key
  const enrichmentKeys = Object.keys(data).filter(k => k.endsWith('Enrichment'));
  console.log('\n=== ENRICHMENT KEYS ===', enrichmentKeys);

  for (const key of enrichmentKeys) {
    const enr = data[key];
    console.log(`\n=== ${key} ===`);
    console.log('hasEnrichment:', enr?.hasEnrichment);
    console.log('lastEnriched:', enr?.lastEnriched);
    console.log('postsCount:', enr?.postsCount);
    console.log('followerCount:', enr?.followerCount);
    console.log('averageEngagementRate:', enr?.averageEngagementRate);

    const topPosts = enr?.topPosts || [];
    console.log('topPosts count:', topPosts.length);

    if (topPosts.length > 0) {
      console.log('\nFirst post (all fields):');
      const first = JSON.parse(JSON.stringify(topPosts[0]));
      console.log(JSON.stringify(first, null, 2));

      console.log('\nKey fields for all posts:');
      topPosts.forEach((p: any, i: number) => {
        console.log(`  [${i}] likes=${p.likes} comments=${p.comments} thumbnail=${(p.thumbnail || '').substring(0, 60)}... displayUrl=${(p.displayUrl || '').substring(0, 60)}...`);
      });
    }

    console.log('\naudienceDemographics:', JSON.stringify(enr?.audienceDemographics, null, 2));
  }

  if (enrichmentKeys.length === 0) {
    console.log('No enrichment data found! Profile only has basic data.');
    console.log('All data:', JSON.stringify(data, null, 2).substring(0, 2000));
  }
}

main().catch(console.error);
