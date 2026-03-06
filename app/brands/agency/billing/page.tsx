'use client';

import { CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';
import AgencyBillingTable from '@/components/agency/AgencyBillingTable';
import VolumeDiscountBanner from '@/components/agency/VolumeDiscountBanner';

export default function AgencyBillingPage() {
  return (
    <>
      {/* Page Header */}
      <div className="bg-white px-4 sm:px-6 lg:px-8 pt-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Agency Billing</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Consolidated billing across all workspaces
              </p>
            </div>
          </div>

          <Link
            href="/brands/settings?tab=plans"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-navy border border-brand-navy/20 bg-white rounded-xl hover:bg-brand-navy/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Billing Settings
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Billing Table */}
          <AgencyBillingTable />

          {/* Volume Discount Banner */}
          <VolumeDiscountBanner
            currentWorkspaces={3}
            discount={15}
            nextTierDiscount={20}
            workspacesNeeded={12}
          />
        </div>
      </div>
    </>
  );
}
