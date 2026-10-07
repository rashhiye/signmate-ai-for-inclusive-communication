import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously as fbSignInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { IAuthService } from '../services/AuthService';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { firebaseAuth, isFirebaseConfigured } from './config';

/**
 * Checks if current browser environment is mobile/tablet or touch-constrained.
 */
export function isMobileOrTablet(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isNarrow = window.innerWidth <= 820;
  return mobileRegex.test(ua) || (isTouch && isNarrow);
}

/**
 * Multi-tier persistence initializer.
 * Ensures compatibility across iOS Safari private mode, mobile webviews, and standard desktops.
 */
let persistenceConfigured = false;
export async function ensurePersistence(): Promise<void> {
  if (!firebaseAuth || persistenceConfigured) return;
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence);
    persistenceConfigured = true;
  } catch {
    try {
      await setPersistence(firebaseAuth, browserSessionPersistence);
      persistenceConfigured = true;
    } catch {
      try {
        await setPersistence(firebaseAuth, inMemoryPersistence);
        persistenceConfigured = true;
      } catch {
        // Fallback silently if all persistence mechanisms are restricted
      }
    }
  }
}

function mapFirebaseUser(fbUser: FirebaseUser | null): User | null {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName || (fbUser.isAnonymous ? 'Guest User' : fbUser.email?.split('@')[0]) || 'SignMate Participant',
    photoURL: fbUser.photoURL,
    isAnonymous: fbUser.isAnonymous,
  };
}

export class FirebaseAuthAdapter implements IAuthService {
  constructor() {
    // Attempt best-effort persistence setup immediately
    ensurePersistence().catch(() => {});
  }

  async signIn(credentials: LoginCredentials): Promise<User> {
    if (!firebaseAuth || !isFirebaseConfigured()) {
      throw new Error('Firebase Authentication is not configured.');
    }

    await ensurePersistence();

    const cleanEmail = credentials.email.trim().toLowerCase();
    const cleanPassword = credentials.password;

    try {
      const result = await signInWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        cleanPassword
      );
      const user = mapFirebaseUser(result.user);
      if (!user) throw new Error('Failed to retrieve user record.');
      return user;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('No user account found with this email.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Check your internet connection.');
      }
      throw new Error(error.message || 'Authentication failed.');
    }
  }

  async signUp(credentials: RegisterCredentials): Promise<User> {
    if (!firebaseAuth || !isFirebaseConfigured()) {
      throw new Error('Firebase Authentication is not configured.');
    }

    await ensurePersistence();

    const cleanEmail = credentials.email.trim().toLowerCase();
    const cleanPassword = credentials.password;

    try {
      const result = await createUserWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        cleanPassword
      );

      if (credentials.displayName && result.user) {
        await updateProfile(result.user, {
          displayName: credentials.displayName.trim(),
        });
      }

      const user = mapFirebaseUser(result.user);
      if (!user) throw new Error('Failed to initialize user record.');
      return user;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Check your internet connection.');
      }
      throw new Error(error.message || 'Registration failed.');
    }
  }

  async signInWithGoogle(): Promise<User> {
    if (!firebaseAuth || !isFirebaseConfigured()) {
      throw new Error('Firebase Authentication is not configured.');
    }

    await ensurePersistence();

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const isMobile = isMobileOrTablet();

    try {
      // On mobile browsers, popups are frequently blocked or open orphaned tabs.
      // We try popup first, and gracefully fallback to redirect if blocked.
      let result;
      try {
        result = await signInWithPopup(firebaseAuth, provider);
      } catch (popupErr: unknown) {
        const pErr = popupErr as { code?: string; message?: string };
        
        // Check for popup-blocked or mobile-unsupported popup
        if (
          pErr?.code === 'auth/popup-blocked' ||
          pErr?.code === 'auth/cancelled-popup-request' ||
          pErr?.code === 'auth/operation-not-supported-in-this-environment' ||
          (isMobile && pErr?.code === 'auth/popup-closed-by-user')
        ) {
          console.warn('Mobile popup blocked or interrupted. Redirecting to Google Auth...');
          await signInWithRedirect(firebaseAuth, provider);
          // Return pending promise because page is redirecting
          return new Promise<User>(() => {});
        }
        throw popupErr;
      }

      const user = mapFirebaseUser(result.user);
      if (!user) throw new Error('Google authentication succeeded but user record could not be mapped.');
      return user;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was cancelled.');
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
        throw new Error(
          `Domain "${currentHost}" is not in Firebase Authorized Domains. In Firebase Console > Authentication > Settings > Authorized domains, add this domain/IP. Or use 1-Tap Demo Sign-In or Guest Access.`
        );
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error during Google sign-in. Check your connection.');
      }
      throw new Error(error.message || 'Google sign-in failed.');
    }
  }

  /**
   * Captures the sign-in result when returning from signInWithRedirect on mobile browsers.
   */
  async handleRedirectResult(): Promise<User | null> {
    if (!firebaseAuth || !isFirebaseConfigured()) return null;
    try {
      await ensurePersistence();
      const result = await getRedirectResult(firebaseAuth);
      if (result && result.user) {
        return mapFirebaseUser(result.user);
      }
    } catch (err: unknown) {
      console.warn('Redirect authentication result check:', err);
    }
    return null;
  }

  /**
   * Anonymous authentication provides real Firebase JWT tokens for mobile & guest users,
   * unlocking Firestore security rules (request.auth != null) without credential barriers.
   */
  async signInAnonymously(displayName: string = 'Guest User'): Promise<User> {
    await ensurePersistence();

    if (!firebaseAuth || !isFirebaseConfigured()) {
      return {
        uid: `guest-${Math.random().toString(36).substring(2, 9)}`,
        email: null,
        displayName: displayName.trim() || 'Guest User',
        photoURL: null,
        isAnonymous: true,
      };
    }

    try {
      const result = await fbSignInAnonymously(firebaseAuth);
      if (displayName && result.user) {
        try {
          await updateProfile(result.user, { displayName: displayName.trim() });
        } catch {
          // Profile updates on anonymous tokens can be skipped
        }
      }
      const user = mapFirebaseUser(result.user);
      if (!user) throw new Error('Guest sign-in succeeded but user mapping failed.');
      return user;
    } catch (err: unknown) {
      console.warn('Firebase Anonymous Auth unavailable (may be disabled in console). Using local guest profile fallback:', err);
      return {
        uid: `guest-${Math.random().toString(36).substring(2, 9)}`,
        email: null,
        displayName: displayName.trim() || 'Guest User',
        photoURL: null,
        isAnonymous: true,
      };
    }
  }

  async signOut(): Promise<void> {
    if (!firebaseAuth) return;
    await fbSignOut(firebaseAuth);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!firebaseAuth) return null;
    return mapFirebaseUser(firebaseAuth.currentUser);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!firebaseAuth) {
      callback(null);
      return () => {};
    }

    return fbOnAuthStateChanged(firebaseAuth, (user) => {
      callback(mapFirebaseUser(user));
    });
  }
}

