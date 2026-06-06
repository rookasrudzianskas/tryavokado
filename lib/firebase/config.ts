/**
 * Firebase web configuration for project `tryavokado-a4ead`.
 *
 * These values are PUBLIC by design — a Firebase web API key identifies the
 * project; it does NOT grant access. Security is enforced by Firestore/Storage
 * Security Rules and Authentication authorized domains, not by hiding this. It is
 * fine to commit. (This is NOT the service-account/admin key, which must never be
 * committed.)
 *
 * Env vars override these per-field when present, so you can point a deployment
 * at a different Firebase project without code changes.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBVAibBMBi0fSXHYqZ-i5oLmupXTuI4gU4",
  authDomain: "tryavokado-a4ead.firebaseapp.com",
  projectId: "tryavokado-a4ead",
  storageBucket: "tryavokado-a4ead.firebasestorage.app",
  messagingSenderId: "809028808779",
  appId: "1:809028808779:web:ed1dfc22cda48148769dce",
  measurementId: "G-LDF5L6KTN6",
} as const;
