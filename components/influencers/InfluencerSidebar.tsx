'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Settings,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import NotificationBell from '@/components/ui/NotificationBell';
import Logo from '@/components/auth/Logo';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export default function InfluencerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const menuItems: MenuItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/influencers' },
    { icon: <User className="w-5 h-5" />, label: 'My Profile', path: '/influencers/profile' },
    { icon: <Search className="w-5 h-5" />, label: 'Marketplace', path: '/influencers/marketplace' },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'My Campaigns', path: '/influencers/campaigns' },
    // { icon: <MessageSquare className="w-5 h-5" />, label: 'My Chats', path: '/influencers/chats' },
    // { icon: <BarChart3 className="w-5 h-5" />, label: 'My Analytics', path: '/influencers/analytics' },
  ];

  const isActive = (path: string) => {
    if (path === '/influencers') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/influencer/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderMenuItems = () => (
    <>
      {menuItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.path)
              ? 'bg-brand-navy text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </>
  );

  const renderBottomSection = () => (
    <>
      {/* Logout Button */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/influencers">
            <Logo size="sm" clickable={false} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <Link href="/influencers">
            <Logo size="md" clickable={false} />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-12rem)]">
          {renderMenuItems()}
        </nav>

        {/* User Profile + Bottom Section */}
        <div className="border-t border-gray-200">
          {/* User Profile */}
          <div className="px-4 py-3 flex items-center gap-3">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={(userProfile.displayName || 'U').charAt(0)}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {(userProfile?.displayName || userProfile?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userProfile?.displayName || userProfile?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500">Content Creator</p>
            </div>
            <NotificationBell />
          </div>

          {/* Overview & Settings */}
          <div className="px-4 pb-1">
            <button
              onClick={() => handleNavigation('/influencers/profile')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleNavigation('/influencers/profile?tab=settings')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="px-4 py-3 border-t border-gray-200">
            {renderBottomSection()}
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-60 bg-white border-r border-gray-200 z-50">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <Link href="/influencers">
            <Logo size="md" clickable={false} />
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {renderMenuItems()}
        </nav>

        {/* Bottom Section */}
        <div className="px-4 py-4 border-t border-gray-200 space-y-2">
          {renderBottomSection()}
        </div>
      </aside>
    </>
  );
}
