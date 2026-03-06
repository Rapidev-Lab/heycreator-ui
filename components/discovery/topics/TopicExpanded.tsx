'use client';

import { ChevronDown } from 'lucide-react';
import { TopicCategory } from '@/types/discovery';
import TopicSuggestionCard from './TopicSuggestionCard';

interface TopicExpandedProps {
  topic: TopicCategory;
  onSuggestionClick: (query: string) => void;
  onToggle: () => void;
}

export default function TopicExpanded({ topic, onSuggestionClick, onToggle }: TopicExpandedProps) {
  const IconComponent = topic.icon;

  return (
    <div className="space-y-4 py-6 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconComponent className="w-6 h-6" style={{ color: topic.color }} />
          <h3 className="text-lg font-semibold text-gray-900">{topic.name}</h3>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          See More
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {topic.suggestions.map((suggestion, index) => (
          <TopicSuggestionCard
            key={index}
            suggestion={suggestion}
            onClick={onSuggestionClick}
          />
        ))}
      </div>
    </div>
  );
}
