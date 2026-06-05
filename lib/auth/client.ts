"use client";
import { createAuthClient } from "better-auth/react";
import { publicEnv } from "@/lib/env-public";

// Use the current origin in the browser so auth works on any dev port (the
// configured app URL is only used during SSR/build).
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined" ? window.location.origin : publicEnv.appUrl,
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
