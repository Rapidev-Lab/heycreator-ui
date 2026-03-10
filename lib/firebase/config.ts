import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Safety check: do we have a valid Firebase API key?
const hasValidFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Only initialize Firebase in the browser, not during SSR or build
let app: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseDb: Firestore | undefined;
let firebaseStorage: FirebaseStorage | undefined;

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

if (isBrowser && !isMockMode && hasValidFirebaseConfig) {
  // Initialize Firebase only in the browser, not in mock mode, and only with valid config
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firebaseAuth = getAuth(app);
    firebaseDb = getFirestore(app);
    firebaseStorage = getStorage(app);
  } catch (err) {
    console.warn('[Firebase] Failed to initialize:', err);
  }
} else if (isBrowser && !isMockMode && !hasValidFirebaseConfig) {
  console.warn(
    '[Firebase] Missing API key or project ID. Firebase will not be initialized. ' +
    'Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID, ' +
    'or enable mock mode with NEXT_PUBLIC_MOCK_MODE=true.'
  );
}

// In mock mode (or when Firebase config is missing), provide a stub auth object
// so imports of `auth` don't crash. Login pages import `auth` directly for
// firebaseSignOut(auth), etc.
const mockAuth = {
  signOut: async () => {},
  currentUser: null,
  onAuthStateChanged: () => () => {},
} as unknown as Auth;

const mockDb = {} as Firestore;
const mockStorage = {} as FirebaseStorage;

// Export the instances (will be undefined during SSR/build, initialized in browser)
const useMocks = isMockMode || !hasValidFirebaseConfig;
export const auth = useMocks ? mockAuth : (firebaseAuth as Auth);
export const db = useMocks ? mockDb : (firebaseDb as Firestore);
export const storage = useMocks ? mockStorage : (firebaseStorage as FirebaseStorage);

// Export the app instance
export default app;
