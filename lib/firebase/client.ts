import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase Web SDK initialization. Uses the public `tryavokado-a4ead` web config.
 * Safe to import from client components. (Server-side Admin features require a
 * matching service account for this project — see docs/firebase-setup.md.)
 */
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/** True only when a real Firebase web API key is present. */
export const firebaseConfigured = Boolean(apiKey);

const firebaseConfig: FirebaseOptions = {
  // A non-empty fallback keeps `getAuth()` from throwing `auth/invalid-api-key`
  // during the production build / SSR prerender when env isn't configured. It is
  // never used for real requests (UI flows surface a clear "not configured" error).
  apiKey: apiKey || "missing-firebase-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
