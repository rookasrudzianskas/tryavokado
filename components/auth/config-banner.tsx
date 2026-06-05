"use client";
import { TriangleAlert } from "lucide-react";
import { firebaseConfigured } from "@/lib/firebase/client";

/** Surfaces a clear message when the deployment is missing the Firebase web
 *  config (the usual cause of "auth doesn't work" on a fresh Vercel deploy). */
export function AuthConfigBanner() {
  if (firebaseConfigured) return null;
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 px-3.5 py-3 text-sm text-warning-foreground">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>
        Sign-in isn&rsquo;t configured on this deployment. Add the{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_*</code>{" "}
        environment variables in your hosting project (and authorize this domain
        in Firebase), then redeploy.
      </span>
    </div>
  );
}
