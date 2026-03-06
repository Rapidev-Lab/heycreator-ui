'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Target, Users, TrendingUp, Mail, MessageSquare } from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import PageLoader from '@/components/ui/PageLoader';

function RecruitPageContent() {
  const router = useRouter();

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Targeted Outreach',
      description: 'Find and connect with influencers that align with your brand values and audience.'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Campaigns',
      description: 'Create personalized email campaigns to reach potential brand ambassadors.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Direct Messaging',
      description: 'Communicate directly with influencers through integrated messaging tools.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Performance Tracking',
      description: 'Monitor recruitment success rates and optimize your outreach strategy.'
    }
  ];

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Recruit</h1>
            <p className="text-sm text-gray-600 mt-1">
              Find and connect with influencers to build lasting partnerships.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand-navy to-[#003580] rounded-lg p-8 mb-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Influencer Recruitment</h2>
                  <p className="text-blue-100 mt-1">Build your creator network</p>
                </div>
              </div>
              <p className="text-blue-50 leading-relaxed">
                Streamline your influencer recruitment process with powerful tools designed
                to help you discover, reach out, and onboard the perfect creators for your campaigns.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-brand-navy">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <Users className="w-12 h-12 text-brand-navy mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to start recruiting?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Discover influencers who match your brand and start building meaningful partnerships today.
              </p>
              <button
                onClick={() => router.push('/brands/discover')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
              >
                <Target className="w-5 h-5" />
                Discover Influencers
              </button>
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function RecruitPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RecruitPageContent />
    </Suspense>
  );
}
