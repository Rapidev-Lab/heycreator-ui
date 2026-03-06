import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

interface FirebaseAdminConfig {
  credential: admin.credential.Credential;
  databaseURL?: string;
  storageBucket?: string;
}

// Use global to persist across hot reloads in development
const globalForFirebase = global as typeof globalThis & {
  _firebaseApp?: admin.app.App;
  _firebaseDb?: admin.firestore.Firestore;
  _firebaseAuth?: admin.auth.Auth;
  _firebaseStorage?: admin.storage.Storage;
  _firebaseInitError?: Error;
  _firestoreSettingsApplied?: boolean;
};

let _app: admin.app.App | null = globalForFirebase._firebaseApp || null;
let _db: admin.firestore.Firestore | null = globalForFirebase._firebaseDb || null;
let _auth: admin.auth.Auth | null = globalForFirebase._firebaseAuth || null;
let _storage: admin.storage.Storage | null = globalForFirebase._firebaseStorage || null;
let _initError: Error | null = globalForFirebase._firebaseInitError || null;

const initializeFirebaseAdmin = (): admin.app.App => {
  // Return existing app if already initialized
  if (_app) {
    return _app;
  }

  // If there was a previous init error, throw it
  if (_initError) {
    throw _initError;
  }

  // Check if already initialized by another module
  if (admin.apps.length > 0) {
    _app = admin.apps[0] as admin.app.App;
    globalForFirebase._firebaseApp = _app;
    return _app;
  }

  // First, try to use environment variables (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    console.log('Initializing Firebase Admin SDK with environment variable...');
    try {
      const serviceAccountString = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountString);

      const config: FirebaseAdminConfig = {
        credential: admin.credential.cert(serviceAccount),
      };

      if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
        config.databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
      }

      if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        config.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      }

      _app = admin.initializeApp(config);
      globalForFirebase._firebaseApp = _app;
      return _app;
    } catch (error) {
      console.error('Error initializing Firebase Admin with service account from env var:', error);
      // Fallback to file-based method if env var fails
    }
  }

  // Second, try to use a service account file (for local development)
  const serviceAccountPath = path.join(process.cwd(), 'scripts', 'heycreator-service-account.json');

  // Check if file exists before trying to require it
  if (fs.existsSync(serviceAccountPath)) {
    console.log(`Initializing Firebase Admin SDK with file: ${serviceAccountPath}`);
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      const config: FirebaseAdminConfig = {
        credential: admin.credential.cert(serviceAccount),
      };

      if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
        config.databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
      }

      if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
        config.storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      }

      _app = admin.initializeApp(config);
      globalForFirebase._firebaseApp = _app;
      return _app;
    } catch (error) {
      console.error('Error initializing Firebase Admin with service account file:', error);
      _initError = error as Error;
      globalForFirebase._firebaseInitError = _initError;
      throw error;
    }
  }

  // No valid configuration found
  const error = new Error(
    '❌ Failed to initialize Firebase Admin SDK.\n' +
    'Please ensure you have a valid service account configuration.\n' +
    'Set FIREBASE_SERVICE_ACCOUNT_BASE64 env var or place heycreator-service-account.json in /scripts.'
  );

  console.error(error.message);
  _initError = error;
  globalForFirebase._firebaseInitError = error;
  throw error;
};

// Lazy getters that initialize on first access
export const getAdminApp = (): admin.app.App => {
  if (!_app) {
    _app = initializeFirebaseAdmin();
    globalForFirebase._firebaseApp = _app;
  }
  return _app;
};

export const getAdminDb = (): admin.firestore.Firestore => {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    const { getMockDb } = require('@/lib/mock/mock-admin');
    return getMockDb() as any;
  }
  if (!_db) {
    _db = admin.firestore(getAdminApp());
    globalForFirebase._firebaseDb = _db;

    // Configure Firestore to ignore undefined values - only call once globally
    if (!globalForFirebase._firestoreSettingsApplied) {
      try {
        _db.settings({ ignoreUndefinedProperties: true });
        globalForFirebase._firestoreSettingsApplied = true;
      } catch (error) {
        // Settings already applied in a previous instance, this is safe to ignore
        globalForFirebase._firestoreSettingsApplied = true;
      }
    }
  }
  return _db;
};

export const getAdminAuth = (): admin.auth.Auth => {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    const { getMockAuth } = require('@/lib/mock/mock-admin');
    return getMockAuth() as any;
  }
  if (!_auth) {
    _auth = admin.auth(getAdminApp());
    globalForFirebase._firebaseAuth = _auth;
  }
  return _auth;
};

export const getAdminStorage = (): admin.storage.Storage => {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    const { getMockStorage } = require('@/lib/mock/mock-admin');
    return getMockStorage() as any;
  }
  if (!_storage) {
    _storage = admin.storage(getAdminApp());
    globalForFirebase._firebaseStorage = _storage;
  }
  return _storage;
};

// Export lazy initialized instances
// These will only initialize when actually accessed at runtime, not during build
export const adminApp = getAdminApp;
export const adminDb = getAdminDb;
export const adminAuth = getAdminAuth;
export const adminStorage = getAdminStorage;

// Create Proxy objects that lazily initialize on first property access
// This allows routes to use firestore.collection() syntax while maintaining lazy loading
const createLazyProxy = <T extends object>(getter: () => T): T => {
  return new Proxy({} as T, {
    get(_, prop) {
      const instance = getter();
      return (instance as any)[prop];
    },
  });
};

// Convenience exports for backwards compatibility
// These are Proxy objects that initialize on first use
export const auth = createLazyProxy(getAdminAuth);
export const db = createLazyProxy(getAdminDb);
export const firestore = createLazyProxy(getAdminDb);
export const app = createLazyProxy(getAdminApp);
export const storageAdmin = createLazyProxy(getAdminStorage);

// Export FieldValue for Firestore operations
export const FieldValue = admin.firestore.FieldValue;
