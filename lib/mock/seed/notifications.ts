import { MockTimestamp } from '../mock-firestore';

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(now.getDate() - 2);

const ts = (d: Date) => MockTimestamp.fromDate(d);

export const mockNotifications = [
  // Brand notifications
  {
    id: 'mock-notif-1',
    data: {
      id: 'mock-notif-1',
      userId: 'mock-brand-user-1',
      type: 'application',
      title: 'New Application',
      message: 'Demo Creator applied to your "Summer Fashion Collection 2025" campaign.',
      read: false,
      data: { campaignId: 'mock-campaign-1', applicationId: 'mock-app-1' },
      createdAt: ts(oneHourAgo),
    },
  },
  {
    id: 'mock-notif-2',
    data: {
      id: 'mock-notif-2',
      userId: 'mock-brand-user-1',
      type: 'application',
      title: 'Application Completed',
      message: 'Demo Creator completed all deliverables for "Winter Sports Gear Promotion".',
      read: true,
      data: { campaignId: 'mock-campaign-4', applicationId: 'mock-app-3' },
      createdAt: ts(yesterday),
    },
  },
  {
    id: 'mock-notif-3',
    data: {
      id: 'mock-notif-3',
      userId: 'mock-brand-user-1',
      type: 'message',
      title: 'Platform Update',
      message: 'Your campaign analytics for January are ready to view.',
      read: true,
      data: {},
      createdAt: ts(twoDaysAgo),
    },
  },

  // Influencer notifications
  {
    id: 'mock-notif-4',
    data: {
      id: 'mock-notif-4',
      userId: 'mock-influencer-user-1',
      type: 'application',
      title: 'Application Accepted',
      message: 'Your application to "Spring Wellness Product Launch" has been accepted!',
      read: false,
      data: { campaignId: 'mock-campaign-3', applicationId: 'mock-app-2' },
      createdAt: ts(yesterday),
    },
  },
  {
    id: 'mock-notif-5',
    data: {
      id: 'mock-notif-5',
      userId: 'mock-influencer-user-1',
      type: 'application',
      title: 'Application Update',
      message: 'Your application to "Holiday Season Fashion Campaign" was not selected.',
      read: false,
      data: { campaignId: 'mock-campaign-2', applicationId: 'mock-app-4' },
      createdAt: ts(yesterday),
    },
  },
  {
    id: 'mock-notif-6',
    data: {
      id: 'mock-notif-6',
      userId: 'mock-influencer-user-1',
      type: 'invitation',
      title: 'Campaign Invitation',
      message: 'HeyCreator Demo invited you to collaborate on a new campaign!',
      read: true,
      data: { campaignId: 'mock-campaign-1' },
      createdAt: ts(twoDaysAgo),
    },
  },
];
