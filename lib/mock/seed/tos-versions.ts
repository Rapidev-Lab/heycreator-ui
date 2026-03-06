/**
 * Mock Terms of Service version seed data.
 *
 * Covers:
 * - v1.0.0 (2025-06-01): Original launch terms — now inactive
 * - v2.0.0 (2026-02-15): Updated with workspace and billing terms — active
 *
 * Acceptances:
 * - mock-brand-user-1 accepted both v1.0.0 and v2.0.0 (fully up to date)
 * - mock-brand-user-2 accepted v1.0.0 only (needs to re-accept v2.0.0)
 * - mock-brand-user-3 accepted v2.0.0 only (joined after v2 launch)
 *
 * Pattern: { id, data: { ... } }
 */

import { ToSVersion, ToSAcceptance } from '@/types/legal';

// ---------------------------------------------------------------------------
// ToS Version data
// ---------------------------------------------------------------------------

const tosV1: ToSVersion = {
  id: 'tos-v1',
  version: '1.0.0',
  title: 'Hey Creator Terms of Service',
  effectiveDate: '2025-06-01',
  content: `## 1. Acceptance of Terms

By creating an account on Hey Creator ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you may not access or use the Platform. Hey Creator reserves the right to update these Terms at any time with reasonable notice to users.

## 2. Platform Use and Acceptable Conduct

Hey Creator grants you a limited, non-exclusive, non-transferable licence to access the Platform for your internal business purposes. You must not use the Platform to harass, impersonate, or defraud any party, distribute malware, engage in automated scraping without prior written consent, or violate any applicable law or regulation.

## 3. Intellectual Property

All content, features, and functionality of the Platform — including but not limited to software, text, designs, logos, and analytics — are the exclusive property of Hey Creator (Pty) Ltd and are protected by applicable intellectual property laws. You retain ownership of your own data submitted to the Platform.`,
  summary: 'Original terms establishing acceptable use, IP ownership, and our data handling practices for the Platform launch.',
  isActive: false,
  createdAt: '2025-05-15T08:00:00.000Z',
};

const tosV2: ToSVersion = {
  id: 'tos-v2',
  version: '2.0.0',
  title: 'Hey Creator Terms of Service — Updated',
  effectiveDate: '2026-02-15',
  content: `## 1. Acceptance of Terms

By creating an account or continuing to use Hey Creator ("the Platform"), you agree to be bound by these Terms of Service ("Terms") effective 15 February 2026. These updated Terms supersede all prior versions. Material changes have been made to Sections 3 (Workspaces & Team Access) and 4 (Billing & Subscriptions). If you do not agree to the revised Terms, you must cease using the Platform.

## 2. Workspaces and Multi-User Access

As of this version, the Platform operates on a Workspace model. Each Workspace is owned by a single account holder ("Owner") who is responsible for all activity conducted within that Workspace, including the actions of invited team members. Team members may be assigned roles (Owner, Admin, Editor, Viewer) with permissions defined in the Platform documentation. The Owner is solely responsible for managing team access, revoking permissions, and ensuring compliance with these Terms within their Workspace.

## 3. Billing, Subscriptions, and Usage Limits

Subscriptions are billed monthly in advance at the rates set out on our Pricing page. Usage limits (searches, campaigns, seats) are enforced per Workspace per billing cycle and do not roll over. Overage packs may be purchased to extend limits within a given cycle. Hey Creator reserves the right to adjust pricing with 30 days written notice. Refunds are handled at our discretion in accordance with applicable consumer protection law.`,
  summary: 'Significant update adding Workspace governance terms (multi-user roles and Owner liability) and detailed billing and subscription provisions.',
  isActive: true,
  createdAt: '2026-02-01T08:00:00.000Z',
};

// ---------------------------------------------------------------------------
// ToS Acceptance data
// ---------------------------------------------------------------------------

const acceptances: ToSAcceptance[] = [
  // mock-brand-user-1 — accepted v1.0.0 at launch
  {
    id: 'tosa-1',
    userId: 'mock-brand-user-1',
    tosVersionId: 'tos-v1',
    acceptedAt: '2025-06-01T10:22:14.000Z',
    ipAddress: '196.21.144.10',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
  // mock-brand-user-1 — also accepted v2.0.0 after the update prompt
  {
    id: 'tosa-2',
    userId: 'mock-brand-user-1',
    tosVersionId: 'tos-v2',
    acceptedAt: '2026-02-16T09:05:31.000Z',
    ipAddress: '196.21.144.10',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
  },
  // mock-brand-user-2 — accepted v1.0.0 at launch, has NOT yet accepted v2.0.0
  {
    id: 'tosa-3',
    userId: 'mock-brand-user-2',
    tosVersionId: 'tos-v1',
    acceptedAt: '2025-06-04T14:37:08.000Z',
    ipAddress: '41.185.8.200',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
  // mock-brand-user-3 — joined after v2 launch, accepted v2.0.0 only
  {
    id: 'tosa-4',
    userId: 'mock-brand-user-3',
    tosVersionId: 'tos-v2',
    acceptedAt: '2026-02-22T11:14:55.000Z',
    ipAddress: '105.235.132.44',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  },
];

// ---------------------------------------------------------------------------
// Exports in seed-pattern format: { id, data }
// ---------------------------------------------------------------------------

export const mockToSVersions: { id: string; data: ToSVersion }[] = [
  { id: tosV1.id, data: tosV1 },
  { id: tosV2.id, data: tosV2 },
];

export const mockToSAcceptances: { id: string; data: ToSAcceptance }[] = acceptances.map(
  (acc) => ({ id: acc.id, data: acc })
);
