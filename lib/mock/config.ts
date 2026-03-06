/**
 * Mock mode configuration helper.
 * Checks the NEXT_PUBLIC_MOCK_MODE environment variable.
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
}
