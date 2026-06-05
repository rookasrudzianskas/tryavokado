import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "./client";
import { ensureUserDoc } from "./data";

const FRIENDLY: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again shortly.",
  "auth/popup-closed-by-user": "The Google sign-in window was closed.",
  "auth/network-request-failed": "Network error. Check your connection.",
  // Project not yet configured for this provider — a Firebase Console setup step.
  "auth/configuration-not-found":
    "Sign-in isn't enabled for this Firebase project yet. Enable Authentication and the Email/Password provider in the Firebase console (see docs/firebase-setup.md).",
  "auth/operation-not-allowed":
    "This sign-in method is disabled. Enable it under Authentication → Sign-in method in the Firebase console.",
  // Deployment didn't get the Firebase web config (e.g. env vars not set on Vercel).
  "auth/invalid-api-key":
    "Authentication isn't configured on this deployment. Add the NEXT_PUBLIC_FIREBASE_* environment variables in your hosting project and redeploy.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Authentication isn't configured on this deployment. Add the NEXT_PUBLIC_FIREBASE_* environment variables in your hosting project and redeploy.",
  // The current domain isn't whitelisted in Firebase Auth.
  "auth/unauthorized-domain":
    "This domain isn't authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
};

export function friendlyAuthError(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  return FRIENDLY[code] ?? "Something went wrong. Please try again.";
}

export async function signUpEmail(input: {
  name: string;
  email: string;
  password: string;
}): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email,
    input.password,
  );
  if (input.name) await updateProfile(cred.user, { displayName: input.name });
  await ensureUserDoc(cred.user);
  return cred.user;
}

export async function signInEmail(input: {
  email: string;
  password: string;
}): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(
    auth,
    input.email,
    input.password,
  );
  await ensureUserDoc(cred.user);
  return cred.user;
}

export async function signInGoogle(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(cred.user);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}
