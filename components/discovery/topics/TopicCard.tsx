'use client';

import { LucideIcon } from 'lucide-react';

interface TopicCardProps {
  icon: LucideIcon;
  name: string;
  color: string;
  isSelected?: boolean;
  onClick: () => void;
}

export default function TopicCard({ icon: Icon, name, color, isSelected = false, onClick }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all group ${
        isSelected
          ? 'bg-blue-50 border-blue-500 shadow-md'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg'
      }`}
      style={{ minHeight: '120px' }}
    >
      <Icon
        className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}
        strokeWidth={1.5}
      />
      <span className={`text-sm font-medium transition-colors ${
        isSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-700'
      }`}>
        {name}
      </span>
    </button>
  );
}
