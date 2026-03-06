'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, BarChart3, Bell, TrendingUp, Users, Activity } from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';
import PageLoader from '@/components/ui/PageLoader';

function MonitorPageContent() {
  const router = useRouter();

  const features = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Real-time Tracking',
      description: 'Monitor campaign performance and influencer activity in real-time.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Performance Analytics',
      description: 'Comprehensive analytics dashboards with detailed insights and metrics.'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Alerts',
      description: 'Get notified about important campaign milestones and performance changes.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Trend Analysis',
      description: 'Identify trends and patterns to optimize future campaigns.'
    }
  ];

  return (
    <ProfileCompletionGuard showLoading={false}>
      <EmailVerificationGuard>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Monitor</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track campaign performance and influencer engagement in real-time.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-brand-navy to-[#003580] rounded-lg p-8 mb-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <Eye className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Campaign Monitoring</h2>
                  <p className="text-blue-100 mt-1">Stay on top of your campaigns</p>
                </div>
              </div>
              <p className="text-blue-50 leading-relaxed">
                Keep a close eye on your influencer marketing campaigns with comprehensive
                monitoring tools that provide real-time insights and actionable data.
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
                    <div className="bg-purple-50 p-3 rounded-lg text-brand-navy">
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
                Start monitoring your campaigns
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                View detailed analytics and track the performance of your active campaigns and influencer partnerships.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/brands/campaigns')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Campaigns
                </button>
                <button
                  onClick={() => router.push('/brands/analytics')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <TrendingUp className="w-5 h-5" />
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}

export default function MonitorPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MonitorPageContent />
    </Suspense>
  );
}
