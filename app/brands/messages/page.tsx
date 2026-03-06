'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import PageLoader from '@/components/ui/PageLoader';

function MessagesPageContent() {
  const router = useRouter();

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/brands/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            {/* Coming Soon Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="inline-block bg-cyan-50 p-6 rounded-full mb-6">
                <MessageSquare className="w-16 h-16 text-brand-navy" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Messages
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Direct messaging with influencers is coming soon! Chat with creators, discuss campaigns, and collaborate seamlessly.
              </p>

              <button
                onClick={() => router.push('/brands/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MessagesPageContent />
    </Suspense>
  );
}
