/**
 * Mock replacements for Firebase Admin SDK.
 * getMockDb(), getMockAuth(), getMockStorage() are drop-in substitutes
 * for the real getAdminDb(), getAdminAuth(), getAdminStorage() in admin.ts.
 *
 * Uses the global object cache pattern so data survives Next.js hot reloads.
 */
import {
  MockFirestore,
  MockTimestamp,
  MockFieldValue,
  MockFieldPath,
} from './mock-firestore';
import { seedMockData } from './seed';

// Persist across hot reloads in dev
const globalForMock = global as typeof globalThis & {
  _mockDb?: MockFirestore;
  _mockSeeded?: boolean;
};

export function getMockDb(): MockFirestore {
  if (!globalForMock._mockDb) {
    globalForMock._mockDb = new MockFirestore();
  }

  // Seed on first access — but only if no persisted JSON files exist on disk
  if (!globalForMock._mockSeeded) {
    globalForMock._mockSeeded = true;
    if (globalForMock._mockDb._hasPersistedData()) {
      console.log('[MockMode] Loaded persisted data from mock-data/ (skipping seed)');
    } else {
      seedMockData(globalForMock._mockDb);
      globalForMock._mockDb._persist();
      console.log('[MockMode] Seeded demo data and persisted to mock-data/');
    }
  }

  return globalForMock._mockDb;
}

/**
 * Mock Auth that supports verifyIdToken for mock tokens.
 * Token format: "mock-token-{uid}"
 */
export function getMockAuth(): any {
  return {
    verifyIdToken: async (token: string) => {
      // Parse uid from mock token
      const match = token.match(/^mock-token-(.+)$/);
      if (!match) {
        throw new Error(`Invalid mock token: ${token}`);
      }
      const uid = match[1];
      const now = Math.floor(Date.now() / 1000);
      return {
        uid,
        aud: 'mock-project',
        auth_time: now,
        exp: now + 3600,
        iat: now,
        iss: 'https://securetoken.google.com/mock-project',
        sub: uid,
        email: uid.includes('brand') ? 'brand@demo.heycreator.com' : 'creator@demo.heycreator.com',
        firebase: {
          identities: {},
          sign_in_provider: 'custom',
        },
      };
    },

    getUser: async (uid: string) => {
      return {
        uid,
        email: uid.includes('brand') ? 'brand@demo.heycreator.com' : 'creator@demo.heycreator.com',
        emailVerified: true,
        displayName: uid.includes('brand') ? 'Demo Brand' : 'Demo Creator',
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
      };
    },

    getUserByEmail: async (email: string) => {
      const isBrand = email.includes('brand');
      return {
        uid: isBrand ? 'mock-brand-user-1' : 'mock-influencer-user-1',
        email,
        emailVerified: true,
        displayName: isBrand ? 'Demo Brand' : 'Demo Creator',
        disabled: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
      };
    },

    createCustomToken: async (uid: string) => {
      return `mock-custom-token-${uid}`;
    },

    updateUser: async (_uid: string, _data: any) => {
      // No-op in mock mode
    },
  };
}

/**
 * Mock Storage — returns a no-op bucket.
 */
export function getMockStorage(): any {
  return {
    bucket: (name?: string) => ({
      file: (path: string) => ({
        save: async (_data: any, _options?: any) => {},
        delete: async () => {},
        getSignedUrl: async (_options: any) => [`/mock-uploads/${path}`],
        exists: async () => [true],
        download: async () => [Buffer.from('')],
        name: path,
      }),
      upload: async (localPath: string, options?: any) => {
        const dest = options?.destination || localPath;
        return [{
          name: dest,
          metadata: { name: dest, size: 0 },
        }];
      },
    }),
  };
}

// Re-export mock utilities so admin.ts can expose them
export { MockTimestamp, MockFieldValue, MockFieldPath };
