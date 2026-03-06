'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleGoHome = () => {
    if (userProfile?.role === 'influencer') {
      router.push('/influencers/profiles');
    } else if (userProfile?.role === 'brand') {
      router.push('/brands/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-50"></div>
            <div className="relative bg-red-50 p-4 rounded-full">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          You don&apos;t have permission to access this page.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          This page is restricted to specific user roles. If you believe this is an error, please contact support.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-navy-light transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <p className="text-sm font-medium text-blue-900 mb-1">
            💡 Need Access?
          </p>
          <p className="text-sm text-blue-800">
            Different features are available based on your account type (Influencer or Brand). Make sure you&apos;re logged in with the correct account.
          </p>
        </div>
      </div>
    </div>
  );
}
