'use client';

/**
 * AuthContext Compatibility Layer
 *
 * This file provides backward compatibility by re-exporting
 * the comprehensive Firebase auth context.
 *
 * All new code should import from '@/lib/firebase/auth-context'
 * but this ensures existing imports from '@/lib/context/AuthContext' still work.
 */

export {
  AuthProvider,
  useAuth,
  useIsAuthenticated,
  useUserRole,
  useIsInfluencer,
  useIsBrand,
} from '@/lib/firebase/auth-context';

// Type re-exports for compatibility
export type { UserRole } from '@/types/firebase';
