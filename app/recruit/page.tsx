'use client';

/**
 * Recruit Page (Placeholder)
 *
 * This page will contain recruitment features.
 * Currently shows a coming soon message.
 */

import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

export default function RecruitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Users className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Recruit Influencers
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our recruitment feature is coming soon! This will help you find and recruit the perfect influencers for your brand.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              In the meantime, you can:
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/influencers/profiles"
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors"
              >
                Browse Influencers
              </Link>

              <Link
                href="/influencers/marketplace"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Campaigns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
