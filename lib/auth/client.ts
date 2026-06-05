"use client";
import { createAuthClient } from "better-auth/react";
import { publicEnv } from "@/lib/env-public";

export const authClient = createAuthClient({
  baseURL: publicEnv.appUrl,
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
