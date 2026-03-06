'use client';

import { Plus } from 'lucide-react';
import CreatorDeliverableCard from './CreatorDeliverableCard';
import type { DeliverableSubmission } from '@/types/campaign';

interface CampaignContentTabProps {
  deliverables: DeliverableSubmission[];
  loading: boolean;
  onAddNew: () => void;
  onEditDeliverable: (deliverable: DeliverableSubmission) => void;
  onSubmitUrl?: (deliverableId: string, contentUrl: string) => Promise<void>;
  creatorName?: string;
  creatorAvatar?: string | null;
}

export default function CampaignContentTab({
  deliverables,
  loading,
  onAddNew,
  onEditDeliverable,
  onSubmitUrl,
  creatorName,
  creatorAvatar,
}: CampaignContentTabProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Review Content</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state — full width "Add New Creative" card
  if (deliverables.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Review Content</h3>
        <button
          onClick={onAddNew}
          className="group w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 py-16 hover:border-brand-navy hover:bg-gray-50 transition-all text-center"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-brand-navy/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-navy transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-navy transition-colors">
              Add New Creative
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click to begin adding your content for review.
            </p>
          </div>
        </button>
      </div>
    );
  }

  // Has deliverables — grid with cards + add button
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Review Content <span className="text-gray-400 font-normal">({deliverables.length})</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {deliverables.map((deliverable) => (
          <CreatorDeliverableCard
            key={deliverable.id}
            deliverable={deliverable}
            onClick={() => onEditDeliverable(deliverable)}
            onSubmitUrl={onSubmitUrl}
            creatorName={creatorName}
            creatorAvatar={creatorAvatar}
          />
        ))}

        {/* Add New Creative card in grid */}
        <button
          onClick={onAddNew}
          className="group border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-brand-navy hover:bg-gray-50 transition-all text-center px-4 min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-brand-navy/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-brand-navy transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-navy transition-colors">
              Add New Creative
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click to begin adding your content for review.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
