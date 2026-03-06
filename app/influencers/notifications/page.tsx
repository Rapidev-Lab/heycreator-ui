'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Bell, X, MessageSquare, AlertCircle, CheckCircle, MessageCircleMore, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import PageLoader from '@/components/ui/PageLoader';
import SectionLoader from '@/components/ui/SectionLoader';

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
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'application_received':
    case 'application_reviewed':
    case 'campaign_invitation':
    case 'invitation_response':
      return {
        icon: <Megaphone className="w-5 h-5 text-white" />,
        bg: 'bg-red-500',
      };
    case 'message_received':
      return {
        icon: <MessageSquare className="w-5 h-5 text-white" />,
        bg: 'bg-brand-navy',
      };
    case 'campaign_deadline':
    case 'alert':
      return {
        icon: <AlertCircle className="w-5 h-5 text-white" />,
        bg: 'bg-brand-navy',
      };
    case 'deliverable_reviewed':
    case 'content_approved':
      return {
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        bg: 'bg-green-500',
      };
    case 'comment':
      return {
        icon: <MessageCircleMore className="w-5 h-5 text-white" />,
        bg: 'bg-teal-500',
      };
    case 'deliverable_submitted':
      return {
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        bg: 'bg-blue-500',
      };
    case 'payment_processed':
      return {
        icon: <CheckCircle className="w-5 h-5 text-white" />,
        bg: 'bg-green-500',
      };
    default:
      return {
        icon: <Bell className="w-5 h-5 text-white" />,
        bg: 'bg-brand-navy',
      };
  }
}

function getActionButtons(type: string): { primary: string; secondary?: string } {
  switch (type) {
    case 'application_received':
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

function NotificationsPageContent() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/notifications?limit=50', {
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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
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

  const handleDismiss = async (notification: Notification) => {
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

  const handleAction = (notification: Notification) => {
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

    if (notification.actionUrl) {
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

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
          <div className="bg-white px-6 sm:px-10 lg:px-16 pt-8 pb-0 border-b border-gray-200">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">Notifications</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all as read
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 -mb-[1px]">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'unread'
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-10 lg:px-16 py-6">
            {isLoading ? (
              <SectionLoader message="Loading notifications..." />
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-20">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  {activeTab === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Notifications about campaigns, applications, and messages will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const { icon, bg } = getNotificationIcon(notification.type);
                  const buttons = getActionButtons(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-xl border p-5 sm:p-6 transition-colors ${
                        notification.read
                          ? 'bg-white border-gray-200'
                          : 'bg-blue-50/60 border-l-4 border-l-brand-navy border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                          {icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-navy leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {/* Dismiss */}
                        <button
                          onClick={() => handleDismiss(notification)}
                          className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      {/* Footer row */}
                      <div className="flex items-center justify-between mt-4 pl-15">
                        <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          {buttons.secondary && notification.actionUrl && (
                            <button
                              onClick={() => handleAction(notification)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {buttons.secondary}
                            </button>
                          )}
                          {notification.actionUrl && (
                            <button
                              onClick={() => handleAction(notification)}
                              className="px-4 py-2 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navy-light transition-colors"
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
            )}
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <NotificationsPageContent />
    </Suspense>
  );
}
