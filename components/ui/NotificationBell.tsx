'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, MessageSquare, AlertCircle, CheckCircle, MessageCircleMore, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useUserRole } from '@/lib/firebase/auth-context';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  campaignId?: string;
  applicationId?: string;
  actionUrl?: string;
  read: boolean;
  archived?: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'application_received':
    case 'application_reviewed':
    case 'campaign_invitation':
    case 'invitation_response':
      return {
        icon: <Megaphone className="w-4 h-4 text-white" />,
        bg: 'bg-red-500',
      };
    case 'message_received':
      return {
        icon: <MessageSquare className="w-4 h-4 text-white" />,
        bg: 'bg-brand-navy',
      };
    case 'campaign_deadline':
    case 'alert':
      return {
        icon: <AlertCircle className="w-4 h-4 text-white" />,
        bg: 'bg-brand-navy',
      };
    case 'deliverable_reviewed':
    case 'content_approved':
      return {
        icon: <CheckCircle className="w-4 h-4 text-white" />,
        bg: 'bg-green-500',
      };
    case 'comment':
      return {
        icon: <MessageCircleMore className="w-4 h-4 text-white" />,
        bg: 'bg-teal-500',
      };
    case 'deliverable_submitted':
      return {
        icon: <CheckCircle className="w-4 h-4 text-white" />,
        bg: 'bg-blue-500',
      };
    case 'payment_processed':
      return {
        icon: <CheckCircle className="w-4 h-4 text-white" />,
        bg: 'bg-green-500',
      };
    default:
      return {
        icon: <Bell className="w-4 h-4 text-white" />,
        bg: 'bg-brand-navy',
      };
  }
}

function getActionButtons(type: string): { primary: string; secondary?: string } {
  switch (type) {
    case 'application_received':
      return { primary: 'View Application' };
    case 'application_reviewed':
    case 'campaign_invitation':
    case 'invitation_response':
      return { primary: 'View Campaign' };
    case 'message_received':
      return { primary: 'View Message' };
    case 'campaign_deadline':
    case 'alert':
      return { primary: 'View Alert' };
    case 'deliverable_reviewed':
    case 'content_approved':
      return { primary: 'View Details' };
    case 'comment':
      return { secondary: 'View Comment', primary: 'View Details' };
    case 'deliverable_submitted':
      return { primary: 'View Details' };
    case 'payment_processed':
      return { primary: 'View Details' };
    default:
      return { primary: 'View Details' };
  }
}

export default function NotificationBell() {
  const { firebaseUser } = useAuth();
  const userRole = useUserRole();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/notifications?unread=true&limit=1', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [firebaseUser]);

  const fetchFullNotifications = useCallback(async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/notifications?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications);
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUser]);

  // Register FCM token on mount (fire-and-forget)
  const fcmRegisteredRef = useRef(false);
  useEffect(() => {
    if (!firebaseUser || fcmRegisteredRef.current) return;
    fcmRegisteredRef.current = true;

    (async () => {
      try {
        const { requestNotificationPermission, saveFCMToken } = await import('@/lib/firebase/fcm');
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          const idToken = await firebaseUser.getIdToken();
          await saveFCMToken(fcmToken, idToken);
        }
      } catch {
        // FCM not available or permission denied — silent fail
      }
    })();
  }, [firebaseUser]);

  // Poll for unread count every 30s — defer initial fetch
  const initialTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!firebaseUser) return;

    initialTimerRef.current = setTimeout(() => {
      fetchUnreadCount();
      pollIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
    }, 3000);

    return () => {
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [firebaseUser, fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchFullNotifications();
    }
  }, [isOpen, fetchFullNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!firebaseUser || notification.read) return;

    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDismiss = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`/api/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error dismissing notification:', err);
    }
  };

  const handleAction = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();

    // Mark as read (fire-and-forget) before navigating
    if (!notification.read && firebaseUser) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      firebaseUser.getIdToken().then((token) =>
        fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {})
      );
    }

    // For campaign invitations, always navigate to the specific campaign page
    if (notification.type === 'campaign_invitation' && notification.campaignId) {
      setIsOpen(false);
      router.push(`/influencers/marketplace/${notification.campaignId}`);
      return;
    }

    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    if (!firebaseUser || unreadCount === 0) return;
    try {
      const token = await firebaseUser.getIdToken();
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    const notificationsPath = userRole === 'brand' ? '/brands/notifications' : '/influencers/notifications';
    router.push(notificationsPath);
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown — full-screen on mobile, absolute dropdown on desktop */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 lg:w-[420px] lg:z-50 lg:rounded-xl lg:shadow-xl lg:border lg:border-gray-200 lg:max-h-[520px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-base font-bold text-brand-navy">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-5 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'unread'
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-brand-navy text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1 lg:flex-none lg:max-h-[360px] p-3 space-y-3">
            {isLoading && notifications.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                Loading...
              </div>
            )}

            {!isLoading && filteredNotifications.length === 0 && (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            )}

            {filteredNotifications.map((notification) => {
              const { icon, bg } = getNotificationIcon(notification.type);
              const buttons = getActionButtons(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    notification.read
                      ? 'bg-white border-gray-200'
                      : 'bg-blue-50/60 border-l-4 border-l-brand-navy border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                      {icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-navy leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {/* Dismiss */}
                    <button
                      onClick={(e) => handleDismiss(e, notification)}
                      className="p-0.5 hover:bg-gray-100 rounded-full flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  {/* Footer row */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-gray-400">{timeAgo(notification.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      {buttons.secondary && notification.actionUrl && (
                        <button
                          onClick={(e) => handleAction(e, notification)}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {buttons.secondary}
                        </button>
                      )}
                      {notification.actionUrl && (
                        <button
                          onClick={(e) => handleAction(e, notification)}
                          className="px-3 py-1.5 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
                        >
                          {buttons.primary}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex-1 py-2 px-2 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center whitespace-nowrap"
            >
              Mark All As Read
            </button>
            <button
              onClick={handleViewAll}
              className="flex-1 py-2 px-2 bg-brand-navy text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-brand-navy-light transition-colors text-center whitespace-nowrap"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
