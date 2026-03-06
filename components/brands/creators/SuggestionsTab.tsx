'use client';

import { Sparkles } from 'lucide-react';

export default function SuggestionsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="inline-block bg-amber-50 p-6 rounded-full mb-6">
        <Sparkles className="w-16 h-16 text-amber-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Creator Suggestions Coming Soon
      </h3>
      <p className="text-lg text-gray-500 max-w-lg text-center">
        We&apos;ll suggest creators based on your campaign history, industry, and saved creator profiles.
      </p>
    </div>
  );
}
