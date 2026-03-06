'use client';

import { TopicSuggestion } from '@/types/discovery';

interface TopicSuggestionCardProps {
  suggestion: TopicSuggestion;
  onClick: (query: string) => void;
}

export default function TopicSuggestionCard({ suggestion, onClick }: TopicSuggestionCardProps) {
  return (
    <button
      onClick={() => onClick(suggestion.query)}
      className="flex-shrink-0 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {suggestion.label}
      </span>
    </button>
  );
}
