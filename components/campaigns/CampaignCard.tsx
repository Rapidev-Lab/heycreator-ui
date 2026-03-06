'use client';

import { Campaign } from '@/types/campaign';
import { DollarSign, Calendar, Users, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter();

  // Helper to convert Firestore Timestamp or Date to Date object
  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return null;
  };

  const getDeadlineDays = () => {
    if (!campaign.budget?.applicationDeadline) return null;
    const deadline = toDate(campaign.budget.applicationDeadline);
    if (!deadline || isNaN(deadline.getTime())) return null;
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const deadlineDays = getDeadlineDays();
  const budgetAmount = campaign.budget?.fixedAmount || campaign.budget?.maxRangeAmount || 0;
  const category = campaign.campaignCategories?.[0] || campaign.campaignProduct?.productType || '';

  // Calculate duration from start and end dates
  const getDuration = () => {
    const start = toDate(campaign.campaignStart);
    const end = toDate(campaign.campaignEnd);
    if (!start || !end) return null;
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <div
      onClick={() => router.push(`/influencers/campaigns/${campaign.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {campaign.campaignTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{category}</p>
          </div>
          {campaign.stats?.views > 100 && (
            <div className="ml-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-600 line-clamp-3">{campaign.description}</p>
        <div className="flex items-center gap-2 mt-4 text-sm">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">
            R{budgetAmount.toLocaleString('en-ZA')}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{getDuration() || 'Duration TBD'}</span>
          {deadlineDays !== null && deadlineDays > 0 && (
            <span className="ml-auto text-xs text-red-600 font-medium">
              {deadlineDays} {deadlineDays === 1 ? 'day' : 'days'} left
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {campaign.tasks?.requiredDeliverables?.slice(0, 3).map((deliverable, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs"
              >
                {deliverable.platform} {deliverable.type}
              </span>
            ))}
            {(campaign.tasks?.requiredDeliverables?.length || 0) > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                +{(campaign.tasks?.requiredDeliverables?.length || 0) - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{campaign.stats?.applications || 0} applications</span>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors text-sm font-medium">
          View Details & Apply
        </button>
      </div>
    </div>
  );
}
