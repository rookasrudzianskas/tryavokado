import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { integrations } from "@/lib/env";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/overview");

  return (
    <div>
      <div className="mb-6 space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in to your Avokado workspace.
        </p>
      </div>
      <LoginForm googleEnabled={integrations.googleAuth} />
    </div>
  );
}
