'use client';

import { useState } from 'react';
import { Instagram, Music2, Twitter, Youtube, Ghost, MoreHorizontal } from 'lucide-react';
import { Platform } from '@/types/discovery';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

const platforms = [
  { id: 'instagram' as Platform, icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
  { id: 'tiktok' as Platform, icon: Music2, label: 'TikTok', color: 'text-black' },
  { id: 'twitter' as Platform, icon: Twitter, label: 'X', color: 'text-black' },
  { id: 'youtube' as Platform, icon: Youtube, label: 'YouTube', color: 'text-red-600' },
  { id: 'snapchat' as Platform, icon: Ghost, label: 'Snapchat', color: 'text-yellow-400' },
];

export default function PlatformSelector({ selectedPlatforms, onChange }: PlatformSelectorProps) {
  const [showMore, setShowMore] = useState(false);

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {platforms.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          onClick={() => togglePlatform(id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full border transition-all
            ${selectedPlatforms.includes(id)
              ? 'bg-blue-50 border-blue-500 shadow-sm'
              : 'bg-transparent border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
          title={label}
        >
          <Icon className={`w-4 h-4 ${selectedPlatforms.includes(id) ? 'text-blue-600' : color}`} />
        </button>
      ))}

      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-transparent hover:border-gray-400 hover:bg-gray-50 transition-all"
        title="More platforms"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
