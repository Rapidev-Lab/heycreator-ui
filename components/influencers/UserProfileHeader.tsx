'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { User, Settings } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';

interface UserProfileHeaderProps {
  className?: string;
}

export default function UserProfileHeader({ className = '' }: UserProfileHeaderProps) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const photoURL = userProfile?.photoURL;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Notification Bell */}
      <NotificationBell />

      {/* User Profile — clickable, opens dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">Content Creator</p>
          </div>
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName.charAt(0).toUpperCase()}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => { setIsOpen(false); router.push('/influencers/profile'); }}
              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
            >
              <User size={16} />
              Overview
            </button>
            <button
              onClick={() => { setIsOpen(false); router.push('/influencers/profile?tab=settings'); }}
              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
