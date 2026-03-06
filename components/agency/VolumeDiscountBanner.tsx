'use client';

import { Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

interface VolumeDiscountBannerProps {
  currentWorkspaces: number;
  discount: number;
  nextTierDiscount?: number;
  workspacesNeeded?: number;
}

export default function VolumeDiscountBanner({
  currentWorkspaces,
  discount,
  nextTierDiscount,
  workspacesNeeded,
}: VolumeDiscountBannerProps) {
  const isMaxTier = !nextTierDiscount || !workspacesNeeded;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-navy via-brand-navy-light to-[#0D3B7A] px-6 py-5 md:px-8 md:py-6">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-8 right-16 h-32 w-32 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute top-4 right-40 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: discount info */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white leading-none">{discount}%</span>
              <span className="text-base font-semibold text-white/80">off</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-white/90 tracking-wide uppercase">
              Volume Discount Active
            </p>
          </div>

          <div className="h-12 w-px bg-white/20 hidden sm:block" />

          <div className="hidden sm:block">
            <p className="text-sm text-white/70 font-medium">
              {currentWorkspaces} workspace{currentWorkspaces !== 1 ? 's' : ''} managed
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              Discount applied to all workspace plans
            </p>
          </div>
        </div>

        {/* Right side: next tier prompt or max tier */}
        <div className="flex flex-col items-start sm:items-end gap-3">
          {isMaxTier ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <p className="text-sm font-semibold text-white">
                You&apos;re on our best agency plan!
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/80 font-medium text-right">
                Add{' '}
                <span className="text-white font-bold">{workspacesNeeded}</span> more workspace
                {workspacesNeeded !== 1 ? 's' : ''} to unlock{' '}
                <span className="text-white font-bold">{nextTierDiscount}% discount</span>
              </p>
              <Link
                href="/brands/agency/workspaces"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-navy hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Workspace
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
