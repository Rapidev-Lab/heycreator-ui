import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { STORIES, UserStory } from './story-registry';
import { SCREENSHOTS, ScreenshotSpec } from './screenshot-manifest';

// ─── Color Constants ────────────────────────────────────────
const NAVY = 'FF001F54';
const WHITE = 'FFFFFFFF';
const CYAN = 'FF00A8CC';
const GREEN_FILL = 'FFE6F4EA';
const GREEN_TEXT = 'FF065F46';
const AMBER_FILL = 'FFFFF3CD';
const AMBER_TEXT = 'FF92400E';
const GRAY_FILL = 'FFF5F5F5';
const GRAY_TEXT = 'FF6B7280';
const LINK_COLOR = 'FF0066CC';

// Module color coding
const MODULE_COLORS: Record<string, string> = {
  AUTH:  'FFDBEAFE',  // blue-100
  DASH:  'FFE0F2FE',  // sky-100
  DISC:  'FFCCFBF1',  // teal-100
  CAMP:  'FFE9D5FF',  // purple-100
  CREAT: 'FFFEF3C7',  // amber-100
  PROF:  'FFFEE2E2',  // rose-100
  SETT:  'FFF3F4F6',  // gray-100
  NOTIF: 'FFFCE7F3',  // pink-100
  ANAL:  'FFEDE9FE',  // violet-100
  MKTPL: 'FFD1FAE5',  // green-100
  APP:   'FFFEF9C3',  // yellow-100
  INV:   'FFCFFAFE',  // cyan-100
  CAL:   'FFFEF3C7',  // amber-100
  CONT:  'FFE0E7FF',  // indigo-100
  UTIL:  'FFF9FAFB',  // gray-50
  DATA:  'FFE0F2FE',
  MOCK:  'FFF3F4F6',
};

function getStatusFill(status: string): { fill: string; text: string } {
  switch (status) {
    case 'DONE':        return { fill: GREEN_FILL, text: GREEN_TEXT };
    case 'PARTIAL':     return { fill: AMBER_FILL, text: AMBER_TEXT };
    case 'PLACEHOLDER': return { fill: GRAY_FILL,  text: GRAY_TEXT  };
    default:            return { fill: GRAY_FILL,  text: GRAY_TEXT  };
  }
}

// ─── Header Style ────────────────────────────────────────────
function styleHeaderRow(row: ExcelJS.Row, colCount: number): void {
  row.height = 28;
  row.font = { bold: true, color: { argb: WHITE }, size: 11, name: 'Calibri' };
  row.alignment = { vertical: 'middle', horizontal: 'left' };
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
    };
  }
}

// ─── Main Export ─────────────────────────────────────────────
export async function generateExcel(version: string, outputDir: string): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HeyCreator Story Map Generator';
  workbook.created = new Date();

  const today = new Date().toISOString().split('T')[0];

  // ═══════════════════════════════════════════════════════════
  // SHEET 1: User Stories
  // ═══════════════════════════════════════════════════════════
  const ws1 = workbook.addWorksheet('User Stories', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
  });

  ws1.columns = [
    { header: 'Story ID',       key: 'id',            width: 14 },
    { header: 'Module',         key: 'module',         width: 20 },
    { header: 'Role',           key: 'role',           width: 12 },
    { header: 'User Story',     key: 'story',          width: 65 },
    { header: 'Status',         key: 'status',         width: 14 },
    { header: 'Route(s)',       key: 'routes',         width: 40 },
    { header: 'API Endpoints',  key: 'api',            width: 45 },
    { header: 'Components',     key: 'components',     width: 45 },
    { header: 'Screenshot IDs', key: 'screenshotIds',  width: 30 },
    { header: 'View',           key: 'view',           width: 16 },
    { header: 'Notes',          key: 'notes',          width: 30 },
    { header: 'Version',        key: 'version',        width: 10 },
    { header: 'Last Verified',  key: 'verified',       width: 14 },
  ];

  styleHeaderRow(ws1.getRow(1), 13);

  // Build a map of storyId -> row number for cross-referencing
  const storyRowMap: Record<string, number> = {};

  STORIES.forEach((s: UserStory, idx: number) => {
    const rowNum = idx + 2;
    storyRowMap[s.id] = rowNum;

    const row = ws1.addRow({
      id:            s.id,
      module:        s.module,
      role:          s.role,
      story:         s.story,
      status:        s.status,
      routes:        s.routes.join('\n'),
      api:           s.apiEndpoints.join('\n'),
      components:    s.components.join(', '),
      screenshotIds: s.screenshotIds.join(', '),
      view:          '',
      notes:         s.notes,
      version:       s.versionAdded,
      verified:      today,
    });

    // Style ID column bold
    row.getCell('id').font = { bold: true, size: 10, name: 'Calibri' };

    // Module color coding
    const moduleColor = MODULE_COLORS[s.moduleCode] ?? GRAY_FILL;
    row.getCell('module').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: moduleColor },
    };

    // Status conditional formatting
    const statusStyle = getStatusFill(s.status);
    const statusCell = row.getCell('status');
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusStyle.fill },
    };
    statusCell.font = { bold: true, color: { argb: statusStyle.text }, size: 10 };
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Wrap text for long cells
    row.getCell('story').alignment = { wrapText: true, vertical: 'top' };

    row.getCell('routes').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('routes').font = { name: 'Consolas', size: 9 };

    row.getCell('api').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('api').font = { name: 'Consolas', size: 9 };

    row.getCell('components').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('notes').alignment = { wrapText: true, vertical: 'top' };

    // Screenshot hyperlink (link to the first screenshot)
    if (s.screenshotIds.length > 0) {
      const firstScreenshot = SCREENSHOTS.find(
        (sc: ScreenshotSpec) => sc.id === s.screenshotIds[0]
      );
      if (firstScreenshot) {
        const relPath = `screenshots/${firstScreenshot.subdir}/${firstScreenshot.id}.png`;
        const viewCell = row.getCell('view');
        viewCell.value = { text: 'View Screenshot', hyperlink: relPath };
        viewCell.font = { color: { argb: LINK_COLOR }, underline: true, size: 10 };
      }
    }
  });

  // Enable auto-filter on all header columns
  ws1.autoFilter = { from: 'A1', to: `M${STORIES.length + 1}` };

  // ═══════════════════════════════════════════════════════════
  // SHEET 2: Screenshots Index
  // ═══════════════════════════════════════════════════════════
  const ws2 = workbook.addWorksheet('Screenshots Index', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  ws2.columns = [
    { header: 'Screenshot ID',   key: 'id',       width: 28 },
    { header: 'Story ID',        key: 'storyId',  width: 14 },
    { header: 'Page Title',      key: 'title',    width: 30 },
    { header: 'Route',           key: 'route',    width: 40 },
    { header: 'State',           key: 'state',    width: 20 },
    { header: 'Role',            key: 'role',     width: 12 },
    { header: 'Viewport',        key: 'viewport', width: 12 },
    { header: 'Open Screenshot', key: 'filePath', width: 20 },
    { header: 'Captured Date',   key: 'captured', width: 18 },
    { header: 'Version',         key: 'version',  width: 10 },
  ];

  styleHeaderRow(ws2.getRow(1), 10);

  SCREENSHOTS.forEach((sc: ScreenshotSpec) => {
    const row = ws2.addRow({
      id:       sc.id,
      storyId:  sc.storyId,
      title:    sc.pageTitle,
      route:    sc.route,
      state:    sc.state,
      role:     sc.roleContext,
      viewport: `${sc.viewport.width}x${sc.viewport.height}`,
      filePath: '',
      captured: today,
      version:  version,
    });

    row.getCell('id').font = { bold: true, size: 10 };
    row.getCell('route').font = { name: 'Consolas', size: 9 };

    // Cross-link back to Sheet 1
    const storyRow = storyRowMap[sc.storyId];
    if (storyRow !== undefined) {
      const storyCell = row.getCell('storyId');
      storyCell.value = {
        text:      sc.storyId,
        hyperlink: `#'User Stories'!A${storyRow}`,
      };
      storyCell.font = { color: { argb: LINK_COLOR }, underline: true, size: 10 };
    }

    // Screenshot file hyperlink
    const relPath = `screenshots/${sc.subdir}/${sc.id}.png`;
    const fileCell = row.getCell('filePath');
    fileCell.value = { text: 'Open', hyperlink: relPath };
    fileCell.font = { color: { argb: LINK_COLOR }, underline: true, size: 10 };
  });

  ws2.autoFilter = { from: 'A1', to: `J${SCREENSHOTS.length + 1}` };

  // ═══════════════════════════════════════════════════════════
  // SHEET 3: Version History
  // ═══════════════════════════════════════════════════════════
  const ws3 = workbook.addWorksheet('Version History');

  ws3.columns = [
    { header: 'Version',           key: 'version',     width: 12 },
    { header: 'Date',              key: 'date',        width: 14 },
    { header: 'Total Stories',     key: 'stories',     width: 14 },
    { header: 'Total Screenshots', key: 'screenshots', width: 18 },
    { header: 'New / Modified',    key: 'changes',     width: 16 },
    { header: 'Description',       key: 'desc',        width: 60 },
  ];

  styleHeaderRow(ws3.getRow(1), 6);

  ws3.addRow({
    version:     `v${version}`,
    date:        today,
    stories:     STORIES.length,
    screenshots: SCREENSHOTS.length,
    changes:     `${STORIES.length} new`,
    desc:        'Initial user story map generation with full platform coverage',
  });

  // ═══════════════════════════════════════════════════════════
  // SHEET 4: Component Inventory
  // ═══════════════════════════════════════════════════════════
  const ws4 = workbook.addWorksheet('Component Inventory');

  ws4.columns = [
    { header: 'Component',       key: 'name',     width: 30 },
    { header: 'Category',        key: 'category', width: 18 },
    { header: 'Used By Stories', key: 'stories',  width: 50 },
    { header: 'Count',           key: 'count',    width: 8  },
  ];

  styleHeaderRow(ws4.getRow(1), 4);

  // Build component -> stories map
  const componentMap: Record<string, Set<string>> = {};
  STORIES.forEach((s: UserStory) => {
    s.components.forEach((c: string) => {
      if (!componentMap[c]) componentMap[c] = new Set();
      componentMap[c].add(s.id);
    });
  });

  // Infer a display category from the component name
  function categorize(name: string): string {
    if (
      name.includes('Auth') || name.includes('Login') ||
      name.includes('Password') || name.includes('OTP') ||
      name.includes('Progress') || name.includes('Logo')
    ) return 'Auth';
    if (
      name.includes('Campaign') || name.includes('Step') ||
      name.includes('Stepper')
    ) return 'Campaign';
    if (
      name.includes('Discovery') || name.includes('Filter') ||
      name.includes('Result') || name.includes('Topic') ||
      name.includes('Search')
    ) return 'Discovery';
    if (
      name.includes('Profile') || name.includes('Snapshot') ||
      name.includes('Insight') || name.includes('Metrics') ||
      name.includes('Demographics') || name.includes('Similar') ||
      name.includes('Enrichment') || name.includes('Internal') ||
      name.includes('Content')
    ) return 'Profile';
    if (
      name.includes('Creator') || name.includes('List') ||
      name.includes('Suggestion')
    ) return 'Creators';
    if (name.includes('Notification') || name.includes('Bell')) return 'Notifications';
    if (
      name.includes('Analytics') || name.includes('Report') ||
      name.includes('Summary')
    ) return 'Analytics';
    if (
      name.includes('Modal') || name.includes('Button') ||
      name.includes('Card') || name.includes('Tab') ||
      name.includes('Sidebar') || name.includes('Header')
    ) return 'UI';
    return 'Other';
  }

  Object.entries(componentMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([name, stories]) => {
      const row = ws4.addRow({
        name,
        category: categorize(name),
        stories:  Array.from(stories).join(', '),
        count:    stories.size,
      });
      row.getCell('name').font = { bold: true, size: 10 };
      row.getCell('stories').alignment = { wrapText: true };
    });

  ws4.autoFilter = { from: 'A1', to: `D${Object.keys(componentMap).length + 1}` };

  // ═══════════════════════════════════════════════════════════
  // SHEET 5: API Inventory
  // ═══════════════════════════════════════════════════════════
  const ws5 = workbook.addWorksheet('API Inventory');

  ws5.columns = [
    { header: 'Method',          key: 'method',  width: 10 },
    { header: 'Route',           key: 'route',   width: 50 },
    { header: 'Auth',            key: 'auth',    width: 14 },
    { header: 'Description',     key: 'desc',    width: 45 },
    { header: 'Used By Stories', key: 'stories', width: 40 },
  ];

  styleHeaderRow(ws5.getRow(1), 5);

  // Known API routes with metadata
  const API_ROUTES: Array<{ method: string; route: string; auth: string; desc: string }> = [
    { method: 'POST',   route: '/api/auth/check-email-status',                  auth: 'No',         desc: 'Check if email exists and is verified' },
    { method: 'POST',   route: '/api/auth/check-email-verified',                auth: 'No',         desc: 'Verify email verification status' },
    { method: 'POST',   route: '/api/auth/resend-verification',                 auth: 'No',         desc: 'Resend verification email' },
    { method: 'POST',   route: '/api/auth/get-user-role-by-email',              auth: 'No',         desc: 'Get user role for password reset routing' },
    { method: 'POST',   route: '/api/auth/update-email',                        auth: 'Yes',        desc: 'Update user email' },
    { method: 'POST',   route: '/api/discover/search/stream',                   auth: 'Yes',        desc: 'SSE streaming search' },
    { method: 'POST',   route: '/api/search',                                   auth: 'Yes',        desc: 'Direct search (legacy)' },
    { method: 'GET',    route: '/api/campaigns',                                auth: 'Brand',      desc: 'List brand campaigns' },
    { method: 'POST',   route: '/api/campaigns',                                auth: 'Brand',      desc: 'Create campaign' },
    { method: 'GET',    route: '/api/campaigns/[id]',                           auth: 'Brand',      desc: 'Get campaign details' },
    { method: 'PATCH',  route: '/api/campaigns/[id]',                           auth: 'Brand',      desc: 'Update campaign' },
    { method: 'POST',   route: '/api/campaigns/[id]/publish',                   auth: 'Brand',      desc: 'Publish draft campaign' },
    { method: 'GET',    route: '/api/campaigns/[id]/applications',              auth: 'Brand',      desc: 'List applications' },
    { method: 'PATCH',  route: '/api/campaigns/[id]/applications/[appId]',      auth: 'Brand',      desc: 'Review application' },
    { method: 'POST',   route: '/api/campaigns/[id]/invitations',               auth: 'Brand',      desc: 'Send invitation' },
    { method: 'POST',   route: '/api/campaigns/[id]/documents',                 auth: 'Brand',      desc: 'Upload document' },
    { method: 'GET',    route: '/api/deliverables',                             auth: 'Brand',      desc: 'List deliverables' },
    { method: 'GET',    route: '/api/influencer/profiles',                      auth: 'Yes',        desc: 'List all profiles' },
    { method: 'GET',    route: '/api/influencer/profiles/[id]',                 auth: 'Yes',        desc: 'Get profile details' },
    { method: 'GET',    route: '/api/influencer/{id}/enrichment',               auth: 'Yes',        desc: 'Get enriched data' },
    { method: 'POST',   route: '/api/influencer/{id}/enrichment',               auth: 'Yes',        desc: 'Trigger enrichment' },
    { method: 'GET',    route: '/api/influencer/my-profile',                    auth: 'Influencer', desc: 'Get own profile' },
    { method: 'POST',   route: '/api/influencer/my-profile',                    auth: 'Influencer', desc: 'Update own profile' },
    { method: 'POST',   route: '/api/profiles',                                 auth: 'Yes',        desc: 'Create unified profile' },
    { method: 'GET',    route: '/api/influencers/campaigns/marketplace',        auth: 'Yes',        desc: 'Browse public campaigns' },
    { method: 'GET',    route: '/api/influencers/campaigns/[id]',               auth: 'Yes',        desc: 'Campaign details (influencer)' },
    { method: 'POST',   route: '/api/influencers/campaigns/[id]/apply',         auth: 'Influencer', desc: 'Apply to campaign' },
    { method: 'POST',   route: '/api/influencers/campaigns/[id]/submit-content',auth: 'Influencer', desc: 'Submit deliverable' },
    { method: 'GET',    route: '/api/influencers/applications',                 auth: 'Influencer', desc: 'List applications' },
    { method: 'DELETE', route: '/api/influencers/applications/[id]',            auth: 'Influencer', desc: 'Withdraw application' },
    { method: 'GET',    route: '/api/influencers/campaigns/saved',              auth: 'Influencer', desc: 'Saved campaigns' },
    { method: 'POST',   route: '/api/influencers/campaigns/saved',              auth: 'Influencer', desc: 'Save campaign' },
    { method: 'GET',    route: '/api/brands/creators/global',                   auth: 'Brand',      desc: 'List all global influencers' },
    { method: 'POST',   route: '/api/brands/lists',                             auth: 'Brand',      desc: 'Create creator list' },
    { method: 'POST',   route: '/api/brands/creators/export',                   auth: 'Brand',      desc: 'Export creators CSV' },
    { method: 'GET',    route: '/api/influencers/invitations',                  auth: 'Influencer', desc: 'List invitations' },
    { method: 'PATCH',  route: '/api/influencers/invitations/[id]',             auth: 'Influencer', desc: 'Respond to invitation' },
    { method: 'GET',    route: '/api/notifications',                            auth: 'Yes',        desc: 'List notifications' },
    { method: 'PATCH',  route: '/api/notifications/[id]',                      auth: 'Yes',        desc: 'Mark as read' },
    { method: 'POST',   route: '/api/notifications/mark-all-read',              auth: 'Yes',        desc: 'Bulk mark read' },
    { method: 'GET',    route: '/api/dashboard/stats',                          auth: 'Brand',      desc: 'Dashboard statistics' },
    { method: 'GET',    route: '/api/dashboard/recommended',                    auth: 'Brand',      desc: 'Recommended creators' },
    { method: 'PATCH',  route: '/api/profiles/{id}/star',                       auth: 'Brand',      desc: 'Toggle bookmark' },
    { method: 'GET',    route: '/api/image-proxy',                              auth: 'No',         desc: 'Proxy external images' },
  ];

  // HTTP method fill colors (light pastels matching semantic meaning)
  const METHOD_COLORS: Record<string, string> = {
    GET:    'FFD1FAE5',  // green-100
    POST:   'FFDBEAFE',  // blue-100
    PATCH:  'FFFFF3CD',  // amber-100
    DELETE: 'FFFEE2E2',  // red-100
  };

  API_ROUTES.forEach((api) => {
    // Find stories that reference this endpoint via loose matching
    const relatedStories = new Set<string>();
    STORIES.forEach((s: UserStory) => {
      s.apiEndpoints.forEach((ep: string) => {
        const normalizedRoute = api.route
          .replace('[id]', '{id}')
          .replace('[appId]', '{appId}');
        const normalizedEp = ep
          .replace('{id}', '[id]')
          .replace('{appId}', '[appId]');
        if (
          ep.includes(normalizedRoute) ||
          api.route.includes(normalizedEp) ||
          ep === api.route
        ) {
          relatedStories.add(s.id);
        }
      });
    });

    const row = ws5.addRow({
      method:  api.method,
      route:   api.route,
      auth:    api.auth,
      desc:    api.desc,
      stories: Array.from(relatedStories).join(', '),
    });

    row.getCell('route').font = { name: 'Consolas', size: 9 };
    row.getCell('stories').alignment = { wrapText: true };

    // Color-code by HTTP method
    const methodCell = row.getCell('method');
    methodCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: METHOD_COLORS[api.method] ?? GRAY_FILL },
    };
    methodCell.font = { bold: true, size: 10 };
  });

  ws5.autoFilter = { from: 'A1', to: `E${API_ROUTES.length + 1}` };

  // ═══════════════════════════════════════════════════════════
  // Save workbook
  // ═══════════════════════════════════════════════════════════
  const filename = `HeyCreator-UserStoryMap-v${version}.xlsx`;
  const filePath = path.join(outputDir, filename);

  await workbook.xlsx.writeFile(filePath);

  // Also copy to a "latest" alias one level above the versioned output dir
  const latestPath = path.join(outputDir, '..', 'HeyCreator-UserStoryMap-latest.xlsx');
  fs.copyFileSync(filePath, latestPath);

  return filePath;
}
