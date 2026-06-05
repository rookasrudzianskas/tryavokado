# Firebase setup (tryavokado-a4ead)

Avokado uses **Firebase Auth + Firestore + Storage** via the client SDK. The web
config (public, in `.env.local` as `NEXT_PUBLIC_FIREBASE_*`) is already wired.
Three one-time steps must be done in the **Firebase Console** for the project
`tryavokado-a4ead` before the app can sign users in or store data. The app
surfaces a clear error (`auth/configuration-not-found`) until step 1 is done — it
does **not** fake a successful sign-in.

## 1. Enable Authentication

1. Firebase Console → **Build → Authentication → Get started**.
2. **Sign-in method** → enable **Email/Password**.
3. Enable **Google** (pick a project support email).
4. **Settings → Authorized domains** → ensure `localhost` is present (add your
   production domain later, e.g. `tryavokado.com`).

> The `CONFIGURATION_NOT_FOUND` 400 from `identitytoolkit.googleapis.com` means
> this step has not been completed yet.

## 2. Create the Firestore database

1. Firebase Console → **Build → Firestore Database → Create database**.
2. Start in **production mode** (we ship real security rules below).
3. Choose a location near your users (e.g. `eur3` / `europe-west` for EUR/EU).

## 3. Create Storage + deploy security rules

The data is accessed from the browser, so the rules in `firestore.rules` and
`storage.rules` (committed at the repo root) **are** the security boundary.

```bash
npm i -g firebase-tools
firebase login
firebase use tryavokado-a4ead
firebase deploy --only firestore:rules,storage
```

Or paste the contents of `firestore.rules` into Console → Firestore → Rules, and
enable **Build → Storage** then paste `storage.rules`.

## Server-side Firebase (optional, cleaner architecture)

The Admin SDK (session cookies, server-side Firestore, secure server rendering)
needs a service account **for `tryavokado-a4ead`** — the key currently provided
is for the unrelated `katchy-1aad1` project and will not authenticate here.

1. Console → **Project settings → Service accounts → Generate new private key**.
2. Save the JSON **outside the repo** and point `GOOGLE_APPLICATION_CREDENTIALS`
   at it (and set `FIREBASE_ADMIN_PROJECT_ID=tryavokado-a4ead`). Never commit it.

## Security reminders

- The service-account key shared in chat is **compromised** — rotate it
  (IAM → Service Accounts → Keys) and delete the leaked key.
- `.env.local` and any `*-adminsdk*.json` are gitignored; never commit them.
- Firebase web API keys are public by design (security comes from Auth + Rules).
