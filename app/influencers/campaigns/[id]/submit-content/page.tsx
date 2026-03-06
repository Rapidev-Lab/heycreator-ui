'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Hash,
  FileText
} from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';

export default function SubmitContentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useAuth();

  const campaignId = params.id as string;
  const applicationId = searchParams.get('applicationId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Campaign data
  const [campaign, setCampaign] = useState<any>(null);

  // Form data
  const [deliverableType, setDeliverableType] = useState('');
  const [platform, setPlatform] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);

  useEffect(() => {
    if (campaignId && firebaseUser) {
      fetchCampaign();
    }
  }, [campaignId, firebaseUser]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const token = await firebaseUser?.getIdToken();

      const response = await fetch(`/api/influencers/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      setCampaign(data.data.campaign);

      // Auto-select first deliverable and platform if only one option
      if (data.data.campaign.deliverables?.length === 1) {
        setDeliverableType(data.data.campaign.deliverables[0].type);
      }
      if (data.data.campaign.requirements?.platforms?.length === 1) {
        setPlatform(data.data.campaign.requirements.platforms[0]);
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag.startsWith('#') ? tag : `#${tag}`]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId) {
      setError('Application ID is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = await firebaseUser?.getIdToken();

      const response = await fetch('/api/deliverables', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          deliverableType,
          platform,
          contentUrl,
          caption: caption || undefined,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          contentScreenshots: screenshots.length > 0 ? screenshots : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit content');
      }

      setSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/influencers/campaigns?tab=applications');
      }, 2000);
    } catch (err) {
      console.error('Error submitting content:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit content');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-brand-navy mx-auto" />
              <p className="mt-4 text-gray-600">Loading campaign details...</p>
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    );
  }

  if (!campaign) {
    return (
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
              <p className="text-gray-600 mb-4">The campaign you&apos;re looking for doesn&apos;t exist.</p>
              <button
                onClick={() => router.push('/influencers/campaigns?tab=applications')}
                className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    );
  }

  if (success) {
    return (
      <ProfileCompletionGuard>
        <EmailVerificationGuard>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Submitted!</h2>
              <p className="text-gray-600 mb-4">
                Your content has been submitted successfully. The brand will review it soon.
              </p>
              <p className="text-sm text-gray-500">Redirecting to your applications...</p>
            </div>
          </div>
        </EmailVerificationGuard>
      </ProfileCompletionGuard>
    );
  }

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Submit Content</h1>
              <p className="text-gray-600 mt-2">
                Submit your completed content for <span className="font-semibold">{campaign.title}</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 space-y-6">
                {/* Deliverable Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Deliverable Type *
                  </label>
                  <select
                    value={deliverableType}
                    onChange={(e) => setDeliverableType(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                  >
                    <option value="">Select deliverable type</option>
                    {campaign.deliverables?.map((d: any, index: number) => (
                      <option key={index} value={d.type}>
                        {d.type} {d.quantity > 1 && `(${d.quantity})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Platform *
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                  >
                    <option value="">Select platform</option>
                    {campaign.requirements?.platforms?.map((p: string) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Content URL *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://instagram.com/p/..."
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Link to your published post
                  </p>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Caption (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Your post caption..."
                      rows={4}
                      maxLength={2000}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {caption.length}/2000
                  </p>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Hashtags (Optional)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                        placeholder="Add hashtag"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHashtag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveHashtag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Screenshots - Placeholder for file upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Screenshots (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      File upload coming soon
                    </p>
                    <p className="text-xs text-gray-500">
                      For now, you can add screenshot URLs in the future
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !deliverableType || !platform || !contentUrl}
                  className="px-6 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Content
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}
