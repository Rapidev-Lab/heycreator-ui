'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { Campaign } from '@/types/campaign';
import { PrimaryButton, OutlineButton, InputField, SelectField } from '@/components/auth';
import DateField from '@/components/campaigns/DateField';
import VisibilitySelector from '@/components/campaigns/VisibilitySelector';
import { ArrowLeft, Loader, Save } from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import DocumentUploadZone from '@/components/campaigns/DocumentUploadZone';
import DocumentList from '@/components/campaigns/DocumentList';

const paymentTermOptions = [
  'Payment on Completion',
  '50% Upfront, 50% on Completion',
  'Milestone Based Payments',
  'Payment after Publication'
].map(term => ({ value: term, label: term }));

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { user, firebaseUser } = useAuth();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const campaignLoadedRef = useRef(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    deliverables: '',
    paymentTerms: 'Payment on Completion',
    productCategory: '',
    productName: '',
    budgetFrom: '',
    budgetTo: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    visibility: 'public' as 'public' | 'private',
    minFollowers: 1000,
    minEngagementRate: 3.0,
    languages: 'English',
  });

  useEffect(() => {
    if (id && user && firebaseUser) {
      if (!campaignLoadedRef.current) {
        campaignLoadedRef.current = true;
        fetchCampaign();
      }
    }
  }, [id, user, firebaseUser]);

  // Helper to convert Firestore Timestamp or Date to Date object
  const toDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate && typeof value.toDate === 'function') return value.toDate();
    if (value.seconds) return new Date(value.seconds * 1000);
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return null;
  };

  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (value: any): string => {
    const date = toDate(value);
    if (!date || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await res.json();
      const camp = data.data.campaign;
      setCampaign(camp);

      // Pre-fill form with existing data (new Campaign structure)
      setFormData({
        title: camp.campaignTitle || '',
        description: camp.description || '',
        objectives: Array.isArray(camp.campaignObjectives) ? camp.campaignObjectives.join(', ') : '',
        deliverables: camp.tasks?.requiredDeliverables?.map((d: any) => `1x ${d.platform} ${d.type}`).join(', ') || '',
        paymentTerms: camp.budget?.paymentTerms || 'Payment on Completion',
        productCategory: camp.campaignCategories?.[0] || camp.campaignProduct?.productType || '',
        productName: camp.campaignProduct?.productName || '',
        budgetFrom: camp.budget?.minRangeAmount?.toString() || camp.budget?.fixedAmount?.toString() || '',
        budgetTo: camp.budget?.maxRangeAmount?.toString() || camp.budget?.fixedAmount?.toString() || '',
        startDate: formatDateForInput(camp.campaignStart),
        endDate: formatDateForInput(camp.campaignEnd),
        applicationDeadline: formatDateForInput(camp.budget?.applicationDeadline),
        visibility: camp.campaignVisibility || 'public',
        minFollowers: camp.audience?.minFollowers || 1000,
        minEngagementRate: camp.audience?.minEngagements || 3.0,
        languages: 'English',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firebaseUser || !campaign) return;

    try {
      setSaving(true);
      const token = await firebaseUser.getIdToken();

      // Transform data to match API expectations (new Campaign structure)
      const updateData = {
        campaignTitle: formData.title,
        description: formData.description,
        campaignObjectives: formData.objectives.split(',').map((o: string) => o.trim()).filter(Boolean),
        campaignCategories: formData.productCategory ? [formData.productCategory] : [],
        campaignVisibility: formData.visibility,
        campaignProduct: {
          ...campaign.campaignProduct,
          productName: formData.productName,
          productType: formData.productCategory,
        },
        budget: {
          ...campaign.budget,
          compensationModel: formData.budgetFrom !== formData.budgetTo ? 'range' : 'fixed',
          fixedAmount: Number(formData.budgetFrom || 0),
          minRangeAmount: Number(formData.budgetFrom || 0),
          maxRangeAmount: Number(formData.budgetTo || formData.budgetFrom || 0),
          currency: 'ZAR',
          paymentTerms: formData.paymentTerms,
          applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : null,
        },
        campaignStart: formData.startDate ? new Date(formData.startDate) : null,
        campaignEnd: formData.endDate ? new Date(formData.endDate) : null,
        audience: {
          ...campaign.audience,
          minFollowers: formData.minFollowers,
          minEngagements: formData.minEngagementRate,
        },
      };

      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      // Redirect back to campaign detail page
      router.push(`/brands/campaigns/${id}/dashboard`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-brand-navy mx-auto" />
          <p className="mt-4 text-gray-600">Loading Campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error: {error || 'Campaign not found'}</p>
          <button
            onClick={() => router.push('/brands/dashboard')}
            className="mt-4 text-brand-navy hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-100">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <button
                onClick={() => router.push(`/brands/campaigns/${id}/dashboard`)}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
              <p className="text-gray-600 mt-2">Update your campaign details</p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              {/* Core Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800">Core Details</h2>
                <InputField
                  label="Campaign Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Fashion Campaign 2024"
                />
                <InputField
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your campaign"
                  isTextArea
                />
                <InputField
                  label="Campaign Objectives *"
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  placeholder="What do you want to achieve?"
                  isTextArea
                />
                <InputField
                  label="Deliverables (comma-separated) *"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="e.g., 3 Instagram posts, 2 TikTok videos"
                />
              </div>

              {/* Product & Budget */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Product & Budget</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Product Category"
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                    placeholder="e.g., Fashion, Beauty, Tech"
                  />
                  <InputField
                    label="Product Name"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="Specific product"
                  />
                </div>
                <SelectField
                  label="Payment Terms *"
                  value={formData.paymentTerms}
                  onChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                  options={paymentTermOptions}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Budget Range (ZAR) - From *"
                    type="number"
                    value={formData.budgetFrom}
                    onChange={(e) => setFormData({ ...formData, budgetFrom: e.target.value })}
                  />
                  <InputField
                    label="Budget Range (ZAR) - To *"
                    type="number"
                    value={formData.budgetTo}
                    onChange={(e) => setFormData({ ...formData, budgetTo: e.target.value })}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateField
                    label="Start Date *"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                  <DateField
                    label="End Date *"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <DateField
                  label="Application Deadline *"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  required
                />
              </div>

              {/* Targeting */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Targeting</h2>
                <VisibilitySelector
                  value={formData.visibility}
                  onChange={(value) => setFormData({ ...formData, visibility: value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Min Followers"
                    type="number"
                    value={formData.minFollowers.toString()}
                    onChange={(e) => setFormData({ ...formData, minFollowers: Number(e.target.value) })}
                  />
                  <InputField
                    label="Min Engagement Rate (%)"
                    type="number"
                    value={formData.minEngagementRate.toString()}
                    onChange={(e) => setFormData({ ...formData, minEngagementRate: Number(e.target.value) })}
                  />
                  <InputField
                    label="Language"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g., English, Zulu"
                  />
                </div>
              </div>

              {/* Document Management */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Documents & Attachments</h2>
                <p className="text-sm text-gray-600">
                  Upload campaign briefs, brand guidelines, product images, or any other relevant documents.
                  Supported formats: PDF, DOC, XLS, PPT, TXT, CSV, and images (max 10MB per file).
                </p>

                {/* Upload Zone */}
                <DocumentUploadZone
                  campaignId={id}
                  onUploadSuccess={() => setRefreshDocuments(prev => prev + 1)}
                />

                {/* Document List */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
                  <DocumentList campaignId={id} refreshTrigger={refreshDocuments} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <OutlineButton
                  onClick={() => router.push(`/brands/campaigns/${id}/dashboard`)}
                  className="w-auto"
                >
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  onClick={handleSave}
                  loading={saving}
                  className="w-auto inline-flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}
