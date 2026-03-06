#!/usr/bin/env tsx
/**
 * generate.ts — Main orchestrator for HeyCreator User Story Map
 *
 * Usage:
 *   npx tsx scripts/user-story-map/generate.ts                    # Generate with auto version
 *   npx tsx scripts/user-story-map/generate.ts --version 1.0.0    # Explicit version
 *   npx tsx scripts/user-story-map/generate.ts --bump minor       # Bump from latest
 *   npx tsx scripts/user-story-map/generate.ts --screenshots-only # Only screenshots
 *   npx tsx scripts/user-story-map/generate.ts --excel-only       # Only Excel
 */

import fs from 'fs';
import path from 'path';
import {
  ensureDir,
  getVersionDir,
  getLatestVersion,
  bumpVersion,
  writeManifest,
  OUTPUT_ROOT,
  VERSIONS_DIR,
} from './utils';
import { STORIES } from './story-registry';
import { SCREENSHOTS } from './screenshot-manifest';
import { generateExcel } from './generate-excel';
import { captureAllScreenshots } from './capture-screenshots';

// ─── Parse CLI args ──────────────────────────────────────────
interface CliArgs {
  version?: string;
  bump?: 'major' | 'minor' | 'patch';
  screenshotsOnly: boolean;
  excelOnly: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = { screenshotsOnly: false, excelOnly: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--version':
        result.version = args[++i];
        break;
      case '--bump':
        result.bump = args[++i] as 'major' | 'minor' | 'patch';
        break;
      case '--screenshots-only':
        result.screenshotsOnly = true;
        break;
      case '--excel-only':
        result.excelOnly = true;
        break;
    }
  }

  return result;
}

// ─── Determine version ───────────────────────────────────────
function resolveVersion(args: CliArgs): string {
  if (args.version) return args.version;

  const latest = getLatestVersion();

  if (args.bump && latest) {
    return bumpVersion(latest, args.bump);
  }

  if (latest) {
    // Default: bump patch
    return bumpVersion(latest, 'patch');
  }

  return '1.0.0';
}

// ─── Create screenshot subdirs ───────────────────────────────
function createScreenshotDirs(outputDir: string): void {
  const subdirs = [
    'brand/auth', 'brand/dashboard', 'brand/discovery', 'brand/campaigns',
    'brand/creators', 'brand/profile', 'brand/notifications', 'brand/analytics',
    'influencer/auth', 'influencer/dashboard', 'influencer/marketplace',
    'influencer/campaigns', 'influencer/applications', 'influencer/invitations',
    'influencer/profile', 'influencer/notifications', 'influencer/calendar',
    'shared',
  ];

  subdirs.forEach(sub => {
    ensureDir(path.join(outputDir, 'screenshots', sub));
  });
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  const version = resolveVersion(args);
  const outputDir = getVersionDir(version);

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     HeyCreator User Story Map Generator         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  Version:      v${version}`);
  console.log(`  Stories:      ${STORIES.length}`);
  console.log(`  Screenshots:  ${SCREENSHOTS.length}`);
  console.log(`  Output:       ${outputDir}`);
  console.log(`  Mode:         ${args.screenshotsOnly ? 'Screenshots only' : args.excelOnly ? 'Excel only' : 'Full (Excel + Screenshots)'}`);
  console.log('');

  // Create output directories
  ensureDir(outputDir);
  createScreenshotDirs(outputDir);

  let screenshotCount = 0;

  // Step 1: Capture screenshots
  if (!args.excelOnly) {
    console.log('Step 1: Capturing screenshots...');
    const results = await captureAllScreenshots(version, outputDir);
    screenshotCount = results.filter(r => r.success).length;
  } else {
    // Count existing screenshots
    const screenshotsDir = path.join(outputDir, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const countFiles = (dir: string): number => {
        let count = 0;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
          } else if (entry.name.endsWith('.png')) {
            count++;
          }
        }
        return count;
      };
      screenshotCount = countFiles(screenshotsDir);
    }
    console.log(`Step 1: Skipped (--excel-only). Found ${screenshotCount} existing screenshots.`);
  }

  // Step 2: Generate Excel
  if (!args.screenshotsOnly) {
    console.log('\nStep 2: Generating Excel workbook...');
    const excelPath = await generateExcel(version, outputDir);
    console.log(`  Excel saved: ${excelPath}`);
  } else {
    console.log('\nStep 2: Skipped (--screenshots-only).');
  }

  // Step 3: Write manifest
  console.log('\nStep 3: Writing manifest...');
  writeManifest(version, outputDir, {
    stories: STORIES.length,
    screenshots: screenshotCount,
  });

  // Step 4: Update latest copy
  if (!args.screenshotsOnly) {
    const latestExcel = path.join(OUTPUT_ROOT, 'HeyCreator-UserStoryMap-latest.xlsx');
    const versionExcel = path.join(outputDir, `HeyCreator-UserStoryMap-v${version}.xlsx`);
    if (fs.existsSync(versionExcel)) {
      fs.copyFileSync(versionExcel, latestExcel);
      console.log(`  Latest copy: ${latestExcel}`);
    }
  }

  console.log('');
  console.log('========================================');
  console.log(`  User Story Map v${version} generated!`);
  console.log('========================================');
  console.log('');
  console.log('Output files:');
  if (!args.screenshotsOnly) {
    console.log(`  Excel:        ${outputDir}/HeyCreator-UserStoryMap-v${version}.xlsx`);
    console.log(`  Latest copy:  ${OUTPUT_ROOT}/HeyCreator-UserStoryMap-latest.xlsx`);
  }
  if (!args.excelOnly) {
    console.log(`  Screenshots:  ${outputDir}/screenshots/ (${screenshotCount} files)`);
  }
  console.log(`  Manifest:     ${outputDir}/manifest.json`);
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
