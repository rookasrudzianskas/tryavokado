import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
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
      <RegisterForm googleEnabled />
    </div>
  );
}
