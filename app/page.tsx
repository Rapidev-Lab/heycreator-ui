'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Building2 } from 'lucide-react';
import RoleCard from '@/components/RoleCard';
import Logo from '@/components/auth/Logo';
import { useAuth } from '@/lib/context/AuthContext';

const users = <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18" fill="none">
  <path d="M15.9976 16.9973H20.9968V14.9976C20.9968 14.3743 20.8025 13.7664 20.4411 13.2585C20.0796 12.7507 19.5689 12.368 18.9799 12.1638C18.3909 11.9596 17.753 11.944 17.1547 12.1191C16.5564 12.2942 16.0276 12.6514 15.6417 13.1409M15.9976 16.9973H5.99921M15.9976 16.9973V14.9976C15.9976 14.3417 15.8716 13.7148 15.6417 13.1409M15.6417 13.1409C15.2704 12.213 14.6296 11.4177 13.802 10.8574C12.9743 10.2972 11.9978 9.99772 10.9984 9.99772C9.99899 9.99772 9.02249 10.2972 8.19486 10.8574C7.36724 11.4177 6.72645 12.213 6.35515 13.1409M5.99921 16.9973H1V14.9976C1.00005 14.3743 1.1943 13.7664 1.55577 13.2585C1.91724 12.7507 2.42796 12.368 3.01693 12.1638C3.6059 11.9596 4.24386 11.944 4.84213 12.1191C5.4404 12.2942 5.96924 12.6514 6.35515 13.1409M5.99921 16.9973V14.9976C5.99921 14.3417 6.12519 13.7148 6.35515 13.1409M13.9979 3.99937C13.9979 4.7949 13.6819 5.55784 13.1194 6.12036C12.5569 6.68288 11.7939 6.9989 10.9984 6.9989C10.2029 6.9989 9.43995 6.68288 8.87743 6.12036C8.31491 5.55784 7.99889 4.7949 7.99889 3.99937C7.99889 3.20385 8.31491 2.44091 8.87743 1.87839C9.43995 1.31587 10.2029 0.999847 10.9984 0.999847C11.7939 0.999847 12.5569 1.31587 13.1194 1.87839C13.6819 2.44091 13.9979 3.20385 13.9979 3.99937ZM19.997 6.9989C19.997 7.52925 19.7863 8.03787 19.4113 8.41289C19.0363 8.7879 18.5277 8.99858 17.9973 8.99858C17.467 8.99858 16.9583 8.7879 16.5833 8.41289C16.2083 8.03787 15.9976 7.52925 15.9976 6.9989C15.9976 6.46855 16.2083 5.95992 16.5833 5.58491C16.9583 5.20989 17.467 4.99921 17.9973 4.99921C18.5277 4.99921 19.0363 5.20989 19.4113 5.58491C19.7863 5.95992 19.997 6.46855 19.997 6.9989ZM5.99921 6.9989C5.99921 7.52925 5.78853 8.03787 5.41351 8.41289C5.0385 8.7879 4.52987 8.99858 3.99953 8.99858C3.46918 8.99858 2.96055 8.7879 2.58554 8.41289C2.21052 8.03787 1.99984 7.52925 1.99984 6.9989C1.99984 6.46855 2.21052 5.95992 2.58554 5.58491C2.96055 5.20989 3.46918 4.99921 3.99953 4.99921C4.52987 4.99921 5.0385 5.20989 5.41351 5.58491C5.78853 5.95992 5.99921 6.46855 5.99921 6.9989Z" stroke="#666666" stroke-width="1.99968" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

const brands = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M16.9975 18.997V2.9995C16.9975 2.46915 16.7868 1.96052 16.4118 1.58551C16.0368 1.2105 15.5281 0.999817 14.9978 0.999817H4.99937C4.46902 0.999817 3.96039 1.2105 3.58538 1.58551C3.21036 1.96052 2.99968 2.46915 2.99968 2.9995V18.997M16.9975 18.997H18.9972M16.9975 18.997H11.9983M2.99968 18.997H1M2.99968 18.997H7.99889M11.9983 18.997V13.9978C11.9983 13.7326 11.8929 13.4783 11.7054 13.2908C11.5179 13.1033 11.2636 12.9979 10.9984 12.9979H8.99873C8.73356 12.9979 8.47925 13.1033 8.29174 13.2908C8.10423 13.4783 7.99889 13.7326 7.99889 13.9978V18.997M11.9983 18.997H7.99889M6.99905 4.99918H7.99889M6.99905 8.99855H7.99889M11.9983 4.99918H12.9981M11.9983 8.99855H12.9981" stroke="#666666" stroke-width="1.99968" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

export default function RoleSelection() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.role === 'influencer') {
        router.push('/influencers');
      } else if (userProfile.role === 'brand') {
        router.push('/brands/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleRoleSelect = (role: 'influencer' | 'brand') => {
    console.log('Role selected:', role);
    // Set user type in session storage for tracking
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userType', role);
    }

    // Redirect directly to login page
    console.log('Navigating to:', `/auth/${role}/login`);
    router.push(`/auth/${role}/login`);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-navy mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl w-full">
        {/* Logo and tagline */}
        <div className="text-left mb-8 md:mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy-dark mb-2">
            Connect. Collaborate.
          </h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="text-brand-navy-dark">Create. </span>
            <span className="text-[#0075FF]">Convert.</span>
          </h1>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          <RoleCard
            icon={Users}
            title="I'm a Creator"
            description="Join to collaborate with brands, grow your audience, and monetize your content across platforms"
            onClick={() => handleRoleSelect('influencer')}
          />
          <RoleCard
            icon={Building2}
            title="I'm a Brand"
            description="Find and manage influencers for your campaigns, track performance, and maximize ROI"
            onClick={() => handleRoleSelect('brand')}
          />
        </div>
      </div>
    </div>
  );
}
