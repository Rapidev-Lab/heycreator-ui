'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface TaskDeliverable {
  id: string;
  platform: string;
  type: string;
  details: string;
  dueDate: string;
}

interface DisplayTaskProps {
  deliverables: TaskDeliverable[];
  onAddClick?: () => void;
}

export default function DisplayTask({ deliverables, onAddClick }: DisplayTaskProps) {
  if (deliverables.length === 0) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-gray-500">No deliverables specified yet.</p>
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="text-sm text-[#00A8CC] hover:underline mt-2"
          >
            Add deliverables
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {deliverables.map((deliverable, index) => (
        <div
          key={deliverable.id || index}
          className="flex h-[74px] px-4 items-center gap-4 rounded-[14px] border border-[#E0E0E0] bg-[#F8F9FD]"
        >
          {/* Number Badge */}
          <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {index + 1}
          </div>
          {/* Platform Badge */}
          <span className="px-3 py-1 bg-brand-navy text-white text-xs font-medium rounded-full flex-shrink-0">
            {deliverable.platform || 'Platform'}
          </span>
          {/* Content Type */}
          <span className="px-3 py-1 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200 flex-shrink-0">
            {deliverable.type || 'Content Type'}
          </span>
          {/* Details and Due Date */}
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">
              {deliverable.details || 'No description'}
            </p>
            {deliverable.dueDate && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Due: {deliverable.dueDate}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
