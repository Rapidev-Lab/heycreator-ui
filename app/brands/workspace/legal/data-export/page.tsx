'use client';

import {
  Info,
  Globe,
  Lock,
  Clock,
} from 'lucide-react';
import DataExportRequestComponent from '@/components/legal/DataExportRequest';

// ===== INFO SIDEBAR ITEMS =====

const POPIA_GDPR_POINTS = [
  {
    icon: <Globe className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />,
    title: 'GDPR Article 20',
    description:
      'EU users have the right to receive their personal data in a structured, commonly used, machine-readable format.',
  },
  {
    icon: <Lock className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />,
    title: 'POPIA Section 23',
    description:
      'South African users have the right to request a record of all personal information held by HeyCreator.',
  },
  {
    icon: <Clock className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />,
    title: 'Processing Time',
    description:
      'We respond to data portability requests within 30 days as required by law. Most exports are ready in minutes.',
  },
  {
    icon: <Info className="w-4 h-4 text-brand-cyan flex-shrink-0 mt-0.5" />,
    title: 'Data Security',
    description:
      'Your export is generated in a secure environment. Download links are time-limited and single-use.',
  },
];

// ===== MAIN PAGE =====

export default function DataExportPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
        <p className="text-sm text-gray-500 mt-1">
          Request a portable copy of your workspace data in compliance with GDPR and POPIA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column — export component */}
        <div className="lg:col-span-2">
          <DataExportRequestComponent />
        </div>

        {/* Sidebar — about data exports */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-brand-navy" />
              <h3 className="text-sm font-bold text-gray-900">About Data Exports</h3>
            </div>

            <div className="space-y-4">
              {POPIA_GDPR_POINTS.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  {point.icon}
                  <div>
                    <p className="text-xs font-bold text-gray-800">{point.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's included */}
          <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-xl p-5">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wide mb-3">
              What&apos;s included in your export
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {[
                'Creator profile data you have saved',
                'Campaign briefs and deliverables',
                'Analytics and performance reports',
                'Notes, comments, and annotations',
                'Your search and discovery history',
                'Account activity and login records',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-brand-cyan font-bold flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Need help?</p>
            <p className="leading-relaxed">
              For questions about your data rights or if you experience issues with your export,
              contact our Data Protection Officer at{' '}
              <a
                href="mailto:privacy@heycreator.com"
                className="text-brand-cyan hover:underline font-medium"
              >
                privacy@heycreator.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
