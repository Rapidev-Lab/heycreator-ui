/**
 * Mock mode configuration helper.
 * Checks the NEXT_PUBLIC_MOCK_MODE environment variable.
 * Falls back to mock mode if Firebase config is missing (e.g. on Vercel without env vars).
 */
export function isMockMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}
