'use client';

import { Users, Heart } from 'lucide-react';
import { useState } from 'react';

interface CreatorCardProps {
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
    bio: string;
    categories: string[];
    followers: string;
    engagementRate: string;
  };
  onView?: () => void;
  className?: string;
}

export default function CreatorCard({
  creator,
  onView,
  className = '',
}: CreatorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-brand-navy-50 text-brand-navy',
      'bg-pink-100 text-pink-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onView}
    >
      {/* Header with Avatar and Favorite */}
      <div className="flex items-start gap-3 mb-3">
        {creator.avatar ? (
          <img
            src={creator.avatar}
            alt={creator.name.charAt(0).toUpperCase()}
            className="w-12 h-12 rounded-full border-2 border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-semibold">
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {creator.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">{creator.handle}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Bio */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{creator.bio}</p>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-3">
        {creator.categories.slice(0, 3).map((category, index) => (
          <span
            key={category}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
              index
            )}`}
          >
            {category}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-4 h-4" />
          <span className="font-semibold">{creator.followers}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-600">Engagement: </span>
          <span className="font-semibold text-brand-navy">
            {creator.engagementRate}
          </span>
        </div>
      </div>
    </div>
  );
}
