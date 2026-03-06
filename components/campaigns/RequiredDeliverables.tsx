'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import CampaignPrimaryButton from '@/components/ui/CampaignPrimaryButton';

export interface TaskDeliverable {
  id: string;
  platform: string;
  type: string;
  details: string;
  dueDate: string;
}

interface RequiredDeliverablesProps {
  value: TaskDeliverable[];
  onChange: (deliverables: TaskDeliverable[]) => void;
  minDate?: string;
  maxDate?: string;
}

const platformOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
];

const typeOptions: Record<string, { value: string; label: string }[]> = {
  instagram: [
    { value: 'reel', label: 'Reel' },
    { value: 'story_series', label: 'Story Series' },
    { value: 'post', label: 'Post' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'live', label: 'Live' },
  ],
  tiktok: [
    { value: 'video', label: 'Video' },
    { value: 'live', label: 'Live' },
    { value: 'story', label: 'Story' },
  ],
  youtube: [
    { value: 'video', label: 'Video' },
    { value: 'short', label: 'Short' },
    { value: 'live', label: 'Live' },
  ],
  facebook: [
    { value: 'post', label: 'Post' },
    { value: 'reel', label: 'Reel' },
    { value: 'story', label: 'Story' },
    { value: 'live', label: 'Live' },
  ],
  twitter: [
    { value: 'tweet', label: 'Tweet' },
    { value: 'thread', label: 'Thread' },
    { value: 'video', label: 'Video' },
  ],
};

export default function RequiredDeliverables({ value, onChange, minDate, maxDate }: RequiredDeliverablesProps) {
  const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addTask = () => {
    const newTask: TaskDeliverable = {
      id: generateId(),
      platform: 'instagram',
      type: '',
      details: '',
      dueDate: '',
    };
    onChange([...value, newTask]);
  };

  const updateTask = (id: string, field: keyof TaskDeliverable, fieldValue: string) => {
    onChange(
      value.map((task) => {
        if (task.id === id) {
          // If platform changes, reset the type
          if (field === 'platform') {
            return { ...task, platform: fieldValue, type: '' };
          }
          return { ...task, [field]: fieldValue };
        }
        return task;
      })
    );
  };

  const removeTask = (id: string) => {
    onChange(value.filter((task) => task.id !== id));
  };

  const getTypesForPlatform = (platform: string) => {
    return typeOptions[platform] || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Required Deliverables</h3>
        <CampaignPrimaryButton
          label="Add Task"
          onClick={addTask}
          icon={Plus}
          iconPosition="left"
          type="button"
        />
      </div>

      {/* Table Header */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_2fr_1fr_auto] gap-2 bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Details</div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</div>
          <div className="w-8"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {value.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No deliverables added yet. Click &quot;Add Task&quot; to get started.
            </div>
          ) : (
            value.map((task) => (
              <div key={task.id} className="grid grid-cols-[1fr_1fr_2fr_1fr_auto] gap-2 px-4 py-3 items-center bg-white hover:bg-gray-50">
                {/* Platform Select */}
                <div className="relative">
                  <select
                    value={task.platform}
                    onChange={(e) => updateTask(task.id, 'platform', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-[#00A8CC]"
                  >
                    {platformOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Type Select */}
                <div className="relative">
                  <select
                    value={task.type}
                    onChange={(e) => updateTask(task.id, 'type', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-[#00A8CC]"
                  >
                    <option value="">Select type</option>
                    {getTypesForPlatform(task.platform).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Details Input */}
                <input
                  type="text"
                  value={task.details}
                  onChange={(e) => updateTask(task.id, 'details', e.target.value)}
                  placeholder="Describe the content requirements..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-[#00A8CC] placeholder:text-gray-400"
                />

                {/* Due Date Input */}
                <input
                  type="date"
                  value={task.dueDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-[#00A8CC]"
                />

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
