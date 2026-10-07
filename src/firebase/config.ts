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

export function getFirebaseConfig(): FirebaseClientConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  const databaseURL =
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    `https://${projectId}-default-rtdb.firebaseio.com`;

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
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

