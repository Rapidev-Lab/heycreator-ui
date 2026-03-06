'use client';

import { Sparkles } from 'lucide-react';

export default function PublicCampaignBenefitsCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-3">
        <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
        <h3 className="font-semibold ">Public Campaign Benefits:</h3>
      </div>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>Creators matching your requirements can see this campaign in the marketplace</li>
        <li>Automatic filtering based on min followers and engagement rate</li>
        <li>Faster application process with more creator options</li>
        <li>You can still review and approve each application individually</li>
      </ul>
    </div>
  );
}
