import { ContentSubmission } from '@/components/campaigns/ContentSubmissionCard';
import { DeliverableStatus } from '@/types/campaign';

export const mockContentSubmissionsData: ContentSubmission[] = [
  {
    id: 'content-1',
    creatorName: 'Thandi Mkhize',
    creatorAvatar: 'https://i.pravatar.cc/150?img=10',
    platform: 'Instagram',
    postType: 'Post',
    submittedDate: '20 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.SUBMITTED
  },
  {
    id: 'content-2',
    creatorName: 'Lebo Molefe',
    creatorAvatar: 'https://i.pravatar.cc/150?img=11',
    platform: 'Instagram',
    postType: 'Story',
    submittedDate: '22 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.SUBMITTED
  },
  {
    id: 'content-3',
    creatorName: 'Sipho Ndlovu',
    creatorAvatar: 'https://i.pravatar.cc/150?img=12',
    platform: 'TikTok',
    postType: 'Video',
    submittedDate: '18 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
    liveUrl: 'https://tiktok.com/@sipho/video123',
    contentScreenshots: [],
    status: DeliverableStatus.COMPLETED
  },
  {
    id: 'content-4',
    creatorName: 'Nomsa Khumalo',
    creatorAvatar: 'https://i.pravatar.cc/150?img=13',
    platform: 'YouTube',
    postType: 'Video',
    submittedDate: '21 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.APPROVED
  },
  {
    id: 'content-5',
    creatorName: 'Alex Morgan',
    creatorAvatar: 'https://i.pravatar.cc/150?img=1',
    platform: 'Instagram',
    postType: 'Post',
    submittedDate: '23 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.SUBMITTED
  },
  {
    id: 'content-6',
    creatorName: 'Jamie Collins',
    creatorAvatar: 'https://i.pravatar.cc/150?img=2',
    platform: 'TikTok',
    postType: 'Video',
    submittedDate: '24 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.APPROVED
  },
  {
    id: 'content-7',
    creatorName: 'Casey Thompson',
    creatorAvatar: 'https://i.pravatar.cc/150?img=3',
    platform: 'Instagram',
    postType: 'Story',
    submittedDate: '19 Dec 2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    contentScreenshots: [],
    status: DeliverableStatus.REJECTED
  }
];