import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}

const FALLBACK_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: 'AIzaSyDRvd-Br6GjHDNzVy02FrwCS0VYX8YHv_c',
  authDomain: 'signmate-a73b3.firebaseapp.com',
  projectId: 'signmate-a73b3',
  storageBucket: 'signmate-a73b3.firebasestorage.app',
  messagingSenderId: '220476879234',
  appId: '1:220476879234:web:c6751a68537f6b34b25f9b',
  measurementId: 'G-887JR1G099',
  databaseURL: 'https://signmate-a73b3-default-rtdb.firebaseio.com',
};

export function getFirebaseConfig(): FirebaseClientConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_FIREBASE_CONFIG.apiKey;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_CONFIG.projectId;

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_FIREBASE_CONFIG.authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || FALLBACK_FIREBASE_CONFIG.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FALLBACK_FIREBASE_CONFIG.measurementId,
    databaseURL:
      import.meta.env.VITE_FIREBASE_DATABASE_URL ||
      FALLBACK_FIREBASE_CONFIG.databaseURL ||
      `https://${projectId}-default-rtdb.firebaseio.com`,
  };
}

export function isFirebaseConfigured(): boolean {
  return true;
}

// Singleton instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let databaseInstance: Database | null = null;
let analyticsInstance: Analytics | null = null;

const config = getFirebaseConfig();

if (config) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(config) : getApp();
    authInstance = getAuth(appInstance);
    firestoreInstance = getFirestore(appInstance);

    // Initialize Firebase Realtime Database
    try {
      databaseInstance = getDatabase(appInstance, config.databaseURL);
    } catch {
      databaseInstance = getDatabase(appInstance);
    }

    // Analytics is optional and only supported in client environments
    if (typeof window !== 'undefined' && config.measurementId) {
      isSupported().then((supported) => {
        if (supported && appInstance) {
          analyticsInstance = getAnalytics(appInstance);
        }
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to initialize Firebase App:', err);
  }
}

export const firebaseApp = appInstance;
export const firebaseAuth = authInstance;
export const firestore = firestoreInstance;
export const rtdb = databaseInstance;
export const database = databaseInstance;
export const firebaseAnalytics = analyticsInstance;

