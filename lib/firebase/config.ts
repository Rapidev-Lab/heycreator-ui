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

// Only initialize Firebase in the browser, not during SSR or build
let app: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseDb: Firestore | undefined;
let firebaseStorage: FirebaseStorage | undefined;

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

if (isBrowser && !isMockMode) {
  // Initialize Firebase only in the browser and not in mock mode
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  firebaseAuth = getAuth(app);
  firebaseDb = getFirestore(app);
  firebaseStorage = getStorage(app);
}

// In mock mode, provide a stub auth object so imports of `auth` don't crash.
// Login pages import `auth` directly for firebaseSignOut(auth), etc.
const mockAuth = {
  signOut: async () => {},
  currentUser: null,
  onAuthStateChanged: () => () => {},
} as unknown as Auth;

// Export the instances (will be undefined during SSR/build, initialized in browser)
export const auth = isMockMode ? mockAuth : (firebaseAuth as Auth);
export const db = firebaseDb as Firestore;
export const storage = firebaseStorage as FirebaseStorage;

// Export the app instance
export default app;
