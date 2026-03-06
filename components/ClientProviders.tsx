'use client';

import { AuthProvider } from '@/lib/firebase/auth-context';
import { MockAuthProvider } from '@/lib/mock/mock-auth-context';
import { BrandSignupProvider } from '@/lib/contexts/BrandSignupContext';
import { PhoneAuthContextProvider } from '@/lib/contexts/PhoneAuthContext';
import { ToastProvider } from '@/components/ui/ToastContainer';
import MockDevToolbar from '@/components/MockDevToolbar';

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
const Provider = isMockMode ? MockAuthProvider : AuthProvider;

/**
 * Client-side providers wrapper
 * This component wraps all client-side context providers
 */
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <BrandSignupProvider>
        <PhoneAuthContextProvider>
          <ToastProvider>
            {children}
            {isMockMode && <MockDevToolbar />}
          </ToastProvider>
        </PhoneAuthContextProvider>
      </BrandSignupProvider>
    </Provider>
  );
}
