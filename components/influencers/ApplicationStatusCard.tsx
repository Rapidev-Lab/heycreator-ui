'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  DollarSign,
  Calendar,
  Building2,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import WithdrawalModal from './WithdrawalModal';

interface ApplicationStatusCardProps {
  application: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    appliedAt: Date | any;
    reviewedAt?: Date | any | null;
    reviewNotes?: string | null;
    rejectionReason?: string | null;
    qualificationMet: boolean;
    pitchMessage: string;
    campaign: {
      id: string;
      title: string;
      brandName: string;
      brandLogo?: string | null;
      budget: {
        amount: number;
        currency: string;
      };
      timeline: {
        duration: string;
      };
      status: string;
    };
  };
  onWithdraw?: (applicationId: string) => void;
}

export default function ApplicationStatusCard({ application, onWithdraw }: ApplicationStatusCardProps) {
  const router = useRouter();
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const getStatusConfig = () => {
    switch (application.status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending Review',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          badgeBg: 'bg-yellow-100',
        };
      case 'accepted':
        return {
          icon: CheckCircle2,
          label: 'Accepted',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          badgeBg: 'bg-green-100',
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          badgeBg: 'bg-red-100',
        };
      case 'withdrawn':
        return {
          icon: Ban,
          label: 'Withdrawn',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-100',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          badgeBg: 'bg-gray-100',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleWithdrawConfirm = async (reason?: string) => {
    try {
      setIsWithdrawing(true);

      // Call the onWithdraw callback if provided
      if (onWithdraw) {
        await onWithdraw(application.id);
      }

      // Close modal after successful withdrawal
      setShowWithdrawalModal(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      // Error is already handled by the parent component
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';

    let d: Date;
    // Handle Firestore Timestamp
    if (typeof date.toDate === 'function') {
      d = date.toDate();
    }
    // Handle Date object
    else if (date instanceof Date) {
      d = date;
    }
    // Handle ISO string or timestamp
    else if (typeof date === 'string' || typeof date === 'number') {
      d = new Date(date);
    }
    // Handle object with seconds (Firestore format from API)
    else if (date.seconds) {
      d = new Date(date.seconds * 1000);
    }
    else {
      return 'Invalid Date';
    }

    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }

    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 ${statusConfig.borderColor} overflow-hidden transition-all hover:shadow-md`}>
      {/* Status Banner */}
      <div className={`${statusConfig.bgColor} px-6 py-3 border-b ${statusConfig.borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
          <span className={`font-semibold ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          Applied {formatDate(application.appliedAt)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Campaign Info */}
        <div className="flex items-start gap-4 mb-4">
          {application.campaign.brandLogo ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={application.campaign.brandLogo}
                alt={application.campaign.brandName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {application.campaign.title}
            </h3>
            <p className="text-sm text-gray-600">{application.campaign.brandName}</p>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              {application.campaign.budget.currency === 'ZAR' ? 'R' : application.campaign.budget.currency}
              {application.campaign.budget.amount.toLocaleString('en-ZA')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {application.campaign.timeline.duration}
            </span>
          </div>
        </div>

        {/* Pitch Message */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-brand-navy" />
            <span className="text-sm font-semibold text-gray-900">Your Pitch</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg">
            {application.pitchMessage}
          </p>
        </div>

        {/* Review Notes (if rejected or accepted) */}
        {application.status === 'rejected' && application.rejectionReason && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-800">{application.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {application.status === 'accepted' && application.reviewNotes && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">Brand&apos;s Message</p>
                <p className="text-sm text-green-800">{application.reviewNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Qualification Badge */}
        {!application.qualificationMet && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-orange-800">
                You didn&apos;t meet all requirements when you applied
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
        {application.status === 'pending' && onWithdraw && (
          <button
            onClick={() => setShowWithdrawalModal(true)}
            disabled={isWithdrawing}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw Application
          </button>
        )}

        {application.status === 'accepted' && (
          <>
            <button
              onClick={() => router.push(`/influencers/campaigns/${application.campaign.id}/submit-content?applicationId=${application.id}`)}
              className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors text-sm font-medium flex items-center gap-2"
            >
              Submit Content
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-green-700">
              Congratulations! Ready to create content.
            </span>
          </>
        )}

        {(application.status === 'rejected' || application.status === 'withdrawn') && (
          <span className="text-sm text-gray-500">
            {application.reviewedAt && `Reviewed ${formatDate(application.reviewedAt)}`}
          </span>
        )}

        <button
          onClick={() => router.push(`/influencers/marketplace/${application.campaign.id}`)}
          className="ml-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium flex items-center gap-2"
        >
          View Campaign
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => !isWithdrawing && setShowWithdrawalModal(false)}
        onConfirm={handleWithdrawConfirm}
        campaignTitle={application.campaign.title}
        isLoading={isWithdrawing}
      />
    </div>
  );
}
