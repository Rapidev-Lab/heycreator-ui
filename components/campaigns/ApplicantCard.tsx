'use client';

import { useState } from 'react';
import { ApplicationStatus } from '@/types/campaign';
import { User, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';

export interface Applicant {
  id: string;
  influencerId?: string;
  name: string;
  avatar: string | null;
  bio: string;
  followers: string;
  engagement: string;
  status: ApplicationStatus;
}

interface ApplicantCardProps {
  applicant: Applicant;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onViewProfile: (id: string) => void;
  isActionLoading?: boolean;
}

const getStatusStyles = (status: ApplicationStatus) => {
  switch (status) {
    case ApplicationStatus.ACCEPTED:
      return {
        badge: 'bg-green-100 text-green-800',
        border: 'border-green-300',
      };
    case ApplicationStatus.REJECTED:
      return {
        badge: 'bg-red-100 text-red-800',
        border: 'border-red-300',
      };
    case ApplicationStatus.WITHDRAWN:
        return {
        badge: 'bg-yellow-100 text-yellow-800',
        border: 'border-yellow-300',
      };
    case ApplicationStatus.PENDING:
    default:
      return {
        badge: 'bg-gray-100 text-gray-800',
        border: 'border-gray-300',
      };
  }
};

export default function ApplicantCard({
  applicant,
  onAccept,
  onReject,
  onViewProfile,
  isActionLoading = false,
}: ApplicantCardProps) {
  const { badge, border } = getStatusStyles(applicant.status);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className={`bg-white rounded-lg p-4 sm:p-5 border ${border} transition-shadow hover:shadow-lg`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Profile Info */}
        <div className="flex items-start sm:items-center">
          {applicant.avatar && !avatarError ? (
            <img src={applicant.avatar} alt={applicant.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0" onError={() => setAvatarError(true)} />
          ) : (
            <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
              {applicant.name.charAt(0)}
            </span>
          )}
          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <p className="font-bold text-base sm:text-lg text-gray-900 truncate">{applicant.name}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge} w-fit`}>
                    {applicant.status}
                </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{applicant.bio}</p>
          </div>
        </div>

        {/* Stats and Actions Container */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:flex-shrink-0">
          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6 text-center">
            <div>
              <p className="font-bold text-base sm:text-lg text-gray-800">{applicant.followers}</p>
              <p className="text-xs text-gray-500 uppercase">Followers</p>
            </div>
            <div>
              <p className="font-bold text-base sm:text-lg text-gray-800">{applicant.engagement}</p>
              <p className="text-xs text-gray-500 uppercase">Engagement</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {applicant.status === ApplicationStatus.PENDING && (
              <>
                <button
                  onClick={() => onAccept(applicant.id)}
                  disabled={isActionLoading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="hidden sm:inline">{isActionLoading ? 'Accepting...' : 'Accept'}</span>
                  <span className="sm:hidden">✓</span>
                </button>
                <button
                  onClick={() => onReject(applicant.id)}
                  disabled={isActionLoading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="hidden sm:inline">{isActionLoading ? 'Rejecting...' : 'Reject'}</span>
                  <span className="sm:hidden">✗</span>
                </button>
              </>
            )}
            <button
              onClick={() => onViewProfile(applicant.influencerId || applicant.id)}
              disabled={isActionLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Profile</span>
              <span className="sm:hidden">View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
