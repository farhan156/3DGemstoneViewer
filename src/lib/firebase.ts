import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'SKIP_INIT',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Only initialize if API key is available (prevents build-time errors)
let app: any;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'SKIP_INIT') {
    const apps = getApps();
    app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  }
} catch (error) {
  // Silently fail during build when env vars are missing
  console.warn('Firebase initialization skipped (env vars not available)');
}

export const db = app ? getFirestore(app) : undefined;
export const storage = app ? getStorage(app) : undefined;
export const auth = app ? getAuth(app) : undefined;