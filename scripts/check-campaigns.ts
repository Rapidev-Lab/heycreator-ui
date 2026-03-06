/**
 * Quick script to list all campaigns in Firestore
 * Usage: npx tsx scripts/check-campaigns.ts
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

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

function initFirebase(): admin.firestore.Firestore {
  if (admin.apps.length > 0) return admin.firestore(admin.apps[0]!);
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const sa = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    return admin.firestore();
  }
  throw new Error('No Firebase credentials found');
}

async function main() {
  const db = initFirebase();
  console.log('\n=== All Campaigns in Firestore ===\n');

  const snapshot = await db.collection('campaigns').get();
  console.log(`Total campaigns found: ${snapshot.size}\n`);

  for (const doc of snapshot.docs) {
    const d = doc.data();
    console.log(`  ID: ${doc.id}`);
    console.log(`  Title: ${d.campaignTitle || '(no title)'}`);
    console.log(`  Status: ${d.status}`);
    console.log(`  Visibility: ${d.campaignVisibility}`);
    console.log(`  Brand ID: ${d.brandId}`);
    console.log(`  Created: ${d.createdAt?.toDate?.() || d.createdAt || 'unknown'}`);
    console.log('');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
