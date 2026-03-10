'use client';

import React from 'react';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { MockAuthProvider } from '@/lib/mock/mock-auth-context';
import { BrandSignupProvider } from '@/lib/contexts/BrandSignupContext';
import { PhoneAuthContextProvider } from '@/lib/contexts/PhoneAuthContext';
import { ToastProvider } from '@/components/ui/ToastContainer';
import MockDevToolbar from '@/components/MockDevToolbar';

// Detect mock mode: explicitly enabled OR Firebase config is missing.
// NEXT_PUBLIC_ env vars are inlined at build time by Next.js.
// When deploying to Vercel without Firebase credentials, we fall back to mock mode.
const isMockMode =
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const Provider = isMockMode ? MockAuthProvider : AuthProvider;

/**
 * Error boundary to prevent blank pages when a provider throws.
 */
class ProviderErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ClientProviders] Rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          background: '#f9fafb',
        }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#001F54', marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>
              The application failed to load. Please try refreshing the page.
            </p>
            <pre style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 13,
              textAlign: 'left',
              overflow: 'auto',
              maxHeight: 200,
              marginBottom: 16,
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#001F54',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ProviderErrorBoundary>
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
    </ProviderErrorBoundary>
  );
}
