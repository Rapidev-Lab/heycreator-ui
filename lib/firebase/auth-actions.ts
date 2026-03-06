import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider as FirebaseOAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  UserCredential,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import {
  User,
  UserRole,
  AuthProvider as AuthProviderType,
  InfluencerProfile,
  BrandProfile,
  InfluencerSignupData,
  BrandSignupData,
  OAuthProvider,
  InstagramBusinessAccount,
  InstagramTokenData,
} from '@/types/firebase';



// ===== HELPER FUNCTIONS =====

/**
 * Generate a unique ID for profiles
 * Firestore automatically generates unique IDs when you create a document reference
 */
const generateProfileId = (): string => {
  // Use collection() to get a collection reference, then doc() without an ID generates a unique one
  return doc(collection(db, 'profiles')).id;
};

/**
 * Check if user document exists
 */
const userExists = async (uid: string): Promise<boolean> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists();
};

/**
 * Get user document data from Firestore
 * Returns the user document or null if not found
 */
const getUserDocument = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }
  return null;
};

/**
 * Update user's last login timestamp
 */
const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Check if email verification is required for a user
 * Social logins bypass verification, email/password requires it
 */
export const requiresEmailVerification = (user: FirebaseUser): boolean => {
  // If already verified, no need to verify again
  if (user.emailVerified) {
    return false;
  }

  // Check if user signed in with a provider other than password
  const providerData = user.providerData || [];
  const hasNonPasswordProvider = providerData.some(
    (provider) => provider.providerId !== 'password'
  );

  // If user has a non-password provider (Google, Facebook, Apple), skip verification
  return !hasNonPasswordProvider;
};

/**
 * Clean and translate Firebase error messages to user-friendly text
 * Removes technical "Firebase: Error (auth/...)" prefixes
 */
export function getFriendlyErrorMessage(error: any): string {
  // If no error code, return generic message
  if (!error || !error.code) {
    return error?.message?.replace(/^Firebase: Error \(auth\/[^)]+\)\. /, '') ||
           'An unexpected error occurred. Please try again.';
  }

  // Map Firebase error codes to user-friendly messages
  const errorMessages: { [key: string]: string } = {
    // Authentication errors
    'auth/invalid-credential': 'The email or password you entered is incorrect. Please try again.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'The password you entered is incorrect.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',

    // Sign up errors
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'auth/weak-password': 'Please choose a stronger password (at least 6 characters).',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',

    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/timeout': 'The request timed out. Please try again.',

    // OAuth errors
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up was blocked by your browser. Please enable pop-ups and try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    'auth/credential-already-in-use': 'This credential is already associated with a different account.',

    // Email verification errors
    'auth/invalid-action-code': 'This verification link is invalid or has already been used.',
    'auth/expired-action-code': 'This verification link has expired. Please request a new one.',

    // Phone auth errors
    'auth/invalid-phone-number': 'Please enter a valid phone number.',
    'auth/missing-phone-number': 'Please enter your phone number.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/invalid-verification-code': 'The verification code is incorrect. Please try again.',
    'auth/invalid-verification-id': 'Verification session expired. Please request a new code.',
    'auth/billing-not-enabled': 'Phone authentication is currently unavailable. Please sign in with email or social login instead.',

    // Role mismatch
    'auth/role-mismatch': 'This email is already registered with a different account type. Please use the correct login page.',

    // Session errors
    'auth/requires-recent-login': 'Please sign out and sign in again to continue.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  };

  // Get the friendly message or return a cleaned version of the original
  return errorMessages[error.code] ||
         error.message?.replace(/^Firebase: Error \(auth\/[^)]+\)\. /, '') ||
         'Something went wrong. Please try again.';
}

/**
 * Update Firestore user document with email verification status
 */
export const syncEmailVerification = async (
  uid: string,
  emailVerified: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      emailVerified,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error syncing email verification:', error);
  }
};

// ===== EMAIL/PASSWORD AUTHENTICATION =====

/**
 * Sign up influencer with email and password
 */
export async function signUpInfluencerWithEmail(
  data: InfluencerSignupData
): Promise<UserCredential> {
  try {
    if (!data.password) {
      throw new Error('Password is required for email signup');
    }

    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const { user } = userCredential;

    // Update display name if provided, otherwise use email
    const displayName = data.displayName || data.email;
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create influencer profile
    const influencerProfileId = generateProfileId();
    await createInfluencerProfile(user.uid, influencerProfileId, {
      displayName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email: data.email,
      role: 'influencer',
      displayName,
      phoneNumber: data.phoneNumber,
      authProvider: 'email',
      influencerProfileId,
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing up influencer:', error);
    throw error;
  }
}

/**
 * Sign up brand with email and password
 */
export async function signUpBrandWithEmail(
  data: BrandSignupData
): Promise<UserCredential> {
  try {
    if (!data.password) {
      throw new Error('Password is required for email signup');
    }

    // Create Firebase auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const { user } = userCredential;

    // Update display name, use email as fallback
    const displayName = data.fullName || data.email;
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create brand profile
    const brandProfileId = generateProfileId();
    await createBrandProfile(user.uid, brandProfileId, data);

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email: data.email,
      role: 'brand',
      displayName,
      authProvider: 'email',
      brandProfileId,
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing up brand:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 * @param role - Optional role to enforce. If provided, checks Firestore user doc
 *               and rejects login if the stored role doesn't match.
 */
export async function signInWithEmail(
  email: string,
  password: string,
  role?: UserRole
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Role check if role is specified
    if (role) {
      const userDoc = await getUserDocument(userCredential.user.uid);
      if (userDoc && userDoc.role !== role) {
        await auth.signOut();
        throw {
          code: 'auth/role-mismatch',
          message: `This email is already registered as ${
            userDoc.role === 'influencer' ? 'a creator' : 'a brand'
          }. Please use the ${userDoc.role} login instead.`,
        };
      }
    }

    // Update last login timestamp
    await updateLastLogin(userCredential.user.uid);

    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// ===== OAUTH AUTHENTICATION =====

/**
 * Sign in with Google (works for both influencers and brands)
 */
export async function signInWithGoogle(
  role: UserRole
): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { user } = userCredential;

    // Check if user already exists
    const exists = await userExists(user.uid);

    if (!exists) {
      // New user - create profile based on role
      const email = user.email || '';
      const displayName = user.displayName || email;

      if (role === 'influencer') {
        const influencerProfileId = generateProfileId();
        await createInfluencerProfile(user.uid, influencerProfileId, {
          displayName,
          email,
        });

        await createUserDocument(user.uid, {
          email,
          role: 'influencer',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'google',
          influencerProfileId,
        });
      } else {
        const brandProfileId = generateProfileId();
        await createBrandProfile(user.uid, brandProfileId, {
          fullName: displayName,
          email,
          companyName: '', // Will need to be filled later
          industry: 'Other',
          companySize: '1-10',
          role: 'Not Specified', // Default value for social auth signups
        } as BrandSignupData);

        await createUserDocument(user.uid, {
          email,
          role: 'brand',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'google',
          brandProfileId,
        });
      }
    } else {
      // Existing user - check state and role
      const existingUserDoc = await getUserDocument(user.uid);

      if (existingUserDoc && existingUserDoc.role !== role) {
        // Role mismatch - always check role first, even for abandoned signups
        await auth.signOut();
        throw {
          code: 'auth/role-mismatch',
          message: `This email is already registered as ${
            existingUserDoc.role === 'influencer' ? 'a creator' : 'a brand'
          }. Please use the ${existingUserDoc.role} login instead.`,
        };
      } else if (existingUserDoc && existingUserDoc.signupComplete === false) {
        // Abandoned email-first signup (same role) - overwrite with fresh social auth profile
        const email = user.email || '';
        const displayName = user.displayName || email;

        if (role === 'influencer') {
          const influencerProfileId = generateProfileId();
          await createInfluencerProfile(user.uid, influencerProfileId, {
            displayName,
            email,
          });
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'influencer',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['google' as AuthProviderType],
            signupComplete: true,
            influencerProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        } else {
          const brandProfileId = generateProfileId();
          await createBrandProfile(user.uid, brandProfileId, {
            fullName: displayName,
            email,
            companyName: '',
            industry: 'Other',
            companySize: '1-10',
            role: 'Not Specified',
          } as BrandSignupData);
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'brand',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['google' as AuthProviderType],
            signupComplete: true,
            brandProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        }
      } else {
        // Role matches, signup complete - update auth provider if needed
        await addAuthProvider(user.uid, 'google');
      }
    }

    // Update last login
    await updateLastLogin(user.uid);

    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

/**
 * Sign in with Facebook (works for both influencers and brands)
 */
export async function signInWithFacebook(
  role: UserRole
): Promise<UserCredential> {
  try {
    const provider = new FacebookAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const { user } = userCredential;

    // Check if user already exists
    const exists = await userExists(user.uid);

    if (!exists) {
      // New user - create profile based on role
      const email = user.email || '';
      const displayName = user.displayName || email;

      if (role === 'influencer') {
        const influencerProfileId = generateProfileId();
        await createInfluencerProfile(user.uid, influencerProfileId, {
          displayName,
          email,
        });

        await createUserDocument(user.uid, {
          email,
          role: 'influencer',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'facebook',
          influencerProfileId,
        });
      } else {
        const brandProfileId = generateProfileId();
        await createBrandProfile(user.uid, brandProfileId, {
          fullName: displayName,
          email,
          companyName: '', // Will need to be filled later
          industry: 'Other',
          companySize: '1-10',
          role: 'Not Specified', // Default value for social auth signups
        } as BrandSignupData);

        await createUserDocument(user.uid, {
          email,
          role: 'brand',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'facebook',
          brandProfileId,
        });
      }
    } else {
      // Existing user - check state and role
      const existingUserDoc = await getUserDocument(user.uid);

      if (existingUserDoc && existingUserDoc.role !== role) {
        // Role mismatch - always check role first, even for abandoned signups
        await auth.signOut();
        throw {
          code: 'auth/role-mismatch',
          message: `This email is already registered as ${
            existingUserDoc.role === 'influencer' ? 'a creator' : 'a brand'
          }. Please use the ${existingUserDoc.role} login instead.`,
        };
      } else if (existingUserDoc && existingUserDoc.signupComplete === false) {
        // Abandoned email-first signup (same role) - overwrite with fresh social auth profile
        const email = user.email || '';
        const displayName = user.displayName || email;

        if (role === 'influencer') {
          const influencerProfileId = generateProfileId();
          await createInfluencerProfile(user.uid, influencerProfileId, {
            displayName,
            email,
          });
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'influencer',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['facebook' as AuthProviderType],
            signupComplete: true,
            influencerProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        } else {
          const brandProfileId = generateProfileId();
          await createBrandProfile(user.uid, brandProfileId, {
            fullName: displayName,
            email,
            companyName: '',
            industry: 'Other',
            companySize: '1-10',
            role: 'Not Specified',
          } as BrandSignupData);
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'brand',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['facebook' as AuthProviderType],
            signupComplete: true,
            brandProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        }
      } else {
        // Role matches, signup complete - update auth provider if needed
        await addAuthProvider(user.uid, 'facebook');
      }
    }

    // Update last login
    await updateLastLogin(user.uid);

    return userCredential;
  } catch (error) {
    console.error('Error signing in with Facebook:', error);
    throw error;
  }
}

/**
 * Sign in with Apple (works for both influencers and brands)
 */
export async function signInWithApple(
  role: UserRole
): Promise<UserCredential> {
  try {
    const provider = new FirebaseOAuthProvider('apple.com');
    // Request user's name and email
    provider.addScope('email');
    provider.addScope('name');

    const userCredential = await signInWithPopup(auth, provider);
    const { user } = userCredential;

    // Check if user already exists
    const exists = await userExists(user.uid);

    if (!exists) {
      // New user - create profile based on role
      const email = user.email || '';
      const displayName = user.displayName || email;

      if (role === 'influencer') {
        const influencerProfileId = generateProfileId();
        await createInfluencerProfile(user.uid, influencerProfileId, {
          displayName,
          email,
        });

        await createUserDocument(user.uid, {
          email,
          role: 'influencer',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'apple',
          influencerProfileId,
        });
      } else {
        const brandProfileId = generateProfileId();
        await createBrandProfile(user.uid, brandProfileId, {
          fullName: displayName,
          email,
          companyName: '', // Will need to be filled later
          industry: 'Other',
          companySize: '1-10',
          role: 'Not Specified', // Default value for social auth signups
        } as BrandSignupData);

        await createUserDocument(user.uid, {
          email,
          role: 'brand',
          displayName,
          photoURL: user.photoURL || undefined,
          authProvider: 'apple',
          brandProfileId,
        });
      }
    } else {
      // Existing user - check state and role
      const existingUserDoc = await getUserDocument(user.uid);

      if (existingUserDoc && existingUserDoc.role !== role) {
        // Role mismatch - always check role first, even for abandoned signups
        await auth.signOut();
        throw {
          code: 'auth/role-mismatch',
          message: `This email is already registered as ${
            existingUserDoc.role === 'influencer' ? 'a creator' : 'a brand'
          }. Please use the ${existingUserDoc.role} login instead.`,
        };
      } else if (existingUserDoc && existingUserDoc.signupComplete === false) {
        // Abandoned email-first signup (same role) - overwrite with fresh social auth profile
        const email = user.email || '';
        const displayName = user.displayName || email;

        if (role === 'influencer') {
          const influencerProfileId = generateProfileId();
          await createInfluencerProfile(user.uid, influencerProfileId, {
            displayName,
            email,
          });
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'influencer',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['apple' as AuthProviderType],
            signupComplete: true,
            influencerProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        } else {
          const brandProfileId = generateProfileId();
          await createBrandProfile(user.uid, brandProfileId, {
            fullName: displayName,
            email,
            companyName: '',
            industry: 'Other',
            companySize: '1-10',
            role: 'Not Specified',
          } as BrandSignupData);
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'brand',
            displayName,
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: true,
            authProviders: ['apple' as AuthProviderType],
            signupComplete: true,
            brandProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        }
      } else {
        // Role matches, signup complete - update auth provider if needed
        await addAuthProvider(user.uid, 'apple');
      }
    }

    // Update last login
    await updateLastLogin(user.uid);

    return userCredential;
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
}

// ===== PASSWORD RESET =====

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// ===== PHONE AUTHENTICATION =====



/**
 * Send OTP to the provided phone number.
 */
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<ConfirmationResult> {
  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    'size': 'invisible',
    'callback': () => {},
    'expired-callback': () => {},
  });
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

/**
 * Confirm the OTP received via SMS.
 */
export async function confirmPhoneVerificationCode(
  confirmationResult: ConfirmationResult,
  otp: string,
  role: UserRole
): Promise<UserCredential> {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    const { user } = userCredential;

    // Check if user already exists in Firestore
    const exists = await userExists(user.uid);

    if (!exists) {
      // New user - create profile based on role
      const email = user.email || `${user.uid}@phone.firebaseapp.com`; // Fallback email
      const displayName = user.displayName || `User-${user.uid.substring(0, 5)}`;

      if (role === 'influencer') {
        const influencerProfileId = generateProfileId();
        await createInfluencerProfile(user.uid, influencerProfileId, {
          displayName,
          email,
          phoneNumber: user.phoneNumber || undefined,
        });

        await createUserDocument(user.uid, {
          email,
          role: 'influencer',
          displayName,
          phoneNumber: user.phoneNumber || undefined,
          photoURL: user.photoURL || undefined,
          authProvider: 'phone',
          influencerProfileId,
        });
      } else {
        const brandProfileId = generateProfileId();
        await createBrandProfile(user.uid, brandProfileId, {
          fullName: displayName,
          email,
          companyName: '',
          industry: 'Other',
          companySize: '1-10',
          role: 'Not Specified', // Default value for social auth signups
        } as BrandSignupData);

        await createUserDocument(user.uid, {
          email,
          role: 'brand',
          displayName,
          phoneNumber: user.phoneNumber || undefined,
          photoURL: user.photoURL || undefined,
          authProvider: 'phone',
          brandProfileId,
        });
      }
    } else {
      // Existing user - check state and role
      const existingUserDoc = await getUserDocument(user.uid);

      if (existingUserDoc && existingUserDoc.role !== role) {
        // Role mismatch - always check role first, even for abandoned signups
        await auth.signOut();
        throw {
          code: 'auth/role-mismatch',
          message: `This email is already registered as ${
            existingUserDoc.role === 'influencer' ? 'a creator' : 'a brand'
          }. Please use the ${existingUserDoc.role} login instead.`,
        };
      } else if (existingUserDoc && existingUserDoc.signupComplete === false) {
        // Abandoned signup (same role) - overwrite with phone auth profile
        const email = user.email || `${user.uid}@phone.firebaseapp.com`;
        const displayName = user.displayName || `User-${user.uid.substring(0, 5)}`;

        if (role === 'influencer') {
          const influencerProfileId = generateProfileId();
          await createInfluencerProfile(user.uid, influencerProfileId, {
            displayName,
            email,
            phoneNumber: user.phoneNumber || undefined,
          });
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'influencer',
            displayName,
            ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: false,
            authProviders: ['phone' as AuthProviderType],
            signupComplete: true,
            influencerProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        } else {
          const brandProfileId = generateProfileId();
          await createBrandProfile(user.uid, brandProfileId, {
            fullName: displayName,
            email,
            companyName: '',
            industry: 'Other',
            companySize: '1-10',
            role: 'Not Specified',
          } as BrandSignupData);
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            role: 'brand',
            displayName,
            ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            emailVerified: false,
            authProviders: ['phone' as AuthProviderType],
            signupComplete: true,
            brandProfileId,
            createdAt: existingUserDoc.createdAt,
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            isActive: true,
            isSuspended: false,
          });
        }
      } else {
        // Role matches, signup complete - update auth provider if needed
        await addAuthProvider(user.uid, 'phone');
      }
    }

    // Update last login
    await updateLastLogin(user.uid);

    return userCredential;
  } catch (error: any) {
    console.error('Error confirming phone verification code:', error);
    throw error;
  }
}

// ===== INSTAGRAM OAUTH =====

/**
 * Generate Instagram OAuth URL for login flow
 * This initiates the Instagram Business Login flow
 */
export function getInstagramOAuthUrl(state?: string): string {
  const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;
  const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;

  // Debug: Check what values we have
  console.log('🔍 Instagram OAuth Config Check:');
  console.log('  - NEXT_PUBLIC_INSTAGRAM_APP_ID:', appId ? '✅ Set' : '❌ Missing');
  console.log('  - NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI:', redirectUri ? '✅ Set' : '❌ Missing');
  console.log('  - Redirect URI value:', redirectUri);

  if (!redirectUri || !appId) {
    const missingVars = [];
    if (!redirectUri) missingVars.push('NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI');
    if (!appId) missingVars.push('NEXT_PUBLIC_INSTAGRAM_APP_ID');

    throw new Error(
      `Instagram OAuth configuration missing. Please set these environment variables in Vercel: ${missingVars.join(', ')}`
    );
  }

  // Instagram Business Login scopes (new format as of Jan 27, 2025)
  // For Meta App Review: Only request instagram_business_basic initially
  // Add other scopes after approval: content_publish, manage_messages, manage_comments
  const scopes = [
    'instagram_business_basic',
    // 'instagram_business_content_publish',    // Uncomment after basic approval
    // 'instagram_business_manage_messages',     // Uncomment after basic approval
    // 'instagram_business_manage_comments',     // Uncomment after basic approval
  ].join(',');

  // Generate random state for CSRF protection if not provided
  const stateParam = state || Math.random().toString(36).substring(7);

  // Store state in sessionStorage for verification (client-side only)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('instagram_oauth_state', stateParam);
  }

  // Instagram OAuth authorization URL
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state: stateParam,
  });

  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

  // Debug: Log the redirect_uri being used
  console.log('Instagram OAuth - Redirect URI:', redirectUri);
  console.log('Instagram OAuth - Full URL:', authUrl);

  return authUrl;
}

/**
 * Store Instagram token data in user document
 * Called from the API route after successful token exchange
 */
export async function storeInstagramTokenData(
  uid: string,
  tokenData: InstagramTokenData
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      instagramTokenData: tokenData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error storing Instagram token data:', error);
    throw error;
  }
}

/**
 * Get Instagram token data for a user
 */
export async function getInstagramTokenData(uid: string): Promise<InstagramTokenData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData.instagramTokenData || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting Instagram token data:', error);
    return null;
  }
}

// ===== FIRESTORE PROFILE CREATION =====

/**
 * Create user document in Firestore
 */
async function createUserDocument(
  uid: string,
  data: {
    email: string;
    role: UserRole;
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
    authProvider: AuthProviderType;
    influencerProfileId?: string;
    brandProfileId?: string;
  }
): Promise<void> {
  // Build user document with only defined fields (Firestore doesn't accept undefined)
  // For social logins (google, facebook, apple), email is automatically verified
  // For email/password and phone, it starts as false
  const emailVerified = ['google', 'facebook', 'apple'].includes(data.authProvider);

  const userDoc: any = {
    uid,
    email: data.email,
    role: data.role,
    displayName: data.displayName || data.email,
    emailVerified,
    authProviders: [data.authProvider],
    createdAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    signupComplete: true,
    isActive: true,
    isSuspended: false,
  };

  // Only add optional fields if they have values
  if (data.phoneNumber) userDoc.phoneNumber = data.phoneNumber;
  if (data.photoURL) userDoc.photoURL = data.photoURL;
  if (data.influencerProfileId) userDoc.influencerProfileId = data.influencerProfileId;
  if (data.brandProfileId) userDoc.brandProfileId = data.brandProfileId;

  await setDoc(doc(db, 'users', uid), userDoc);
}

/**
 * Create influencer profile document
 */
export async function createInfluencerProfile(
  userId: string,
  profileId: string,
  data: {
    displayName: string;
    email: string;
    phoneNumber?: string;
  }
): Promise<void> {
  const profile: InfluencerProfile = {
    id: profileId,
    userId,
    displayName: data.displayName,
    linkedAccounts: [],
    totalFollowers: 0,
    isVerified: false,
    isPublic: true,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'influencer_profiles', profileId), profile);
}

/**
 * Create brand profile document
 */
export async function createBrandProfile(
  userId: string,
  profileId: string,
  data: BrandSignupData
): Promise<void> {
  const socialLinks = [];

  if (data.instagram) socialLinks.push({ platform: 'instagram' as const, url: data.instagram });
  if (data.tiktok) socialLinks.push({ platform: 'tiktok' as const, url: data.tiktok });
  if (data.facebook) socialLinks.push({ platform: 'facebook' as const, url: data.facebook });
  if (data.twitter) socialLinks.push({ platform: 'twitter' as const, url: data.twitter });
  if (data.linkedin) socialLinks.push({ platform: 'linkedin' as const, url: data.linkedin });

  // Build profile with only defined fields (Firestore doesn't accept undefined)
  const profile: any = {
    id: profileId,
    userId,
    companyName: data.companyName,
    industry: data.industry,
    companySize: data.companySize,
    displayName: data.fullName || data.email,
    socialLinks,
    isActive: true,
    isVerified: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if provided (Firestore doesn't accept undefined)
  if (data.role) profile.userRole = data.role;
  if (data.website) profile.website = data.website;

  await setDoc(doc(db, 'brand_profiles', profileId), profile);
}

/**
 * Add auth provider to existing user
 */
async function addAuthProvider(
  uid: string,
  provider: AuthProviderType
): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;

      if (!userData.authProviders.includes(provider)) {
        await updateDoc(doc(db, 'users', uid), {
          authProviders: [...userData.authProviders, provider],
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Error adding auth provider:', error);
  }
}

// ===== EMAIL-FIRST SIGNUP FLOW =====

/**
 * Create temporary Firebase account for email verification
 * This is step 1 of the email-first signup flow
 */
export async function createTemporaryEmailAccount(
  email: string,
  role: UserRole
): Promise<{ userCredential: UserCredential; tempPassword: string }> {
  try {
    // Generate a secure temporary password
    const tempPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('') + 'Tmp1!';

    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      tempPassword
    );

    const { user } = userCredential;

    // Send email verification
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/${role}/signup/email-verified`,
      handleCodeInApp: false,
    });

    // Create minimal user document (mark as incomplete signup)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      role,
      displayName: email,
      authProviders: ['email' as AuthProviderType],
      emailVerified: false,
      signupComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { userCredential, tempPassword };
  } catch (error) {
    console.error('Error creating temporary email account:', error);
    throw error;
  }
}

/**
 * Complete brand signup after email verification
 * This is the final step that creates the full brand profile
 */
export async function completeBrandSignupAfterVerification(
  uid: string,
  data: BrandSignupData
): Promise<void> {
  try {
    // Update display name
    const displayName = data.fullName || data.email;
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }

    // Create brand profile
    const brandProfileId = generateProfileId();
    await createBrandProfile(uid, brandProfileId, data);

    // Update user document with complete data
    await updateDoc(doc(db, 'users', uid), {
      displayName,
      phoneNumber: data.phoneNumber || null,
      brandProfileId,
      signupComplete: true,
      emailVerified: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing brand signup:', error);
    throw error;
  }
}

/**
 * Complete influencer signup after email verification
 * This is the final step that creates the full influencer profile
 */
export async function completeInfluencerSignupAfterVerification(
  uid: string,
  data: InfluencerSignupData
): Promise<void> {
  try {
    // Update display name
    const displayName = data.displayName || data.email;
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }

    // Create influencer profile
    const influencerProfileId = generateProfileId();
    await createInfluencerProfile(uid, influencerProfileId, {
      displayName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });

    // Update user document with complete data
    await updateDoc(doc(db, 'users', uid), {
      displayName,
      phoneNumber: data.phoneNumber || null,
      influencerProfileId,
      signupComplete: true,
      emailVerified: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing influencer signup:', error);
    throw error;
  }
}
