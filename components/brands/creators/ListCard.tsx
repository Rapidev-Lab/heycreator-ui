'use client';

import { useState, useRef, useEffect } from 'react';
import { Bookmark, MoreVertical, Eye, UserPlus, Trash2 } from 'lucide-react';
import type { CreatorListResponse } from '@/types/creator-list';

interface ListCardProps {
  list: CreatorListResponse;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  onView: () => void;
  onAddCreators: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ListCard({
  list,
  isBookmarked = false,
  onBookmarkToggle,
  onView,
  onAddCreators,
  onEdit,
  onDelete,
}: ListCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const tags = list.tags || [];

  return (
    <div className="bg-white rounded-xl border-2 border-[#E0E0E0] p-5 flex flex-col">
      {/* Top: Bookmark + Menu */}
      <div className="flex items-center justify-end gap-1 mb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(); }}
          className={`p-1 rounded-md transition-colors ${isBookmarked ? 'bg-[rgba(99,102,241,0.1)]' : 'hover:bg-gray-100'}`}
        >
          <Bookmark className={`w-5 h-5 transition-colors ${isBookmarked ? 'text-brand-navy-dark fill-brand-navy-dark' : 'text-gray-400'}`} />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                View / Edit List
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onAddCreators(); }}
                className="hidden items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <UserPlus className="w-4 h-4" />
                Add Creators
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name + Count */}
      <h3 className="text-lg font-bold text-gray-900">{list.name}</h3>
      <p className="text-sm text-gray-500 mt-1">
        {list.creatorCount} Creator{list.creatorCount !== 1 ? 's' : ''}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 min-h-[1.75rem] mb-4">
        {tags.length > 0 ? (
          tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#F8F9FD] text-[#FF385C] font-medium">
              {tag.replace(/^#/, '')}
            </span>
          ))
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-400 font-medium">
            No tags
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex w-full gap-2 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onAddCreators(); }}
          className="hidden items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-[#E0E0E0] rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Add Creators
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex-1 flex items-center justify-center px-3 py-2.5 border-2 border-[#E0E0E0] rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
}
