import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/auth/session";
import { integrations } from "@/lib/env";

export const metadata: Metadata = { title: "Create your account" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.user) redirect("/overview");

  return (
    <div>
      <div className="mb-6 space-y-1.5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start in demo mode — no store or ad account required.
        </p>
      </div>
      <RegisterForm googleEnabled={integrations.googleAuth} />
    </div>
  );
}
