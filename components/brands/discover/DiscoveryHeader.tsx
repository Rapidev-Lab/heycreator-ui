'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, HelpCircle, Instagram, Music2, Youtube, X, Facebook, CheckCircle } from 'lucide-react';
import VerifiedIcon from '@/components/brands/discover/VerifiedIcon';

interface DiscoveryHeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  searchType: string;
  onSearchTypeChange: (type: string) => void;
  isModalMode?: boolean;
  onExecuteSearch?: () => void;
}

export default function DiscoveryHeader({ searchTerm, onSearchTermChange, searchType, onSearchTypeChange, isModalMode = false, onExecuteSearch = (): void => {} }: DiscoveryHeaderProps) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [isVetted, setIsVetted] = useState(false);
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']); // Default to Instagram

  const placeholderText = searchType === 'Topic'
    ? "Food, Lifestyle, #newborn"
    : "Enter any Keyword or Phrase";

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };
  
  const platforms = [
    { name: 'Instagram', icon: Instagram, key: 'instagram' },
    { name: 'TikTok', icon: Music2, key: 'tiktok' },
    { name: 'YouTube', icon: Youtube, key: 'youtube' },
    { name: 'X', icon: X, key: 'twitter' },
    { name: 'Facebook', icon: Facebook, key: 'facebook' },
  ];

  const handleSearch = () => {
    // Validate that we have a search term or at least one platform selected
    if (!searchTerm.trim() && selectedPlatforms.length === 0) {
      alert('Please enter a search term or select at least one platform');
      return;
    }

    if (isModalMode && onExecuteSearch) {
      console.log('Search handled internally by modal');
      onExecuteSearch(); // This calls the handleInternalSearch in your InviteCreatorsModal
      return; 
    }

    // Build query parameters
    const params = new URLSearchParams();

    // Add query (required for search)
    if (searchTerm.trim()) {
      params.set('query', searchTerm.trim());
    }

    // Add platforms (default to instagram if none selected)
    const platformsToSearch = selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram'];
    params.set('platforms', platformsToSearch.join(','));

    // Add location if provided
    if (location.trim()) {
      params.set('location', location.trim());
    }

    // Add vetted filter
    if (isVetted) {
      params.set('vetted', 'true');
    }

    // Always force live search
    params.set('forceLive', 'true');

    console.log('Search initiated:', { searchTerm, searchType, isVetted, selectedPlatforms, location });
    console.log('Navigating to:', `/brands/discover/results?${params.toString()}`);

    // Navigate to results page
    router.push(`/brands/discover/results?${params.toString()}`);
  };
  
  const handleSelectSearchType = (type: string) => {
    onSearchTypeChange(type);
    setIsSearchTypeOpen(false);
  };
  
  const searchTypeOptions = ['Keyword', 'Topic'];

  const commonHeightClass = 'min-h-[48px]';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
        {/* Main Search Input Area */}
        <div className={`bg-gray-50 shadow-lg p-1.5 flex flex-col sm:flex-row items-center flex-grow gap-2 rounded-lg border border-gray-200 ${commonHeightClass}`}>
          {/* Search Type Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)} 
              className="flex items-center justify-between space-x-2 pl-4 pr-2 py-2 rounded-md hover:bg-gray-100 w-full"
            >
              <span className="font-semibold text-gray-700">{searchType}</span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
            {isSearchTypeOpen && (
              <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg p-2">
                {searchTypeOptions.map(opt => (
                  <a
                    key={opt}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleSelectSearchType(opt); }}
                    className={`flex justify-between items-center px-3 py-2 text-sm rounded-md ${searchType === opt ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {opt}
                    {searchType === opt && <CheckCircle className="w-4 h-4" />}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="h-px w-full sm:h-8 sm:w-px border-l border-gray-300"></div>

          {/* Main Search Input */}
          <div className="flex-grow flex items-center">
            <input
              type="text"
              placeholder={placeholderText}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-2 py-2 bg-transparent focus:outline-none text-base text-gray-700"
            />
            <HelpCircle className="w-5 h-5 text-gray-400 mx-2" />
          </div>

          <div className="hidden sm:block h-8 border-l border-gray-300"></div>

          {/* Location Input */}
          <div className="flex-grow flex items-center">
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-2 py-2 bg-transparent focus:outline-none text-base text-gray-700"
            />
          </div>

          <div className="hidden sm:block h-8 border-l border-gray-300"></div>

          {/* Vetted Toggle */}
          <label className="flex items-center space-x-2 px-4 py-2 cursor-pointer rounded-md hover:bg-gray-100">
            <input
              type="checkbox"
              checked={isVetted}
              onChange={() => setIsVetted(!isVetted)}
              aria-label="Show vetted creators only"
              className="sr-only"
            />
            <VerifiedIcon isVerified={isVetted} className="w-5 h-5" />
            <span className={`font-semibold text-gray-700 transition-colors ${isVetted ? 'text-blue-500' : 'text-gray-600'}`}>Vetted</span>
          </label>

        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className={`w-full md:w-auto bg-brand-navy-dark text-white rounded-lg px-8 py-2 font-semibold hover:bg-blue-600 transition-colors shadow-lg ${commonHeightClass}`}
        >
          Search
        </button>
      </div>

      {/* Platform Toggles */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isActive = selectedPlatforms.includes(platform.key);
          return (
            <button
              key={platform.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200
                ${isActive
                  ? 'bg-[#FF385C] border-[#FF385C] text-white'
                  : 'bg-white border-[#E0E0E0] text-gray-700 hover:bg-gray-50'
                }`}
              onClick={() => handlePlatformToggle(platform.key)}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="font-medium text-sm">{platform.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}