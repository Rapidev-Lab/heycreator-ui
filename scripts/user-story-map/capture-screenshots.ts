/**
 * capture-screenshots.ts
 * Uses Playwright to capture screenshots of every page in the HeyCreator platform.
 * Requires: dev server running with NEXT_PUBLIC_MOCK_MODE=true
 */

import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { SCREENSHOTS, ScreenshotSpec } from './screenshot-manifest';
import { ensureDir, getScreenshotsDir } from './utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT = 15_000;

export interface CaptureResult {
  id: string;
  success: boolean;
  filePath?: string;
  fileSize?: number;
  error?: string;
  capturedAt: string;
}

async function setMockRole(page: Page, role: 'brand' | 'influencer'): Promise<void> {
  await page.evaluate((r) => {
    localStorage.setItem('mock_user_role', r);
  }, role);
}

async function executeSetupActions(page: Page, spec: ScreenshotSpec): Promise<void> {
  if (!spec.setupActions) return;

  for (const action of spec.setupActions) {
    switch (action.type) {
      case 'navigate':
        await page.goto(`${BASE_URL}${action.url}`, { waitUntil: 'networkidle', timeout: DEFAULT_TIMEOUT });
        break;
      case 'click':
        try {
          await page.waitForSelector(action.selector, { timeout: 5000 });
          await page.click(action.selector);
          await page.waitForTimeout(500);
        } catch {
          console.warn(`  [warn] Could not click "${action.selector}" for ${spec.id}`);
        }
        break;
      case 'fill':
        try {
          await page.waitForSelector(action.selector, { timeout: 5000 });
          await page.fill(action.selector, action.value);
        } catch {
          console.warn(`  [warn] Could not fill "${action.selector}" for ${spec.id}`);
        }
        break;
      case 'wait':
        await page.waitForTimeout(action.ms);
        break;
      case 'setRole':
        await setMockRole(page, action.role);
        break;
      case 'waitForSelector':
        try {
          await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 });
        } catch {
          console.warn(`  [warn] Selector "${action.selector}" not found for ${spec.id}`);
        }
        break;
    }
  }
}

async function captureOne(
  page: Page,
  spec: ScreenshotSpec,
  screenshotsBaseDir: string
): Promise<CaptureResult> {
  const startTime = Date.now();
  const outputDir = path.join(screenshotsBaseDir, spec.subdir);
  ensureDir(outputDir);
  const filePath = path.join(outputDir, `${spec.id}.png`);

  try {
    // Set viewport
    await page.setViewportSize(spec.viewport);

    // Set mock role if needed (before navigation)
    if (spec.roleContext !== 'none') {
      // Navigate to a simple page first to set localStorage
      const currentUrl = page.url();
      if (!currentUrl.startsWith(BASE_URL)) {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });
      }
      await setMockRole(page, spec.roleContext as 'brand' | 'influencer');
    }

    // Navigate to target page
    const url = `${BASE_URL}${spec.route}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: DEFAULT_TIMEOUT }).catch(() => {
      // Fallback: try with just domcontentloaded
      return page.goto(url, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });
    });

    // Wait for specific element if specified
    if (spec.waitFor) {
      try {
        await page.waitForSelector(spec.waitFor, { timeout: 8000 });
      } catch {
        console.warn(`  [warn] waitFor selector "${spec.waitFor}" not found for ${spec.id}`);
      }
    }

    // Execute any setup actions (click tabs, open modals, etc.)
    await executeSetupActions(page, spec);

    // Small buffer for animations to complete
    await page.waitForTimeout(800);

    // Capture screenshot
    await page.screenshot({ path: filePath, fullPage: false });

    const stats = fs.statSync(filePath);
    const duration = Date.now() - startTime;
    console.log(`  [OK] ${spec.id} (${(stats.size / 1024).toFixed(0)}KB, ${duration}ms)`);

    return {
      id: spec.id,
      success: true,
      filePath,
      fileSize: stats.size,
      capturedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`  [FAIL] ${spec.id} (${duration}ms): ${error.message}`);

    return {
      id: spec.id,
      success: false,
      error: error.message,
      capturedAt: new Date().toISOString(),
    };
  }
}

export async function captureAllScreenshots(
  version: string,
  outputDir: string
): Promise<CaptureResult[]> {
  const screenshotsDir = path.join(outputDir, 'screenshots');
  ensureDir(screenshotsDir);

  console.log(`\nCapturing ${SCREENSHOTS.length} screenshots...`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${screenshotsDir}\n`);

  // Check if dev server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error: any) {
    console.error(`\nERROR: Dev server not reachable at ${BASE_URL}`);
    console.error('Please start it with: NEXT_PUBLIC_MOCK_MODE=true npm run dev\n');
    process.exit(1);
  }

  let browser: Browser | null = null;
  const results: CaptureResult[] = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Group screenshots by role context for efficient role switching
    const grouped: Record<string, ScreenshotSpec[]> = {
      none: [],
      brand: [],
      influencer: [],
    };

    SCREENSHOTS.forEach(spec => {
      grouped[spec.roleContext].push(spec);
    });

    // Process each role group
    for (const [roleContext, specs] of Object.entries(grouped)) {
      if (specs.length === 0) continue;

      console.log(`\n--- ${roleContext === 'none' ? 'Public' : roleContext.toUpperCase()} pages (${specs.length}) ---\n`);

      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        locale: 'en-US',
      });

      const page = await context.newPage();

      // Set mock role if needed
      if (roleContext !== 'none') {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });
        await setMockRole(page, roleContext as 'brand' | 'influencer');
        // Reload to apply role
        await page.reload({ waitUntil: 'networkidle', timeout: DEFAULT_TIMEOUT }).catch(() => {});
      }

      for (const spec of specs) {
        const result = await captureOne(page, spec, screenshotsDir);
        results.push(result);
      }

      await context.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`\n========================================`);
  console.log(`Screenshots: ${succeeded} captured, ${failed} failed, ${results.length} total`);
  console.log(`========================================\n`);

  // Write results report
  const reportPath = path.join(outputDir, 'screenshot-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  return results;
}
