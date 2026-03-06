"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, ChevronRight, ChevronUp } from "lucide-react";
import TopicCard from "./TopicCard";
import TopicExpanded from "./TopicExpanded";
import { topTopics } from "@/data/discoveryTopics";

// Number of topic cards visible in the first row (View All card takes the last slot)
const FIRST_ROW_VISIBLE = { sm: 1, md: 2, lg: 5 };

interface TopTopicsSectionProps {
  selectedTopics?: string[];
  onTopicSelect?: (topics: string[]) => void;
}

export default function TopTopicsSection({
  selectedTopics = [],
  onTopicSelect,
}: TopTopicsSectionProps) {
  const router = useRouter();
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleTopic = (topicId: string) => {
    if (expandedTopics.includes(topicId)) {
      setExpandedTopics(expandedTopics.filter((id) => id !== topicId));
    } else {
      setExpandedTopics([...expandedTopics, topicId]);
    }
  };

  const handleTopicClick = (topicName: string, topicId: string) => {
    if (onTopicSelect) {
      const newSelectedTopics = selectedTopics.includes(topicName)
        ? selectedTopics.filter((t) => t !== topicName)
        : [...selectedTopics, topicName];
      onTopicSelect(newSelectedTopics);
    } else {
      toggleTopic(topicId);
    }
  };

  const handleSuggestionClick = (query: string) => {
    const searchParams = new URLSearchParams({ query });
    router.push(`/brands/discover/results?${searchParams.toString()}`);
  };

  // When collapsed, show only the first row's worth of topics (responsive)
  // lg: 5 topics + View All = 6 cols, md: 2 + View All = 3 cols, sm: 1 + View All = 2 cols
  const visibleTopics = showAll
    ? topTopics
    : topTopics.slice(0, FIRST_ROW_VISIBLE.lg);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Top Topics</h2>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {visibleTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            icon={topic.icon}
            name={topic.name}
            color={topic.color}
            isSelected={selectedTopics.includes(topic.name)}
            onClick={() => handleTopicClick(topic.name, topic.id)}
          />
        ))}

        {/* View All / View Less card */}
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-dashed border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg group"
          style={{ minHeight: "120px" }}
        >
          {/* {showAll ? (
            <ChevronUp className="w-8 h-8 text-gray-400 group-hover:text-brand-navy transition-colors" strokeWidth={1.5} />
          ) : (
            <ChevronRight className="w-8 h-8 text-gray-400 group-hover:text-brand-navy transition-colors" strokeWidth={1.5} />
          )} */}
          <span className="text-sm font-medium text-[#FF385C] group-hover:text-[#FF385C] transition-colors">
            {showAll ? "View Less" : "View All"}
          </span>
        </button>
      </div>

      {/* Expanded Topics */}
      {expandedTopics.map((topicId) => {
        const topic = topTopics.find((t) => t.id === topicId);
        if (!topic) return null;

        return (
          <TopicExpanded
            key={topicId}
            topic={topic}
            onSuggestionClick={handleSuggestionClick}
            onToggle={() => toggleTopic(topicId)}
          />
        );
      })}
    </div>
  );
}
