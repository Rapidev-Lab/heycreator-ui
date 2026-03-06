import fs from 'fs';
import path from 'path';

export const PROJECT_ROOT = path.resolve(__dirname, '../..');
export const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'user-story-map');
export const VERSIONS_DIR = path.join(OUTPUT_ROOT, 'versions');

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getVersionDir(version: string): string {
  return path.join(VERSIONS_DIR, `v${version}`);
}

export function getScreenshotsDir(version: string): string {
  return path.join(getVersionDir(version), 'screenshots');
}

export function getLatestVersion(): string | null {
  if (!fs.existsSync(VERSIONS_DIR)) return null;
  const versions = fs
    .readdirSync(VERSIONS_DIR)
    .filter((d) => d.startsWith('v'))
    .map((d) => d.slice(1))
    .sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
      return (aMajor - bMajor) || (aMinor - bMinor) || (aPatch - bPatch);
    });
  return versions.length > 0 ? versions[versions.length - 1] : null;
}

export function bumpVersion(
  current: string,
  type: 'major' | 'minor' | 'patch'
): string {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

export interface Manifest {
  version: string;
  generatedAt: string;
  platform: string;
  counts: {
    userStories: number;
    screenshots: number;
  };
  devServerUrl: string;
  viewport: { width: number; height: number };
  previousVersion: string | null;
}

export function writeManifest(
  version: string,
  outputDir: string,
  counts: { stories: number; screenshots: number }
): void {
  const manifest: Manifest = {
    version,
    generatedAt: new Date().toISOString(),
    platform: 'HeyCreator',
    counts: {
      userStories: counts.stories,
      screenshots: counts.screenshots,
    },
    devServerUrl: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    previousVersion: getLatestVersion(),
  };
  fs.writeFileSync(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}
