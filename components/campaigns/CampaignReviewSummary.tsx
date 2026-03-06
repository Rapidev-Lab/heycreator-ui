'use client';

import { Campaign } from '@/types/campaign';
import { FileText, DollarSign, Calendar, Users, Eye, Edit } from 'lucide-react';

interface CampaignReviewSummaryProps {
  campaignData: Campaign;
  onEdit: (step: number) => void;
}

const SectionTitle = ({ icon, title, step, onEdit }: { icon: React.ReactNode; title: string; step: number; onEdit: (step: number) => void }) => (
  <div className="flex items-center justify-between pb-3">
    <h3 className="flex items-center text-xl font-semibold text-gray-800">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <button onClick={() => onEdit(step)} className="inline-flex items-center text-sm font-medium text-brand-navy hover:text-blue-700">
      <Edit className="w-4 h-4 mr-1" /> Edit
    </button>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <p className="text-gray-600 font-medium">{label}:</p>
    <p className="text-gray-800">{value}</p>
  </div>
);

export default function CampaignReviewSummary({ campaignData, onEdit }: CampaignReviewSummaryProps) {
  const formatCurrency = (amount: number | string) => {
    if (typeof amount === 'string') {
      const num = parseFloat(amount);
      if (isNaN(num)) return amount;
      return `R${num.toLocaleString('en-ZA')}`;
    }
    return `R${amount.toLocaleString('en-ZA')}`;
  };

  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    return new Date(value);
  };

  const getBudgetDisplay = () => {
    if (!campaignData.budget) return 'N/A';
    if (campaignData.budget.compensationModel === 'range') {
      return `${formatCurrency(campaignData.budget.minRangeAmount || 0)} - ${formatCurrency(campaignData.budget.maxRangeAmount || 0)}`;
    }
    return formatCurrency(campaignData.budget.fixedAmount || 0);
  };

  const getDeliverablesDisplay = () => {
    if (!campaignData.tasks?.requiredDeliverables?.length) return 'N/A';
    return campaignData.tasks.requiredDeliverables
      .map((d, i) => `${d.platform} ${d.type}${i < campaignData.tasks.requiredDeliverables.length - 1 ? ', ' : ''}`)
      .join('');
  };

  const getObjectivesDisplay = () => {
    if (!campaignData.campaignObjectives?.length) return 'N/A';
    return campaignData.campaignObjectives.join(', ');
  };

  return (
    <div className="space-y-8">
      {/* Core Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionTitle icon={<FileText className="w-5 h-5" />} title="Core Details" step={1} onEdit={onEdit} />
        <div className="divide-y divide-gray-100">
          <DetailRow label="Campaign Title" value={campaignData.campaignTitle || 'N/A'} />
          <DetailRow label="Description" value={campaignData.description || 'N/A'} />
          <DetailRow label="Objectives" value={getObjectivesDisplay()} />
          <DetailRow label="Deliverables" value={getDeliverablesDisplay()} />
        </div>
      </div>

      {/* Logistics & Budget */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionTitle icon={<DollarSign className="w-5 h-5" />} title="Logistics & Budget" step={2} onEdit={onEdit} />
        <div className="divide-y divide-gray-100">
          <DetailRow label="Campaign Categories" value={campaignData.campaignCategories?.join(', ') || 'N/A'} />
          <DetailRow label="Product Type" value={campaignData.campaignProduct?.productType || 'N/A'} />
          <DetailRow label="Product Name" value={campaignData.campaignProduct?.productName || 'N/A'} />
          <DetailRow label="Payment Terms" value={campaignData.budget?.paymentTerms || 'N/A'} />
          <DetailRow label="Budget" value={getBudgetDisplay()} />
          <DetailRow label="Campaign Start Date" value={toDate(campaignData.campaignStart)?.toLocaleDateString() || 'N/A'} />
          <DetailRow label="Campaign End Date" value={toDate(campaignData.campaignEnd)?.toLocaleDateString() || 'N/A'} />
          <DetailRow label="Application Deadline" value={toDate(campaignData.budget?.applicationDeadline)?.toLocaleDateString() || 'N/A'} />
        </div>
      </div>

      {/* Targeting & Visibility */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionTitle icon={<Eye className="w-5 h-5" />} title="Targeting & Visibility" step={3} onEdit={onEdit} />
        <div className="divide-y divide-gray-100">
          <DetailRow label="Visibility" value={<span className="capitalize">{campaignData.campaignVisibility || 'public'}</span>} />
          <DetailRow label="Min Followers" value={(campaignData.audience?.minFollowers || 0).toLocaleString()} />
          <DetailRow label="Min Engagement Rate" value={`${campaignData.audience?.minEngagements || 0}%`} />
          <DetailRow label="Target Location" value={campaignData.audience?.targetLocation || 'N/A'} />
          <DetailRow label="Target Gender" value={campaignData.audience?.gender || 'Any'} />
        </div>
      </div>
    </div>
  );
}
