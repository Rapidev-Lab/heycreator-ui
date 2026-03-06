'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import VisualPromptCard from './VisualPromptCard';
import { visualPrompts } from '@/data/discoveryTopics';

type Tab = 'visual' | 'campaigns';

export default function AIDiscoverySection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('visual');

  const handlePromptClick = (prompt: string) => {
    // Navigate to results with AI visual search
    const searchParams = new URLSearchParams({
      ai_prompt: prompt,
      platforms: 'instagram,tiktok'
    });
    router.push(`/discovery/results?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">AI Based Suggestions</h2>
      </div>

      {/* Tab Selector */}
      <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setActiveTab('visual')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all
            ${activeTab === 'visual'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Visual Prompts
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-all
            ${activeTab === 'campaigns'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Influencers By Campaigns
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Find influencers who posted content that match a free text description
          </p>

          {/* Visual Prompt Cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {visualPrompts.map((prompt) => (
              <VisualPromptCard
                key={prompt.id}
                prompt={prompt.prompt}
                onClick={handlePromptClick}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">
            Campaign-based recommendations will appear here
          </p>
        </div>
      )}
    </div>
  );
}
