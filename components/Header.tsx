'use client';

import { Bell, Grid3x3, Rocket, User, Menu, X, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { useAuth } from '@/lib/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const { firebaseUser, userProfile, signOut: firebaseSignOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const getNavLinkClass = (href: string) => {
    // Special handling for Dashboard link - exact match only
    // This prevents /influencers from matching /influencers/discover, /influencers/profiles, etc.
    const isActive = href === '/influencers'
      ? pathname === '/influencers'
      : pathname.startsWith(href);

    return `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary border-b-2 border-primary pb-4 -mb-4'
        : 'text-gray-600 hover:text-gray-900'
    }`;
  };

  const getMobileNavLinkClass = (href: string) => {
    // Special handling for Dashboard link - exact match only
    const isActive = href === '/influencers'
      ? pathname === '/influencers'
      : pathname.startsWith(href);

    return `text-sm font-medium transition-colors px-2 py-2 rounded-lg ${
      isActive ? 'text-primary bg-primary/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;
  };

  // Determine home/dashboard route based on user role
  const getHomeRoute = () => {
    if (userProfile?.role === 'brand') {
      return '/brands/dashboard';
    } else if (userProfile?.role === 'influencer') {
      return '/influencers';
    }
    return '/'; // Default fallback for non-authenticated users
  };

  // Determine campaign route based on user role
  const getCampaignRoute = () => {
    if (userProfile?.role === 'brand') {
      return '/brands/dashboard';
    } else if (userProfile?.role === 'influencer') {
      return '/influencers/marketplace';
    }
    return '/'; // Default fallback
  };

  // Determine settings route based on user role
  const getSettingsRoute = () => {
    if (userProfile?.role === 'brand') {
      return '/brands/settings';
    } else if (userProfile?.role === 'influencer') {
      return '/influencers/profile?tab=settings';
    }
    return '/'; // Default fallback
  };

  const homeRoute = getHomeRoute();
  const campaignRoute = getCampaignRoute();
  const settingsRoute = getSettingsRoute();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            {/* Logo */}
            <Link href={homeRoute} className="flex items-center">
              <div className="text-xl sm:text-2xl font-bold text-brand-navy">heycreator</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Influencer Navigation - Only Dashboard and Campaigns */}
              {userProfile?.role === 'influencer' && (
                <>
                  <Link
                    href="/influencers"
                    className={getNavLinkClass('/influencers')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={campaignRoute}
                    className={getNavLinkClass(campaignRoute)}
                  >
                    Campaigns
                  </Link>
                </>
              )}

              {/* Brand Navigation - Discovery, Influencers, Campaigns, Recruit, Monitor */}
              {userProfile?.role === 'brand' && (
                <>
                  <Link
                    href="/brands/discover"
                    className={getNavLinkClass('/brands/discover')}
                  >
                    Discovery
                  </Link>
                  <Link
                    href="/brands/influencers"
                    className={getNavLinkClass('/brands/influencers')}
                  >
                    Influencers
                  </Link>
                  <Link
                    href={campaignRoute}
                    className={getNavLinkClass(campaignRoute)}
                  >
                    Campaigns
                  </Link>
                  <Link
                    href="/brands/recruit"
                    className={getNavLinkClass('/brands/recruit')}
                  >
                    Recruit
                  </Link>
                  <Link
                    href="/brands/monitor"
                    className={getNavLinkClass('/brands/monitor')}
                  >
                    Monitor
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop icons - hide some on mobile */}
            <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Grid3x3 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Rocket className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {firebaseUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.displayName || userProfile?.email || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userProfile?.email}
                      </p>
                    </div>
                    <Link
                      href={settingsRoute}
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {firebaseUser && userProfile && (
              <div className="hidden md:block pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-700 font-medium">
                  {userProfile.displayName || userProfile.email || 'User'}
                </span>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              {/* Influencer Mobile Navigation - Only Dashboard and Campaigns */}
              {userProfile?.role === 'influencer' && (
                <>
                  <Link
                    href="/influencers"
                    className={getMobileNavLinkClass('/influencers')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={campaignRoute}
                    className={getMobileNavLinkClass(campaignRoute)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Campaigns
                  </Link>
                </>
              )}

              {/* Brand Mobile Navigation - Discovery, Influencers, Campaigns, Recruit, Monitor */}
              {userProfile?.role === 'brand' && (
                <>
                  <Link
                    href="/brands/discover"
                    className={getMobileNavLinkClass('/brands/discover')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Discovery
                  </Link>
                  <Link
                    href="/brands/influencers"
                    className={getMobileNavLinkClass('/brands/influencers')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Influencers
                  </Link>
                  <Link
                    href={campaignRoute}
                    className={getMobileNavLinkClass(campaignRoute)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Campaigns
                  </Link>
                  <Link
                    href="/brands/recruit"
                    className={getMobileNavLinkClass('/brands/recruit')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Recruit
                  </Link>
                  <Link
                    href="/brands/monitor"
                    className={getMobileNavLinkClass('/brands/monitor')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Monitor
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

