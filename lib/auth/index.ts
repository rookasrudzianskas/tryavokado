import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { env, integrations } from "@/lib/env";
import { users, sessions, accounts, verifications } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";

/**
 * Better Auth server instance.
 * - Email/password is always enabled.
 * - Google sign-in is enabled only when GOOGLE_CLIENT_ID/SECRET are present.
 * - Sessions and users map onto our plural Drizzle tables.
 */
export const auth = betterAuth({
  appName: "Avokado",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Keep onboarding frictionless; verification email is sent but not required.
    requireEmailVerification: false,
    minPasswordLength: 8,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your Avokado password",
        text: `Reset your password: ${url}`,
      });
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verify your Avokado email",
        text: `Confirm your email: ${url}`,
      });
    },
  },
  socialProviders: integrations.googleAuth
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: {
    cookiePrefix: "avokado",
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
