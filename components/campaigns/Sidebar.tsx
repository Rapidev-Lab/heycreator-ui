'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Search,
  User,
  Settings,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import NotificationBell from '@/components/ui/NotificationBell';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  isHighlighted?: boolean;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, signOut } = useAuth();
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
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      path: '/brands/dashboard',
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Discovery',
      path: '/brands/discover',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'My Creators',
      path: '/brands/influencers',
    },
    {
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'My Campaigns',
      path: '/brands/campaigns',
    },
    // {
    //   icon: <MessageSquare className="w-5 h-5" />,
    //   label: 'My Chats',
    //   path: '/brands/chats',
    // },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Analytics',
      path: '/brands/analytics',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      path: '/brands/settings',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/brand/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderMenuItems = () => (
    <>
      {menuItems.map((item) => {
        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-brand-navy text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );

  const renderBottomActions = () => (
    <>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </>
  );

  /** Shared sidebar content used by both mobile drawer and desktop sidebar */
  const renderSidebarContent = (variant: 'mobile' | 'desktop') => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <Link href="/brands/dashboard" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="HeyCreator"
            width={160}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 pt-4 pb-2">
        <WorkspaceSwitcher />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
        {renderMenuItems()}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 flex-shrink-0">
        {variant === 'mobile' ? (
          <>
            {/* User Profile (mobile only) */}
            <div className="px-4 py-3 flex items-center gap-3 border-t border-gray-100">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={(firebaseUser.displayName || 'U').charAt(0)}
                  className="w-9 h-9 rounded-full border-2 border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {(firebaseUser?.displayName || firebaseUser?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500">Campaign Manager</p>
              </div>
              <NotificationBell />
            </div>

            {/* Profile & Settings */}
            <div className="px-4 pb-1">
              <button
                onClick={() => handleNavigation('/brands/settings?tab=profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => handleNavigation('/brands/settings')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Logout */}
            <div className="px-4 py-3 border-t border-gray-200">
              {renderBottomActions()}
            </div>
          </>
        ) : (
          /* Desktop: just logout */
          <div className="px-4 py-3 border-t border-gray-100">
            {renderBottomActions()}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/brands/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="HeyCreator"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
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
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {renderSidebarContent('mobile')}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200 ${className}`}
      >
        {renderSidebarContent('desktop')}
      </aside>
    </>
  );
}
