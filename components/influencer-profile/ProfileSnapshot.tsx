'use client';

import { ProfileSnapshot as ProfileSnapshotType } from '@/types/profile';
import { ProfileTransformer } from '@/lib/services/profile-transformer.service';

interface ProfileSnapshotProps {
  data: ProfileSnapshotType;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  percentage: number;
}

function MetricCard({ title, value, subtitle, percentage }: MetricCardProps) {
  return (
    <div>
      <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">
        {title}
      </div>

      <div className="mb-3">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-brand-navy" style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ProfileSnapshot({ data }: ProfileSnapshotProps) {
  const followersProgress = 85;
  const engagementProgress = Math.min((data.engagementRate / 10) * 100, 100);
  const reachProgress = Math.min((data.engagementRate / 8) * 100, 100);

  return (
    <>
      <h2 className="text-base font-semibold text-brand-navy mb-4">Profile Snapshot</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="FOLLOWERS"
          value={ProfileTransformer.formatNumber(data.followersCount)}
          subtitle="Growth last 7 days"
          percentage={followersProgress}
        />

        <MetricCard
          title="ENGAGEMENT"
          value={ProfileTransformer.formatNumber(data.avgEngagement)}
          subtitle="Average per post"
          percentage={engagementProgress}
        />

        <MetricCard
          title="REACH"
          value={ProfileTransformer.formatPercentage(data.engagementRate)}
          subtitle="Engagement rate"
          percentage={reachProgress}
        />
      </div>
    </>
  );
}
