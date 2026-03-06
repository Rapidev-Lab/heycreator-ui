import { MockTimestamp } from '../mock-firestore';

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const lastWeek = new Date(now);
lastWeek.setDate(now.getDate() - 7);
const twoWeeksAgo = new Date(now);
twoWeeksAgo.setDate(now.getDate() - 14);

const ts = (d: Date) => MockTimestamp.fromDate(d);

export const mockApplications = [
  {
    id: 'mock-app-1',
    data: {
      id: 'mock-app-1',
      influencerId: 'mock-influencer-user-1',
      campaignId: 'mock-campaign-1',
      status: 'pending',
      pitchMessage: 'I love this summer collection and would be thrilled to showcase it to my audience! My style content consistently gets great engagement.',
      proposedRate: 4500,
      appliedAt: ts(yesterday),
      reviewedAt: null,
      reviewNotes: null,
      rejectionReason: null,
      qualificationMet: true,
      questionAnswers: [
        { question: 'What is your personal style?', answer: 'Minimalist chic with a touch of streetwear' },
        { question: 'Which platforms do you primarily create content for?', answer: 'Instagram' },
      ],
    },
  },
  {
    id: 'mock-app-2',
    data: {
      id: 'mock-app-2',
      influencerId: 'mock-influencer-user-1',
      campaignId: 'mock-campaign-3',
      status: 'accepted',
      pitchMessage: 'As a wellness advocate, I regularly share my health journey with my followers. This partnership aligns perfectly with my content.',
      proposedRate: 6000,
      appliedAt: ts(lastWeek),
      reviewedAt: ts(yesterday),
      reviewNotes: 'Great fit for the brand. High engagement on wellness content.',
      rejectionReason: null,
      qualificationMet: true,
      questionAnswers: [
        { question: 'Do you have experience with wellness content?', answer: 'Yes' },
      ],
    },
  },
  {
    id: 'mock-app-3',
    data: {
      id: 'mock-app-3',
      influencerId: 'mock-influencer-user-1',
      campaignId: 'mock-campaign-4',
      status: 'completed',
      pitchMessage: 'Winter sports are my passion. Completed all deliverables for this campaign.',
      proposedRate: 3000,
      appliedAt: ts(twoWeeksAgo),
      reviewedAt: ts(lastWeek),
      reviewNotes: 'All deliverables completed successfully.',
      rejectionReason: null,
      qualificationMet: true,
      questionAnswers: [],
    },
  },
  {
    id: 'mock-app-4',
    data: {
      id: 'mock-app-4',
      influencerId: 'mock-influencer-user-1',
      campaignId: 'mock-campaign-2',
      status: 'rejected',
      pitchMessage: 'I would love to feature your holiday collection!',
      proposedRate: 5000,
      appliedAt: ts(lastWeek),
      reviewedAt: ts(yesterday),
      reviewNotes: null,
      rejectionReason: 'Audience demographics do not match target audience for this campaign.',
      qualificationMet: false,
      questionAnswers: [],
    },
  },
];
